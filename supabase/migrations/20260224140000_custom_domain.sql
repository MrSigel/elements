alter table channels
  add column if not exists custom_domain text;

-- Unique so two channels can't claim the same domain
create unique index if not exists channels_custom_domain_unique
  on channels (custom_domain)
  where custom_domain is not null;
