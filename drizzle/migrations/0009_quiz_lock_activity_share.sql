-- Features 7/11/12: quiz re-watch lock, expiring signed video links, activity log.
ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS quiz_fails integer NOT NULL DEFAULT 0;
ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS quiz_locked boolean NOT NULL DEFAULT false;
CREATE TABLE IF NOT EXISTS activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  detail text,
  at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS activity_events_user_idx ON activity_events (user_id);
CREATE INDEX IF NOT EXISTS activity_events_at_idx ON activity_events (at);
CREATE TABLE IF NOT EXISTS signed_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jti text NOT NULL UNIQUE,
  token text NOT NULL,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS signed_links_lesson_idx ON signed_links (lesson_id);
