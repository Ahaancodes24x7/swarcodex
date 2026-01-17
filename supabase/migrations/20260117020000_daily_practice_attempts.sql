-- Daily Practice Attempts table for Parent Dashboard self-efficacy module
-- Creates table, indexes, and RLS policies for parents

create table if not exists public.daily_practice_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  parent_id uuid references public.profiles(id),
  parent_email text,
  date date not null default current_date,
  session_type text not null check (session_type in ('dyslexia','dyscalculia')),
  question_text text not null,
  expected_answer text not null,
  response_text text not null,
  correct boolean not null,
  confidence integer not null check (confidence >= 0 and confidence <= 100),
  streak integer not null default 1 check (streak >= 0),
  created_at timestamptz not null default now()
);

create index if not exists daily_practice_attempts_student_date_idx
  on public.daily_practice_attempts (student_id, date);

alter table public.daily_practice_attempts enable row level security;

-- Parents can insert attempts only for students linked to them
create policy if not exists "parents_insert_own_attempts"
  on public.daily_practice_attempts
  for insert
  to authenticated
  with check (
    -- Parent identity matches their profile
    parent_id in (
      select id from public.profiles where user_id = auth.uid()
    )
    and (
      -- Student is linked to the parent by id or email
      student_id in (
        select s.id from public.students s
        where s.parent_id in (select id from public.profiles where user_id = auth.uid())
           or s.parent_email in (select email from public.profiles where user_id = auth.uid())
      )
    )
  );

-- Parents can view attempts for their linked students
create policy if not exists "parents_select_linked_attempts"
  on public.daily_practice_attempts
  for select
  to authenticated
  using (
    student_id in (
      select s.id from public.students s
      where s.parent_id in (select id from public.profiles where user_id = auth.uid())
         or s.parent_email in (select email from public.profiles where user_id = auth.uid())
    )
  );
