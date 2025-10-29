-- 检查和删除logo_url为空的网站数据

-- 第一步：查看logo_url为空的网站数量和基本信息
SELECT
  COUNT(*) as total_count,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count
FROM websites
WHERE logo_url IS NULL OR logo_url = '';

-- 第二步：查看这些网站的详细信息（前20条）
SELECT
  id,
  title,
  slug,
  url,
  status,
  created_at
FROM websites
WHERE logo_url IS NULL OR logo_url = ''
ORDER BY created_at DESC
LIMIT 20;

-- 第三步：删除logo_url为空的网站数据
-- 注意：这会级联删除相关的 website_likes, website_favorites, website_reviews, website_categories
-- 取消下面的注释来执行删除操作

-- BEGIN;
--
-- DELETE FROM websites
-- WHERE logo_url IS NULL OR logo_url = '';
--
-- COMMIT;

-- 第四步：验证删除结果
-- SELECT COUNT(*) as remaining_empty_logo_count
-- FROM websites
-- WHERE logo_url IS NULL OR logo_url = '';
