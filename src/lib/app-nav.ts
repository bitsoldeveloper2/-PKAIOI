import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Building2,
  ClipboardList,
  FileText,
  FlaskConical,
  GraduationCap,
  Home,
  KanbanSquare,
  LayoutDashboard,
  Newspaper,
  ScrollText,
  Settings,
  ShieldCheck,
  TerminalSquare,
  Users,
} from "lucide-react";

export type NavItem = { label: string; href: Route; icon: LucideIcon; exact?: boolean };
export type NavGroup = { label?: string; items: NavItem[] };

export type AreaKey = "campus" | "studio" | "admin" | "enterprise";

export const AREA_META: Record<AreaKey, { label: string; home: Route; description: string }> = {
  campus: { label: "Campus", home: "/campus" as Route, description: "Learn" },
  studio: { label: "Studio", home: "/studio" as Route, description: "Teach" },
  admin: { label: "Console", home: "/admin" as Route, description: "Operate" },
  enterprise: { label: "Enterprise", home: "/enterprise/portal" as Route, description: "Manage teams" },
};

export const CAMPUS_NAV: NavGroup[] = [
  {
    items: [
      { label: "Overview", href: "/campus" as Route, icon: Home, exact: true },
      { label: "My courses", href: "/campus/courses" as Route, icon: BookOpen },
      { label: "Certificates", href: "/campus/certificates" as Route, icon: Award },
    ],
  },
  {
    label: "AI",
    items: [
      { label: "Tutor", href: "/campus/tutor" as Route, icon: BrainCircuit },
      { label: "Coding lab", href: "/campus/lab" as Route, icon: TerminalSquare },
    ],
  },
];

export const STUDIO_NAV: NavGroup[] = [
  {
    items: [
      { label: "Overview", href: "/studio" as Route, icon: LayoutDashboard, exact: true },
      { label: "Courses", href: "/studio/courses" as Route, icon: BookOpen },
      { label: "Learners", href: "/studio/learners" as Route, icon: Users },
      { label: "Analytics", href: "/studio/analytics" as Route, icon: BarChart3 },
    ],
  },
];

export const ADMIN_NAV: NavGroup[] = [
  {
    items: [{ label: "Overview", href: "/admin" as Route, icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Institution",
    items: [
      { label: "Admissions", href: "/admin/admissions" as Route, icon: ClipboardList },
      { label: "CRM", href: "/admin/crm" as Route, icon: KanbanSquare },
      { label: "Enterprise", href: "/admin/enterprise" as Route, icon: Building2 },
      { label: "Research", href: "/admin/research" as Route, icon: FlaskConical },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "CMS", href: "/admin/cms" as Route, icon: Newspaper },
      { label: "Academy", href: "/admin/academy" as Route, icon: GraduationCap },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Users", href: "/admin/users" as Route, icon: Users },
      { label: "Audit log", href: "/admin/audit" as Route, icon: ScrollText },
      { label: "Settings", href: "/admin/settings" as Route, icon: Settings },
    ],
  },
];

export const ENTERPRISE_NAV: NavGroup[] = [
  {
    items: [
      { label: "Overview", href: "/enterprise/portal" as Route, icon: LayoutDashboard, exact: true },
      { label: "People", href: "/enterprise/portal/people" as Route, icon: Users },
      { label: "Reports", href: "/enterprise/portal/reports" as Route, icon: FileText },
      { label: "Governance", href: "/enterprise/portal/governance" as Route, icon: ShieldCheck },
    ],
  },
];

export const AREA_NAV: Record<AreaKey, NavGroup[]> = {
  campus: CAMPUS_NAV,
  studio: STUDIO_NAV,
  admin: ADMIN_NAV,
  enterprise: ENTERPRISE_NAV,
};
