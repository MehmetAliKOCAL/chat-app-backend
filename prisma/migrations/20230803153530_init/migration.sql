-- CreateTable
CREATE TABLE "UserPublicDetails" (
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPublicDetails_email_key" ON "UserPublicDetails"("email");
