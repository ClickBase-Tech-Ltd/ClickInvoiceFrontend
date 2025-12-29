"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear,
  faCirclePlus,
  faReceipt,
  faTags,
  faComments,
  faBuilding,
  faUsers,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

export default function AdminQuickActions() {
  // Admin actions: focus on multi-tenant management & overview
  const actions = [
    // { href: "/dashboard/tenants/create", label: "Create Business", icon: faBuilding },
    // { href: "/dashboard/tenants", label: "All Businesses", icon: faUsers },
    // { href: "/dashboard/invoices/create", label: "Create Invoice", icon: faCirclePlus },
    // { href: "/dashboard/admin/invoices", label: "Billing", icon: faReceipt },
    // { href: "/dashboard/admin/reports", label: "Reports", icon: faChartLine },
    { href: "/dashboard/admin/subscriptions", label: "Subscriptions", icon: faTags },
    // { href: "/dashboard/admin/plans", label: "Pricing", icon: faTags },
    { href: "/dashboard/admin/support", label: "Support", icon: faComments },
    { href: "/dashboard/admin/profile", label: "Settings", icon: faGear },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {actions.map((action) => (
        <a
          key={action.href}
          href={action.href}
          className="flex flex-col items-center gap-1 text-[#0A66C2] dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <FontAwesomeIcon icon={action.icon} className="text-lg" />
          </div>
          <span className="text-xs font-medium text-center">
            {action.label}
          </span>
        </a>
      ))}
    </div>
  );
}
