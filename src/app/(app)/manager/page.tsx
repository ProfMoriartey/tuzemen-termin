import { db } from "~/server/db";
import { inquiries, fabrics, variants, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { ProductionList } from "~/components/manager/production-list";

export default async function ManagerPage() {
  const rawData = await db
    .select({
      id: inquiries.id,
      quantity: inquiries.quantity,
      customerName: inquiries.customerName,
      deadline: inquiries.deadline,
      arrivedQty: inquiries.arrivedQty,
      variantId: inquiries.variantId,
      fabricName: fabrics.name,
      colorName: variants.colorName,
      sellerName: users.name,
    })
    .from(inquiries)
    .leftJoin(variants, eq(inquiries.variantId, variants.id))
    .leftJoin(fabrics, eq(variants.fabricId, fabrics.id))
    .leftJoin(users, eq(inquiries.userId, users.id));

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col p-4 pt-8">
      <h1 className="mb-6 text-2xl font-bold">Production Dashboard</h1>
      <ProductionList data={rawData} />
    </div>
  );
}
