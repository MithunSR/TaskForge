-- =====================================================
-- Author      : Mithun
-- Date        : 2026-07-06
-- Description : Registers a new user. The first user ever
--               created is automatically assigned the Admin
--               role; every user after that gets the User
--               role. pg_advisory_xact_lock serializes
--               concurrent registrations so two simultaneous
--               signups can never both become Admin.
-- =====================================================

CREATE OR REPLACE FUNCTION fn_register_user(
    p_name TEXT, p_email TEXT, p_password_hash TEXT
) RETURNS TABLE (id UUID, name TEXT, email TEXT, role_name TEXT) AS $$
DECLARE
    v_role_id INT;
    v_user_count BIGINT;
BEGIN
    PERFORM pg_advisory_xact_lock(hashtext('user_registration'));

    SELECT COUNT(*) INTO v_user_count FROM users;

    IF v_user_count = 0 THEN
        SELECT roles.id INTO v_role_id FROM roles WHERE roles.name = 'Admin';
    ELSE
        SELECT roles.id INTO v_role_id FROM roles WHERE roles.name = 'User';
    END IF;

    RETURN QUERY
    INSERT INTO users (name, email, password_hash, role_id)
    VALUES (p_name, p_email, p_password_hash, v_role_id)
    RETURNING users.id,
              users.name::TEXT,
              users.email::TEXT,
              (SELECT roles.name::TEXT FROM roles WHERE roles.id = v_role_id);
END;
$$ LANGUAGE plpgsql;