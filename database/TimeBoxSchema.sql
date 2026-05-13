CREATE TABLE "users" (
  "user_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "email" varchar(255) UNIQUE NOT NULL,
  "password" varchar(255) NOT NULL,
  "nickname" varchar(50) NOT NULL,
  "role" varchar,
  "created_at" timestamp
);

CREATE TABLE "daily_schedule" (
  "schedule_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" uuid NOT NULL,
  "schedule_date" date NOT NULL,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "brain_dump" (
  "dump_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "schedule_id" uuid NOT NULL,
  "content" text NOT NULL,
  "is_checked" boolean DEFAULT false,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "priority_task" (
  "schedule_id" uuid NOT NULL,
  "dump_id" uuid NOT NULL,
  "task_index" int NOT NULL,
  "is_completed" boolean DEFAULT false,
  "created_at" timestamp DEFAULT (now()),
  PRIMARY KEY ("schedule_id", "dump_id")
);

CREATE TABLE "time_box" (
  "timebox_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "schedule_id" uuid NOT NULL,
  "hour" int NOT NULL,
  "first_half" text,
  "second_half" text,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "time_pattern" (
  "pattern_id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" uuid NOT NULL,
  "hour" int NOT NULL,
  "day_of_week" int NOT NULL,
  "completion_count" int DEFAULT 0,
  "total_count" int DEFAULT 0,
  "updated_at" timestamp DEFAULT (now())
);

CREATE UNIQUE INDEX ON "daily_schedule" ("user_id", "schedule_date");

CREATE UNIQUE INDEX ON "time_box" ("schedule_id", "hour");

CREATE UNIQUE INDEX ON "time_pattern" ("user_id", "hour", "day_of_week");

ALTER TABLE "daily_schedule" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "brain_dump" ADD FOREIGN KEY ("schedule_id") REFERENCES "daily_schedule" ("schedule_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "priority_task" ADD FOREIGN KEY ("schedule_id") REFERENCES "daily_schedule" ("schedule_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "priority_task" ADD FOREIGN KEY ("dump_id") REFERENCES "brain_dump" ("dump_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "time_box" ADD FOREIGN KEY ("schedule_id") REFERENCES "daily_schedule" ("schedule_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "time_pattern" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;
