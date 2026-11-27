-- v14: parent accounts + integration outbox + mock checkouts.
CREATE TABLE IF NOT EXISTS parent_codes (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS parent_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS parent_links_pair_idx ON parent_links (parent_id, child_id);
CREATE INDEX IF NOT EXISTS parent_links_child_idx ON parent_links (child_id);
CREATE TABLE IF NOT EXISTS integration_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  recipient text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'mock_delivered',
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS integration_outbox_at_idx ON integration_outbox (created_at);
CREATE TABLE IF NOT EXISTS mock_checkouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_egp integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mock_checkouts_user_idx ON mock_checkouts (user_id);
