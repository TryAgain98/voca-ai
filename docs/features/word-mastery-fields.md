# `word_mastery` — Giải thích từng field

> Nguồn schema: [supabase/migrations](../../supabase/migrations/) (3 file: [create](../../supabase/migrations/20260429154257_create_word_review_progress.sql) → [add mastery](../../supabase/migrations/20260506234353_add_mastery_to_word_review_progress.sql) → [add FSRS + rename](../../supabase/migrations/20260507213749_add_fsrs_fields_to_word_review_progress.sql))
> Type TS: [types/index.ts](../../types/index.ts) (`WordMastery`)
> Logic dùng: [services/word-mastery.service.ts](../../services/word-mastery.service.ts), [lib/mastery-scheduler.ts](../../lib/mastery-scheduler.ts)
> Bối cảnh thuật toán: xem [srs-flow.md](./srs-flow.md) và [relearning.md](./relearning.md)

Mỗi dòng = 1 user × 1 từ vựng. Unique key: `(user_id, word_id)`. Chỉ được ghi khi user **làm Quiz/Test** (trang Review/flashcard không động vào).

---

## 1. Identity (định danh)

| Field     | Kiểu | Default             | Ý nghĩa                                                | Khi nào set   |
| --------- | ---- | ------------------- | ------------------------------------------------------ | ------------- |
| `id`      | uuid | `gen_random_uuid()` | Khoá chính nội bộ.                                     | Khi tạo dòng. |
| `user_id` | text | —                   | Clerk user ID. Mọi truy vấn đều filter theo field này. | Lần test đầu. |
| `word_id` | uuid | —                   | FK → `vocabularies.id`, cascade delete.                | Lần test đầu. |

---

## 2. Mastery state — "đã nhớ tới đâu"

| Field           | Kiểu     | Default | Ý nghĩa                                            | Đọc ở                                              |
| --------------- | -------- | ------- | -------------------------------------------------- | -------------------------------------------------- |
| `level`         | smallint | 0       | Bậc nhớ 0–5. ≥ 3 = Mastered (ẩn khỏi quiz thường). | Quiz priority, dashboard groups, fading detection. |
| `correct_count` | integer  | 0       | Tổng số lần test trả lời ĐÚNG (cộng dồn cả đời).   | Stats user.                                        |
| `wrong_count`   | integer  | 0       | Tổng số lần test SAI.                              | Stats user.                                        |

**Cập nhật**: [applyQuizMastery](../../services/word-mastery.service.ts#L344-L407) sau mỗi lần submit quiz.

- `level` được tính qua [nextMasteryLevel](../../lib/mastery-scheduler.ts#L136-L146):
  - GOOD/EASY → +1/+2 (trần 5)
  - HARD → giữ nguyên
  - AGAIN → −1 (−2 nếu đang mastered)
- `correct_count`/`wrong_count` chỉ tăng, không reset.

---

## 3. Scheduling — "khi nào nhắc lại"

| Field         | Kiểu         | Default | Ý nghĩa                                                                    | Đọc ở                                                                                                  |
| ------------- | ------------ | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `tested_at`   | timestamptz  | `null`  | Thời điểm test gần nhất. `null` = chưa từng test.                          | Tính `daysSinceReview`, "Wrong today", priority.                                                       |
| `due_at`      | timestamptz  | `null`  | Đến hạn nhắc tiếp theo. Quá hạn nếu `due_at <= now`.                       | Quiz/dashboard "needs testing", overdue boost.                                                         |
| `ease_factor` | numeric(4,2) | `2.50`  | "Tính dễ" của từ với user (1.30–3.00). Hệ số nhân stability.               | [nextStability](../../lib/mastery-scheduler.ts#L116-L129) (`easeBoost = ease/2.5`).                    |
| `stability`   | numeric(8,2) | `0`     | "Memory half-life" theo ngày. Quyết định trực tiếp `interval` & retention. | Tính `due_at` mới, `retrievability(stability, daysSince)`.                                             |
| `difficulty`  | numeric(4,2) | `5.00`  | "Khó cá nhân" của từ (1–10). Càng cao càng phạt stability.                 | [nextStability](../../lib/mastery-scheduler.ts#L116-L129) (`difficultyPenalty`), practice score boost. |

### 3.1. Bối cảnh thuật toán (FSRS-lite = SM-2 + retrievability)

Toàn bộ scheduler nằm trong [lib/mastery-scheduler.ts](../../lib/mastery-scheduler.ts). Đây **không phải** FSRS đầy đủ (17 tham số) mà là biến thể nhẹ kết hợp 3 ý tưởng:

1. **SM-2 ease factor**: mỗi từ có 1 hệ số "dễ" riêng theo user. Trả lời tốt → tăng ease → khoảng cách ôn dài hơn.
2. **FSRS stability + retrievability**: thay vì chỉ nhân interval, ta mô hình hoá "memory half-life" và xác suất nhớ tại thời điểm `t` bằng đường cong mũ.
3. **Per-card difficulty**: từ nào user hay sai → `difficulty` tăng → phạt stability → khoảng cách ôn ngắn lại dù trả lời đúng.

3 cột `ease_factor`, `stability`, `difficulty` là **state per (user, word)** mà thuật toán đọc/ghi mỗi lần submit quiz.

### 3.2. `ease_factor` — "từ này dễ với mình tới đâu"

| Thuộc tính   | Giá trị                                                                           |
| ------------ | --------------------------------------------------------------------------------- |
| **Default**  | `2.50` (khi tạo dòng — chưa test bao giờ)                                         |
| **Range**    | `1.30 – 3.00` (clamp ở [scheduler:24-26](../../lib/mastery-scheduler.ts#L24-L26)) |
| **Đơn vị**   | Hệ số nhân không thứ nguyên                                                       |
| **Cập nhật** | Cộng/trừ delta theo grade (xem bảng dưới), không reset khi lapse                  |

**Công thức cập nhật** ([scheduler:170](../../lib/mastery-scheduler.ts#L170)):

```
new_ease = clamp(prev_ease + EASE_DELTA[grade], 1.30, 3.00)
```

| Grade | EASE_DELTA | Ý nghĩa                              |
| ----- | ---------- | ------------------------------------ |
| AGAIN | `-0.20`    | Trừ mạnh — user vừa quên hẳn từ này. |
| HARD  | `-0.05`    | Trừ nhẹ — đúng nhưng chậm/khó nhớ.   |
| GOOD  | `+0.05`    | Cộng nhẹ — đúng bình thường.         |
| EASY  | `+0.15`    | Cộng mạnh — đúng và nhanh.           |

**Áp dụng vào đâu**: chỉ vào công thức `nextStability` qua thừa số `easeBoost = ease / 2.5`. Ease cao (2.8) → stability nhân thêm ~12% so với baseline; ease thấp (1.5) → giảm 40%. Nói cách khác, ease là "lò xo" điều chỉnh tốc độ giãn interval theo lịch sử dài hạn của user với từ này.

**Ví dụ**: từ user trả lời GOOD 5 lần liên tiếp từ default → ease = `2.50 + 5×0.05 = 2.75`. Từ user lapse 2 lần → ease tụt xuống `2.50 - 2×0.20 = 2.10`.

### 3.3. `stability` — "trí nhớ giữ được bao nhiêu ngày"

| Thuộc tính   | Giá trị                                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| **Default**  | `0` (chưa test) — code coi `prevStability=0` như "lần đầu".                                                |
| **Range**    | `≥ 0.5` sau lần test đầu (sàn cứng ở [scheduler:123](../../lib/mastery-scheduler.ts#L123)). Không có trần. |
| **Đơn vị**   | **Ngày** — chính xác hơn là "memory half-life × hệ số".                                                    |
| **Cập nhật** | Mỗi lần test, theo công thức `nextStability` bên dưới.                                                     |

**Công thức cập nhật** ([scheduler:116-129](../../lib/mastery-scheduler.ts#L116-L129)):

```ts
// Khi AGAIN (sai):
new_stability = max(0.5, prev_stability * 0.2)   // mất 80% trí nhớ

// Khi HARD/GOOD/EASY (đúng):
base             = max(prev_stability, 1)         // sàn 1 ngày cho lần đầu
easeBoost        = ease / 2.5                     // 0.52 .. 1.20
difficultyPenalty = 1 - (difficulty - 5) * 0.05  // 1.20 (dễ) .. 0.75 (khó)
new_stability    = base × INTERVAL_MULTIPLIER[grade] × easeBoost × difficultyPenalty
```

| Grade | INTERVAL_MULTIPLIER |
| ----- | ------------------- |
| HARD  | `1.2`               |
| GOOD  | `2.5`               |
| EASY  | `4.0`               |

**Áp dụng vào đâu** — 2 chỗ:

1. **Tính `due_at`**: `due_at = now + round(stability) ngày` ([scheduler:131-134](../../lib/mastery-scheduler.ts#L131-L134), tối thiểu 1 ngày).
2. **Tính `retrievability(t)`** — xác suất nhớ sau `daysSinceReview` ngày, công thức FSRS ([scheduler:268-274](../../lib/mastery-scheduler.ts#L268-L274)):

   ```
   R(t) = exp( -ln(0.9) × (daysSinceReview / stability) )
   ```

   - Tại `t = stability`, R = 0.9 (target retention 90%).
   - Tại `t = 2 × stability`, R = 0.81.
   - Dùng để phát hiện **Fading**: từ đã mastered nhưng `R < 0.85` → đẩy lên dashboard "sắp quên".

**Ví dụ áp dụng**: từ có `stability = 6.25` ngày, user 4 ngày chưa ôn → `R = exp(-0.105 × 4/6.25) = 0.935` (vẫn an toàn). Nếu để tới ngày thứ 9 → `R = 0.86` → bắt đầu fading.

### 3.4. `difficulty` — "từ này khó cá nhân với user tới đâu"

| Thuộc tính   | Giá trị                                                                            |
| ------------ | ---------------------------------------------------------------------------------- |
| **Default**  | `5.00` (giữa range, "trung bình")                                                  |
| **Range**    | `1.00 – 10.00` (clamp ở [scheduler:28-30](../../lib/mastery-scheduler.ts#L28-L30)) |
| **Đơn vị**   | Thang điểm khó (1 = rất dễ, 10 = rất khó)                                          |
| **Cập nhật** | Cộng/trừ delta theo grade, không reset khi lapse                                   |

**Công thức cập nhật** ([scheduler:171-175](../../lib/mastery-scheduler.ts#L171-L175)):

```
new_difficulty = clamp(prev_difficulty + DIFFICULTY_DELTA[grade], 1, 10)
```

| Grade | DIFFICULTY_DELTA | Ý nghĩa                                         |
| ----- | ---------------- | ----------------------------------------------- |
| AGAIN | `+1.0`           | Tăng mạnh — sai một lần là "đánh dấu" từ khó.   |
| HARD  | `+0.4`           | Tăng nhẹ.                                       |
| GOOD  | `-0.1`           | Giảm rất chậm — cần nhiều lần GOOD mới hạ được. |
| EASY  | `-0.4`           | Giảm rõ rệt.                                    |

> Lưu ý bất đối xứng: AGAIN tăng `+1.0` nhưng GOOD chỉ giảm `-0.1` → từng sai nhiều lần thì rất "lì". Đây là design có chủ đích để giữ ký ức về độ khó.

**Áp dụng vào đâu** — 2 chỗ:

1. **`difficultyPenalty` trong `nextStability`**:

   ```
   difficultyPenalty = 1 - (difficulty - 5) × 0.05
   ```

   - `difficulty = 1` → factor `1.20` (thưởng 20% stability).
   - `difficulty = 5` → factor `1.00` (trung tính).
   - `difficulty = 10` → factor `0.75` (phạt 25% stability).

2. **Practice score boost** trong service quiz priority — từ `difficulty` cao được đẩy lên đầu hàng đợi sớm hơn (xem [services/word-mastery.service.ts](../../services/word-mastery.service.ts)).

**Ví dụ áp dụng**: từ A và B cùng GOOD lần thứ 2, cùng `stability=2.5`, `ease=2.55` →

- Từ A `difficulty=4.0`: `new_stability = 2.5 × 2.5 × 1.02 × 1.05 ≈ 6.7` ngày.
- Từ B `difficulty=8.0`: `new_stability = 2.5 × 2.5 × 1.02 × 0.85 ≈ 5.4` ngày.

→ Cùng performance nhưng từ B được nhắc lại sớm hơn ~1.3 ngày vì user "có lịch sử khó" với nó.

### 3.5. Ví dụ flow điển hình (4 lần test liên tiếp)

Bắt đầu từ default `ease=2.50`, `stability=0`, `difficulty=5.00`:

```
Test 1 GOOD:  ease=2.55, stability=2.5,   difficulty=4.9, due=now+3d
              base=max(0,1)=1; 1 × 2.5 × (2.55/2.5) × (1-(4.9-5)×0.05) = 2.5 × 1.02 × 1.005 ≈ 2.56

Test 2 GOOD:  ease=2.60, stability=6.25,  difficulty=4.8, due=now+6d
              base=2.5; 2.5 × 2.5 × (2.6/2.5) × 1.01 ≈ 6.57

Test 3 EASY:  ease=2.75, stability=25,    difficulty=4.4, due=now+25d
              base=6.25; 6.25 × 4.0 × 1.10 × 1.03 ≈ 28.3

Test 4 AGAIN: ease=2.55, stability=5,     difficulty=5.4, due=lapse (5h grace → 00:00 hôm sau)
              25 × 0.2 = 5 (mất 80%); enter relearning loop, due = now + 10 phút
```

### 3.6. Khi nào nó "đặc biệt"

- `stability = 0` + `tested_at = null` → từ chưa được test → priority quiz = 50.
- `stability` rất nhỏ + `tested_at` xa → retention tụt → vào nhóm **Fading** (nếu mastered) hoặc tăng priority (nếu chưa).
- `due_at` không có khi user vừa được seed nhưng chưa test → fallback xem `tested_at`.
- 3 field này **không reset** khi lapse — chủ ý: lịch sử khó/dễ cá nhân được giữ để lần học lại không bắt đầu từ đầu.

---

## 4. Relearning & Lapse — "đã quên rồi mà cần cứu"

| Field             | Kiểu     | Default | Ý nghĩa                                                                                    | Đọc ở                                                 |
| ----------------- | -------- | ------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `lapse_count`     | integer  | 0       | Số lần "rơi" (mastered → AGAIN). Không bao giờ giảm.                                       | Phân tích từ "khó thật sự".                           |
| `is_relearning`   | boolean  | `false` | `true` khi đang trong vòng cứu trí nhớ (10 phút → 24h).                                    | Quiz priority = 100, group "Relearning", index riêng. |
| `relearning_step` | smallint | 0       | Bước trong [`RELEARNING_STEPS_MIN = [10, 1440]`](../../lib/mastery-scheduler.ts#L39) phút. | Tính `due_at` khi đang relearning.                    |

### Diễn biến

- AGAIN khi level ≥ 3 → set `is_relearning=true`, `step=0`, `lapse_count += 1`, `due_at = now + 10 phút`, `stability *= 0.2`.
- GOOD/EASY khi đang relearning → `step += 1`. Đến step cuối thì thoát (`is_relearning=false`).
- AGAIN khi đang relearning → reset `step=0`, `stability *= 0.5`, **không** tăng `lapse_count`.

Index riêng [`word_mastery_relearning_idx`](../../supabase/migrations/20260507213749_add_fsrs_fields_to_word_review_progress.sql#L11-L13) (partial, chỉ `is_relearning=true`) để query nhanh.

Chi tiết logic: [relearning.md](./relearning.md).

---

## 5. Last test — "log lần test gần nhất"

| Field              | Kiểu     | Default | Ý nghĩa                                                       | Đọc ở                                                |
| ------------------ | -------- | ------- | ------------------------------------------------------------- | ---------------------------------------------------- |
| `last_grade`       | smallint | `null`  | Grade lần test gần nhất: 1=AGAIN, 2=HARD, 3=GOOD, 4=EASY.     | "Wrong today" (`last_grade === 1`).                  |
| `last_response_ms` | integer  | `null`  | Thời gian phản hồi (ms) lần gần nhất. `null` nếu UI không đo. | Debug/analytics. (Hiện không dùng để tính priority.) |

`last_grade` được derive bởi [deriveGrade](../../lib/mastery-scheduler.ts#L92-L102) từ `(isCorrect, responseMs)`.

---

## 6. Audit

| Field        | Kiểu        | Default | Ý nghĩa                                        |
| ------------ | ----------- | ------- | ---------------------------------------------- |
| `created_at` | timestamptz | `now()` | Lần test ĐẦU TIÊN của từ với user.             |
| `updated_at` | timestamptz | `now()` | Lần ghi gần nhất (set thủ công trong service). |

> ⚠️ `updated_at` không có trigger auto — service phải tự set mỗi lần upsert ([service:398](../../services/word-mastery.service.ts#L398)).

---

## 7. Index hiện có

| Index                           | Cột                                        | Dùng cho                    |
| ------------------------------- | ------------------------------------------ | --------------------------- |
| `word_mastery_pkey`             | `id`                                       | Khoá chính.                 |
| `word_mastery_user_word_unique` | `(user_id, word_id)`                       | Upsert idempotent.          |
| `word_mastery_user_id_idx`      | `user_id`                                  | Quét theo user (dashboard). |
| `word_mastery_due_at_idx`       | `(user_id, due_at)`                        | "Từ nào đến hạn?".          |
| `word_mastery_relearning_idx`   | `(user_id, is_relearning, due_at)` partial | Query relearning nhanh.     |

---

## 8. Cheat sheet — field → use case

| Tôi muốn biết...                 | Đọc field(s)                                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| User đã nhớ từ này chưa?         | `level >= 3`                                                                                                   |
| Từ này có hiện trong quiz không? | `level`, `is_relearning`, `due_at` (xem [computeQuizPriority](../../services/word-mastery.service.ts#L72-L95)) |
| Còn nhớ bao nhiêu % rồi?         | `retrievability(stability, now − tested_at)`                                                                   |
| Sắp quên (Fading)?               | `level >= 3` AND `retention < 0.85`                                                                            |
| Hôm nay vừa làm sai?             | `last_grade === 1` AND `tested_at` cùng ngày local                                                             |
| Từ "khó kinh niên"?              | `lapse_count` cao + `difficulty` cao                                                                           |
| Đang trong relearning?           | `is_relearning === true`                                                                                       |
| Khi nào nhắc lại?                | `due_at`                                                                                                       |

---

## 9. Lưu ý vận hành

- **Trang Review (flashcard) KHÔNG ghi vào bảng này** — chủ ý design để user xem lại tự do mà không "đốt" lịch ôn.
- **Chỉ Quiz/Test** gọi [applyQuizMastery](../../services/word-mastery.service.ts#L344-L407).
- [softDemoteMastery](../../services/word-mastery.service.ts#L409-L438) là cửa hậu để hạ 1 từ mastered xuống level 2 + bật relearning (dùng khi user tự bấm "tôi quên rồi" trên dashboard).
- Default `ease_factor=2.50`, `difficulty=5.00`, `stability=0` cho từ chưa từng test → công thức tự xử lý "lần đầu" qua `base = max(prevStability, 1)`.
