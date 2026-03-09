"use client";

import { useState } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  startOfDay,
} from "date-fns";
import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

type CalendarItem = {
  id: string;
  quantity: number;
  customerName: string;
  deadline: Date | null;
  status: string | null;
  fabricName: string | null;
  colorName: string | null;
};

export function CalendarView({ data }: { data: CalendarItem[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const today = startOfDay(new Date());

  function nextMonth() {
    setCurrentDate(addMonths(currentDate, 1));
  }

  function prevMonth() {
    setCurrentDate(subMonths(currentDate, 1));
  }

  function handleDayClick(day: Date) {
    setSelectedDay(day);
    setDialogOpen(true);
  }

  const firstDay = startOfMonth(currentDate);
  const lastDay = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });

  const selectedDayItems = selectedDay
    ? data.filter(
        (item) =>
          item.deadline && isSameDay(new Date(item.deadline), selectedDay),
      )
    : [];

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="text-xl font-bold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 md:gap-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-bold text-slate-500"
          >
            {day}
          </div>
        ))}

        {Array.from({ length: firstDay.getDay() }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="min-h-25 rounded-lg border border-transparent md:min-h-30"
          />
        ))}

        {days.map((day) => {
          const dayItems = data.filter(
            (item) => item.deadline && isSameDay(new Date(item.deadline), day),
          );

          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toString()}
              onClick={() => handleDayClick(day)}
              className={`flex min-h-25 cursor-pointer flex-col rounded-lg border p-2 text-left shadow-sm transition-colors hover:ring-2 hover:ring-slate-200 md:min-h-30 ${isToday ? "border-blue-500 bg-blue-50" : "bg-white"}`}
            >
              <div
                className={`mb-2 w-full text-right text-sm font-bold ${isToday ? "text-blue-600" : "text-slate-700"}`}
              >
                {format(day, "d")}
              </div>

              <div className="flex w-full flex-1 flex-col gap-1 overflow-hidden">
                {dayItems.slice(0, 3).map((item) => {
                  const isLate = day < today;

                  let itemStyle =
                    "bg-yellow-100 text-yellow-800 border-yellow-200";

                  if (isLate) {
                    itemStyle = "bg-red-100 text-red-800 border-red-200";
                  }

                  return (
                    <div
                      key={item.id}
                      className={`rounded-md border p-1 text-xs ${itemStyle}`}
                    >
                      <span className="block truncate font-semibold">
                        {item.fabricName} - {item.colorName}
                      </span>
                    </div>
                  );
                })}
                {dayItems.length > 3 && (
                  <div className="pl-1 text-xs font-medium text-slate-500">
                    +{dayItems.length - 3} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>
              {selectedDay ? format(selectedDay, "EEEE, MMMM d, yyyy") : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto pt-2 pr-2">
            {selectedDayItems.length === 0 ? (
              <p className="text-slate-500">
                No production scheduled for this day.
              </p>
            ) : (
              selectedDayItems.map((item) => {
                const isLate = selectedDay && selectedDay < today;

                let badgeStyle = "bg-yellow-100 text-yellow-800";
                let statusText = "Pending";

                if (isLate) {
                  badgeStyle = "bg-red-100 text-red-800";
                  statusText = "Late";
                }

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-lg border bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold">
                          {item.fabricName} - {item.colorName}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Customer: {item.customerName}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${badgeStyle}`}
                      >
                        {statusText}
                      </span>
                    </div>
                    <div className="text-sm font-medium">
                      Quantity Required: {item.quantity} MT
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
