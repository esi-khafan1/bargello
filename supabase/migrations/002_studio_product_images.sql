-- Create public Supabase Storage bucket for Bargello studio bottle photography
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public read access for product-images'
  ) THEN
    CREATE POLICY "Public read access for product-images"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'product-images');
  END IF;
END $$;

-- Attach studio product photography (primary Supabase CDN + resilient fallback) to all 22 Bargello products
UPDATE public.products AS p
SET
  image_url = v.image_url,
  secondary_image_url = v.secondary_image_url
FROM (
  VALUES
    ('bargello-561-men-50ml-fresh', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-561-men-50ml-fresh.png', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794534976_9832805303.png'),
    ('bargello-199-unisex-50ml-oriental', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-199-unisex-50ml-oriental.png', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794534979_3965015959.png'),
    ('bargello-122-women-50ml-oriental', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-122-women-50ml-oriental.png', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794534980_8728164062.png'),
    ('bargello-685-men-50ml-woody', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-685-men-50ml-woody.png', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794534982_9451585293.png'),
    ('bargello-554-unisex-50ml-oriental', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-554-unisex-50ml-oriental.png', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794534984_9809615257.png'),
    ('bargello-320-women-50ml-oriental', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-320-women-50ml-oriental.png', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794534986_4197990397.png'),
    ('bargello-116-women-50ml-floral', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-116-women-50ml-floral.png', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794534988_9240458470.png'),
    ('bargello-384-women-50ml-floral', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-384-women-50ml-floral.png', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794534990_2186082985.png'),
    ('bargello-226-women-50ml-oriental', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-226-women-50ml-oriental.png', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794535154_5860057578.png'),
    ('bargello-709-men-50ml-oriental', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-709-men-50ml-oriental.png', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794535156_7316155893.png'),
    ('bargello-751-men-50ml-woody', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-751-men-50ml-woody.png', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794535158_5978271141.png'),
    ('bargello-106-women-50ml-floral', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-106-women-50ml-floral.png', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794535160_8398024691.png'),
    ('bargello-502-men-50ml-woody', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-502-men-50ml-woody.jpg', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794535161_711059780.jpg'),
    ('bargello-591-men-50ml-woody', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-591-men-50ml-woody.png', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794535183_6115720819.png'),
    ('bargello-niche-infinity-soleil-dor-100ml', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-niche-infinity-soleil-dor-100ml.png', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794535185_5854503538.png'),
    ('bargello-niche-infinity-black-mirage-100ml', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-niche-infinity-black-mirage-100ml.png', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794535186_9644441327.png'),
    ('bargello-niche-elegance-white-contrast-60ml', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-niche-elegance-white-contrast-60ml.png', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794535188_3244451804.png'),
    ('bargello-niche-paradise-aurum-75ml', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-niche-paradise-aurum-75ml.png', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794535190_6258125251.png'),
    ('bargello-mystiq-midnight-flora-100ml', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-mystiq-midnight-flora-100ml.png', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794535217_9938803236.png'),
    ('bargello-vanilla-excellence-50ml', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-vanilla-excellence-50ml.png', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794535219_7370551554.png'),
    ('bargello-body-mist-glamorous-210ml', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-body-mist-glamorous-210ml.png', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794535220_8406829153.png'),
    ('bargello-car-fragrance-watermelon-mango-8ml', 'https://ceghlnyuziagatwqmfma.supabase.co/storage/v1/object/public/product-images/bargello-car-fragrance-watermelon-mango-8ml.png', 'https://9337710035.mixin.website/shop-resources/FkqJJGLCAq/product-images/1794535222_1126253459.png')
) AS v(slug, image_url, secondary_image_url)
WHERE p.slug = v.slug;
