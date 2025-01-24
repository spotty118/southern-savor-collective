-- Create collections table
create table public.collections (
    id uuid not null default uuid_generate_v4(),
    name text not null,
    user_id uuid not null references auth.users on delete cascade,
    created_at timestamp with time zone not null default timezone('utc'::text, now()),
    primary key (id)
);

-- Create collection_recipes junction table for many-to-many relationship
create table public.collection_recipes (
    collection_id uuid not null references public.collections on delete cascade,
    recipe_id uuid not null references public.recipes on delete cascade,
    created_at timestamp with time zone not null default timezone('utc'::text, now()),
    primary key (collection_id, recipe_id)
);

-- Enable RLS
alter table public.collections enable row level security;
alter table public.collection_recipes enable row level security;

-- Create policies
create policy "Users can create their own collections"
    on public.collections for insert
    with check (auth.uid() = user_id);

create policy "Users can view their own collections"
    on public.collections for select
    using (auth.uid() = user_id);

create policy "Users can update their own collections"
    on public.collections for update
    using (auth.uid() = user_id);

create policy "Users can delete their own collections"
    on public.collections for delete
    using (auth.uid() = user_id);

create policy "Users can manage their collection recipes"
    on public.collection_recipes for all
    using (auth.uid() = (
        select user_id from public.collections
        where id = collection_id
    ));
