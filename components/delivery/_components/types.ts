// components/delivery/_components/types.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { IntakeFormData } from "@/types/delivery";

export interface IntakeFormProps {
  supabase: SupabaseClient;
  isDark?:  boolean;
}

export interface ScheduleBlock {
  start_time: string;
  end_time:   string;
  label:      string;
  is_active:  boolean;
}

export interface ExistingOrder {
  id:               string;
  customer_name:    string;
  order_type:       string;
  scheduled_time:   string;
  item_description: string;
  status:           string;
}

export interface SlotMeta {
  label:       string;
  blocked:     boolean;
  blockLabel?: string;
  orders:      ExistingOrder[];
  /** false = blocked OR has existing orders */
  available:   boolean;
}

export interface DateOption {
  value:      string;
  dayName:    string;
  dayNum:     number;
  monthShort: string;
  isToday:    boolean;
  isWeekend:  boolean;
}

export interface StepDef {
  id:    number;
  label: string;
}

export const STEPS: StepDef[] = [
  { id: 1, label: "Type"    },
  { id: 2, label: "Contact" },
  { id: 3, label: "Address" },
  { id: 4, label: "Items"   },
  { id: 5, label: "When"    },
  { id: 6, label: "Payment" },
  { id: 7, label: "Confirm" },
];