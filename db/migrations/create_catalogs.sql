-- Create catalogs table to store user catalogs and items
CREATE TABLE IF NOT EXISTS public.catalogs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT catalogs_pkey PRIMARY KEY (id),
  CONSTRAINT catalogs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.catalog_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  catalog_id uuid NOT NULL,
  item_type text NOT NULL, -- 'product' | 'service' | 'professional'
  item_id uuid NOT NULL,
  position integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT catalog_items_pkey PRIMARY KEY (id),
  CONSTRAINT catalog_items_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES public.catalogs(id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX idx_catalogs_user_id ON public.catalogs(user_id);
CREATE INDEX idx_catalog_items_catalog_id ON public.catalog_items(catalog_id);
CREATE INDEX idx_catalog_items_item_type_id ON public.catalog_items(item_type, item_id);
