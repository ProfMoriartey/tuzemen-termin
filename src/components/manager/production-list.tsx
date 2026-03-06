"use client";

import { useState, useTransition } from "react";
import { updateDesignStatus } from "~/server/actions/manager";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Checkbox } from "~/components/ui/checkbox";
import { format } from "date-fns";

type InquiryData = {
  id: string;
  quantity: number;
  customerName: string;
  deadline: Date | null;
  arrivedQty: number | null;
  variantId: string | null;
  fabricName: string | null;
  colorName: string | null;
  sellerName: string | null;
};

type SortOption = "fabric" | "color" | "seller";

type GroupedData = {
  variantId: string;
  fabricName: string;
  colorName: string;
  title: string;
  totalQty: number;
  totalArrived: number;
  deadline: Date | null;
  inquiries: InquiryData[];
};

function GroupCard({
  group,
  category,
}: {
  group: GroupedData;
  category: "late" | "active" | "archive";
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleBatchUpdate(formData: FormData) {
    startTransition(async () => {
      try {
        const rawDate = formData.get("deadline") as string;
        const deadlineDate = rawDate ? new Date(rawDate) : null;
        const isFulfilled = formData.get("isFulfilled") === "on";

        await updateDesignStatus(group.variantId, deadlineDate, isFulfilled);
        setOpen(false);
      } catch (error) {
        console.error(error);
      }
    });
  }

  let cardStyle = "bg-white border-slate-200 hover:bg-slate-50";
  if (category === "archive")
    cardStyle = "bg-green-50 border-green-300 hover:bg-green-100";
  else if (category === "late")
    cardStyle = "bg-red-50 border-red-300 hover:bg-red-100";
  else if (!group.deadline)
    cardStyle = "bg-yellow-50 border-yellow-300 hover:bg-yellow-100";

  const sortedInquiries = [...group.inquiries].sort(
    (a: InquiryData, b: InquiryData) =>
      (a.sellerName ?? "").localeCompare(b.sellerName ?? ""),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={`w-full cursor-pointer rounded-lg border p-4 text-left shadow-sm transition-colors ${cardStyle}`}
        >
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-bold sm:text-lg">{group.title}</h2>
              <p className="text-sm font-medium text-slate-600">
                Total Required: {group.totalQty} MT
              </p>
            </div>
            <div className="text-sm font-medium text-slate-500">
              {group.deadline
                ? `Deadline: ${format(new Date(group.deadline), "MMM d, yyyy")}`
                : "No Deadline Set"}
            </div>
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{group.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex max-h-[40vh] flex-col gap-2 overflow-y-auto pr-2">
            {sortedInquiries.map((inquiry: InquiryData) => (
              <div
                key={inquiry.id}
                className="flex justify-between rounded-md border bg-slate-50 p-3 text-sm"
              >
                <div>
                  <span className="block font-semibold">
                    {inquiry.sellerName}
                  </span>
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

          {category !== "archive" && (
            <form
              action={handleBatchUpdate}
              className="flex flex-col gap-4 rounded-md border bg-slate-50 p-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <label className="flex flex-1 flex-col gap-1 text-xs font-medium">
                  Set Deadline
                  <Input
                    type="date"
                    name="deadline"
                    defaultValue={
                      group.deadline
                        ? new Date(group.deadline).toISOString().split("T")[0]
                        : ""
                    }
                  />
                </label>

                <div className="flex flex-1 items-center space-x-2 pb-2">
                  <Checkbox id="isFulfilled" name="isFulfilled" />
                  <label
                    htmlFor="isFulfilled"
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Mark as Fulfilled
                  </label>
                </div>

                <Button type="submit" disabled={isPending} size="sm">
                  {isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
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

  const activeItems = filteredData.filter(
    (item) => (item.arrivedQty ?? 0) < item.quantity,
  );
  const archivedItems = filteredData.filter(
    (item) => (item.arrivedQty ?? 0) >= item.quantity,
  );

  function createGroups(items: InquiryData[]) {
    const grouped = items.reduce<Record<string, GroupedData>>((acc, item) => {
      const key = item.variantId ?? "unknown";

      acc[key] ??= {
        variantId: key,
        fabricName: item.fabricName ?? "",
        colorName: item.colorName ?? "",
        title: `${item.fabricName ?? ""} - ${item.colorName ?? ""}`,
        totalQty: 0,
        totalArrived: 0,
        deadline: item.deadline,
        inquiries: [],
      };

      const currentGroup = acc[key];

      if (currentGroup) {
        currentGroup.totalQty += item.quantity;
        currentGroup.totalArrived += item.arrivedQty ?? 0;
        currentGroup.inquiries.push(item);
      }

      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => {
      const getTopSeller = (inquiries: InquiryData[]) => {
        const sorted = [...inquiries].sort((x, y) =>
          (x.sellerName ?? "").localeCompare(y.sellerName ?? ""),
        );
        return sorted[0]?.sellerName ?? "";
      };

      if (sortBy === "seller") {
        const sellerA = getTopSeller(a.inquiries);
        const sellerB = getTopSeller(b.inquiries);
        const sellerCompare = sellerA.localeCompare(sellerB);
        if (sellerCompare !== 0) return sellerCompare;
      }

      if (sortBy === "color") {
        const colorCompare = a.colorName.localeCompare(b.colorName);
        if (colorCompare !== 0) return colorCompare;
        return a.fabricName.localeCompare(b.fabricName);
      }

      const fabricCompare = a.fabricName.localeCompare(b.fabricName);
      if (fabricCompare !== 0) return fabricCompare;
      return a.colorName.localeCompare(b.colorName);
    });
  }

  const sortedActiveGroups = createGroups(activeItems);
  const sortedArchivedGroups = createGroups(archivedItems);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lateGroups: GroupedData[] = [];
  const activeGroups: GroupedData[] = [];

  sortedActiveGroups.forEach((group) => {
    const hasDeadline = !!group.deadline;
    const deadlineDate =
      hasDeadline && group.deadline ? new Date(group.deadline) : null;

    if (deadlineDate) deadlineDate.setHours(0, 0, 0, 0);

    const isLate = hasDeadline && deadlineDate && deadlineDate < today;

    if (isLate) lateGroups.push(group);
    else activeGroups.push(group);
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
            <SelectItem value="color">Color</SelectItem>
            <SelectItem value="seller">Issuing Name (Seller)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sortedActiveGroups.length === 0 && sortedArchivedGroups.length === 0 && (
        <p className="text-slate-500">No orders match your search.</p>
      )}

      {lateGroups.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold text-red-600">Late Orders</h3>
          {lateGroups.map((group) => (
            <GroupCard key={group.variantId} group={group} category="late" />
          ))}
        </div>
      )}

      {activeGroups.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold">Active Orders</h3>
          {activeGroups.map((group) => (
            <GroupCard key={group.variantId} group={group} category="active" />
          ))}
        </div>
      )}

      {sortedArchivedGroups.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold text-green-700">
            Archive (Fulfilled)
          </h3>
          {sortedArchivedGroups.map((group) => (
            <GroupCard key={group.variantId} group={group} category="archive" />
          ))}
        </div>
      )}
    </div>
  );
}
