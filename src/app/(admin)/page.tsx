// app/(dashboard)/dashboard/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlyInvoicesChart from "@/components/ecommerce/MonthlyInvoicesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentInvoices from "@/components/ecommerce/RecentInvoices";
import RevenueByCurrency from "@/components/ecommerce/RevenueByCurrency";
import PlanDistribution from "@/components/ecommerce/PlanDistribution";
import TopMarkets from "@/components/ecommerce/TopMarkets";
import BasicDashboard from "@/components/ecommerce/BasicDashboard"; // Import your tenant/basic user dashboard
import SuperAdminDashboard from "@/components/ecommerce/SuperAdminDashboard"; // Import super-admin overview

// Assume you have an auth utility or context to get user role
// In real app, this would come from session/cookies or server-side auth
// For demo, we'll simulate with a server-side check (use getServerSession or similar)
import { getCurrentUser } from "@/lib/auth"; // Your auth helper (returns user object with role)
import { getRole } from "../../../lib/auth";

export const metadata: Metadata = {
  title: "ClickInvoice Dashboard",
  description: "Overview of your invoicing platform: invoices, revenue, tenants, and more.",
};

export default async function Dashboard() {
  const role = await getRole(); // Fetch user on server-side

  

  const isSuperAdmin = role === "SUPER_ADMIN" || role === "ADMIN"; // Adjust role check as per your app

  if (isSuperAdmin) {
    // Super Admin Dashboard (multi-tenant overview)
    return (
      <SuperAdminDashboard />
    );
  } else {
    // Basic/Tenant User Dashboard (single tenant view)
    return (
      <BasicDashboard />
    );
  }
}