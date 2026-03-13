"use client";

import { Clock } from "lucide-react";
import { IOperatingHours } from "@/components/custom/layout/location-section";

function formatTime(time: string | null): string {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function getCurrentDay(): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[new Date().getDay()];
}

function isCurrentlyOpen(hours: IOperatingHours[]): boolean {
  const currentDay = getCurrentDay();
  const todayHours = hours.find((h) => h.day === currentDay);

  if (!todayHours || todayHours.isClosed || !todayHours.openTime || !todayHours.closeTime) {
    return false;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [openHours, openMinutes] = todayHours.openTime.split(":").map(Number);
  const [closeHours, closeMinutes] = todayHours.closeTime.split(":").map(Number);

  const openTime = openHours * 60 + openMinutes;
  const closeTime = closeHours * 60 + closeMinutes;

  return currentTime >= openTime && currentTime < closeTime;
}

const dayOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function OperatingHoursCard({ hours }: { hours: IOperatingHours[] }) {
  const currentDay = getCurrentDay();
  const isOpen = isCurrentlyOpen(hours);

  const sortedHours = [...hours].sort(
    (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
  );

  return (
    <div className="bg-white border border-brand-black/30 border-t-4 border-t-brand-red p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-red" />
          <h3 className="text-xl font-bold font-serif text-brand-black">Opening Hours</h3>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isOpen
              ? "bg-status-open-bg text-status-open-text"
              : "bg-status-closed-bg text-status-closed-text"
          }`}
        >
          {isOpen ? "Open Now" : "Closed"}
        </span>
      </div>
      <div className="space-y-2">
        {sortedHours.map((day) => (
          <div
            key={day.id}
            className={`flex justify-between py-2 border-b border-divider last:border-0 ${
              day.day === currentDay ? "bg-brand-pink/20 -mx-2 px-2 rounded" : ""
            }`}
          >
            <span
              className={`font-medium ${
                day.day === currentDay ? "text-brand-red" : "text-brand-black"
              }`}
            >
              {day.day}
            </span>
            <span className="text-secondary-text">
              {day.isClosed
                ? "Closed"
                : `${formatTime(day.openTime)} - ${formatTime(day.closeTime)}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
