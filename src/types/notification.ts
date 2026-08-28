export interface AppNotification {
  id: string;
  type: string;
  data: {
    type: string;
    [key: string]: unknown;
  };
  read_at: string | null;
  created_at: string;
}
