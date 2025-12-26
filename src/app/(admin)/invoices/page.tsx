import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { Metadata } from "next";
import React from "react";
import AddCompanyPage from "../../../components/ecommerce/CreateTenant";
import CompaniesListPage from "../../../components/tables/Tenants";
import InvoicesPage from "../../../components/tables/Invoices";

export const metadata: Metadata = {
  title: "Invoices | Invoice Manager",
  description: "Create, manage, send and track invoices online.",
  keywords: [
    "create invoice",
    "online invoicing",
    "send invoice Nigeria",
    "invoice tracking",
  ],
};

export default function Invoices() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
     
        <div className="space-y-6">
          <InvoicesPage />
        </div>
      </div>
    </div>
  );
}

