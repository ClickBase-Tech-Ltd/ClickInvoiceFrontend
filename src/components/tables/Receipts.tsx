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
  status: "issued" | "void" | "partial";
  receiptDate: string;
  createdAt: string;
  updated_at?: string;
  currency_detail?: {
    currencySymbol: string;
  };
}

/* ---------------- component ---------------- */

export default function ReceiptsPage() {
  const router = useRouter();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- Money Formatter ---------------- */
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
        const res = await api.get("/receipts");
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
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "void":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "partial":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const handleViewReceipt = (receiptId: string) => {
    router.push(`/dashboard/receipt?receiptId=${receiptId}`);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="relative min-h-screen">
      <div className="space-y-6 py-6 px-4 md:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900"
          >
            <Icon src={ChevronLeftIcon} className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Receipts
          </h1>
        </div>

        <ComponentCard title="">
          {/* Loading / Error / Empty States */}
          {loading && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-12">
              Loading receipts...
            </p>
          )}

          {!loading && error && (
            <p className="text-center text-sm text-red-600 py-12">{error}</p>
          )}

          {!loading && !error && receipts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                No receipts found. Start by creating an invoice.
              </p>
              <Button onClick={() => router.push("/dashboard/invoices/create")}>
                Create Invoice
              </Button>
            </div>
          )}

          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4">
            {receipts.map((receipt) => (
              <div
                key={receipt.receiptId}
                className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5 shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">
                      {receipt.userGeneratedReceiptId || receipt.receiptId}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {receipt.projectName || "No project"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewReceipt(receipt.receiptId)}
                  >
                    View
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4 border-gray-100 dark:border-white/[0.08]">
                  <div>
                    <span className="text-gray-500">Date</span>
                    <p className="font-medium">
                      {formatDate(receipt.updated_at || receipt.receiptDate || receipt.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount</span>
                    <p className="font-medium">
                      {formatMoney(receipt.totalAmount, receipt.currency_detail?.currencySymbol || receipt.currencySymbol)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Paid</span>
                    <p className="font-medium">
                      {formatMoney(receipt.amountPaid, receipt.currency_detail?.currencySymbol || receipt.currencySymbol)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status</span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColor(
                          receipt.status
                        )}`}
                      >
                        {receipt.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
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

                    <td className="py-4">{receipt.projectName || "—"}</td>

                    <td className="py-4">
                      {formatDate(receipt.updated_at || receipt.receiptDate || receipt.createdAt)}
                    </td>

                    <td className="py-4 font-medium">
                      {formatMoney(receipt.totalAmount, receipt.currency_detail?.currencySymbol || receipt.currencySymbol)}
                    </td>

                    <td className="py-4 font-medium">
                      {formatMoney(receipt.amountPaid, receipt.currency_detail?.currencySymbol || receipt.currencySymbol)}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReceipt(receipt.receiptId)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}