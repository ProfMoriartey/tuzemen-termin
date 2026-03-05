"use server"

import { db } from "~/server/db"
import { inquiries } from "~/server/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@clerk/nextjs/server"

export async function updateInquiryStatus(
  inquiryId: string,
  deadline: Date | null,
  arrivedQty: number
) {
  const { userId } = await auth()
  
  if (!userId) throw new Error("Unauthorized")

  let status = "pending"
  if (arrivedQty > 0) status = "partial"

  await db
    .update(inquiries)
    .set({ 
      deadline, 
      arrivedQty,
      status 
    })
    .where(eq(inquiries.id, inquiryId))

  revalidatePath("/manager")
}