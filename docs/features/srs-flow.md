# SRS Flow — Khi nào "nhớ" và thứ tự ôn

> Nguồn: [lib/mastery-scheduler.ts](../../lib/mastery-scheduler.ts), [services/word-mastery.service.ts](../../services/word-mastery.service.ts)
> Mô hình: **FSRS-lite** (lai SuperMemo SM-2 + đường cong retrievability của FSRS).

---

## 1. Một từ thế nào gọi là "đã nhớ" (Mastered)?

### Tiêu chí duy nhất: `mastery_level >= 3`

- Thang điểm `level`: **0 → 5** (xem [`MAX_MASTERY_LEVEL`](../../lib/mastery-scheduler.ts#L10))
- Ngưỡng "đã nhớ": [`MASTERED_THRESHOLD = 3`](../../lib/mastery-scheduler.ts#L11)
- **Không** có ngưỡng theo ngày (ví dụ "nhớ sau 21 ngày") — chỉ dựa vào kết quả test.

### Level lên/xuống dựa vào `grade` của lần test (xem [mastery-scheduler.ts:136-146](../../lib/mastery-scheduler.ts#L136-L146))

`grade` được **suy ra tự động** từ độ đúng + thời gian phản hồi ([deriveGrade](../../lib/mastery-scheduler.ts#L92-L102)):

| Grade           | Khi nào                                     | Tác động lên `level`                 |
| --------------- | ------------------------------------------- | ------------------------------------ |
| 1 (AGAIN — sai) | Trả lời sai                                 | -1 (nếu đang mastered thì -2, sàn 0) |
| 2 (HARD)        | Đúng nhưng ≥ 10s (hoặc ≥ 20s = no-progress) | giữ nguyên                           |
| 3 (GOOD)        | Đúng, 5s < t < 10s (hoặc không đo time)     | +1 (trần 5)                          |
| 4 (EASY)        | Đúng, ≤ 5s                                  | +2 (trần 5)                          |

### Đường đi điển hình tới Mastered

```
level 0 → GOOD (3) → level 1 → GOOD → level 2 → GOOD → level 3 ✅ Mastered
            (cần ~3 lần đúng liên tiếp; EASY rút ngắn còn ~2 lần)
```

### Khi đã mastered, chuyện gì xảy ra?

- Bị **ẩn khỏi quiz thường** (`computeQuizPriority` trả về `-1`).
- Vẫn được tracking ở dashboard dưới các nhóm:
  - **Mastered** — đã nhớ và memory còn vững.
  - **Fading** — đã nhớ nhưng `retention < 85%` (sắp quên).
- Nếu sai → tụt xuống level mới và vào **chế độ Relearning** (xem mục 4).

---

## 2. Bao lâu thì nhắc ôn lại? (Lịch `due_at`)

Mỗi lần test, hệ thống tính `due_at` mới = `now + interval`. Interval phụ thuộc vào **stability** (độ vững của trí nhớ) — xem [`nextStability`](../../lib/mastery-scheduler.ts#L116-L129) và [`intervalDaysFromStability`](../../lib/mastery-scheduler.ts#L131-L134).

### Công thức Stability

```
stability_mới = stability_cũ × INTERVAL_MULTIPLIER[grade] × easeBoost × difficultyPenalty
interval (ngày) = max(1, round(stability_mới))
due_at = now + interval ngày
```

| Grade | INTERVAL_MULTIPLIER | Ý nghĩa                                |
| ----- | ------------------- | -------------------------------------- |
| AGAIN | 0 (reset)           | Stability tụt còn 0.2× (tối thiểu 0.5) |
| HARD  | 1.2×                | Tăng nhẹ                               |
| GOOD  | 2.5×                | Tăng chuẩn                             |
| EASY  | 4.0×                | Tăng mạnh                              |

`easeBoost = ease / 2.5` · `difficultyPenalty = 1 − (difficulty − 5) × 0.05`

### Ví dụ thực tế (giả định ease=2.5, difficulty=5, không boost/penalty)

| Lần | Grade | Stability         | Interval (ngày) | Nhắc lại sau             |
| --- | ----- | ----------------- | --------------- | ------------------------ |
| 1   | GOOD  | 1 × 2.5 = 2.5     | 3               | **3 ngày**               |
| 2   | GOOD  | 2.5 × 2.5 = 6.25  | 6               | **6 ngày**               |
| 3   | GOOD  | 6.25 × 2.5 = 15.6 | 16              | **~2 tuần**              |
| 4   | EASY  | 15.6 × 4.0 = 62.5 | 63              | **~2 tháng**             |
| 5   | GOOD  | 62.5 × 2.5 = 156  | 156             | **~5 tháng**             |
| —   | AGAIN | reset → 0.5       | 1               | **10 phút (relearning)** |

### Ngoại lệ — không tính theo công thức trên

| Trường hợp                               | `due_at`                                                                                                       |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| AGAIN khi **chưa** mastered (level < 3)  | Hết `LAPSE_GRACE_MS = 5h`, làm tròn lên 00:00 hôm sau ([lapseDueAt](../../lib/mastery-scheduler.ts#L159-L163)) |
| AGAIN khi **đã** mastered (lapse)        | +10 phút (Relearning step 0)                                                                                   |
| Đang Relearning, **GOOD** ở step 0       | +24 giờ (step 1)                                                                                               |
| Đang Relearning, **GOOD** ở step 1       | Thoát relearning → lịch chuẩn theo công thức stability ở trên                                                  |
| Đang Relearning, **AGAIN** ở bất kỳ step | Reset về step 0 → +10 phút, stability × 0.5                                                                    |

> **Tóm tắt**: GOOD đều đều thì interval lớn dần (3 ngày → 6 ngày → 2 tuần → tháng). Sai thì reset gần như về 0 và phải ôn ngay trong ngày.

---

## 3. Khi vào trang Review/Quiz, từ nào hiện ra trước?

Hàm chính: [`computeQuizPriority(progress, now)`](../../services/word-mastery.service.ts#L72-L95) trong `word-mastery.service.ts`.
Quiz lấy tối đa **20 từ** ([getQuizCandidates](../../services/word-mastery.service.ts#L296-L342)), sort theo điểm priority **giảm dần**.

### Thứ tự ưu tiên (cao → thấp)

| Hạng | Loại từ                                         | Điểm priority  | Ghi chú                                     |
| ---- | ----------------------------------------------- | -------------- | ------------------------------------------- |
| 🔴 1 | Mastered đang **Relearning** + đã đến hạn       | **100**        | Cao nhất — cần cứu ngay                     |
| 🟠 2 | **Quá hạn** (overdue, `due_at <= now`)          | **70 → 100**   | `70 + min(30, daysOverdue × 4) − level × 3` |
| 🟡 3 | Chưa từng test (`tested_at == null`)            | **35 hoặc 50** | 50 nếu chưa có progress, 35 nếu chưa có due |
| 🟢 4 | Đã test, chưa quá hạn, **chưa** mastered        | **10 → 70**    | `40 − level × 4 + (1 − retention) × 30`     |
| ⚪ 5 | Vừa test trong **1 giờ** gần đây                | **0 → 1**      | Gần như loại                                |
| ❌   | Mastered + **không** relearning                 | **−1**         | Bị loại khỏi quiz                           |
| ❌   | Mastered đang relearning nhưng **chưa** đến hạn | **−1**         | Bị loại khỏi quiz                           |

### Yếu tố phụ ảnh hưởng điểm

- **Level càng thấp** → priority càng cao (cần học thêm).
- **Càng quá hạn lâu** → priority càng cao (mỗi ngày overdue +4 điểm, trần +30).
- **Retention càng thấp** (sắp quên) → priority càng cao.
  - `retention = exp(−0.105 × daysSinceReview / stability)` — càng xa lần test trước hoặc stability càng nhỏ thì retention càng tụt.

### Ví dụ thứ tự một quiz điển hình

```
1. "ephemeral" — mastered, vừa sai hôm qua, đang relearning      → 100
2. "obfuscate" — quá hạn 5 ngày, level 1                         → 70 + 20 − 3 = 87
3. "succinct"  — quá hạn 1 ngày, level 2                         → 70 + 4 − 6  = 68
4. "verbose"   — chưa từng test                                  → 50
5. "concise"   — đến hạn hôm nay, level 2, retention 0.6         → 40 − 8 + 12 = 44
6. "nuance"    — đến hạn hôm nay, level 0, retention 0.9         → 40 + 3      = 43
... (tối đa 20 từ)
```

> **Chú ý**: Trang Review (flashcard) **không** update SRS — chỉ trang **Quiz/Test** mới ghi điểm và đẩy `due_at` ra xa. Đây là design có chủ đích để người dùng có thể xem lại tự do mà không "đốt" lịch ôn.

---

## 4. Relearning — vòng cứu trí nhớ khi đã nhớ rồi mà quên

Khi từ **đã mastered** (level ≥ 3) bị trả lời sai (AGAIN), hệ thống **không** xóa hết tiến độ mà chuyển sang chế độ Relearning hai bước ([mastery-scheduler.ts:179-235](../../lib/mastery-scheduler.ts#L179-L235)):

```
[Mastered] ──AGAIN──► Step 0 (due +10 phút, stability × 0.2)
                         │
                         ├─AGAIN──► Step 0 lại (stability × 0.5)
                         │
                         └─GOOD/EASY──► Step 1 (due +24 giờ)
                                          │
                                          ├─AGAIN──► về Step 0
                                          │
                                          └─GOOD/EASY──► thoát relearning,
                                                          lịch chuẩn theo stability mới
```

- `RELEARNING_STEPS_MIN = [10, 1440]` phút (= 10 phút, 24 giờ).
- Trong khi Relearning, từ này được **ưu tiên cao nhất** (priority 100) khi đến hạn.
- `lapse_count` tăng lên để theo dõi số lần từ này "rơi rụng" sau khi mastered.

---

## 5. Quick reference

| Câu hỏi                                   | Đáp án                                                     |
| ----------------------------------------- | ---------------------------------------------------------- |
| Bao nhiêu lần đúng để mastered?           | ~3 lần GOOD liên tiếp (hoặc 2 lần EASY) từ level 0         |
| Mastered xong có còn hiện trong quiz?     | Không, trừ khi sai → vào relearning                        |
| Sai 1 lần là mất hết tiến độ?             | Không. Level chỉ −1 (hoặc −2 nếu đang mastered), sàn 0     |
| Bao lâu thì nhắc lại sau khi GOOD đầu?    | ~3 ngày                                                    |
| Bao lâu thì nhắc lại khi đã mastered lâu? | Vài tháng (interval × 2.5 mỗi lần GOOD)                    |
| Quên 1 từ mastered thì sao?               | Vào relearning: ôn lại sau 10 phút, rồi 24h, rồi mới thoát |
| Quiz lấy tối đa bao nhiêu từ?             | 20 từ/lượt, sort theo priority                             |
| Trang Flashcard có làm tăng `due_at`?     | Không — chỉ Quiz/Test mới cập nhật SRS                     |
