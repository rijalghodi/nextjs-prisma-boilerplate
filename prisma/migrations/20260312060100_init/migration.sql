-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('superadmin', 'admin', 'staff', 'guest');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "email_verified_at" TIMESTAMPTZ,
    "role" "user_role" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "avatar_file_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "path" TEXT NOT NULL,
    "mime_type" TEXT,
    "size" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "user_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_avatar_file_id_fkey" FOREIGN KEY ("avatar_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
