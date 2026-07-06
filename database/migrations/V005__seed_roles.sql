-- =====================================================
-- Author      : Mithun
-- Date        : 2026-07-06
-- Description : Seeds the two fixed roles required before
--               any user can register. Must run after
--               V002 (roles table) and before V006
--               (fn_register_user, which looks these up).
-- =====================================================
INSERT INTO roles (name) VALUES ('User'), ('Admin');