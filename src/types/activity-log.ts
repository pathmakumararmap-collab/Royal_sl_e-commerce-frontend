export interface ActivityLog {
  id: number;
  log_name: string | null;
  description: string;
  subject_type: string | null;
  subject_id: number | null;
  causer_type: string | null;
  causer_id: number | null;
  causer?: { id: number; name: string; email: string } | null;
  event: string | null;
  properties: Record<string, unknown>;
  created_at: string;
}
