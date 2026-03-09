import { Webhook } from "svix"
import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { db } from "~/server/db"
import { users } from "~/server/db/schema"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET")
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 })
  }

  const body = await req.text()
  const wh = new Webhook(WEBHOOK_SECRET)
  
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    return new Response("Error verifying webhook", { status: 400 })
  }

  const eventType = evt.type

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, username } = evt.data
    const email = email_addresses[0]?.email_address ?? ""
    const name = `${first_name ?? ""} ${last_name ?? ""}`.trim()

    await db.insert(users).values({
      id,
      email,
      name,
      username,
      role: "PENDING"
    })
  }

  if (eventType === "user.updated") {
    const { id, first_name, last_name, username } = evt.data
    const name = `${first_name ?? ""} ${last_name ?? ""}`.trim()

    await db
      .update(users)
      .set({ name, username })
      .where(eq(users.id, id))
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data
    
    if (id) {
      await db.delete(users).where(eq(users.id, id))
    }
  }

  return new Response("Success", { status: 200 })
}