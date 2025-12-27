import React from "react";

export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03] pb-10`}
    >
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
        Leading Invoicing & Billing Software
      </h3>
      <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400">
        Create professional invoices, manage payments, automate recurring billing, track expenses, and get paid faster — perfect for freelancers, startups, and businesses in Africa and beyond.
      </p>
      <a
        href="/dashboard/plans"
        target="_blank"
        rel="nofollow"
        className="flex items-center justify-center p-3 font-medium text-white rounded-lg bg-[#0A66C2] text-theme-sm hover:bg-brand-600"
      >
        Upgrade to Premium
      </a>
    </div>
  );
}