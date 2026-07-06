-- =====================================================
-- Author      : Mithun
-- Date        : 2026-07-06
-- Description : Creates the roles table, holding the two
--               fixed roles used for RBAC: 'User' and
--               'Admin'. Seeded separately in V005.
-- =====================================================
CREATE TABLE roles (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);