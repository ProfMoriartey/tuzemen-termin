import { db } from "~/server/db";
import { InquiryForm } from "~/components/forms/inquiry-form";

export default async function SellerPage() {
  const allFabrics = await db.query.fabrics.findMany();
  const allVariants = await db.query.variants.findMany();

  return (
    <div className="flex min-h-screen flex-col items-center p-4 pt-12">
      <h1 className="mb-6 text-2xl font-bold">New Production Inquiry</h1>
      <InquiryForm fabrics={allFabrics} variants={allVariants} />
    </div>
  );
}
