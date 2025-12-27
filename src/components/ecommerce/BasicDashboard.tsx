// app/(dashboard)/dashboard/page.tsx for Basic (Tenant) User
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OutstandingAndCollected from "@/components/ecommerce/OutstandingAndCollected";
import RecentInvoices from "@/components/ecommerce/RecentInvoices";
import QuickActions from "@/components/ecommerce/QuickActions";
import { getUserName } from "../../../lib/auth";

export default function BasicDashboard() {
  const router = useRouter();
  const [name, setName] = useState("");
  const currency = "₦";

  useEffect(() => {
    const userName = getUserName();
    if (!userName) {
      router.push("/signin");
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
              <img src="/images/avatar.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Welcome back, {name || "User"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your invoices and get paid faster
              </p>
            </div>
          </div>
          <QuickActions />
        </div>
      </div>

      {/* KPIs: Outstanding & Collected */}
      <OutstandingAndCollected currency={currency} />

      {/* Recent Invoices */}
      <RecentInvoices currency={currency} />
    </div>
  );
}