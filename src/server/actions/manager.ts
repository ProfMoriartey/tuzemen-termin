"use server"

import { db } from "~/server/db"
import { inquiries } from "~/server/db/schema"
import { eq, asc } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@clerk/nextjs/server"

export async function updateGroupedInquiries(
  variantId: string,
  deadline: Date | null,
  totalArrived: number
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const variantInquiries = await db.query.inquiries.findMany({
    where: eq(inquiries.variantId, variantId),
    orderBy: [asc(inquiries.createdAt)],
  })

  let remainingArrived = totalArrived

  for (const inquiry of variantInquiries) {
    let assignedQty = 0
    if (remainingArrived > 0) {
      assignedQty = Math.min(remainingArrived, inquiry.quantity)
      remainingArrived -= assignedQty
    }

    let status = "pending"
    if (assignedQty >= inquiry.quantity) status = "arrived"
    else if (assignedQty > 0) status = "partial"

    await db
      .update(inquiries)
      .set({ 
        deadline, 
        arrivedQty: assignedQty,
        status 
      })
      .where(eq(inquiries.id, inquiry.id))
  }

  revalidatePath("/manager")
}