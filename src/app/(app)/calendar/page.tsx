import { db } from "~/server/db";
import { inquiries, fabrics, variants } from "~/server/db/schema";
import { isNotNull, eq } from "drizzle-orm";
import { CalendarView } from "~/components/calendar/calendar-view";
import { requireRoles } from "~/server/check-role";

export default async function CalendarPage() {
  await requireRoles(["SELLER", "MANAGER", "DEVELOPER"]);

  const scheduledInquiries = await db
    .select({
      id: inquiries.id,
      quantity: inquiries.quantity,
      arrivedQty: inquiries.arrivedQty,
      customerName: inquiries.customerName,
      deadline: inquiries.deadline,
      fabricName: fabrics.name,
      colorName: variants.colorName,
    })
    .from(inquiries)
    .leftJoin(variants, eq(inquiries.variantId, variants.id))
    .leftJoin(fabrics, eq(variants.fabricId, fabrics.id))
    .where(isNotNull(inquiries.deadline));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col p-4 pt-8">
      <h1 className="mb-6 text-2xl font-bold">Production Calendar</h1>
      <CalendarView data={scheduledInquiries} />
    </div>
  );
}
