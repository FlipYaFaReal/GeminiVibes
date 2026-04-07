CREATE TYPE "public"."life_domain" AS ENUM('family', 'work', 'home', 'relationships', 'faith', 'health', 'growth');--> statement-breakpoint
CREATE TABLE "conversation_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"summary" text NOT NULL,
	"facts_learned" jsonb DEFAULT '[]'::jsonb,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "life_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"domain" "life_domain",
	"type" text DEFAULT 'note' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"priority" text DEFAULT 'medium',
	"due_at" timestamp,
	"completed_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"calendar_event_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"tool_calls" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nudges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"message" text NOT NULL,
	"domain" "life_domain",
	"type" text NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"delivered" boolean DEFAULT false NOT NULL,
	"acted_on" boolean DEFAULT false NOT NULL,
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"google_access_token" text,
	"google_refresh_token" text,
	"push_token" text,
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "conversation_summaries" ADD CONSTRAINT "conversation_summaries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_items" ADD CONSTRAINT "life_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nudges" ADD CONSTRAINT "nudges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;