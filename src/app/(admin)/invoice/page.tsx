import { Metadata } from "next";
import React from "react";
import CompaniesListPage from "../../../components/tables/Tenants";
import InvoicesPage from "../../../components/tables/Invoices";
import InvoiceViewPage from "../../../components/tables/Invoice";

export const metadata: Metadata = {
  title: "Click Invoice Dashboard",
  description: "Overview of your invoicing platform: invoices, revenue, tenants, and more.",
};

export default function Invoices() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
     
        <div className="space-y-6">
          <InvoiceViewPage />
        </div>
      </div>
    </div>
  );
}
