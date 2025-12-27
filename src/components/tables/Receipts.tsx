// app/receipts/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import api from "../../../lib/api";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icons";
/* ---------------- types ---------------- */

interface Receipt {
  receiptId: string;
  userGeneratedReceiptId?: string | null;
  projectName: string;
  totalAmount: number;
  amountPaid: number;
  currencyCode: string;
  currencySymbol: string;
  status: "issued" | "void" | "partial"; // Common receipt statuses; adjust as needed
  receiptDate: string;
  createdAt: string;
}

/* ---------------- component ---------------- */

export default function ReceiptsPage() {
  const router = useRouter();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- Money Formatter with Commas ---------------- */
  const formatMoney = (value: number | null | undefined, currencySymbol: string = "$") => {
    const num = Number(value);
    if (isNaN(num)) return `${currencySymbol}0.00`;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(num)
      .replace("$", currencySymbol);
  };

  /* ---------------- fetch receipts ---------------- */

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const res = await api.get("/receipts"); // Changed endpoint
        setReceipts(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load receipts");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, []);

  /* ---------------- helpers ---------------- */

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const statusColor = (status: Receipt["status"]) => {
    switch (status) {
      case "issued":
        return "bg-green-100 text-green-700";
      case "void":
        return "bg-red-100 text-red-700";
      case "partial":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleViewReceipt = (receiptId: string) => {
    router.push(`/receipts/${receiptId}/view`);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Back */}
      <button
        onClick={() => window.history.back()}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900"
      >
        {/* <ChevronLeftIcon className="w-5 h-5" /> */}
         <Icon src={ChevronLeftIcon} className="w-5 h-5"/>
        Back
      </button>

      <ComponentCard title="Receipts">
        {/* Loading */}
        {loading && (
          <p className="text-center text-sm text-gray-500 py-8">
            Loading receipts...
          </p>
        )}

        {/* Error */}
        {!loading && error && (
          <p className="text-center text-sm text-red-600 py-8">{error}</p>
        )}

        {/* Empty */}
        {!loading && !error && receipts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-6">
              No receipts found for this tenant.
            </p>
            <Button onClick={() => router.push("/dashboard/receipts/create")}>
              Create Receipt
            </Button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && receipts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-left text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-4 font-medium">Receipt</th>
                  <th className="py-4 font-medium">Project</th>
                  <th className="py-4 font-medium">Date</th>
                  <th className="py-4 font-medium">Amount</th>
                  <th className="py-4 font-medium">Paid</th>
                  <th className="py-4 font-medium">Status</th>
                  <th className="py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {receipts.map((receipt) => (
                  <tr
                    key={receipt.receiptId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="py-4 font-medium">
                      {receipt.userGeneratedReceiptId || receipt.receiptId}
                    </td>

                    <td className="py-4">{receipt.projectName || "-"}</td>

                    <td className="py-4">{formatDate(receipt.updated_at)}</td>

                    <td className="py-4 font-medium">
                      {formatMoney(receipt.totalAmount, receipt.currency_detail?.currencySymbol)}
                    </td>

                    <td className="py-4 font-medium">
                      {formatMoney(receipt.amountPaid, receipt?.currency_detail?.currencySymbol)}
                    </td>

                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                          receipt.status
                        )}`}
                      >
                        {receipt.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-4 text-right">
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/receipts/${receipt.receiptId}/view`)} // Updated route
                      >
                        View
                      </Button> */}

                      <Button
  variant="outline"
  size="sm"
  onClick={() => router.push(`/dashboard/receipt?receiptId=${receipt.receiptId}`)}
>
  View
</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ComponentCard>
    </div>
  );
}