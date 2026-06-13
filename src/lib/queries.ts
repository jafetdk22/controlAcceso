import { supabase } from "./supabase";
import {
  type AccessLog,
  type AccessLogWithBusiness,
  type Business,
  type RangeConfig,
  type VisitorType
} from "./types";

/* -------------------------------------------------------------------------- */
/*  Businesses                                                                */
/* -------------------------------------------------------------------------- */

export async function listBusinesses(): Promise<Business[]> {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getBusiness(id: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Genera un slug url-safe a partir del nombre del negocio. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Campos editables de un negocio (todo menos id y created_at). */
export type BusinessInput = Omit<Business, "id" | "created_at">;

export async function createBusiness(
  input: Partial<BusinessInput> & { name: string }
): Promise<Business> {
  const slug = input.slug?.trim() || slugify(input.name);
  const { data, error } = await supabase
    .from("businesses")
    .insert({ ...input, slug })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateBusiness(
  id: string,
  patch: Partial<BusinessInput>
): Promise<Business> {
  const { data, error } = await supabase
    .from("businesses")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBusiness(id: string): Promise<void> {
  const { error } = await supabase.from("businesses").delete().eq("id", id);
  if (error) throw error;
}

/* -------------------------------------------------------------------------- */
/*  Access logs                                                               */
/* -------------------------------------------------------------------------- */

export interface RegisterAccessInput {
  business_id: string;
  visitor_type: VisitorType;
  full_name: string;
  id_document?: string;
  company?: string;
  reason?: string;
  host_name?: string;
  phone?: string;
}

export async function registerAccess(input: RegisterAccessInput): Promise<AccessLog> {
  const { data, error } = await supabase
    .from("access_logs")
    .insert({
      ...input,
      id_document: input.id_document ?? null,
      company: input.company ?? null,
      reason: input.reason ?? null,
      host_name: input.host_name ?? null,
      phone: input.phone ?? null
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export interface AccessFilters {
  businessId?: string;
  visitorType?: VisitorType;
  range: RangeConfig;
}

export async function fetchAccessLogs(
  filters: AccessFilters,
  limit = 500
): Promise<AccessLogWithBusiness[]> {
  const since = new Date(Date.now() - filters.range.hours * 3600_000).toISOString();
  let q = supabase
    .from("access_logs")
    .select(
      `id, business_id, visitor_type, full_name, id_document, company, reason,
       host_name, phone, entry_time, exit_time, created_at,
       business:businesses ( id, name, logo_url, color )`
    )
    .gte("entry_time", since)
    .order("entry_time", { ascending: false })
    .limit(limit);

  if (filters.businessId && filters.businessId !== "all") {
    q = q.eq("business_id", filters.businessId);
  }
  if (filters.visitorType) {
    q = q.eq("visitor_type", filters.visitorType);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data as unknown as AccessLogWithBusiness[]) ?? [];
}

/* -------------------------------------------------------------------------- */
/*  Bucketing for charts                                                      */
/* -------------------------------------------------------------------------- */

export interface ChartPoint {
  label: string;
  timestamp: number;
  visitors: number;
  suppliers: number;
  total: number;
}

function bucketStart(d: Date, range: RangeConfig): Date {
  const x = new Date(d);
  switch (range.bucket) {
    case "minute": {
      const m = Math.floor(x.getMinutes() / range.bucketSize) * range.bucketSize;
      x.setSeconds(0, 0);
      x.setMinutes(m);
      return x;
    }
    case "hour": {
      const h = Math.floor(x.getHours() / range.bucketSize) * range.bucketSize;
      x.setMinutes(0, 0, 0);
      x.setHours(h);
      return x;
    }
    case "day": {
      x.setHours(0, 0, 0, 0);
      const day0 = new Date(x);
      day0.setDate(1);
      const delta =
        Math.floor((x.getTime() - day0.getTime()) / 86400000 / range.bucketSize) *
        range.bucketSize;
      day0.setDate(1 + delta);
      return day0;
    }
    case "week": {
      x.setHours(0, 0, 0, 0);
      const dow = (x.getDay() + 6) % 7; // lunes
      x.setDate(x.getDate() - dow);
      return x;
    }
    case "month": {
      x.setHours(0, 0, 0, 0);
      x.setDate(1);
      return x;
    }
  }
}

function bucketNext(d: Date, range: RangeConfig): Date {
  const x = new Date(d);
  switch (range.bucket) {
    case "minute":
      x.setMinutes(x.getMinutes() + range.bucketSize);
      return x;
    case "hour":
      x.setHours(x.getHours() + range.bucketSize);
      return x;
    case "day":
      x.setDate(x.getDate() + range.bucketSize);
      return x;
    case "week":
      x.setDate(x.getDate() + 7);
      return x;
    case "month":
      x.setMonth(x.getMonth() + 1);
      return x;
  }
}

function bucketLabel(d: Date, range: RangeConfig): string {
  const opts: Intl.DateTimeFormatOptions =
    range.bucket === "minute"
      ? { hour: "2-digit", minute: "2-digit" }
      : range.bucket === "hour"
        ? { hour: "2-digit", minute: "2-digit" }
        : range.bucket === "day"
          ? { day: "2-digit", month: "short" }
          : range.bucket === "week"
            ? { day: "2-digit", month: "short" }
            : { month: "short", year: "2-digit" };
  return new Intl.DateTimeFormat("es-MX", opts).format(d);
}

export function bucketLogs(
  logs: AccessLogWithBusiness[],
  range: RangeConfig
): ChartPoint[] {
  const now = new Date();
  const start = bucketStart(new Date(now.getTime() - range.hours * 3600_000), range);
  const end = bucketStart(now, range);

  const buckets = new Map<number, ChartPoint>();
  let cursor = new Date(start);
  while (cursor.getTime() <= end.getTime()) {
    buckets.set(cursor.getTime(), {
      label: bucketLabel(cursor, range),
      timestamp: cursor.getTime(),
      visitors: 0,
      suppliers: 0,
      total: 0
    });
    cursor = bucketNext(cursor, range);
  }

  for (const log of logs) {
    const b = bucketStart(new Date(log.entry_time), range).getTime();
    const point = buckets.get(b);
    if (!point) continue;
    if (log.visitor_type === "visitor") point.visitors += 1;
    else point.suppliers += 1;
    point.total += 1;
  }

  return Array.from(buckets.values()).sort((a, b) => a.timestamp - b.timestamp);
}

/* -------------------------------------------------------------------------- */
/*  Aggregations                                                              */
/* -------------------------------------------------------------------------- */

export interface BusinessBreakdownRow {
  business_id: string;
  business_name: string;
  logo_url: string | null;
  color: string | null;
  visitors: number;
  suppliers: number;
  total: number;
}

export function aggregateByBusiness(
  logs: AccessLogWithBusiness[]
): BusinessBreakdownRow[] {
  const map = new Map<string, BusinessBreakdownRow>();
  for (const log of logs) {
    const id = log.business_id;
    const name = log.business?.name ?? "Sin nombre";
    if (!map.has(id)) {
      map.set(id, {
        business_id: id,
        business_name: name,
        logo_url: log.business?.logo_url ?? null,
        color: log.business?.color ?? null,
        visitors: 0,
        suppliers: 0,
        total: 0
      });
    }
    const row = map.get(id)!;
    if (log.visitor_type === "visitor") row.visitors += 1;
    else row.suppliers += 1;
    row.total += 1;
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

export interface KPI {
  total: number;
  visitors: number;
  suppliers: number;
  insideNow: number;
  uniqueBusinesses: number;
  peakHour: { hour: string; count: number } | null;
}

export function computeKPIs(logs: AccessLogWithBusiness[]): KPI {
  const byHour = new Map<string, number>();
  let visitors = 0;
  let suppliers = 0;
  let inside = 0;
  const businesses = new Set<string>();

  for (const log of logs) {
    if (log.visitor_type === "visitor") visitors += 1;
    else suppliers += 1;
    if (!log.exit_time) inside += 1;
    businesses.add(log.business_id);
    const h = new Date(log.entry_time).getHours().toString().padStart(2, "0") + ":00";
    byHour.set(h, (byHour.get(h) ?? 0) + 1);
  }

  let peak: { hour: string; count: number } | null = null;
  for (const [hour, count] of byHour) {
    if (!peak || count > peak.count) peak = { hour, count };
  }

  return {
    total: logs.length,
    visitors,
    suppliers,
    insideNow: inside,
    uniqueBusinesses: businesses.size,
    peakHour: peak
  };
}
