// types/delivery.ts

export type OrderStatus   = "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
export type OrderType     = "delivery" | "pickup";
export type PaymentStatus = "paid" | "partial" | "unpaid" | "n/a";

export interface DeliveryOrder {
  id: string;
  order_type: OrderType;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string | null;
  origin_address: string | null;
  destination_address: string | null;
  item_description: string;
  item_notes: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  scheduled_time_override: string | null;
  payment_status: PaymentStatus;
  payment_notes: string | null;
  taken_by: string | null;
  created_at: string;
  completed_at: string | null;
  eta_minutes: number | null;
  eta_checked_at: string | null;
  notify_at: string | null;
  eta_notified: boolean;
}

export interface IntakeFormData {
  order_type: OrderType;
  customer_name: string;
  customer_phone: string;
  origin_address: string;
  destination_address: string;
  item_description: string;
  item_notes: string;
  scheduled_date: string;
  scheduled_time: string;
  payment_status: PaymentStatus;
  payment_notes: string;
  taken_by: string;
}

export const BLANK_FORM: IntakeFormData = {
  order_type: "delivery",
  customer_name: "",
  customer_phone: "",
  origin_address: "",
  destination_address: "",
  item_description: "",
  item_notes: "",
  scheduled_date: "",
  scheduled_time: "",
  payment_status: "unpaid",
  payment_notes: "",
  taken_by: "",
};

export const STATUS_CFG: Record<
  OrderStatus,
  {
    label:     string;
    color:     string;
    bg:        string;
    next:      OrderStatus | null;
    nextLabel: string;
    prev:      OrderStatus | null; // ← undo target
    prevLabel: string;             // ← undo button label
  }
> = {
  pending:     { label: "Pending",     color: "#b45309", bg: "#fef3c7", next: "in_progress", nextLabel: "Start Run", prev: null,          prevLabel: "" },
  assigned:    { label: "Assigned",    color: "#1d4ed8", bg: "#dbeafe", next: "in_progress", nextLabel: "Start Run", prev: "pending",      prevLabel: "Undo Assign" },
  in_progress: { label: "In Progress", color: "#7c3aed", bg: "#ede9fe", next: "completed",   nextLabel: "Mark Done", prev: "pending",      prevLabel: "Undo Start" },
  completed:   { label: "Completed",   color: "#166534", bg: "#dcfce7", next: null,           nextLabel: "",          prev: "in_progress",  prevLabel: "Undo Complete" },
  cancelled:   { label: "Cancelled",   color: "#991b1b", bg: "#fee2e2", next: null,           nextLabel: "",          prev: "pending",      prevLabel: "Undo Cancel" },
};

export const PAYMENT_COLOR: Record<string, string> = {
  paid:    "#16a34a",
  partial: "#d97706",
  unpaid:  "#dc2626",
  "n/a":   "#888",
};

export const TIME_SLOTS = [
  "8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM",
  "11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM",
  "2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM",
];

export const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];