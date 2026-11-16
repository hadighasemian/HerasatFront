export interface RoleRef {
  id?: number;
  name: string;
  display_name: string | null;
}

export interface Me {
  id: number;
  personnel_code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  must_change_password: boolean;
  roles: RoleRef[];
  permissions: string[];
}

export interface Paginated<T> {
  data: T[];
  meta: { current_page: number; last_page: number; total: number; per_page?: number };
}

export interface UserItem {
  id: number;
  personnel_code: string;
  first_name: string;
  last_name: string;
  department: string | null;
  work_location: string | null;
  is_active: boolean;
  is_locked: boolean;
  must_change_password: boolean;
  roles: RoleRef[];
  last_login_at: string | null;
  created_at: string | null;
  father_name?: string | null;
  employment_type?: string | null;
  national_code_masked?: string | null;
  phone_masked?: string | null;
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  title_en: string | null;
  description: string | null;
  is_system: boolean;
  users_count: number | null;
  permissions: string[];
}

export interface Permission {
  id: number;
  name: string;
  display_name: string;
  group: string | null;
  description: string | null;
  is_system: boolean;
}

export type ReportStatus = "submitted" | "approved" | "rejected";

export interface ReportItem {
  id: number;
  tracking_hint: string;
  title: string;
  category: string;
  category_label: string;
  status: ReportStatus;
  attachments_count: number;
  created_at: string;
}

export interface ReportDetail extends ReportItem {
  description: string;
  contact: string | null;
  review_note: string | null;
  reviewer: string | null;
  reviewed_at: string | null;
  attachments: { id: number; name: string; mime: string; size: number }[];
  history: { from: string | null; to: string; note: string | null; by: string | null; at: string }[];
}

export interface TodoItem {
  id: number;
  title: string;
  notes: string | null;
  due_date: string | null;
  is_done: boolean;
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export type LoginResult = "success" | "failed" | "logout" | "locked" | "other";

export interface LoginHistoryItem {
  id: number;
  action: string;
  result: LoginResult;
  result_label: string;
  occurred_at: string | null;
  ip: string | null;
  browser: string | null;
  os: string | null;
}
