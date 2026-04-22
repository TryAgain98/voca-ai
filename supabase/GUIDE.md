# Supabase Database Guide

## Setup (one-time)

```bash
npx supabase login        # Đăng nhập, mở browser xác thực
npm run db:link           # Link đến project remote
```

---

## Scripts

| Script                    | Lệnh                      | Mô tả                       |
| ------------------------- | ------------------------- | --------------------------- |
| `npm run db:new -- <tên>` | `supabase migration new`  | Tạo migration mới           |
| `npm run db:push`         | `supabase db push`        | Apply migrations lên remote |
| `npm run db:pull`         | `supabase db pull`        | Pull schema từ remote về    |
| `npm run db:status`       | `supabase migration list` | Xem danh sách migrations    |
| `npm run db:link`         | `supabase link`           | Link lại project remote     |

---

## Quy trình thay đổi schema

> **Nguyên tắc:** Mỗi thay đổi = 1 migration file mới. Không bao giờ sửa file migration cũ đã push.

### 1. Tạo migration mới

```bash
npm run db:new -- <tên_migration>

# Ví dụ:
npm run db:new -- add_level_to_lessons
npm run db:new -- create_users_table
npm run db:new -- drop_old_column
```

File được tạo tại `supabase/migrations/<timestamp>_<tên>.sql`.

### 2. Viết SQL vào file vừa tạo

### 3. Push lên remote

```bash
npm run db:push
```

---

## SQL thường dùng

### Thêm bảng mới

```sql
create table courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz default now()
);
```

### Thêm cột

```sql
alter table lessons add column level integer default 1;
alter table lessons add column created_at timestamptz default now();
alter table lessons add column is_published boolean default false;
```

### Xóa cột

```sql
alter table lessons drop column description;
```

### Đổi tên cột

```sql
alter table lessons rename column description to content;
```

### Đổi kiểu dữ liệu

```sql
alter table lessons alter column name type varchar(255);
```

### Thêm cột NOT NULL (cần default)

```sql
-- Bước 1: thêm cột với default
alter table lessons add column order_index integer default 0;
-- Bước 2: đặt NOT NULL sau khi đã có giá trị
alter table lessons alter column order_index set not null;
```

### Xóa bảng

```sql
drop table if exists lessons;
```

### Thêm index

```sql
create index on lessons (name);
create unique index on lessons (name);
```

### Foreign key

```sql
alter table lessons add column course_id uuid references courses(id) on delete cascade;
```

---

## Kiểm tra trạng thái

```bash
npm run db:status   # Xem migration nào đã apply, chưa apply
```
