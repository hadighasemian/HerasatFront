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
 * permission on the server (route `can:` middleware / policies).
 */
const SidebarContent: MenuItem[] = [
  {
    id: 1,
    name: "داشبورد",
    icon: "solar:layers-line-duotone",
    items: [
      {
        heading: "داشبورد",
        children: [
          { id: "home", name: "داشبورد", icon: "solar:widget-add-line-duotone", url: "/dashboard" },
          { id: "todos", name: "کارهای من", icon: "solar:checklist-minimalistic-line-duotone", url: "/dashboard/todos", permissions: ["todos.use"] },
          { id: "profile", name: "پروفایل من", icon: "solar:user-circle-line-duotone", url: "/dashboard/profile" },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "مدیریت سیستم",
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
  {
    id: 3,
    name: "حراست پرسنلی",
    icon: "solar:shield-check-line-duotone",
    items: [
      {
        heading: "حفاظت پرسنلی",
        children: [
          { id: "reports", name: "گزارش‌های مردمی", icon: "solar:document-text-line-duotone", url: "/dashboard/reports", permissions: REPORT_PERMISSIONS },
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

/** Section id that contains the current path (longest URL match; /dashboard is exact-only). */
export function menuIdForPath(pathname: string, menu: MenuItem[]): number | undefined {
  const entries = menu.flatMap((m) => m.items.flatMap((g) => g.children.map((c) => ({ id: m.id, url: c.url }))));
  const exact = entries.find((e) => e.url === pathname);
  if (exact) return exact.id;
  const prefix = entries
    .filter((e) => e.url !== "/dashboard" && pathname.startsWith(e.url + "/"))
    .sort((a, b) => b.url.length - a.url.length)[0];
  return prefix?.id ?? menu[0]?.id;
}

export default SidebarContent;
