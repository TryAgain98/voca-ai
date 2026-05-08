# Relearning

Từ đã thuộc (`level ≥ 3`) mà trả lời **sai** → vào trạng thái relearning, ôn lại theo interval ngắn rồi mới quay về SRS thường.

## Flow

| Chặng    | Kết quả           | `step` | Due kế tiếp              |
| -------- | ----------------- | ------ | ------------------------ |
| Lapse    | Sai (từ mastered) | `0`    | +10 phút                 |
| Ôn 1     | Đúng              | `1`    | +1 ngày                  |
| Graduate | Đúng              | tắt cờ | Theo SRS (vài ngày/tuần) |

Sai ở bất kỳ chặng nào → reset `step=0`, due lại +10 phút.

## Ví dụ

`ephemeral` (level 4):

1. **1/5 09:00** sai → due **1/5 09:10**
2. **1/5 09:15** đúng → due **2/5 09:15**
3. **2/5 09:30** đúng → graduate, due **6/5**

## Constants

[lib/mastery-scheduler.ts](../../lib/mastery-scheduler.ts):

```ts
const RELEARNING_STEPS_MIN = [10, 1440] // 10 phút → 1 ngày
```
