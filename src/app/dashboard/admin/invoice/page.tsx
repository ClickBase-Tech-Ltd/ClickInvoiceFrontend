import { Metadata } from "next";
import React from "react";
import AdminInvoice from "@/components/tables/AdminInvoice";

export const metadata: Metadata = {
  title: "Invoice | Customers Manager",
  description: "Create, manage, send and track invoices online.",
  keywords: [
    "manage invoice subscribers",
    "online invoicing",
    "send invoice Nigeria",
    "invoice tracking",
  ],
};

export default function Invoice() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
     
        <div className="space-y-6">
          <AdminInvoice/>
        </div>
      </div>
    </div>
  );
}

