-- Features 22/26/27: timestamped notes, lesson PDF sheets, subtitle tracks.
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS pdf_url text;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS vtt_url text;
CREATE TABLE IF NOT EXISTS lesson_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  "second" integer NOT NULL DEFAULT 0,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lesson_notes_user_lesson_idx ON lesson_notes (user_id, lesson_id);
