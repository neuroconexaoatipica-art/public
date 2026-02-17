
-- ============================================================
-- NEUROCONEXAO ATIPICA
-- CANONICAL DATABASE STATE V7
-- Data: 2026-02-17
-- Inclui:
-- - Estrutura ajustada
-- - FK CASCADE
-- - Índices
-- - RPC
-- - Trigger
-- - RLS definitivo v7_
-- ============================================================

-- ============================================================
-- ====================== FASE A ==============================
-- ============================================================

-- A1. Garantir colunas
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='posts' AND column_name='image_url') THEN
    ALTER TABLE public.posts ADD COLUMN image_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='posts' AND column_name='is_pinned') THEN
    ALTER TABLE public.posts ADD COLUMN is_pinned BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='whatsapp') THEN
    ALTER TABLE public.users ADD COLUMN whatsapp TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='beta_lifetime') THEN
    ALTER TABLE public.users ADD COLUMN beta_lifetime TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='allow_whatsapp') THEN
    ALTER TABLE public.users ADD COLUMN allow_whatsapp BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='allow_email') THEN
    ALTER TABLE public.users ADD COLUMN allow_email BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='terms_version') THEN
    ALTER TABLE public.users ADD COLUMN terms_version TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='terms_accepted_at') THEN
    ALTER TABLE public.users ADD COLUMN terms_accepted_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='updated_at') THEN
    ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- A2. FIX CASCADE
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_author_fkey;
ALTER TABLE public.comments
  ADD CONSTRAINT comments_author_fkey
  FOREIGN KEY (author) REFERENCES public.users(id) ON DELETE CASCADE;

-- A3. CHECK constraints
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS chk_name_length;
ALTER TABLE public.users ADD CONSTRAINT chk_name_length CHECK (char_length(name) BETWEEN 1 AND 100);

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS chk_bio_length;
ALTER TABLE public.users ADD CONSTRAINT chk_bio_length CHECK (bio IS NULL OR char_length(bio) <= 1000);

ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS chk_content_length;
ALTER TABLE public.posts ADD CONSTRAINT chk_content_length CHECK (char_length(content) BETWEEN 1 AND 5000);

ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS chk_comment_length;
ALTER TABLE public.comments ADD CONSTRAINT chk_comment_length CHECK (char_length(content) BETWEEN 1 AND 1000);

-- A4. Índices
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_posts_community ON public.posts(community, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_posts_public ON public.posts(created_at DESC, id DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON public.posts(is_pinned, created_at DESC) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- A5. admin_logs
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- A6. RPC seats
CREATE OR REPLACE FUNCTION public.get_seats_count()
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM public.users
  WHERE role IN ('member', 'founder', 'admin');
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- A7. updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- A8. handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, name, role, access_released, onboarding_done,
    whatsapp, allow_whatsapp, allow_email,
    terms_version, terms_accepted_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Membro'),
    'user_free',
    FALSE,
    FALSE,
    CASE
      WHEN NEW.raw_user_meta_data->>'whatsapp' IS NOT NULL
      THEN ARRAY[NEW.raw_user_meta_data->>'whatsapp']
      ELSE NULL
    END,
    COALESCE((NEW.raw_user_meta_data->>'allow_whatsapp')::boolean, FALSE),
    COALESCE((NEW.raw_user_meta_data->>'allow_email')::boolean, TRUE),
    COALESCE(NEW.raw_user_meta_data->>'terms_version', '1.0'),
    now()
  );
  RETURN NEW;
EXCEPTION WHEN unique_violation THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sync roles
UPDATE public.users SET access_released = true
WHERE role IN ('member', 'founder', 'admin') AND access_released = false;

UPDATE public.users SET access_released = false
WHERE role = 'user_free' AND access_released = true;

-- ============================================================
-- ====================== FASE B ==============================
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Drop todas policies
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- USERS
CREATE POLICY "v7_users_select" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "v7_users_select_anon" ON public.users FOR SELECT TO anon USING (true);
CREATE POLICY "v7_users_insert" ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "v7_users_update_own" ON public.users FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role IS NOT DISTINCT FROM (SELECT role FROM public.users WHERE id = auth.uid())
    AND access_released IS NOT DISTINCT FROM (SELECT access_released FROM public.users WHERE id = auth.uid())
  );
CREATE POLICY "v7_users_update_admin" ON public.users FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "v7_users_delete" ON public.users FOR DELETE TO authenticated USING (auth.uid() = id);

-- POSTS
CREATE POLICY "v7_posts_select" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "v7_posts_select_anon" ON public.posts FOR SELECT TO anon USING (is_public = true);
CREATE POLICY "v7_posts_insert" ON public.posts FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author
    AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('member','founder','admin')
  );
CREATE POLICY "v7_posts_update" ON public.posts FOR UPDATE TO authenticated
  USING (
    auth.uid() = author
    OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('founder','admin')
  );
CREATE POLICY "v7_posts_delete" ON public.posts FOR DELETE TO authenticated
  USING (
    auth.uid() = author
    OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('founder','admin')
  );

-- COMMENTS
CREATE POLICY "v7_comments_select" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "v7_comments_insert" ON public.comments FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author
    AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('member','founder','admin')
  );
CREATE POLICY "v7_comments_delete" ON public.comments FOR DELETE TO authenticated
  USING (
    auth.uid() = author
    OR (SELECT role FROM public.users WHERE id = auth.uid()) IN ('founder','admin')
  );

-- COMMUNITIES
CREATE POLICY "v7_communities_select" ON public.communities FOR SELECT TO authenticated USING (true);
CREATE POLICY "v7_communities_select_anon" ON public.communities FOR SELECT TO anon USING (true);

-- ADMIN LOGS
CREATE POLICY "v7_admin_logs_insert" ON public.admin_logs FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "v7_admin_logs_select" ON public.admin_logs FOR SELECT TO authenticated
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');


