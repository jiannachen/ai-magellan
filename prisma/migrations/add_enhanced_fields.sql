-- 扩展Website表，支持增强的提交表单字段
ALTER TABLE websites 
ADD COLUMN email VARCHAR(255),
ADD COLUMN tagline VARCHAR(500),
ADD COLUMN features JSONB DEFAULT '[]',
ADD COLUMN pricing_model VARCHAR(50) DEFAULT 'free',
ADD COLUMN has_free_version BOOLEAN DEFAULT false,
ADD COLUMN base_price VARCHAR(100),
ADD COLUMN twitter_url VARCHAR(500);

-- 添加索引
CREATE INDEX idx_websites_pricing_model ON websites(pricing_model);
CREATE INDEX idx_websites_has_free_version ON websites(has_free_version);

-- 注释
COMMENT ON COLUMN websites.email IS '提交者商业邮箱';
COMMENT ON COLUMN websites.tagline IS '工具标语';
COMMENT ON COLUMN websites.features IS '主要特点JSON数组';
COMMENT ON COLUMN websites.pricing_model IS '定价模型：free, freemium, subscription, one_time, custom';
COMMENT ON COLUMN websites.has_free_version IS '是否有免费版本';
COMMENT ON COLUMN websites.base_price IS '基础价格';
COMMENT ON COLUMN websites.twitter_url IS 'Twitter/X链接';