CREATE TABLE "timesheets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"period_start_date" date NOT NULL,
	"period_end_date" date NOT NULL,
	"regular_hours" numeric(6, 2) DEFAULT '0.00' NOT NULL,
	"overtime_hours" numeric(6, 2) DEFAULT '0.00' NOT NULL,
	"total_hours" numeric(6, 2) DEFAULT '0.00' NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"submitted_at" timestamp with time zone,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "organization_scale" varchar(50) DEFAULT 'growing' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "enabled_modules" jsonb DEFAULT '{"time_tracking":true,"attendance":true,"leaves":true,"timesheets":true,"payroll":false,"performance":false,"audit":false}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "employee_profiles" ADD COLUMN "compensation_type" varchar(20) DEFAULT 'salaried' NOT NULL;--> statement-breakpoint
ALTER TABLE "employee_profiles" ADD COLUMN "base_salary" numeric(12, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "employee_profiles" ADD COLUMN "hourly_rate" numeric(10, 2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "employee_profiles" ADD COLUMN "overtime_rate_multiplier" numeric(4, 2) DEFAULT '1.50' NOT NULL;--> statement-breakpoint
ALTER TABLE "employee_profiles" ADD COLUMN "standard_weekly_hours" numeric(4, 2) DEFAULT '40.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_employee_id_employee_profiles_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_reviewed_by_employee_profiles_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."employee_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_timesheet_emp_period" ON "timesheets" USING btree ("employee_id","period_start_date");--> statement-breakpoint
CREATE INDEX "idx_timesheet_org_status" ON "timesheets" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "idx_timesheet_reviewed_by" ON "timesheets" USING btree ("reviewed_by");