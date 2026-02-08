// // app/(dashboard)/dashboard/page.tsx
// import type { Metadata } from "next";
// import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
// import React from "react";
// import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
// import MonthlyInvoicesChart from "@/components/ecommerce/MonthlyInvoicesChart";
// import StatisticsChart from "@/components/ecommerce/StatisticsChart";
// import RecentInvoices from "@/components/ecommerce/RecentInvoices";
// import RevenueByCurrency from "@/components/ecommerce/RevenueByCurrency";
// import PlanDistribution from "@/components/ecommerce/PlanDistribution";
// import TopMarkets from "@/components/ecommerce/TopMarkets";

// export const metadata: Metadata = {
//   title: "ClickInvoice Dashboard",
//   description: "Overview of your invoicing platform: invoices, revenue, tenants, and more.",
// };

// export default function SuperAdminDashboard() {
//   return (
//     <div className="grid grid-cols-12 gap-4 md:gap-6">
//       {/* Main Content */}
//       <div className="col-span-12 space-y-6 xl:col-span-8">
//         {/* <EcommerceMetrics /> */}

//         {/* <MonthlyInvoicesChart /> */}

//         {/* <StatisticsChart /> */}

//         {/* <PlanDistribution /> */}

//         {/* <RevenueByCurrency /> */}

//         {/* <TopMarkets /> */}
//       </div>

//       {/* Sidebar / Right Column */}
//       <div className="col-span-12 xl:col-span-4 space-y-6">
//         {/* <MonthlyTarget />

//         <RecentInvoices /> */}
//       </div>
//     </div>
//   );
// }


// app/(dashboard)/dashboard/AdminDashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserName } from "../../../lib/auth";
import AdminOutstandingAndCollected from "./AdminOutstandingAndCollected";
import AdminQuickActions from "./AdminQuickActions";
import InvoiceStatusChart from "../admin/InvoiceStatusChart";
import CurrencyDistributionChart from "../admin/CurrencyDistributionChart";
import RevenueTrendsChart from "../admin/RevenueTrendsChart";
import TopTenantsChart from "../admin/TopTenantsChart";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [name, setName] = useState("");
  const currency = "₦";

  useEffect(() => {
    const userName = getUserName();
    if (!userName) {
      router.push("/signin"); // Redirect if not logged in
    } else {
      setName(userName);
    }
  }, [router]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200/70 bg-gradient-to-br from-white via-white to-[#0A66C2]/5 p-4 sm:p-6 shadow-sm dark:border-white/10 dark:from-gray-900 dark:via-gray-900 dark:to-[#0A66C2]/10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#0A66C2]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-20 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-white/10 shadow-sm flex items-center justify-center overflow-hidden">
              <img
                src="/images/avatar.png"
                alt="Admin Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#0A66C2]">
                Super Admin Console
              </p>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                Welcome back, {name || "Admin"}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage businesses, invoices, and system-wide settings
              </p>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <AdminQuickActions />
          </div>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Core Metrics</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Real-time snapshot of currency performance
            </p>
          </div>
        </div>

        <AdminOutstandingAndCollected currency={currency} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
          <div className="w-full">
            <InvoiceStatusChart />
          </div>
          <div className="w-full">
            <TopTenantsChart />
          </div>

          <div className="w-full">
            <CurrencyDistributionChart />
          </div>
          <div className="w-full">
            <RevenueTrendsChart />
          </div>
        </div>
      </div>

      {/* Admin-specific Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* <AllTenants /> Widget showing all tenants/businesses */}
        {/* <RevenueByCurrency currency={currency} /> Revenue overview */}
        {/* <RecentInvoices currency={currency} /> Recent invoices across all tenants */}
      </div>
    </div>
  );
}
