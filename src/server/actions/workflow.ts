"use server"

import { db } from "~/server/db"
import { inquiries } from "~/server/db/schema"
import { eq, and, not } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@clerk/nextjs/server"

export async function notifyNewBatch(variantId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await db
    .update(inquiries)
    .set({ newBatchAlert: true })
    .where(
      and(
        eq(inquiries.variantId, variantId),
        not(eq(inquiries.status, "arrived"))
      )
    )

  revalidatePath("/manager")
  revalidatePath("/seller")
}

export async function toggleInquiryFulfillment(inquiryId: string, isFulfilled: boolean) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await db
    .update(inquiries)
    .set({ 
      status: isFulfilled ? "arrived" : "pending",
      newBatchAlert: false 
    })
    .where(eq(inquiries.id, inquiryId))

  revalidatePath("/seller")
  revalidatePath("/manager")
  revalidatePath("/calendar")
}