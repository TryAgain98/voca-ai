-- Special day templates could only target a single date. Replace it with
-- either a list of discrete dates or a contiguous date range, so one
-- template can cover e.g. a multi-day trip or a set of specific holidays.
alter table task_templates drop column special_date cascade;

alter table task_templates
  add column special_dates date[],
  add column special_date_start date,
  add column special_date_end date;

alter table task_templates
  add constraint task_templates_special_date_shape check (
    case
      when recurrence_kind = 'special_date' then
        (
          special_dates is not null and array_length(special_dates, 1) > 0
          and special_date_start is null and special_date_end is null
        )
        or
        (
          special_dates is null
          and special_date_start is not null and special_date_end is not null
          and special_date_end >= special_date_start
        )
      else
        special_dates is null
        and special_date_start is null
        and special_date_end is null
    end
  );

create index task_templates_special_dates_idx on task_templates
  using gin (special_dates)
  where recurrence_kind = 'special_date';

create index task_templates_special_range_idx on task_templates
  (user_id, special_date_start, special_date_end)
  where recurrence_kind = 'special_date';
