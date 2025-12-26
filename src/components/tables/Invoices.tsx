// app/invoices/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import api from "../../../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/Icons";
/* ---------------- types ---------------- */

interface Invoice {
  invoiceId: string;
  userGeneratedInvoiceId?: string | null;
  projectName: string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  currencyCode: string;
  currencySymbol: string;
  status: "draft" | "sent" | "paid" | "overdue";
  invoiceDate: string;
  createdAt: string;
}

/* ---------------- component ---------------- */

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- Money Formatter with Commas ---------------- */
  const formatMoney = (value: number | null | undefined, currencySymbol: string = "$") => {
    const num = Number(value);
    if (isNaN(num)) return `${currencySymbol}0.00`;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD", // We use this only for formatting (commas & decimals)
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(num)
      .replace("$", currencySymbol); // Replace default $ with actual symbol (e.g., £, €)
  };

  /* ---------------- fetch invoices ---------------- */

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await api.get("/invoices");
        setInvoices(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  /* ---------------- helpers ---------------- */

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const statusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      case "sent":
        return "bg-blue-100 text-blue-700";
      case "draft":
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleViewInvoice = (invoiceId: string) => {
    router.push(`/invoices/${invoiceId}/view`);
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

      {/* <ComponentCard> */}
        {/* Loading */}
        {loading && (
          <p className="text-center text-sm text-gray-500 py-8">
            Loading invoices...
          </p>
        )}

        {/* Error */}
        {!loading && error && (
          <p className="text-center text-sm text-red-600 py-8">{error}</p>
        )}

        {/* Empty */}
        {!loading && !error && invoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-6">
              No invoices found for this tenant.
            </p>
            <Button onClick={() => router.push("/invoices/create")}>
              Create Invoice
            </Button>
          </div>
        )}

 {/* Page Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              My Invoices
            </h1>
            <Link
              href="/invoices/create"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
            >
              Create Invoice
            </Link>
          </div>
        {/* Table */}
        {!loading && !error && invoices.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-left text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-4 font-medium">Invoice</th>
                  <th className="py-4 font-medium">Project</th>
                  <th className="py-4 font-medium">Date</th>
                  <th className="py-4 font-medium">Total</th>
                  <th className="py-4 font-medium">Balance Due</th>
                  <th className="py-4 font-medium">Status</th>
                  <th className="py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.map((inv) => (
                  <tr
                    key={inv.invoiceId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="py-4 font-medium">
                      {inv.userGeneratedInvoiceId || inv.invoiceId}
                    </td>

                    <td className="py-4">{inv.projectName || "-"}</td>

                    <td className="py-4">{formatDate(inv.invoiceDate)}</td>

                    <td className="py-4 font-medium">
                      {formatMoney(inv.totalAmount, inv.currency_detail?.currencySymbol)}
                    </td>

                    <td className="py-4 font-medium">
                      {formatMoney(inv.balanceDue, inv.currency_detail?.currencySymbol)}
                    </td>

                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                          inv.status
                        )}`}
                      >
                        {inv.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-4 text-right">
                     
<Button
  variant="outline"
  size="sm"
  onClick={() => router.push(`/invoice?invoiceId=${inv.invoiceId}`)}
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
      {/* </ComponentCard> */}
    </div>
  );
}