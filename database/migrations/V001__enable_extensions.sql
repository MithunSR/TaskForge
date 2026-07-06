-- =====================================================
-- Author      : Mithun
-- Date        : 2026-07-06
-- Description : Enables the pgcrypto extension, required
--               for gen_random_uuid() used across all
--               UUID primary keys in this schema.
-- =====================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;