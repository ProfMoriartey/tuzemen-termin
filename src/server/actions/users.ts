"use server"

import { db } from "~/server/db"
import { users } from "~/server/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@clerk/nextjs/server"

type Role = "PENDING" | "SELLER" | "MANAGER" | "DEVELOPER"

export async function updateUserRole(userId: string, newRole: Role) {
  const { userId: currentUserId } = await auth()
  
  if (!currentUserId) throw new Error("Unauthorized")

  const currentUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, currentUserId)
  })

  if (currentUser?.role !== "DEVELOPER") throw new Error("Forbidden")

  await db.update(users).set({ role: newRole }).where(eq(users.id, userId))
  revalidatePath("/admin")
}