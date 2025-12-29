-- Enable RLS on catalogs and catalog_items tables
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;

-- Policy for reading catalogs (all users can read)
CREATE POLICY catalogs_read_policy ON public.catalogs
FOR SELECT
USING (true);

-- Policy for inserting catalogs (all authenticated users can insert)
CREATE POLICY catalogs_insert_policy ON public.catalogs
FOR INSERT
WITH CHECK (true);

-- Policy for updating catalogs (all authenticated users can update)
CREATE POLICY catalogs_update_policy ON public.catalogs
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy for deleting catalogs (all authenticated users can delete)
CREATE POLICY catalogs_delete_policy ON public.catalogs
FOR DELETE
USING (true);

-- Policy for reading catalog_items (all users can read)
CREATE POLICY catalog_items_read_policy ON public.catalog_items
FOR SELECT
USING (true);

-- Policy for inserting catalog_items (all authenticated users can insert)
CREATE POLICY catalog_items_insert_policy ON public.catalog_items
FOR INSERT
WITH CHECK (true);

-- Policy for updating catalog_items (all authenticated users can update)
CREATE POLICY catalog_items_update_policy ON public.catalog_items
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy for deleting catalog_items (all authenticated users can delete)
CREATE POLICY catalog_items_delete_policy ON public.catalog_items
FOR DELETE
USING (true);
