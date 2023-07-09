/*
  Warnings:

  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `surname` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "name" SET DEFAULT 'undefined',
ALTER COLUMN "password" SET NOT NULL,
ALTER COLUMN "password" SET DEFAULT '123456789*qazWSX!1881aTa',
ALTER COLUMN "surname" SET NOT NULL,
ALTER COLUMN "surname" SET DEFAULT 'undefined';
