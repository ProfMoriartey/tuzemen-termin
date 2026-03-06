import { auth } from "@clerk/nextjs/server"
import { db } from "~/server/db"
import { users } from "~/server/db/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

export async function requireRoles(allowedRoles: string[]) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/")
  }

  const userRecord = await db.query.users.findFirst({
    where: eq(users.id, userId)
  })

  const hasAccess = userRecord && allowedRoles.includes(userRecord.role)

  if (!hasAccess) {
    redirect("/waiting")
  }

  return userRecord
}