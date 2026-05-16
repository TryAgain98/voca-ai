# Speech Exercise — Pass Logic & Scoring

## Pass Logic

Input: `expected` (từ cần đọc) + `alternatives[]` (tối đa 5 transcript từ browser).

### Bước 1 — Build candidates

Normalize tất cả (lowercase, bỏ dấu câu). Nếu expected là 1 từ, tách thêm từng word trong mỗi alternative:

```
expected = "write", alternative = "right now"
→ candidates = ["right now", "right", "now"]
```

### Bước 2 — Pass threshold

| Expected          | Threshold | Close threshold |
| ----------------- | --------- | --------------- |
| Phrase (≥2 words) | 0.65      | 0.50            |
| ≤3 chars          | 0.90      | 0.75            |
| ≤6 chars          | 0.75      | 0.60            |
| còn lại           | 0.70      | 0.55            |

### Bước 3 — Chấm từng candidate (ưu tiên từ trên xuống)

**Rank 6 — `exact-text`**
Sau normalize, expected === candidate.

---

**Rank 5 — `dictionary-homophone`** ← thư viện `cmu-pronouncing-dictionary`
Chỉ áp dụng cho **single word**. Tra CMU dict (static object ~130k entries), strip số stress, so sánh chuỗi ARPAbet:

```
dictionary["knight"] = "N AY1 T"  →  strip digits  →  "N AY T"
dictionary["night"]  = "N AY1 T"  →  strip digits  →  "N AY T"
"N AY T" === "N AY T"  →  PASS
```

Một từ có thể có nhiều cách phát âm (`read(1)`, `read(2)`...), kiểm tra tất cả.

---

**Rank 4 — `phonetic-code`** ← thư viện `double-metaphone`
Chỉ single word. Cần **đồng thời** 3 điều kiện:

1. sim ≥ 0.45
2. `consonantSkeleton(expected) === consonantSkeleton(candidate)` (bỏ vowels, dedup liên tiếp)
3. Ít nhất 1 phonetic code chung (mỗi word có 2 code: primary + secondary)

```
"knight" → skeleton "knt",  doubleMetaphone → ["NT", "NT"]
"night"  → skeleton "nt"  → skeleton khác  →  bị chặn ở điều kiện 2

"write"  → skeleton "wrt", doubleMetaphone → ["RT", "RT"]
"right"  → skeleton "rt"  → skeleton khác  →  bị chặn ở điều kiện 2

"center" → skeleton "cntr", codes ["SNTR", "SNTR"]
"senter" → skeleton "sntr"  → skeleton khác → FAIL
```

---

**Rank 3 — `consonant-skeleton`** ← custom logic
Chỉ single word. Cần **đồng thời**:

1. Cả 2 word ≤ 5 chars
2. sim ≥ 0.5
3. Cùng ký tự đầu
4. `normalize_lr(consonantSkeleton(a)) === normalize_lr(consonantSkeleton(b))` — r và l đều map thành `L`

```
consonantSkeleton("fill") = "fl"  (bỏ vowel i)
consonantSkeleton("film") = "flm" → khác → FAIL

consonantSkeleton("rill") = "rl"  → normalize_lr → "LL"
consonantSkeleton("lill") = "ll"  → normalize_lr → "LL"
nhưng first char "r" ≠ "l"  →  bị chặn ở điều kiện 3

consonantSkeleton("run") = "rn"  → normalize_lr → "Ln"
consonantSkeleton("lun") = "ln"  → normalize_lr → "Ln"  → NHƯNG first char r ≠ l → FAIL
```

---

**Rank 2 — `text-similarity`** ← custom logic
`sim ≥ threshold` là điều kiện cần. Với **single word ≤ 6 chars**, cần thêm:

- `vowelSkeleton(expected) === vowelSkeleton(spoken)`
- Ít nhất 1 phonetic code chung

Với phrase hoặc word > 6 chars: chỉ cần `sim ≥ threshold`.

```
vowelSkeleton("write") = strip consonants, bỏ trailing 'e', dedup → "i"
vowelSkeleton("right") = "i"  →  khớp
+ phonetic code "RT" chung  →  PASS

vowelSkeleton("cat") = "a"
vowelSkeleton("cut") = "u"  →  không khớp  →  FAIL
```

---

**Rank 1 — `phrase-main-part`** ← custom logic
Chỉ áp dụng khi expected là **phrase** (có space). Lấy word dài nhất ≥ 4 chars trong expected, kiểm tra nó có xuất hiện **exact** trong spoken không.

```
expected = "run up"  →  longest word ≥4 chars: không có  →  FAIL
expected = "break down"  →  "break"  →  spoken phải chứa "break" exact
```

---

**Rank 0 — `close`**
Không qua bất kỳ check nào ở trên, nhưng `sim ≥ closeThreshold`. UI hiện feedback nhưng không tính sai.

**Rank -1 — `retry`**
Tất cả fail. Tính 1 lần sai.

---

`isPass = rank >= 0` (bao gồm cả `close`)

### Bước 4 — Chọn best candidate

`rank cao hơn → score cao hơn → transcript ngắn hơn`

---

## Scoring

```
score       = similarity(expected, bestCandidate) * 100   ← raw [0..100]
displayScore = isPass ? clamp(round(score/10), 7, 10)     ← [7..10]
             :         clamp(round(score/10), 1,  6)      ← [1..6]
```

`similarity` = Levenshtein-based: `1 - editDistance / max(len_a, len_b)`

→ Pass luôn hiển thị ≥ 7/10, fail luôn ≤ 6/10.

---

## Kết quả UI

| Verdict            | Hành động                                                 |
| ------------------ | --------------------------------------------------------- |
| `isPass`           | Phát âm đúng → 1200ms → advance                           |
| `isClose` (rank=0) | Hiển thị feedback, **không** tính sai, không phát âm sai  |
| `retry`            | Phát âm sai → +1 attempt. Sau 2 lần → nút "Continue" hiện |

---

## Debug (dev only)

Mở DevTools Console, nói từ bất kỳ:

```
[SpeechDebug] knight -> PASS (dictionary-homophone)
```

`console.table` hiển thị toàn bộ candidates với score, reason, phonetic codes.
