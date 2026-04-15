create table if not exists public.user_feedback (
  id          uuid        primary key default gen_random_uuid(),
  section     text        not null default 'General',
  message     text        not null,
  page        text,
  user_id     text,
  is_read     boolean     not null default false,
  admin_note  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.user_feedback enable row level security;

drop policy if exists "Anyone can submit feedback"   on public.user_feedback;
drop policy if exists "Anon can read feedback"       on public.user_feedback;
drop policy if exists "Anon can update feedback"     on public.user_feedback;
drop policy if exists "Anon can delete feedback"     on public.user_feedback;

create policy "Anyone can submit feedback"
  on public.user_feedback for insert
  with check (true);

create policy "Anon can read feedback"
  on public.user_feedback for select
  to anon using (true);

create policy "Anon can update feedback"
  on public.user_feedback for update
  to anon using (true) with check (true);

create policy "Anon can delete feedback"
  on public.user_feedback for delete
  to anon using (true);

create or replace function public.set_user_feedback_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_feedback_updated_at on public.user_feedback;
create trigger trg_user_feedback_updated_at
before update on public.user_feedback
for each row execute function public.set_user_feedback_updated_at();
