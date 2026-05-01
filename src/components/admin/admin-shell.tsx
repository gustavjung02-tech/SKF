import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { getFixedSuperAdminEmail } from "@/lib/admin/auth";

type AdminSection = "tong-quan" | "bao-gia" | "phan-quyen" | "mail";

const allAdminNavItems: Array<{ section: AdminSection; label: string; href: string; ownerOnly?: boolean }> = [
  { section: "tong-quan", label: "Tổng quan", href: "/admin" },
  { section: "bao-gia", label: "Báo giá", href: "/admin/bao-gia" },
  { section: "phan-quyen", label: "Phân quyền", href: "/admin/phan-quyen", ownerOnly: true },
  { section: "mail", label: "Mail", href: "/admin/mail" },
];

type AdminShellProps = {
  section: AdminSection;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  sessionEmail?: string;
};

export function AdminShell({ section, title, description, actions, children, sessionEmail }: AdminShellProps) {
  const ownerEmail = getFixedSuperAdminEmail();
  const adminNavItems = allAdminNavItems.filter((item) => !item.ownerOnly || sessionEmail === ownerEmail);
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-800">Admin SKF Công Nghiệp</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{title}</h1>
                {description ? <p className="mt-2 max-w-3xl text-sm text-slate-600">{description}</p> : null}
              </div>
              <nav className="flex flex-wrap gap-2">
                {adminNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      item.section === section
                        ? "border-blue-800 bg-blue-800 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-900"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        </div>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}