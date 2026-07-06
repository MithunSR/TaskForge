-- =====================================================
-- Author      : Mithun
-- Date        : 2026-07-06
-- Description : Creates the task_status enum and the
--               tasks table. Indexes on owner_id and
--               status support the filtering/pagination
--               required by fn_get_tasks_paged.
-- =====================================================
CREATE TYPE task_status AS ENUM ('Todo', 'InProgress', 'Done');

CREATE TABLE tasks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    status      task_status NOT NULL DEFAULT 'Todo',
    due_date    DATE,
    owner_id    UUID NOT NULL REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_owner_id ON tasks(owner_id);
CREATE INDEX idx_tasks_status ON tasks(status);