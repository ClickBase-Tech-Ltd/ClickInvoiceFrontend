import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { Metadata } from "next";
import React from "react";

import ReceiptsPage from "../../../../components/tables/Receipts";
import SubscriptionResult from "@/components/ecommerce/Subscription";

export const metadata: Metadata = {
   title: "Subscription | Subscription Page",
  description: "Create, send and track receipts online.",
  keywords: [
    "invoice subscription",
  ],
};

export default function Subscription() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
     
        <div className="space-y-6">
          <SubscriptionResult />
        </div>
      </div>
    </div>
  );
}

