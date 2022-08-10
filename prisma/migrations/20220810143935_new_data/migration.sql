-- CreateEnum
CREATE TYPE "SchedulingType" AS ENUM ('roundRobin', 'collective');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('unlimited', 'rolling', 'range');

-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('FREE', 'TRIAL', 'PRO');

-- CreateEnum
CREATE TYPE "IdentityProvider" AS ENUM ('CAL', 'GOOGLE', 'SAML');

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('MEMBER', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('cancelled', 'accepted', 'rejected', 'pending');

-- CreateEnum
CREATE TYPE "EventTypeCustomInputType" AS ENUM ('text', 'textLong', 'number', 'bool');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('PENDING_BOOKING_CONFIRMATION');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('STRIPE');

-- CreateEnum
CREATE TYPE "WebhookTriggerEvents" AS ENUM ('BOOKING_CREATED', 'BOOKING_RESCHEDULED', 'BOOKING_CANCELLED');

-- CreateTable
CREATE TABLE "EventType" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "locations" JSONB,
    "length" INTEGER NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER,
    "teamId" INTEGER,
    "eventName" TEXT,
    "timeZone" TEXT,
    "periodType" "PeriodType" NOT NULL DEFAULT 'unlimited',
    "periodStartDate" TIMESTAMP(3),
    "periodEndDate" TIMESTAMP(3),
    "periodDays" INTEGER,
    "periodCountCalendarDays" BOOLEAN,
    "requiresConfirmation" BOOLEAN NOT NULL DEFAULT false,
    "disableGuests" BOOLEAN NOT NULL DEFAULT false,
    "minimumBookingNotice" INTEGER NOT NULL DEFAULT 120,
    "schedulingType" "SchedulingType",
    "price" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "slotInterval" INTEGER,
    "metadata" TEXT DEFAULT '',

    CONSTRAINT "EventType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "key" JSONB NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DestinationCalendar" (
    "id" SERIAL NOT NULL,
    "integration" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "userId" INTEGER,
    "bookingId" INTEGER,
    "eventTypeId" INTEGER,

    CONSTRAINT "DestinationCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "bio" TEXT,
    "avatar" TEXT,
    "timeZone" TEXT NOT NULL DEFAULT 'Europe/London',
    "weekStart" TEXT NOT NULL DEFAULT 'Sunday',
    "startTime" INTEGER NOT NULL DEFAULT 0,
    "endTime" INTEGER NOT NULL DEFAULT 1440,
    "bufferTime" INTEGER NOT NULL DEFAULT 0,
    "hideBranding" BOOLEAN NOT NULL DEFAULT false,
    "theme" TEXT,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "twoFactorSecret" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "identityProvider" "IdentityProvider" NOT NULL DEFAULT 'CAL',
    "identityProviderId" TEXT,
    "invitedTo" INTEGER,
    "plan" "UserPlan" NOT NULL DEFAULT 'TRIAL',
    "brandColor" TEXT NOT NULL DEFAULT '#292929',
    "away" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "verified" BOOLEAN DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "slug" TEXT,
    "logo" TEXT,
    "bio" TEXT,
    "hideBranding" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "teamId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "role" "MembershipRole" NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("userId","teamId")
);

-- CreateTable
CREATE TABLE "VerificationRequest" (
    "id" SERIAL NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingReference" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "meetingId" TEXT,
    "meetingPassword" TEXT,
    "meetingUrl" TEXT,
    "bookingId" INTEGER,

    CONSTRAINT "BookingReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendee" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactNo" TEXT,
    "reserveframe" TEXT,
    "timeZone" TEXT NOT NULL,
    "locale" TEXT DEFAULT 'en',
    "bookingId" INTEGER,

    CONSTRAINT "Attendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyEventReference" (
    "id" SERIAL NOT NULL,
    "dailyurl" TEXT NOT NULL DEFAULT 'dailycallurl',
    "dailytoken" TEXT NOT NULL DEFAULT 'dailytoken',
    "bookingId" INTEGER,

    CONSTRAINT "DailyEventReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "userId" INTEGER,
    "eventTypeId" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "store" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "confirmed" BOOLEAN NOT NULL DEFAULT true,
    "rejected" BOOLEAN NOT NULL DEFAULT false,
    "status" "BookingStatus" NOT NULL DEFAULT 'accepted',
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "cancellationReason" TEXT,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "eventTypeId" INTEGER,
    "title" TEXT,
    "freeBusyTimes" JSONB,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" SERIAL NOT NULL,
    "label" TEXT,
    "userId" INTEGER,
    "eventTypeId" INTEGER,
    "days" INTEGER[],
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "date" DATE,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectedCalendar" (
    "userId" INTEGER NOT NULL,
    "integration" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,

    CONSTRAINT "SelectedCalendar_pkey" PRIMARY KEY ("userId","integration","externalId")
);

-- CreateTable
CREATE TABLE "EventTypeCustomInput" (
    "id" SERIAL NOT NULL,
    "eventTypeId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "type" "EventTypeCustomInputType" NOT NULL,
    "required" BOOLEAN NOT NULL,
    "placeholder" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "EventTypeCustomInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResetPasswordRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResetPasswordRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReminderMail" (
    "id" SERIAL NOT NULL,
    "referenceId" INTEGER NOT NULL,
    "reminderType" "ReminderType" NOT NULL,
    "elapsedMinutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReminderMail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "fee" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "refunded" BOOLEAN NOT NULL,
    "data" JSONB NOT NULL,
    "externalId" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "subscriberUrl" TEXT NOT NULL,
    "payloadTemplate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "eventTriggers" "WebhookTriggerEvents"[],

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "Question" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL,
    "Isactive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feilds" (
    "id" SERIAL NOT NULL,
    "questionid" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "access" BOOLEAN NOT NULL DEFAULT false,
    "subtype" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feilds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Values" (
    "id" SERIAL NOT NULL,
    "feildid" INTEGER NOT NULL,
    "Label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_user_eventtype" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "EventType_userId_slug_key" ON "EventType"("userId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "DestinationCalendar_userId_key" ON "DestinationCalendar"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DestinationCalendar_bookingId_key" ON "DestinationCalendar"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "DestinationCalendar_eventTypeId_key" ON "DestinationCalendar"("eventTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Team_slug_key" ON "Team"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRequest_token_key" ON "VerificationRequest"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRequest_identifier_token_key" ON "VerificationRequest"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "DailyEventReference_bookingId_key" ON "DailyEventReference"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_uid_key" ON "Booking"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_uid_key" ON "Payment"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_externalId_key" ON "Payment"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Webhook_id_key" ON "Webhook"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_user_eventtype_AB_unique" ON "_user_eventtype"("A", "B");

-- CreateIndex
CREATE INDEX "_user_eventtype_B_index" ON "_user_eventtype"("B");

-- AddForeignKey
ALTER TABLE "EventType" ADD CONSTRAINT "EventType_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DestinationCalendar" ADD CONSTRAINT "DestinationCalendar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DestinationCalendar" ADD CONSTRAINT "DestinationCalendar_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DestinationCalendar" ADD CONSTRAINT "DestinationCalendar_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingReference" ADD CONSTRAINT "BookingReference_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyEventReference" ADD CONSTRAINT "DailyEventReference_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectedCalendar" ADD CONSTRAINT "SelectedCalendar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTypeCustomInput" ADD CONSTRAINT "EventTypeCustomInput_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feilds" ADD CONSTRAINT "Feilds_questionid_fkey" FOREIGN KEY ("questionid") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Values" ADD CONSTRAINT "Values_feildid_fkey" FOREIGN KEY ("feildid") REFERENCES "Feilds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_eventtype" ADD CONSTRAINT "_user_eventtype_A_fkey" FOREIGN KEY ("A") REFERENCES "EventType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_eventtype" ADD CONSTRAINT "_user_eventtype_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
