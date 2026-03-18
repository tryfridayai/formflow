-- FormFlow Database Schema
-- Run this against a fresh Supabase project to set up all tables

-- ============================================================
-- 1. Profiles (extends Supabase Auth)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger function (shared)
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- ============================================================
-- 2. Forms
-- ============================================================
create table public.forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Untitled Form',
  description text,
  status text not null default 'draft' check (status in ('draft', 'published', 'closed')),
  theme jsonb not null default '{
    "primaryColor": "#6366f1",
    "backgroundColor": "#ffffff",
    "textColor": "#111827",
    "fontFamily": "Inter",
    "backgroundImage": null,
    "darkMode": false,
    "borderRadius": "md"
  }'::jsonb,
  show_progress_bar boolean default true,
  allow_multiple_submissions boolean default false,
  close_date timestamptz,
  close_message text default 'This form is no longer accepting responses.',
  redirect_url text,
  slug text unique not null,
  response_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index forms_user_id_idx on public.forms(user_id);
create index forms_slug_idx on public.forms(slug);

alter table public.forms enable row level security;

create policy "Users can view their own forms"
  on public.forms for select using (auth.uid() = user_id);
create policy "Anyone can view published forms"
  on public.forms for select using (status = 'published');
create policy "Users can create forms"
  on public.forms for insert with check (auth.uid() = user_id);
create policy "Users can update their own forms"
  on public.forms for update using (auth.uid() = user_id);
create policy "Users can delete their own forms"
  on public.forms for delete using (auth.uid() = user_id);

create trigger forms_updated_at
  before update on public.forms
  for each row execute function public.update_updated_at();

-- ============================================================
-- 3. Questions
-- ============================================================
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  type text not null check (type in (
    'short_text', 'long_text', 'email', 'number', 'phone',
    'multiple_choice', 'dropdown', 'rating', 'opinion_scale',
    'date', 'yes_no', 'file_upload', 'url', 'welcome_screen', 'end_screen'
  )),
  title text not null,
  description text,
  required boolean default false,
  properties jsonb not null default '{}'::jsonb,
  order_index integer not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index questions_form_id_order_idx on public.questions(form_id, order_index);

alter table public.questions enable row level security;

create policy "Users can manage questions on their forms"
  on public.questions for all
  using (exists (
    select 1 from public.forms where forms.id = questions.form_id and forms.user_id = auth.uid()
  ));
create policy "Anyone can view questions of published forms"
  on public.questions for select
  using (exists (
    select 1 from public.forms where forms.id = questions.form_id and forms.status = 'published'
  ));

create trigger questions_updated_at
  before update on public.questions
  for each row execute function public.update_updated_at();

-- ============================================================
-- 4. Logic Rules
-- ============================================================
create table public.logic_rules (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  source_question_id uuid not null references public.questions(id) on delete cascade,
  condition jsonb not null,
  target_question_id uuid references public.questions(id) on delete set null,
  jump_to_end boolean default false,
  created_at timestamptz default now()
);

create index logic_rules_form_id_idx on public.logic_rules(form_id);
create index logic_rules_source_question_idx on public.logic_rules(source_question_id);

alter table public.logic_rules enable row level security;

create policy "Users can manage logic rules on their forms"
  on public.logic_rules for all
  using (exists (
    select 1 from public.forms where forms.id = logic_rules.form_id and forms.user_id = auth.uid()
  ));
create policy "Anyone can view logic rules of published forms"
  on public.logic_rules for select
  using (exists (
    select 1 from public.forms where forms.id = logic_rules.form_id and forms.status = 'published'
  ));

-- ============================================================
-- 5. Responses
-- ============================================================
create table public.responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  respondent_id uuid references public.profiles(id) on delete set null,
  started_at timestamptz default now(),
  completed_at timestamptz,
  is_complete boolean default false,
  duration_seconds integer,
  metadata jsonb,
  created_at timestamptz default now()
);

create index responses_form_id_idx on public.responses(form_id);
create index responses_form_id_created_at_idx on public.responses(form_id, created_at);

alter table public.responses enable row level security;

create policy "Anyone can submit responses to published forms"
  on public.responses for insert
  with check (exists (
    select 1 from public.forms where forms.id = responses.form_id and forms.status = 'published'
  ));
create policy "Form owners can view responses"
  on public.responses for select
  using (exists (
    select 1 from public.forms where forms.id = responses.form_id and forms.user_id = auth.uid()
  ));
create policy "Form owners can delete responses"
  on public.responses for delete
  using (exists (
    select 1 from public.forms where forms.id = responses.form_id and forms.user_id = auth.uid()
  ));

-- ============================================================
-- 6. Answers
-- ============================================================
create table public.answers (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.responses(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  value text,
  file_url text,
  created_at timestamptz default now()
);

create index answers_response_id_idx on public.answers(response_id);
create index answers_question_id_idx on public.answers(question_id);

alter table public.answers enable row level security;

create policy "Anyone can submit answers to published forms"
  on public.answers for insert
  with check (exists (
    select 1 from public.responses r
    join public.forms f on f.id = r.form_id
    where r.id = answers.response_id and f.status = 'published'
  ));
create policy "Form owners can view answers"
  on public.answers for select
  using (exists (
    select 1 from public.responses r
    join public.forms f on f.id = r.form_id
    where r.id = answers.response_id and f.user_id = auth.uid()
  ));
create policy "Form owners can delete answers"
  on public.answers for delete
  using (exists (
    select 1 from public.responses r
    join public.forms f on f.id = r.form_id
    where r.id = answers.response_id and f.user_id = auth.uid()
  ));

-- ============================================================
-- 7. Triggers
-- ============================================================

-- Increment response_count when a response is completed
create or replace function public.increment_response_count()
returns trigger as $$
begin
  if new.is_complete = true and (old is null or old.is_complete = false) then
    update public.forms
    set response_count = response_count + 1
    where id = new.form_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_response_complete
  after insert or update on public.responses
  for each row execute function public.increment_response_count();
