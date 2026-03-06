"use server"

import { db } from "~/server/db"
import { users, inquiries } from "~/server/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth, clerkClient } from "@clerk/nextjs/server"

export async function deleteUserAccount(targetUserId: string) {
  const { userId } = await auth()
  
  if (!userId) throw new Error("Unauthorized")

  const client = await clerkClient()

  await db.delete(inquiries).where(eq(inquiries.userId, targetUserId))

  await db.delete(users).where(eq(users.id, targetUserId))

  await client.users.deleteUser(targetUserId)

  revalidatePath("/admin")
}