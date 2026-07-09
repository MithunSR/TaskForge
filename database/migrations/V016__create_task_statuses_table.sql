-- =====================================================
-- Author      : Mithun
-- Date        : 2026-07-08
-- Description : Replaces the task_status ENUM with a proper
--               lookup table. This lets new statuses be added
--               later via a simple INSERT, and lets the
--               frontend fetch the valid options from an
--               endpoint instead of hardcoding them.
-- =====================================================
CREATE TABLE task_statuses (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO task_statuses (name) VALUES ('Todo'), ('InProgress'), ('Done');