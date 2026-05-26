-- ─────────────────────────────────────────────────────────────────────────────
-- Database Performance Indexes
-- PRD §9.6.4 — Agency App
-- Run via: npx prisma db execute --file prisma/migrations/add_indexes.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON projects(deadline);
CREATE INDEX IF NOT EXISTS idx_projects_admin_id ON projects(admin_id);
CREATE INDEX IF NOT EXISTS idx_projects_status_priority ON projects(status, priority);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks(project_id, status);

-- Project Workers (join table)
CREATE INDEX IF NOT EXISTS idx_project_workers_worker_id ON project_workers(worker_id);
CREATE INDEX IF NOT EXISTS idx_project_workers_project_id ON project_workers(project_id);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_worker_id ON invoices(worker_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_worker_status ON invoices(worker_id, status);

-- Notifications (most critical for realtime reads)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Time Logs
CREATE INDEX IF NOT EXISTS idx_time_logs_task_id ON time_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_worker_id ON time_logs(worker_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_active ON time_logs(worker_id, ended_at) WHERE ended_at IS NULL;

-- Ratings
CREATE INDEX IF NOT EXISTS idx_ratings_worker_id ON ratings(worker_id);
CREATE INDEX IF NOT EXISTS idx_ratings_project_id ON ratings(project_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at DESC);

-- Password Reset Tokens
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- Attachments
CREATE INDEX IF NOT EXISTS idx_attachments_project_id ON attachments(project_id);
CREATE INDEX IF NOT EXISTS idx_attachments_task_id ON attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);
