import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { Metadata } from "next";
import React from "react";
import AddCompanyPage from "../../../../components/ecommerce/CreateTenant";
import CompaniesListPage from "../../../components/tables/Tenants";

export const metadata: Metadata = {
  title: "ClickInvoice Dashboard",
  description: "Overview of your invoicing platform: invoices, revenue, tenants, and more.",
};

export default function Tenants() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        {/* <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          My Tenants
        </h3> */}
        <div className="space-y-6">
          <CompaniesListPage />
        </div>
      </div>
    </div>
  );
}
