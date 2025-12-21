"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear,
  faCirclePlus,
  faReceipt,
  faTags,
  faComments,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";

export default function QuickActions() {
  const actions = [
    { href: "/tenants/create", label: "Create Tenant", icon: faBuilding },
    { href: "/invoices/create", label: "Create Invoice", icon: faCirclePlus },
    { href: "/invoices", label: "Billing", icon: faReceipt },
    { href: "/pricing", label: "Pricing", icon: faTags },
    { href: "/support", label: "Support", icon: faComments },
    { href: "/settings", label: "Settings", icon: faGear },
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
      {actions.map((action) => (
        <a
          key={action.href}
          href={action.href}
          className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
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
