export type VisitorType = "visitor" | "supplier";

export type Business = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  color: string | null;
  description: string | null;
  floor: string | null;
  created_at: string;
};

export type AccessLog = {
  id: string;
  business_id: string;
  visitor_type: VisitorType;
  full_name: string;
  id_document: string | null;
  company: string | null;
  reason: string | null;
  host_name: string | null;
  phone: string | null;
  entry_time: string;
  exit_time: string | null;
  created_at: string;
};

export interface AccessLogWithBusiness extends AccessLog {
  business: Pick<Business, "id" | "name" | "logo_url" | "color"> | null;
}

export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: Business;
        Insert: Omit<Business, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Business>;
        Relationships: [];
      };
      access_logs: {
        Row: AccessLog;
        Insert: Omit<AccessLog, "id" | "created_at" | "entry_time" | "exit_time"> & {
          id?: string;
          created_at?: string;
          entry_time?: string;
          exit_time?: string | null;
        };
        Update: Partial<AccessLog>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
  };
};

export type RangeKey = "1h" | "24h" | "7d" | "30d" | "90d" | "1y" | "5y";

export interface RangeConfig {
  key: RangeKey;
  label: string;
  hours: number;
  bucket: "minute" | "hour" | "day" | "week" | "month";
  bucketSize: number;
}

export const RANGES: RangeConfig[] = [
  { key: "1h", label: "1 hora", hours: 1, bucket: "minute", bucketSize: 5 },
  { key: "24h", label: "24 horas", hours: 24, bucket: "hour", bucketSize: 1 },
  { key: "7d", label: "7 días", hours: 24 * 7, bucket: "hour", bucketSize: 6 },
  { key: "30d", label: "30 días", hours: 24 * 30, bucket: "day", bucketSize: 1 },
  { key: "90d", label: "90 días", hours: 24 * 90, bucket: "day", bucketSize: 3 },
  { key: "1y", label: "1 año", hours: 24 * 365, bucket: "week", bucketSize: 1 },
  { key: "5y", label: "5 años", hours: 24 * 365 * 5, bucket: "month", bucketSize: 1 }
];
