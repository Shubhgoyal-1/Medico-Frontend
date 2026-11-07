export type AppointmentStatus = "Pending" | "Confirmed" | "Cancelled" | "Completed";

export function normalizeStatus(status?: string | null, isFinished?: boolean): AppointmentStatus {
  if (isFinished) return "Completed";
  switch ((status || "").trim().toLowerCase()) {
    case "confirmed":
      return "Confirmed";
    case "cancelled":
    case "canceled":
      return "Cancelled";
    case "completed":
      return "Completed";
    default:
      return "Pending";
  }
}

export const STATUS_STYLES: Record<AppointmentStatus, { badge: string; dot: string }> = {
  Confirmed: { badge: "bg-teal-50 text-teal-700", dot: "bg-teal-500" },
  Pending: { badge: "bg-amber-50 text-amber-700", dot: "bg-amber-400" },
  Cancelled: { badge: "bg-red-50 text-red-600", dot: "bg-red-400" },
  Completed: { badge: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
};

export function isChangeable(status: AppointmentStatus) {
  return status === "Pending" || status === "Confirmed";
}

// Appointment dates are calendar days stored at UTC midnight.
export function formatAppointmentDay(date: string | Date, options: Intl.DateTimeFormatOptions = {
  weekday: "long", year: "numeric", month: "long", day: "numeric",
}) {
  return new Date(date).toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
}

export function appointmentDayKey(date: string | Date) {
  return new Date(date).toISOString().slice(0, 10);
}

export function localDayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
