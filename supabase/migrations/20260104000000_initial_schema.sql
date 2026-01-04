-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_members" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decks" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'no',
    "theme_id" TEXT NOT NULL DEFAULT 'nordic_light',
    "logo_url" TEXT,
    "primary_color" TEXT,
    "secondary_color" TEXT,
    "share_token" TEXT,
    "share_access" TEXT NOT NULL DEFAULT 'private',
    "outline" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slides" (
    "id" TEXT NOT NULL,
    "deck_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "layout_variant" TEXT NOT NULL DEFAULT 'default',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocks" (
    "id" TEXT NOT NULL,
    "slide_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generation_jobs" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "deck_id" TEXT,
    "source_file_id" TEXT,
    "input_text" TEXT NOT NULL,
    "text_mode" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'no',
    "tone" TEXT,
    "audience" TEXT,
    "amount" TEXT NOT NULL DEFAULT 'medium',
    "num_slides" INTEGER,
    "theme_id" TEXT,
    "image_mode" TEXT NOT NULL DEFAULT 'none',
    "image_style" TEXT,
    "template_id" TEXT,
    "export_as" TEXT[],
    "idempotency_key" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "view_url" TEXT,
    "pdf_url" TEXT,
    "pptx_url" TEXT,
    "export_expires_at" TIMESTAMP(3),
    "error_code" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "generation_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_jobs" (
    "id" TEXT NOT NULL,
    "deck_id" TEXT NOT NULL,
    "generation_job_id" TEXT,
    "format" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "file_url" TEXT,
    "expires_at" TIMESTAMP(3),
    "error_code" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "export_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uploaded_files" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "s3_key" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "extracted_text" TEXT,
    "char_count" INTEGER,
    "truncated" BOOLEAN NOT NULL DEFAULT false,
    "error_code" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "uploaded_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_members_user_id_workspace_id_key" ON "workspace_members"("user_id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");

-- CreateIndex
CREATE UNIQUE INDEX "decks_share_token_key" ON "decks"("share_token");

-- CreateIndex
CREATE INDEX "decks_workspace_id_idx" ON "decks"("workspace_id");

-- CreateIndex
CREATE INDEX "decks_share_token_idx" ON "decks"("share_token");

-- CreateIndex
CREATE INDEX "slides_deck_id_position_idx" ON "slides"("deck_id", "position");

-- CreateIndex
CREATE INDEX "blocks_slide_id_position_idx" ON "blocks"("slide_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "generation_jobs_idempotency_key_key" ON "generation_jobs"("idempotency_key");

-- CreateIndex
CREATE INDEX "generation_jobs_workspace_id_status_idx" ON "generation_jobs"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "generation_jobs_idempotency_key_idx" ON "generation_jobs"("idempotency_key");

-- CreateIndex
CREATE INDEX "export_jobs_deck_id_format_idx" ON "export_jobs"("deck_id", "format");

-- CreateIndex
CREATE INDEX "uploaded_files_workspace_id_idx" ON "uploaded_files"("workspace_id");

-- CreateIndex
CREATE INDEX "uploaded_files_status_idx" ON "uploaded_files"("status");

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decks" ADD CONSTRAINT "decks_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decks" ADD CONSTRAINT "decks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slides" ADD CONSTRAINT "slides_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_slide_id_fkey" FOREIGN KEY ("slide_id") REFERENCES "slides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_jobs" ADD CONSTRAINT "generation_jobs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_jobs" ADD CONSTRAINT "generation_jobs_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "decks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_jobs" ADD CONSTRAINT "generation_jobs_source_file_id_fkey" FOREIGN KEY ("source_file_id") REFERENCES "uploaded_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_jobs" ADD CONSTRAINT "export_jobs_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploaded_files" ADD CONSTRAINT "uploaded_files_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspaces" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspace_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "api_keys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "decks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "slides" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "blocks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "generation_jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "export_jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "uploaded_files" ENABLE ROW LEVEL SECURITY;

-- Users: Can read/update their own user record
CREATE POLICY "Users can read own user"
ON "users" FOR SELECT
USING (id = auth.uid()::text);

CREATE POLICY "Users can update own user"
ON "users" FOR UPDATE
USING (id = auth.uid()::text);

-- Workspaces: Members can read workspaces they belong to
CREATE POLICY "Members can read own workspaces"
ON "workspaces" FOR SELECT
USING (
  id IN (
    SELECT workspace_id FROM "workspace_members"
    WHERE user_id = auth.uid()::text
  )
);

CREATE POLICY "Owners can update workspaces"
ON "workspaces" FOR UPDATE
USING (
  id IN (
    SELECT workspace_id FROM "workspace_members"
    WHERE user_id = auth.uid()::text AND role = 'owner'
  )
);

CREATE POLICY "Owners can delete workspaces"
ON "workspaces" FOR DELETE
USING (
  id IN (
    SELECT workspace_id FROM "workspace_members"
    WHERE user_id = auth.uid()::text AND role = 'owner'
  )
);

-- Workspace Members: Can read members in their workspaces
CREATE POLICY "Members can read workspace members"
ON "workspace_members" FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id FROM "workspace_members"
    WHERE user_id = auth.uid()::text
  )
);

CREATE POLICY "Admins can manage workspace members"
ON "workspace_members" FOR ALL
USING (
  workspace_id IN (
    SELECT workspace_id FROM "workspace_members"
    WHERE user_id = auth.uid()::text AND role IN ('owner', 'admin')
  )
);

-- API Keys: Service role can manage (for API key auth), workspace members can read
CREATE POLICY "Service role can manage api_keys"
ON "api_keys" FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Workspace members can read api_keys"
ON "api_keys" FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id FROM "workspace_members"
    WHERE user_id = auth.uid()::text
  )
);

-- Decks: Members can read/write decks in their workspaces, OR public shared decks
CREATE POLICY "Members can read workspace decks"
ON "decks" FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id FROM "workspace_members"
    WHERE user_id = auth.uid()::text
  )
  OR share_access = 'anyone_with_link_can_view'
);

CREATE POLICY "Members can insert workspace decks"
ON "decks" FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM "workspace_members"
    WHERE user_id = auth.uid()::text
  )
  AND user_id = auth.uid()::text
);

CREATE POLICY "Members can update own decks"
ON "decks" FOR UPDATE
USING (
  workspace_id IN (
    SELECT workspace_id FROM "workspace_members"
    WHERE user_id = auth.uid()::text
  )
);

CREATE POLICY "Members can delete own decks"
ON "decks" FOR DELETE
USING (
  workspace_id IN (
    SELECT workspace_id FROM "workspace_members"
    WHERE user_id = auth.uid()::text
  )
);

-- Slides: Inherit access from deck
CREATE POLICY "Users can read slides from accessible decks"
ON "slides" FOR SELECT
USING (
  deck_id IN (
    SELECT id FROM "decks"
    WHERE workspace_id IN (
      SELECT workspace_id FROM "workspace_members"
      WHERE user_id = auth.uid()::text
    )
    OR share_access = 'anyone_with_link_can_view'
  )
);

CREATE POLICY "Users can manage slides in workspace decks"
ON "slides" FOR ALL
USING (
  deck_id IN (
    SELECT id FROM "decks"
    WHERE workspace_id IN (
      SELECT workspace_id FROM "workspace_members"
      WHERE user_id = auth.uid()::text
    )
  )
);

-- Blocks: Inherit access from slide/deck
CREATE POLICY "Users can read blocks from accessible decks"
ON "blocks" FOR SELECT
USING (
  slide_id IN (
    SELECT id FROM "slides"
    WHERE deck_id IN (
      SELECT id FROM "decks"
      WHERE workspace_id IN (
        SELECT workspace_id FROM "workspace_members"
        WHERE user_id = auth.uid()::text
      )
      OR share_access = 'anyone_with_link_can_view'
    )
  )
);

CREATE POLICY "Users can manage blocks in workspace decks"
ON "blocks" FOR ALL
USING (
  slide_id IN (
    SELECT id FROM "slides"
    WHERE deck_id IN (
      SELECT id FROM "decks"
      WHERE workspace_id IN (
        SELECT workspace_id FROM "workspace_members"
        WHERE user_id = auth.uid()::text
      )
    )
  )
);

-- Generation Jobs: Workspace members can read/create, service role can manage (for API)
CREATE POLICY "Service role can manage generation_jobs"
ON "generation_jobs" FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Workspace members can read jobs"
ON "generation_jobs" FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id FROM "workspace_members"
    WHERE user_id = auth.uid()::text
  )
);

-- Export Jobs: Inherit access from deck
CREATE POLICY "Users can read export jobs for accessible decks"
ON "export_jobs" FOR SELECT
USING (
  deck_id IN (
    SELECT id FROM "decks"
    WHERE workspace_id IN (
      SELECT workspace_id FROM "workspace_members"
      WHERE user_id = auth.uid()::text
    )
    OR share_access = 'anyone_with_link_can_view'
  )
);

CREATE POLICY "Service role can manage export_jobs"
ON "export_jobs" FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- Uploaded Files: Workspace members can read/upload
CREATE POLICY "Workspace members can read uploaded_files"
ON "uploaded_files" FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id FROM "workspace_members"
    WHERE user_id = auth.uid()::text
  )
);

CREATE POLICY "Workspace members can upload files"
ON "uploaded_files" FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM "workspace_members"
    WHERE user_id = auth.uid()::text
  )
);

CREATE POLICY "Service role can manage uploaded_files"
ON "uploaded_files" FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

