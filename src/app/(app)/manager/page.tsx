import { db } from "~/server/db";
import { inquiries, fabrics, variants, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { ProductionList } from "~/components/manager/production-list";
import { requireRoles } from "~/server/check-role";
import { auth } from "@clerk/nextjs/server";

export default async function ManagerPage() {
  await requireRoles(["MANAGER", "DEVELOPER"]);

  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const rawData = await db
    .select({
      id: inquiries.id,
      quantity: inquiries.quantity,
      customerName: inquiries.customerName,
      deadline: inquiries.deadline,
      status: inquiries.status,
      newBatchAlert: inquiries.newBatchAlert,
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
      <h1 className="mb-6 text-2xl font-bold">Yönetici Paneli</h1>
      <ProductionList data={rawData} />
    </div>
  );
}
