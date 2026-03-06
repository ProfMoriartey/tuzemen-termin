"use server"

import { db } from "~/server/db"
import { inquiries } from "~/server/db/schema"
import { revalidatePath } from "next/cache"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"
import { eq } from "drizzle-orm"

const inquirySchema = z.object({
  variantId: z.string().uuid(),
  customerName: z.string().min(1),
  quantity: z.number().positive()
})

export async function createInquiryAction(formData: FormData) {
  const { userId } = await auth()
  
  if (!userId) throw new Error("Unauthorized")

  const parsed = inquirySchema.parse({
    variantId: formData.get("variantId"),
    customerName: formData.get("customerName"),
    quantity: Number(formData.get("quantity"))
  })

  await db.insert(inquiries).values({
    userId,
    variantId: parsed.variantId,
    customerName: parsed.customerName,
    quantity: parsed.quantity
  })

  revalidatePath("/")
}

export async function deleteInquiry(inquiryId: string) {
  const { userId } = await auth()
  
  if (!userId) throw new Error("Unauthorized")

  await db.delete(inquiries).where(eq(inquiries.id, inquiryId))

  revalidatePath("/seller")
  revalidatePath("/manager")
  revalidatePath("/calendar")
}