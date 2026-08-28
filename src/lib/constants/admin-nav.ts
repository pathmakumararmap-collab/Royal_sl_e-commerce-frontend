import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Boxes,
  Building2,
  Contact,
  FileText,
  Gauge,
  KeyRound,
  LayoutGrid,
  Megaphone,
  Package,
  PackageSearch,
  Percent,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Tags,
  Truck,
  TrendingUp,
  Users,
  Warehouse,
  Zap,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: Gauge },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Sales",
    items: [
      { href: "/admin/pos", label: "POS", icon: Store, permission: "pos.sell" },
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart, permission: "orders.view" },
      { href: "/admin/invoices", label: "Invoices", icon: Receipt, permission: "orders.view" },
      { href: "/admin/customers", label: "Customers", icon: Contact, permission: "users.view" },
    ],
  },
  {
    title: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package, permission: "products.view" },
      { href: "/admin/categories", label: "Categories", icon: LayoutGrid, permission: "categories.view" },
      { href: "/admin/brands", label: "Brands", icon: Tags, permission: "brands.view" },
      { href: "/admin/reviews", label: "Reviews", icon: Star, permission: "reviews.moderate" },
    ],
  },
  {
    title: "Inventory",
    items: [
      { href: "/admin/inventory", label: "Inventory", icon: Boxes, permission: "stock.view" },
      { href: "/admin/warehouse", label: "Warehouse", icon: Warehouse, permission: "warehouses.view" },
      { href: "/admin/suppliers", label: "Suppliers", icon: Truck, permission: "suppliers.view" },
      {
        href: "/admin/purchase-orders",
        label: "Purchase Orders",
        icon: PackageSearch,
        permission: "purchases.view",
      },
    ],
  },
  {
    title: "Reports",
    items: [
      { href: "/admin/reports/sales", label: "Sales Reports", icon: FileText, permission: "reports.view" },
      { href: "/admin/reports/revenue", label: "Revenue Reports", icon: BarChart3, permission: "reports.view" },
      { href: "/admin/reports/stock", label: "Stock Reports", icon: Boxes, permission: "reports.view" },
      {
        href: "/admin/reports/movement",
        label: "Movement Reports",
        icon: TrendingUp,
        permission: "reports.view",
      },
    ],
  },
  {
    title: "Marketing",
    items: [
      { href: "/admin/coupons", label: "Coupons", icon: Percent, permission: "coupons.view" },
      { href: "/admin/flash-sale", label: "Flash Sale", icon: Zap, permission: "coupons.view" },
      { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
    ],
  },
  {
    title: "Access Control",
    items: [
      { href: "/admin/users", label: "Users", icon: Users, permission: "users.view" },
      { href: "/admin/roles", label: "Roles", icon: ShieldCheck, permission: "users.view" },
      { href: "/admin/permissions", label: "Permissions", icon: KeyRound, permission: "users.view" },
      {
        href: "/admin/activity-logs",
        label: "Activity Logs",
        icon: Activity,
        permission: "activity-logs.view",
      },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export const ADMIN_QUICK_STATS_ICONS = { ShoppingBag, Sparkles, Building2 };
