import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { Metadata } from "next";
import React from "react";

import AdminTenants from "@/components/tables/AdminTenants";

export const metadata: Metadata = {
   title: "Businesses | Business Manager",
  description: "Create, send and track manage businesses online.",
  keywords: [
    "create business",
    "online business",
    "generate invoice for my business Nigeria",
    "generate receipt for my business Africa",
    "business receipt tracking",
  ],
};

export default function Tenants() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        {/* <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          My Tenants
        </h3> */}
        <div className="space-y-6">
          <AdminTenants />
        </div>
      </div>
    </div>
  );
}
