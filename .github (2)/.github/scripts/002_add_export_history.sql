-- Create export_history table to track portfolio exports (Pro feature)
CREATE TABLE IF NOT EXISTS export_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL CHECK (export_type IN ('csv', 'pdf')),
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for export_history
CREATE POLICY "Users can view their own export history"
  ON export_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own export history"
  ON export_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_export_history_user_id ON export_history(user_id, created_at DESC);
