export interface ChildItem {
  id: string;
  name: string;
  icon?: string;
  url: string;
  color?: string;
  /** User needs at least one of these permissions (omit = every logged-in user). */
  permissions?: string[];
  children?: ChildItem[];
}

export interface MenuItem {
  id: number;
  name: string;
  icon: string;
  items: { heading: string; children: ChildItem[] }[];
}

export const REPORT_PERMISSIONS = ["reports.review", "reports.view_approved", "reports.view_all"];

/**
 * Dashboard menu. Visibility here is only cosmetic: every API endpoint enforces the same
 * permission on the server (route `can:` middleware / ReportPolicy).
 */
const SidebarContent: MenuItem[] = [
  {
    id: 1,
    name: "داشبورد",
    icon: "solar:layers-line-duotone",
    items: [
      {
        heading: "عمومی",
        children: [
          { id: "home", name: "داشبورد", icon: "solar:widget-add-line-duotone", url: "/dashboard" },
          { id: "profile", name: "پروفایل من", icon: "solar:user-circle-line-duotone", url: "/dashboard/profile" },
          { id: "reports", name: "گزارش‌های مردمی", icon: "solar:document-text-line-duotone", url: "/dashboard/reports", permissions: REPORT_PERMISSIONS },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "مدیریت",
    icon: "solar:settings-line-duotone",
    items: [
      {
        heading: "مدیریت سامانه",
        children: [
          { id: "users", name: "کاربران", icon: "solar:users-group-rounded-line-duotone", url: "/dashboard/users", permissions: ["users.view"] },
          { id: "roles", name: "نقش‌ها و دسترسی‌ها", icon: "solar:shield-user-line-duotone", url: "/dashboard/roles", permissions: ["roles.view"] },
          { id: "content", name: "محتوای سایت", icon: "solar:gallery-wide-line-duotone", url: "/dashboard/content", permissions: ["content.manage"] },
          { id: "audit", name: "گزارش رویدادها", icon: "solar:history-line-duotone", url: "/dashboard/audit-logs", permissions: ["audit.view"] },
        ],
      },
    ],
  },
];

/** Returns the menu filtered by the user's permissions (empty sections removed). */
export function visibleMenu(can: (p: string[]) => boolean): MenuItem[] {
  const filter = (items: ChildItem[]): ChildItem[] =>
    items
      .filter((c) => !c.permissions || can(c.permissions))
      .map((c) => (c.children ? { ...c, children: filter(c.children) } : c))
      .filter((c) => !c.children || c.children.length > 0);
  return SidebarContent.map((m) => ({
    ...m,
    items: m.items.map((g) => ({ ...g, children: filter(g.children) })).filter((g) => g.children.length),
  })).filter((m) => m.items.length);
}

export default SidebarContent;
