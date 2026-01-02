"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear,
  faTags,
  faComments,
} from "@fortawesome/free-solid-svg-icons";

export default function AdminQuickActions() {
  const actions = [
    { href: "/dashboard/admin/subscriptions", label: "Subscriptions", icon: faTags },
    { href: "/dashboard/admin/support", label: "Support", icon: faComments },
    { href: "/dashboard/admin/profile", label: "Settings", icon: faGear },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6 justify-items-center">
        {actions.map((action) => (
          <a
            key={action.href}
            href={action.href}
            className="flex flex-col items-center justify-center gap-2 w-full max-w-24 py-4 rounded-lg text-[#0A66C2] dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={action.icon} className="text-xl" />
            </div>
            <span className="text-xs font-medium text-center leading-tight">
              {action.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}