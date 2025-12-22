import { isFuture } from "date-fns";

export type BookingStatus = "confirmed" | "finished" | "cancelled";

export function getBookingStatus(
  date: Date | string,
  cancelledAt: Date | null | undefined
): BookingStatus {
  if (cancelledAt) {
    return "cancelled";
  }

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isFuture(dateObj)) {
    return "confirmed";
  }
  return "finished";
}
