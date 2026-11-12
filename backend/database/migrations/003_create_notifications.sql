-- Champion Arena: persistent in-app notifications
-- Run this migration once against the champion_arena database.

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notification_type VARCHAR(40) NOT NULL DEFAULT 'general'
        CHECK (notification_type IN ('general', 'announcement', 'exam', 'result', 'reward', 'system')),
    title VARCHAR(180) NOT NULL,
    message TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    CONSTRAINT ck_notifications_expiry
        CHECK (expires_at IS NULL OR expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_recent
    ON notifications (recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread
    ON notifications (recipient_id, created_at DESC)
    WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_batch_recent
    ON notifications (batch_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_creator_recent
    ON notifications (created_by, created_at DESC);
