-- =====================================================
-- Author      : Mithun
-- Date        : 2026-07-06
-- Description : Promotes or demotes a user's role. Guards
--               against demoting the last remaining Admin,
--               which would otherwise lock everyone out of
--               Admin-only functionality.
-- =====================================================
CREATE OR REPLACE PROCEDURE sp_update_user_role(
    p_user_id UUID, p_new_role TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_role_id INT;
    v_admin_count INT;
BEGIN
    SELECT id INTO v_role_id FROM roles WHERE name = p_new_role;
    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'Invalid role: %', p_new_role;
    END IF;

    IF p_new_role = 'User' THEN
        SELECT COUNT(*) INTO v_admin_count
        FROM users u JOIN roles r ON r.id = u.role_id
        WHERE r.name = 'Admin';

        IF v_admin_count <= 1 THEN
            RAISE EXCEPTION 'Cannot demote the last remaining Admin';
        END IF;
    END IF;

    UPDATE users SET role_id = v_role_id WHERE id = p_user_id;
END;
$$;