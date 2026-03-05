"use client";

import { useState, useTransition } from "react";
import { updateInquiryStatus } from "~/server/actions/manager";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

// Define your types based on the Drizzle query output
type InquiryData = {
  id: string;
  quantity: number;
  customerName: string;
  deadline: Date | null;
  arrivedQty: number | null;
  variantId: string | null;
  fabricName: string | null;
  colorName: string | null;
};

export function ProductionList({ data }: { data: InquiryData[] }) {
  const [isPending, startTransition] = useTransition();

  // Group items by variantId
  const grouped = data.reduce(
    (acc, item) => {
      const key = item.variantId ?? "unknown";
      if (!acc[key]) {
        acc[key] = {
          title: `${item.fabricName} - ${item.colorName}`,
          totalQty: 0,
          inquiries: [],
        };
      }
      acc[key].totalQty += item.quantity;
      acc[key].inquiries.push(item);
      return acc;
    },
    {} as Record<
      string,
      { title: string; totalQty: number; inquiries: InquiryData[] }
    >,
  );

  function handleUpdate(inquiryId: string, formData: FormData) {
    startTransition(async () => {
      try {
        const rawDate = formData.get("deadline") as string;
        const deadlineDate = rawDate ? new Date(rawDate) : null;
        const arrivedQty = Number(formData.get("arrivedQty")) || 0;

        await updateInquiryStatus(inquiryId, deadlineDate, arrivedQty);
      } catch (error) {
        console.error(error);
      }
    });
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {Object.values(grouped).map((group) => (
        <div
          key={group.title}
          className="bg-card rounded-lg border p-4 shadow-sm"
        >
          <div className="mb-4 border-b pb-2">
            <h2 className="text-lg font-bold">{group.title}</h2>
            <p className="text-sm text-slate-500">
              Total Required: {group.totalQty} MT | Inquiries:{" "}
              {group.inquiries.length}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {group.inquiries.map((inquiry) => {
              const isOverdue =
                inquiry.deadline && new Date() > inquiry.deadline;

              return (
                <form
                  key={inquiry.id}
                  action={(formData) => handleUpdate(inquiry.id, formData)}
                  className={`flex flex-col gap-3 rounded-md border p-3 ${isOverdue ? "border-red-500 bg-red-50" : "bg-slate-50"}`}
                >
                  <div className="flex justify-between text-sm font-medium">
                    <span>{inquiry.customerName}</span>
                    <span>{inquiry.quantity} MT</span>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <label className="flex flex-1 flex-col gap-1 text-xs">
                      Deadline
                      <Input
                        type="date"
                        name="deadline"
                        defaultValue={
                          inquiry.deadline
                            ? inquiry.deadline.toISOString().split("T")[0]
                            : ""
                        }
                      />
                    </label>

                    <label className="flex flex-1 flex-col gap-1 text-xs">
                      Arrived (MT)
                      <Input
                        type="number"
                        name="arrivedQty"
                        defaultValue={inquiry.arrivedQty ?? 0}
                        min="0"
                      />
                    </label>

                    <Button
                      type="submit"
                      disabled={isPending}
                      size="sm"
                      className="mt-2 sm:mt-0"
                    >
                      Save
                    </Button>
                  </div>
                </form>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
