-- Base schema: profiles, books, sources, chapters, chunks + evidence chain
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Books
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  central_idea TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  cover_prompt TEXT,
  litle_signature TEXT,
  litle_id TEXT,
  stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books TO authenticated;
GRANT ALL ON public.books TO service_role;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own books" ON public.books FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public read published books" ON public.books FOR SELECT TO anon USING (status = 'published');
GRANT SELECT ON public.books TO anon;
CREATE INDEX books_user_idx ON public.books(user_id, created_at DESC);
CREATE UNIQUE INDEX books_litle_id_idx ON public.books(litle_id) WHERE litle_id IS NOT NULL;

-- Sources
CREATE TABLE public.sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime TEXT,
  size INTEGER,
  extracted_text TEXT,
  char_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sources TO authenticated;
GRANT ALL ON public.sources TO service_role;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own sources" ON public.sources FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX sources_book_idx ON public.sources(book_id);

-- Chapters
CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_idx INTEGER NOT NULL,
  title TEXT NOT NULL,
  centroid JSONB,
  synthesized_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chapters TO authenticated;
GRANT ALL ON public.chapters TO service_role;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own chapters" ON public.chapters FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX chapters_book_idx ON public.chapters(book_id, order_idx);

-- Chunks
CREATE TABLE public.chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  embedding JSONB,
  order_idx INTEGER NOT NULL,
  superseded_by UUID REFERENCES public.chunks(id) ON DELETE SET NULL,
  similarity_score REAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chunks TO authenticated;
GRANT ALL ON public.chunks TO service_role;
ALTER TABLE public.chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own chunks" ON public.chunks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX chunks_book_idx ON public.chunks(book_id);
CREATE INDEX chunks_chapter_idx ON public.chunks(chapter_id);

-- Evidence Chain (RFC-0008)
CREATE TABLE public.evidence_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  litle_id TEXT NOT NULL,
  work_type TEXT NOT NULL DEFAULT 'BK',
  namespace TEXT,
  crypto_profile TEXT NOT NULL DEFAULT 'L-512.v1',
  is_published BOOLEAN NOT NULL DEFAULT false,
  root_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence_records TO authenticated;
GRANT ALL ON public.evidence_records TO service_role;
GRANT SELECT ON public.evidence_records TO anon;
ALTER TABLE public.evidence_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own evidence records" ON public.evidence_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public read published evidence records" ON public.evidence_records FOR SELECT TO anon USING (is_published = true);
CREATE UNIQUE INDEX evidence_records_litle_id_idx ON public.evidence_records(litle_id);
CREATE INDEX evidence_records_user_idx ON public.evidence_records(user_id, created_at DESC);

CREATE TABLE public.evidence_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES public.evidence_records(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.evidence_nodes(id) ON DELETE CASCADE,
  node_type TEXT NOT NULL,
  label TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence_nodes TO authenticated;
GRANT ALL ON public.evidence_nodes TO service_role;
GRANT SELECT ON public.evidence_nodes TO anon;
ALTER TABLE public.evidence_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own evidence nodes" ON public.evidence_nodes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public read published evidence nodes" ON public.evidence_nodes FOR SELECT TO anon USING (
  EXISTS (SELECT 1 FROM public.evidence_records r WHERE r.id = record_id AND r.is_published = true)
);
CREATE INDEX evidence_nodes_record_idx ON public.evidence_nodes(record_id, created_at);
CREATE INDEX evidence_nodes_parent_idx ON public.evidence_nodes(parent_id);