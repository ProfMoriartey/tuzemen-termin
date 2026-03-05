"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

type SellerInquiry = {
  id: string;
  fabricName: string | null;
  colorName: string | null;
  customerName: string;
  quantity: number;
  arrivedQty: number | null;
  deadline: Date | null;
};

type SortOption = "date" | "status" | "name" | "color" | "customer";

export function InquiryList({ inquiries }: { inquiries: SellerInquiry[] }) {
  const [sortBy, setSortBy] = useState<SortOption>("date");

  const activeInquiries = inquiries.filter(
    (item) => (item.arrivedQty ?? 0) < item.quantity,
  );

  const archivedInquiries = inquiries.filter(
    (item) => (item.arrivedQty ?? 0) >= item.quantity,
  );

  function sortItems(items: SellerInquiry[]) {
    return [...items].sort((a, b) => {
      const arrivedA = a.arrivedQty ?? 0;
      const isPartialA = arrivedA > 0 && arrivedA < a.quantity;
      const statusRankA = isPartialA ? 2 : 1;

      const arrivedB = b.arrivedQty ?? 0;
      const isPartialB = arrivedB > 0 && arrivedB < b.quantity;
      const statusRankB = isPartialB ? 2 : 1;

      if (sortBy === "status") {
        return statusRankA - statusRankB;
      }

      if (sortBy === "customer") {
        return a.customerName.localeCompare(b.customerName);
      }

      if (sortBy === "name") {
        const nameA = a.fabricName ?? "";
        const nameB = b.fabricName ?? "";
        return nameA.localeCompare(nameB);
      }

      if (sortBy === "color") {
        const colorA = a.colorName ?? "";
        const colorB = b.colorName ?? "";
        return colorA.localeCompare(colorB);
      }

      const dateA = a.deadline ? new Date(a.deadline).getTime() : 0;
      const dateB = b.deadline ? new Date(b.deadline).getTime() : 0;
      return dateA - dateB;
    });
  }

  const sortedActive = sortItems(activeInquiries);
  const sortedArchived = sortItems(archivedInquiries);

  function renderCard(inquiry: SellerInquiry, isArchived: boolean) {
    const arrived = inquiry.arrivedQty ?? 0;
    const isPartial = arrived > 0 && arrived < inquiry.quantity;
    const isOverdue =
      !isArchived && inquiry.deadline && new Date() > inquiry.deadline;

    let statusText = "Pending";
    let badgeColor = "bg-slate-200 text-slate-800";

    if (isArchived) {
      statusText = "Fulfilled";
      badgeColor = "bg-green-100 text-green-800";
    } else if (isPartial) {
      statusText = "Partial";
      badgeColor = "bg-yellow-100 text-yellow-800";
    }

    return (
      <div
        key={inquiry.id}
        className={`flex flex-col gap-2 rounded-lg border p-4 shadow-sm ${isOverdue ? "border-red-500" : "border-slate-200"} ${isArchived ? "opacity-75" : ""}`}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold">
              {inquiry.fabricName} - {inquiry.colorName}
            </h3>
            <p className="text-sm text-slate-500">
              Customer: {inquiry.customerName}
            </p>
          </div>
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${badgeColor}`}
          >
            {statusText}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between text-sm">
          <div>
            <span className="block text-slate-500">Progress</span>
            <span className="font-medium">
              {arrived} / {inquiry.quantity} MT
            </span>
          </div>
          <div className="text-right">
            <span className="block text-slate-500">Deadline</span>
            <span
              className={`font-medium ${isOverdue ? "text-red-600" : "text-slate-900"}`}
            >
              {inquiry.deadline
                ? format(inquiry.deadline, "MMM d, yyyy")
                : "Not set"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-lg font-bold">Active Orders</h3>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Delivery Date</SelectItem>
              <SelectItem value="customer">Customer Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="name">Fabric Name</SelectItem>
              <SelectItem value="color">Color</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-full flex-col gap-4">
          {sortedActive.length === 0 ? (
            <p className="text-slate-500">No active orders found.</p>
          ) : (
            sortedActive.map((item) => renderCard(item, false))
          )}
        </div>
      </div>

      {sortedArchived.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="border-b pb-2">
            <h3 className="text-lg font-bold text-slate-600">Archive</h3>
          </div>

          <div className="flex w-full flex-col gap-4">
            {sortedArchived.map((item) => renderCard(item, true))}
          </div>
        </div>
      )}
    </div>
  );
}
