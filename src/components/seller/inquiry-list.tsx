"use client";

import { useState, useTransition } from "react";
import { toggleInquiryFulfillment } from "~/server/actions/workflow";
import { format } from "date-fns";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { DeleteInquiryButton } from "~/components/seller/delete-inquiry-button";

type SellerInquiry = {
  id: string;
  fabricName: string | null;
  colorName: string | null;
  customerName: string;
  sellerName: string | null;
  quantity: number;
  deadline: Date | null;
  status: string | null;
  newBatchAlert: boolean | null;
  lastAlertAt: Date | null; // Add this line
  arrivedQty: number | null;
};

type SortOption = "fabric" | "seller" | "customer" | "date";

export function InquiryList({ inquiries }: { inquiries: SellerInquiry[] }) {
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("fabric");

  function handleToggle(inquiryId: string, checked: boolean) {
    startTransition(async () => {
      await toggleInquiryFulfillment(inquiryId, checked);
    });
  }

  const filteredInquiries = inquiries.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.fabricName?.toLowerCase().includes(query) ??
      item.colorName?.toLowerCase().includes(query) ??
      item.customerName.toLowerCase().includes(query) ??
      item.sellerName?.toLowerCase().includes(query)
    );
  });

  function sortItems(items: SellerInquiry[]) {
    return [...items].sort((a, b) => {
      if (sortBy === "seller")
        return (a.sellerName ?? "").localeCompare(b.sellerName ?? "");
      if (sortBy === "customer")
        return a.customerName.localeCompare(b.customerName);
      if (sortBy === "date") {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return dateA - dateB;
      }
      const fabricCompare = (a.fabricName ?? "").localeCompare(
        b.fabricName ?? "",
      );
      if (fabricCompare !== 0) return fabricCompare;
      return (a.colorName ?? "").localeCompare(b.colorName ?? "");
    });
  }

  const activeInquiries = sortItems(
    filteredInquiries.filter((item) => item.status !== "arrived"),
  );
  const archivedInquiries = sortItems(
    filteredInquiries.filter((item) => item.status === "arrived"),
  );

  function checkAlertStatus(inquiry: SellerInquiry) {
    if (!inquiry.newBatchAlert || !inquiry.lastAlertAt) return false;

    const alertTime = new Date(inquiry.lastAlertAt).getTime();
    const currentTime = new Date().getTime();
    const hoursDifference = (currentTime - alertTime) / (1000 * 60 * 60);

    return hoursDifference < 36;
  }

  function renderCard(inquiry: SellerInquiry, isArchived: boolean) {
    const isAlertActive = checkAlertStatus(inquiry) && !isArchived;

    let cardStyle = "bg-white border-slate-200";
    if (isArchived) cardStyle = "bg-slate-50 border-slate-200 opacity-75";
    else if (isAlertActive) cardStyle = "bg-blue-50 border-blue-400 shadow-md";

    return (
      <div
        key={inquiry.id}
        className={`flex flex-col gap-3 rounded-lg border p-4 transition-colors ${cardStyle}`}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">
              {inquiry.fabricName} - {inquiry.colorName}
            </h3>
            <p className="text-sm font-medium text-slate-600">
              Customer: {inquiry.customerName} | Seller: {inquiry.sellerName}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2 rounded-md border bg-white p-2 shadow-sm">
              <Checkbox
                id={`fulfill-${inquiry.id}`}
                checked={isArchived}
                onCheckedChange={(checked) =>
                  handleToggle(inquiry.id, checked as boolean)
                }
                disabled={isPending}
              />
              <label
                htmlFor={`fulfill-${inquiry.id}`}
                className="cursor-pointer text-sm font-bold"
              >
                Fulfilled
              </label>
            </div>
            <DeleteInquiryButton inquiryId={inquiry.id} />
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-sm">
          <div>
            <span className="block text-slate-500">Required</span>
            <span className="font-bold">{inquiry.quantity} MT</span>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <span className="block text-slate-500">Deadline</span>
            <span className="font-medium">
              {inquiry.deadline
                ? format(new Date(inquiry.deadline), "MMM d, yyyy")
                : "Not set"}
            </span>
            {isAlertActive && inquiry.lastAlertAt && (
              <div className="mt-1 flex flex-col items-end gap-1 rounded-md bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-800">
                <span>Check Stock - New Batch Arrived</span>
                <span className="text-[10px] font-medium opacity-80">
                  Alerted:{" "}
                  {format(new Date(inquiry.lastAlertAt), "MMM d, h:mm a")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search fabric, color, customer, or seller..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as SortOption)}
        >
          <SelectTrigger className="w-full sm:w-50">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fabric">Fabric Name</SelectItem>
            <SelectItem value="seller">Issuing Name (Seller)</SelectItem>
            <SelectItem value="customer">Customer Name</SelectItem>
            <SelectItem value="date">Delivery Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-4">
        {activeInquiries.map((item) => renderCard(item, false))}
        {activeInquiries.length === 0 && (
          <p className="text-slate-500">No active orders found.</p>
        )}
      </div>

      {archivedInquiries.length > 0 && (
        <div className="mt-8 flex flex-col gap-4 border-t pt-8">
          <h3 className="text-xl font-bold text-slate-600">Archive</h3>
          {archivedInquiries.map((item) => renderCard(item, true))}
        </div>
      )}
    </div>
  );
}
