// app/(dashboard)/dashboard/page.tsx
import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlyInvoicesChart from "@/components/ecommerce/MonthlyInvoicesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentInvoices from "@/components/ecommerce/RecentInvoices";
import RevenueByCurrency from "@/components/ecommerce/RevenueByCurrency";
import PlanDistribution from "@/components/ecommerce/PlanDistribution";
import TopMarkets from "@/components/ecommerce/TopMarkets";

export const metadata: Metadata = {
  title: "Click Invoice Dashboard",
  description: "Overview of your invoicing platform: invoices, revenue, tenants, and more.",
};

export default function SuperAdminDashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Main Content */}
      <div className="col-span-12 space-y-6 xl:col-span-8">
        <EcommerceMetrics />

        <MonthlyInvoicesChart />

        <StatisticsChart />

        {/* <PlanDistribution /> */}

        {/* <RevenueByCurrency /> */}

        <TopMarkets />
      </div>

      {/* Sidebar / Right Column */}
      <div className="col-span-12 xl:col-span-4 space-y-6">
        <MonthlyTarget />

        <RecentInvoices />
      </div>
    </div>
  );
}