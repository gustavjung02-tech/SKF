import Link from "next/link";
import Image from "next/image";
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
    <div className="min-h-screen bg-slate-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex min-w-0 items-center gap-3">
                <Image
                  src="/images/logo-skf-cong-nghiep-header.png"
                  alt="SKF Cong Nghiep"
                  width={220}
                  height={56}
                  className="h-10 w-auto shrink-0"
                  priority
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-800">Admin SKF Công Nghiệp</p>
                  <h1 className="mt-0.5 truncate text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
                </div>
              </div>
              {description ? <p className="max-w-3xl text-sm text-slate-600">{description}</p> : null}
            </div>

            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              <nav className="flex flex-wrap gap-2">
                {adminNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      item.section === section
                        ? "border-blue-800 bg-blue-800 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-900"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              {actions ? <div className="shrink-0">{actions}</div> : null}
            </div>
          </div>
        </div>

        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}