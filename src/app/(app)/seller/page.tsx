import { db } from "~/server/db";
import { inquiries, fabrics, variants, users } from "~/server/db/schema"; // Add users here
import { desc, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { InquiryForm } from "~/components/forms/inquiry-form";
import { InquiryList } from "~/components/seller/inquiry-list";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

export default async function SellerDashboard() {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const allFabrics = await db.query.fabrics.findMany();
  const allVariants = await db.query.variants.findMany();

  const allInquiries = await db
    .select({
      id: inquiries.id,
      quantity: inquiries.quantity,
      customerName: inquiries.customerName,
      deadline: inquiries.deadline,
      status: inquiries.status,
      newBatchAlert: inquiries.newBatchAlert,
      lastAlertAt: inquiries.lastAlertAt,
      arrivedQty: inquiries.arrivedQty, // Kept to match your existing data
      fabricName: fabrics.name,
      colorName: variants.colorName,
      sellerName: users.name, // Add this line
    })
    .from(inquiries)
    .leftJoin(variants, eq(inquiries.variantId, variants.id))
    .leftJoin(fabrics, eq(variants.fabricId, fabrics.id))
    .leftJoin(users, eq(inquiries.userId, users.id)) // Add this join
    .orderBy(desc(inquiries.createdAt));

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 p-4 pt-8 md:flex-row">
      <div className="hidden w-full md:block md:w-1/3">
        <h2 className="mb-4 text-xl font-bold">Yeni Talep</h2>
        <InquiryForm fabrics={allFabrics} variants={allVariants} />
      </div>

      <div className="w-full pb-24 md:w-2/3 md:pb-0">
        <h2 className="mb-4 text-xl font-bold">Tüm Siparişler</h2>
        <InquiryList inquiries={allInquiries} />
      </div>

      <div className="fixed right-6 bottom-6 md:hidden">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-14 w-14 rounded-full shadow-lg" size="icon">
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-106.25">
            <DialogHeader>
              <DialogTitle>Yeni Termin Talebi</DialogTitle>
            </DialogHeader>
            <InquiryForm fabrics={allFabrics} variants={allVariants} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
