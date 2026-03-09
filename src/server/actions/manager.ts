"use server"

import { db } from "~/server/db"
import { inquiries } from "~/server/db/schema"
import { eq, and, not } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@clerk/nextjs/server"

export async function updateGroupDeadline(variantId: string, deadline: Date | null) {
  const { userId } = await auth()
  
  if (!userId) throw new Error("Unauthorized")

  await db
    .update(inquiries)
    .set({ deadline })
    .where(
      and(
        eq(inquiries.variantId, variantId),
        not(eq(inquiries.status, "arrived"))
      )
    )

  revalidatePath("/manager")
  revalidatePath("/seller")
  revalidatePath("/calendar")
}