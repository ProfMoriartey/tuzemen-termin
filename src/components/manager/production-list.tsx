"use client";

import { useState, useTransition } from "react";
import { notifyNewBatch } from "~/server/actions/workflow";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Search, Bell, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

type InquiryData = {
  id: string;
  quantity: number;
  customerName: string;
  deadline: Date | null;
  status: string | null;
  newBatchAlert: boolean | null;
  variantId: string | null;
  fabricName: string | null;
  colorName: string | null;
  sellerName: string | null;
};

type SortOption = "fabric" | "seller" | "customer" | "date";

type GroupedData = {
  variantId: string;
  fabricName: string;
  colorName: string;
  title: string;
  totalQty: number;
  deadline: Date | null;
  inquiries: InquiryData[];
};

function GroupCard({ group }: { group: GroupedData }) {
  const [isPending, startTransition] = useTransition();

  function handleNotify() {
    startTransition(async () => {
      try {
        await notifyNewBatch(group.variantId);
      } catch (error) {
        console.error(error);
      }
    });
  }

  const sortedInquiries = [...group.inquiries].sort((a, b) =>
    (a.sellerName ?? "").localeCompare(b.sellerName ?? ""),
  );

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold">{group.title}</h2>
          <p className="text-sm font-medium text-slate-500">
            Total Required: {group.totalQty} MT
          </p>
        </div>
        <Button
          onClick={handleNotify}
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Notifying...
            </>
          ) : (
            <>
              <Bell className="mr-2 h-4 w-4" />
              New Batch Arrived
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {sortedInquiries.map((inquiry) => (
          <div
            key={inquiry.id}
            className="flex justify-between rounded-md border bg-slate-50 p-3 text-sm"
          >
            <div>
              <span className="block font-semibold">{inquiry.sellerName}</span>
              <span className="text-slate-500">
                Customer: {inquiry.customerName}
              </span>
            </div>
            <div className="font-medium text-slate-800">
              {inquiry.quantity} MT
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductionList({ data }: { data: InquiryData[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("fabric");

  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.fabricName?.toLowerCase().includes(query) ??
      item.colorName?.toLowerCase().includes(query) ??
      item.customerName.toLowerCase().includes(query) ??
      item.sellerName?.toLowerCase().includes(query)
    );
  });

  // Only group active items
  const activeItems = filteredData.filter((item) => item.status !== "arrived");

  const grouped = activeItems.reduce<Record<string, GroupedData>>(
    (acc, item) => {
      const key = item.variantId ?? "unknown";

      acc[key] ??= {
        variantId: key,
        fabricName: item.fabricName ?? "",
        colorName: item.colorName ?? "",
        title: `${item.fabricName ?? ""} - ${item.colorName ?? ""}`,
        totalQty: 0,
        deadline: item.deadline,
        inquiries: [],
      };

      const currentGroup = acc[key];

      if (currentGroup) {
        currentGroup.totalQty += item.quantity;
        currentGroup.inquiries.push(item);
      }

      return acc;
    },
    {},
  );

  const sortedGroups = Object.values(grouped).sort((a, b) => {
    if (sortBy === "date") {
      const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      return dateA - dateB;
    }

    if (sortBy === "seller") {
      const sellerA =
        [...a.inquiries].sort((x, y) =>
          (x.sellerName ?? "").localeCompare(y.sellerName ?? ""),
        )[0]?.sellerName ?? "";
      const sellerB =
        [...b.inquiries].sort((x, y) =>
          (x.sellerName ?? "").localeCompare(y.sellerName ?? ""),
        )[0]?.sellerName ?? "";
      return sellerA.localeCompare(sellerB);
    }

    if (sortBy === "customer") {
      const custA =
        [...a.inquiries].sort((x, y) =>
          x.customerName.localeCompare(y.customerName),
        )[0]?.customerName ?? "";
      const custB =
        [...b.inquiries].sort((x, y) =>
          x.customerName.localeCompare(y.customerName),
        )[0]?.customerName ?? "";
      return custA.localeCompare(custB);
    }

    // Default: fabric
    const fabricCompare = a.fabricName.localeCompare(b.fabricName);
    if (fabricCompare !== 0) return fabricCompare;
    return a.colorName.localeCompare(b.colorName);
  });

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

      {sortedGroups.length === 0 ? (
        <p className="text-slate-500">
          No active production items match your search.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {sortedGroups.map((group) => (
            <GroupCard key={group.variantId} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
