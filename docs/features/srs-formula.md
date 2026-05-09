# SRS Formula — Công thức tính Level & Interval

> Nguồn: [lib/mastery-scheduler.ts](../../lib/mastery-scheduler.ts)

---

## 1. Grade — suy ra từ kết quả test

```
isCorrect = false                 → AGAIN (1)
isCorrect = true,  t ≤ 5s         → EASY  (4)
isCorrect = true,  5s < t < 10s   → GOOD  (3)
isCorrect = true,  t ≥ 10s        → HARD  (2)
isCorrect = true,  t ≥ 20s        → HARD  (2)   // no-progress timeout
isCorrect = true,  t = null       → GOOD  (3)
```

---

## 2. Level — công thức

```
AGAIN:  level' = max(0, level − 1)              // chưa mastered
        level' = max(0, level − 2)              // đang mastered (level ≥ 3)
HARD:   level' = level
GOOD:   level' = min(5, level + 1)
EASY:   level' = min(5, level + 2)
```

**Mastered** khi `level ≥ 3`. Trần `5`, sàn `0`.

---

## 3. Ease & Difficulty — cập nhật mỗi lần trả lời

Cả `ease` và `difficulty` đều được cộng/trừ theo grade rồi clamp vào range hợp lệ.

```
ease'       = clamp(ease + EASE_DELTA[grade],             1.3, 3.0)   // default 2.5
difficulty' = clamp(difficulty + DIFFICULTY_DELTA[grade], 1,   10)    // default 5
```

| grade | Δ ease | Δ difficulty | ý nghĩa                        |
| ----- | ------ | ------------ | ------------------------------ |
| AGAIN | −0.20  | +1.0         | quên → từ khó hơn, ease giảm   |
| HARD  | −0.05  | +0.4         | chậm → khó hơn 1 chút          |
| GOOD  | +0.05  | −0.1         | đúng chuẩn → dễ dần            |
| EASY  | +0.15  | −0.4         | nhanh → từ dễ, ease tăng nhanh |

> `ease'` và `difficulty'` mới được dùng để tính `stability'` ngay trong cùng lượt trả lời (xem section 4 bên dưới) — không phải dùng giá trị cũ.

### Ví dụ chuỗi cập nhật

```
Khởi tạo:  ease = 2.5,  difficulty = 5
GOOD:      ease = 2.55, difficulty = 4.9
GOOD:      ease = 2.60, difficulty = 4.8
AGAIN:     ease = 2.40, difficulty = 5.8
HARD:      ease = 2.35, difficulty = 6.2
EASY:      ease = 2.50, difficulty = 5.8
```

---

## 4. Interval (số ngày due) — công thức

```
stability' = max(prevStability, 1) × MULT[grade] × easeBoost × difficultyPenalty
interval   = max(1, round(stability'))                          // đơn vị: ngày
due_at     = now + interval ngày
```

| grade | MULT | ghi chú                                 |
| ----- | ---- | --------------------------------------- |
| AGAIN | —    | reset: `stability' = max(0.5, S × 0.2)` |
| HARD  | 1.2  |                                         |
| GOOD  | 2.5  |                                         |
| EASY  | 4.0  |                                         |

```
easeBoost         = ease / 2.5                  // ease ∈ [1.3, 3.0], default 2.5
difficultyPenalty = 1 − (difficulty − 5) × 0.05 // difficulty ∈ [1, 10], default 5
```

### Ngoại lệ (override công thức trên)

| Case                              | due_at                                           |
| --------------------------------- | ------------------------------------------------ |
| AGAIN, **chưa** mastered          | `max(now + 5h, 00:00 hôm sau)`                   |
| AGAIN, **đang** mastered (lapse)  | `now + 10 phút` → vào Relearning step 0          |
| Relearning, GOOD/EASY tại step 0  | `now + 24h` → step 1                             |
| Relearning, GOOD/EASY tại step 1  | thoát relearning → tính theo công thức stability |
| Relearning, AGAIN tại bất kỳ step | `now + 10 phút`, stability × 0.5, về step 0      |

---

## 5. Ví dụ — ALL CASES

> Mỗi case theo format: **Trước** → **Δ ease/difficulty** → **Tính lại** → **Sau**.

### Case 1 — GOOD lần đầu

```
Trước:        level=0, S=0, ease=2.5, difficulty=5
Grade:        GOOD (Δease +0.05, Δdiff −0.1)
ease'         = 2.5 + 0.05 = 2.55
difficulty'   = 5   − 0.1  = 4.9
easeBoost     = 2.55 / 2.5            = 1.02
diffPenalty   = 1 − (4.9 − 5) × 0.05  = 1.005
level'        = 0 + 1 = 1
stability'    = max(0, 1) × 2.5 × 1.02 × 1.005 ≈ 2.56
interval      = round(2.56) = 3 ngày
Sau:          level=1, S=2.56, ease=2.55, difficulty=4.9, due=now+3d
```

### Case 2 — GOOD chuỗi tới mastered (tiếp Case 1)

```
─ Lần 2 ─
Trước:        level=1, S=2.56, ease=2.55, difficulty=4.9
Grade:        GOOD
ease'         = 2.55 + 0.05 = 2.60
difficulty'   = 4.9  − 0.1  = 4.8
easeBoost     = 2.60 / 2.5            = 1.04
diffPenalty   = 1 − (4.8 − 5) × 0.05  = 1.01
level'        = 2
stability'    = 2.56 × 2.5 × 1.04 × 1.01 ≈ 6.73
interval      = 7 ngày

─ Lần 3 ─
Trước:        level=2, S=6.73, ease=2.60, difficulty=4.8
Grade:        GOOD
ease'         = 2.65
difficulty'   = 4.7
easeBoost     = 2.65 / 2.5            = 1.06
diffPenalty   = 1 − (4.7 − 5) × 0.05  = 1.015
level'        = 3 ✅ Mastered
stability'    = 6.73 × 2.5 × 1.06 × 1.015 ≈ 18.10
interval      = 18 ngày
```

### Case 3 — EASY (level 0, S=0)

```
Trước:        level=0, S=0, ease=2.5, difficulty=5
Grade:        EASY (Δease +0.15, Δdiff −0.4)
ease'         = 2.5 + 0.15 = 2.65
difficulty'   = 5   − 0.4  = 4.6
easeBoost     = 2.65 / 2.5            = 1.06
diffPenalty   = 1 − (4.6 − 5) × 0.05  = 1.02
level'        = 0 + 2 = 2
stability'    = max(0, 1) × 4.0 × 1.06 × 1.02 ≈ 4.32
interval      = 4 ngày
Sau:          level=2, S=4.32, ease=2.65, difficulty=4.6, due=now+4d
```

### Case 4 — HARD (tiếp Case 2, lần 2: level=2, S=6.73)

```
Trước:        level=2, S=6.73, ease=2.55, difficulty=4.9
Grade:        HARD (Δease −0.05, Δdiff +0.4)
ease'         = 2.55 − 0.05 = 2.50
difficulty'   = 4.9  + 0.4  = 5.3
easeBoost     = 2.50 / 2.5            = 1.00
diffPenalty   = 1 − (5.3 − 5) × 0.05  = 0.985
level'        = 2 (giữ nguyên)
stability'    = 6.73 × 1.2 × 1.00 × 0.985 ≈ 7.95
interval      = 8 ngày
Sau:          level=2, S=7.95, ease=2.50, difficulty=5.3, due=now+8d
```

### Case 5 — AGAIN, chưa mastered (tiếp Case 2, lần 2: level=2, S=6.73)

```
Trước:        level=2, S=6.73, ease=2.55, difficulty=4.9
Grade:        AGAIN (Δease −0.20, Δdiff +1.0)
ease'         = 2.55 − 0.20 = 2.35
difficulty'   = 4.9  + 1.0  = 5.9
level'        = max(0, 2 − 1) = 1
stability'    = max(0.5, 6.73 × 0.2) = 1.346    // override (reset)
due_at        = max(now + 5h, 00:00 hôm sau)
                // 14:00 → due 00:00 mai;  21:00 → due 02:00 mai
Sau:          level=1, S=1.35, ease=2.35, difficulty=5.9
```

> AGAIN không dùng `easeBoost`/`diffPenalty` để tính stability (dùng formula reset).
> `ease` và `difficulty` vẫn cập nhật bình thường để dùng cho lần test kế tiếp.

### Case 6 — AGAIN, đang mastered (lapse) (level 4, S=60)

```
Trước:        level=4, S=60, ease=2.5, difficulty=5
Grade:        AGAIN (mastered → lapse)
ease'         = 2.30
difficulty'   = 6.0
level'        = max(0, 4 − 2) = 2
stability'    = max(0.5, 60 × 0.2) = 12
isRelearning: true, step=0
due_at        = now + 10 phút
Sau:          level=2, S=12, ease=2.30, difficulty=6.0, relearning step 0
```

### Case 7 — Relearning step 0 → GOOD (tiếp Case 6)

```
Trước:        level=2, S=12, ease=2.30, difficulty=6.0, step=0
Grade:        GOOD
ease'         = 2.35
difficulty'   = 5.9
level'        = 3
stability'    = 12 (giữ nguyên — chưa tính lại trong relearning step)
isRelearning: true, step=1
due_at        = now + 24h
Sau:          level=3, S=12, ease=2.35, difficulty=5.9, relearning step 1
```

### Case 8 — Relearning step 1 → GOOD, thoát relearning (tiếp Case 7)

```
Trước:        level=3, S=12, ease=2.35, difficulty=5.9, step=1
Grade:        GOOD
ease'         = 2.40
difficulty'   = 5.8
easeBoost     = 2.40 / 2.5            = 0.96
diffPenalty   = 1 − (5.8 − 5) × 0.05  = 0.96
level'        = 4
stability'    = max(12, 1) × 2.5 × 0.96 × 0.96 ≈ 27.65
isRelearning: false
interval      = 28 ngày
Sau:          level=4, S=27.65, ease=2.40, difficulty=5.8, due=now+28d
```

### Case 9 — Relearning → AGAIN, rớt lại step 0

```
Trước:        level=2, S=12, ease=2.40, difficulty=5.8, step=1, relearning
Grade:        AGAIN
ease'         = 2.40 − 0.20 = 2.20
difficulty'   = 5.8  + 1.0  = 6.8
level'        = max(0, 2 − 1) = 1
stability'    = max(0.5, 12 × 0.5) = 6
isRelearning: true, step=0
due_at        = now + 10 phút
Sau:          level=1, S=6, ease=2.20, difficulty=6.8
```

> Nếu trong relearning mà `level ≥ 3` (mastered) và AGAIN → đi nhánh **lapse** (Case 6) thay vì nhánh này.

### Case 10 — Trần level (level 5, S=30, EASY)

```
Trước:        level=5, S=30, ease=2.5, difficulty=5
Grade:        EASY
ease'         = 2.65
difficulty'   = 4.6
easeBoost     = 1.06
diffPenalty   = 1.02
level'        = min(5, 5 + 2) = 5         // chạm trần
stability'    = 30 × 4.0 × 1.06 × 1.02 ≈ 129.74
interval      = 130 ngày
Sau:          level=5, S=129.74, ease=2.65, difficulty=4.6
```

### Case 11 — Sàn level (level 0, S=2, AGAIN)

```
Trước:        level=0, S=2, ease=2.5, difficulty=5
Grade:        AGAIN
ease'         = 2.30
difficulty'   = 6.0
level'        = max(0, 0 − 1) = 0         // chạm sàn
stability'    = max(0.5, 2 × 0.2) = 0.5
due_at        = max(now + 5h, 00:00 hôm sau)
Sau:          level=0, S=0.5, ease=2.30, difficulty=6.0
```

### Case 12 — Từ khó (low ease + high difficulty)

```
Trước:        level=2, S=10, ease=1.8, difficulty=8
Grade:        GOOD
ease'         = 1.8 + 0.05 = 1.85
difficulty'   = 8   − 0.1  = 7.9
easeBoost     = 1.85 / 2.5            = 0.74
diffPenalty   = 1 − (7.9 − 5) × 0.05  = 0.855
level'        = 3
stability'    = 10 × 2.5 × 0.74 × 0.855 ≈ 15.82
interval      = 16 ngày
Sau:          level=3, S=15.82, ease=1.85, difficulty=7.9
```

### Case 13 — Từ dễ (high ease + low difficulty, ease chạm trần)

```
Trước:        level=2, S=10, ease=3.0, difficulty=2
Grade:        GOOD
ease'         = clamp(3.0 + 0.05, 1.3, 3.0) = 3.0   // đã chạm trần
difficulty'   = 2 − 0.1 = 1.9
easeBoost     = 3.0 / 2.5             = 1.2
diffPenalty   = 1 − (1.9 − 5) × 0.05  = 1.155
level'        = 3
stability'    = 10 × 2.5 × 1.2 × 1.155 ≈ 34.65
interval      = 35 ngày
Sau:          level=3, S=34.65, ease=3.0, difficulty=1.9
```

---

## 6. Cheat sheet

| Tình huống            | Δlevel | Interval              |
| --------------------- | ------ | --------------------- |
| GOOD (chuẩn)          | +1     | S × 2.5               |
| EASY (nhanh ≤ 5s)     | +2     | S × 4.0               |
| HARD (chậm ≥ 10s)     | 0      | S × 1.2               |
| AGAIN — chưa mastered | −1     | ~đầu ngày mai         |
| AGAIN — đã mastered   | −2     | +10 phút (relearning) |
| Relearning step 0 ✓   | +1     | +24h                  |
| Relearning step 1 ✓   | +1     | S × 2.5 (thoát)       |
