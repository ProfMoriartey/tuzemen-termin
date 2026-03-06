"use server"

import { db } from "~/server/db"
import { inquiries } from "~/server/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@clerk/nextjs/server"

export async function updateDesignStatus(
  variantId: string,
  deadline: Date | null,
  isFulfilled: boolean
) {
  const { userId } = await auth()
  
  if (!userId) throw new Error("Unauthorized")

  const variantInquiries = await db.query.inquiries.findMany({
    where: eq(inquiries.variantId, variantId),
  })

  for (const inquiry of variantInquiries) {
    const updateData: Partial<typeof inquiries.$inferInsert> = {}
    
    if (deadline) {
      updateData.deadline = deadline
    }
    
    if (isFulfilled) {
      updateData.arrivedQty = inquiry.quantity
      updateData.status = "arrived"
    }

    if (Object.keys(updateData).length > 0) {
      await db
        .update(inquiries)
        .set(updateData)
        .where(eq(inquiries.id, inquiry.id))
    }
  }

  revalidatePath("/manager")
  revalidatePath("/calendar")
}