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
import QuickActions from "@/components/ecommerce/QuickActions";
import RecentInvoices from "@/components/ecommerce/RecentInvoices";
import OutstandingAndCollected from "@/components/ecommerce/OutstandingAndCollected";
// import AllTenants from "@/components/ecommerce/AllTenants"; // Admin-specific widget
import RevenueByCurrency from "@/components/ecommerce/RevenueByCurrency"; // Admin-specific widget
import AdminOutstandingAndCollected from "./AdminOutstandingAndCollected";
import AdminQuickActions from "./AdminQuickActions";

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
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              <img
                src="/images/avatar.png"
                alt="Admin Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Welcome back, {name || "Admin"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your businesses, invoices, and system-wide settings
              </p>
            </div>
          </div>
          <AdminQuickActions />
        </div>
      </div>

      {/* KPIs: Outstanding & Collected */}
      <AdminOutstandingAndCollected currency={currency} />

      {/* Admin-specific Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* <AllTenants /> Widget showing all tenants/businesses */}
        {/* <RevenueByCurrency currency={currency} /> Revenue overview */}
        {/* <RecentInvoices currency={currency} /> Recent invoices across all tenants */}
      </div>
    </div>
  );
}
