import { db } from "~/server/db";
import { inquiries, fabrics, variants } from "~/server/db/schema";
import { isNotNull, eq, and, not } from "drizzle-orm";
import { CalendarView } from "~/components/calendar/calendar-view";
import { requireRoles } from "~/server/check-role";

export default async function CalendarPage() {
  await requireRoles(["SELLER", "MANAGER", "DEVELOPER"]);

  const scheduledInquiries = await db
    .select({
      id: inquiries.id,
      quantity: inquiries.quantity,
      customerName: inquiries.customerName,
      deadline: inquiries.deadline,
      status: inquiries.status,
      fabricName: fabrics.name,
      colorName: variants.colorName,
    })
    .from(inquiries)
    .leftJoin(variants, eq(inquiries.variantId, variants.id))
    .leftJoin(fabrics, eq(variants.fabricId, fabrics.id))
    .where(
      and(isNotNull(inquiries.deadline), not(eq(inquiries.status, "arrived"))),
    );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col p-4 pt-8">
      <h1 className="mb-6 text-2xl font-bold">Üretim Takvimi</h1>
      <CalendarView data={scheduledInquiries} />
    </div>
  );
}
