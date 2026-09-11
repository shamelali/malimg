CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'checked_in', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."device_type" AS ENUM('camera_ai', 'waste_bin', 'toilet', 'smart_lock', 'pool_sensor', 'gateway', 'wearable');--> statement-breakpoint
CREATE TYPE "public"."facility_status" AS ENUM('open', 'cleaning', 'full', 'maintenance', 'closed');--> statement-breakpoint
CREATE TYPE "public"."facility_type" AS ENUM('car_park', 'chalet', 'pool', 'bbq', 'camping', 'toilet', 'waste_bin', 'trail', 'marketplace');--> statement-breakpoint
CREATE TYPE "public"."incident_status" AS ENUM('open', 'acknowledged', 'monitoring', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."park_status" AS ENUM('active', 'coming_soon', 'phase_2', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('P0', 'P1', 'P2', 'P3');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('super_admin', 'park_manager', 'ranger', 'operator', 'finance', 'auditor', 'visitor');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('open', 'in_progress', 'completed', 'blocked');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"park_id" uuid,
	"actor" varchar(160) NOT NULL,
	"action" varchar(160) NOT NULL,
	"entity" varchar(120),
	"entity_id" varchar(160),
	"result" varchar(80) DEFAULT 'success' NOT NULL,
	"ip_address" varchar(64),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"park_id" uuid NOT NULL,
	"facility_id" uuid NOT NULL,
	"guest_name" varchar(160) NOT NULL,
	"contact" varchar(80),
	"party_size" integer DEFAULT 1 NOT NULL,
	"status" "booking_status" DEFAULT 'confirmed' NOT NULL,
	"check_in_date" date NOT NULL,
	"amount_cents" integer DEFAULT 0 NOT NULL,
	"qr_ref" varchar(32) NOT NULL,
	"smart_lock_pin" varchar(8),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_qr_ref_unique" UNIQUE("qr_ref")
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"park_id" uuid NOT NULL,
	"type" "facility_type" NOT NULL,
	"name" varchar(160) NOT NULL,
	"code" varchar(40) NOT NULL,
	"capacity" integer DEFAULT 0 NOT NULL,
	"occupied" integer DEFAULT 0 NOT NULL,
	"price_cents" integer DEFAULT 0 NOT NULL,
	"status" "facility_status" DEFAULT 'open' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "family_links" (
	"guardian_id" uuid NOT NULL,
	"dependent_id" uuid NOT NULL,
	"relationship" varchar(40) NOT NULL,
	"consent_given" boolean DEFAULT false NOT NULL,
	"safe_zone_radius_m" integer DEFAULT 50 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "family_links_guardian_id_dependent_id_pk" PRIMARY KEY("guardian_id","dependent_id")
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"park_id" uuid NOT NULL,
	"type" varchar(100) NOT NULL,
	"severity" "priority" DEFAULT 'P2' NOT NULL,
	"status" "incident_status" DEFAULT 'open' NOT NULL,
	"title_en" text NOT NULL,
	"title_bm" text NOT NULL,
	"latitude" numeric(9, 6),
	"longitude" numeric(10, 6),
	"reported_by" varchar(120),
	"acknowledged_by" varchar(120),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"acknowledged_at" timestamp with time zone,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "iot_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"park_id" uuid NOT NULL,
	"device_type" "device_type" NOT NULL,
	"device_code" varchar(64) NOT NULL,
	"metric" varchar(80) NOT NULL,
	"value_numeric" numeric(10, 2),
	"value_text" varchar(160),
	"battery" integer,
	"quality_pct" integer DEFAULT 98 NOT NULL,
	"observed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name_en" varchar(160) NOT NULL,
	"name_bm" varchar(160) NOT NULL,
	"municipality" varchar(120) DEFAULT 'MPK Kluang' NOT NULL,
	"status" "park_status" DEFAULT 'active' NOT NULL,
	"latitude" numeric(9, 6),
	"longitude" numeric(10, 6),
	"budget_myr" integer,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "parks_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"park_id" uuid NOT NULL,
	"title_en" varchar(220) NOT NULL,
	"title_bm" varchar(220) NOT NULL,
	"category" varchar(80) NOT NULL,
	"priority" "priority" DEFAULT 'P2' NOT NULL,
	"status" "task_status" DEFAULT 'open' NOT NULL,
	"assignee" varchar(120),
	"due_at" timestamp with time zone,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "trail_check_ins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"park_id" uuid NOT NULL,
	"user_id" uuid,
	"checkpoint_code" varchar(64) NOT NULL,
	"checkpoint_name" varchar(120) NOT NULL,
	"altitude_m" integer,
	"checked_in_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"park_id" uuid,
	"name" varchar(160) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'visitor' NOT NULL,
	"preferred_language" varchar(2) DEFAULT 'en' NOT NULL,
	"mfa_enabled" boolean DEFAULT true NOT NULL,
	"consented_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_park_id_parks_id_fk" FOREIGN KEY ("park_id") REFERENCES "public"."parks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_park_id_parks_id_fk" FOREIGN KEY ("park_id") REFERENCES "public"."parks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_park_id_parks_id_fk" FOREIGN KEY ("park_id") REFERENCES "public"."parks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_links" ADD CONSTRAINT "family_links_guardian_id_users_id_fk" FOREIGN KEY ("guardian_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_links" ADD CONSTRAINT "family_links_dependent_id_users_id_fk" FOREIGN KEY ("dependent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_park_id_parks_id_fk" FOREIGN KEY ("park_id") REFERENCES "public"."parks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iot_readings" ADD CONSTRAINT "iot_readings_park_id_parks_id_fk" FOREIGN KEY ("park_id") REFERENCES "public"."parks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_park_id_parks_id_fk" FOREIGN KEY ("park_id") REFERENCES "public"."parks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trail_check_ins" ADD CONSTRAINT "trail_check_ins_park_id_parks_id_fk" FOREIGN KEY ("park_id") REFERENCES "public"."parks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trail_check_ins" ADD CONSTRAINT "trail_check_ins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_park_id_parks_id_fk" FOREIGN KEY ("park_id") REFERENCES "public"."parks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_park_time_idx" ON "audit_logs" USING btree ("park_id","created_at");--> statement-breakpoint
CREATE INDEX "bookings_park_idx" ON "bookings" USING btree ("park_id");--> statement-breakpoint
CREATE INDEX "bookings_facility_idx" ON "bookings" USING btree ("facility_id");--> statement-breakpoint
CREATE INDEX "facilities_park_idx" ON "facilities" USING btree ("park_id");--> statement-breakpoint
CREATE INDEX "facilities_type_idx" ON "facilities" USING btree ("type");--> statement-breakpoint
CREATE INDEX "incidents_park_idx" ON "incidents" USING btree ("park_id");--> statement-breakpoint
CREATE INDEX "incidents_status_idx" ON "incidents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "iot_device_time_idx" ON "iot_readings" USING btree ("device_code","observed_at");--> statement-breakpoint
CREATE INDEX "tasks_park_status_idx" ON "tasks" USING btree ("park_id","status");--> statement-breakpoint
CREATE INDEX "checkin_park_user_idx" ON "trail_check_ins" USING btree ("park_id","user_id");--> statement-breakpoint
CREATE INDEX "users_park_idx" ON "users" USING btree ("park_id");