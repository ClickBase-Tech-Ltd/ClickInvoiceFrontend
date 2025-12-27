// import { Metadata } from "next";
// import React from "react";
// import CompaniesListPage from "../../../components/tables/Tenants";
// import InvoicesPage from "../../../components/tables/Invoices";
// import InvoiceViewPage from "../../../components/tables/Invoice";

// export const metadata: Metadata = {
//   title: "ClickInvoice Dashboard",
//   description: "Overview of your invoicing platform: invoices, revenue, tenants, and more.",
// };

// export default function Invoices() {
//   return (
//     <div>
//       <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
     
//         <div className="space-y-6">
//           <InvoiceViewPage />
//         </div>
//       </div>
//     </div>
//   );
// }


import { Suspense } from "react";
import InvoiceViewPage from "../../../components/tables/Invoice";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Generated Invoice | Invoice Manager",
  description: "Create, send and track invoices online.",
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
          {/* Wrap the table component in Suspense */}
          <Suspense fallback={<div className="py-10 text-center text-gray-500">Loading invoices...</div>}>
            <InvoiceViewPage />
          </Suspense>
        </div>
      </div>
    </div>
  );
}