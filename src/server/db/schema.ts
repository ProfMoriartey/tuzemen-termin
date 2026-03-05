import { pgTable, text, integer, timestamp, pgEnum, uuid } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["PENDING", "SELLER", "MANAGER", "DEVELOPER"]);

export const fabrics = pgTable("fabrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
});

export const variants = pgTable("variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  fabricId: uuid("fabric_id").references(() => fabrics.id),
  colorName: text("color_name").notNull(),
});

export const inquiries = pgTable("inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(), // Linked to Clerk ID
  variantId: uuid("variant_id").references(() => variants.id),
  customerName: text("customer_name").notNull(),
  quantity: integer("quantity").notNull(), // MT
  deadline: timestamp("deadline"),
  status: text("status").default("pending"), // pending, arrived, partial
  arrivedQty: integer("arrived_qty").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk ID
  email: text("email").notNull(),
  role: roleEnum("role").default("PENDING").notNull(),
  name: text("name"),
});