// app/invoices/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { ChevronLeftIcon, EyeIcon } from "@/icons";
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
  currency_detail?: {
    currencySymbol: string;
  };
}

/* ---------------- component ---------------- */

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
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

  const statusBadgeColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "success";
      case "overdue":
        return "error";
      case "sent":
        return "info";
      case "draft":
      default:
        return "secondary";
    }
  };

  const navigateToInvoice = (invoiceId: string) => {
    router.push(`/dashboard/invoice?invoiceId=${invoiceId}`);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="relative min-h-screen">
      <div className="space-y-6 py-6 px-4 md:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900"
            >
              <Icon src={ChevronLeftIcon} className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              My Invoices
            </h1>
          </div>

          <Link
            href="/dashboard/invoices/create"
            className="inline-flex items-center gap-2 rounded-lg !bg-[#0A66C2] hover:!bg-[#084d93] px-4 py-2 text-sm font-medium text-white transition"
          >
            Create Invoice
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[900px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Invoice
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Project
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Date
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Total
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Balance Due
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Status
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-gray-500 dark:text-gray-400">
                        Loading invoices...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-red-600">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-gray-500 dark:text-gray-400">
                        No invoices found.
                        <div className="mt-4">
                          <Button onClick={() => router.push("/dashboard/invoices/create")}>
                            Create Invoice
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((inv) => (
                      <TableRow
                        key={inv.invoiceId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        {/* Clickable area covering all columns except Actions */}
                        <TableCell
                          className="px-5 py-4 text-start"
                          onClick={() => navigateToInvoice(inv.invoiceId)}
                        >
                          <span className="font-medium text-gray-800 dark:text-white/90">
                            {inv.userGeneratedInvoiceId || inv.invoiceId}
                          </span>
                        </TableCell>

                        <TableCell
                          className="px-5 py-4 text-start text-theme-sm text-gray-600 dark:text-gray-400"
                          onClick={() => navigateToInvoice(inv.invoiceId)}
                        >
                          {inv.projectName || "—"}
                        </TableCell>

                        <TableCell
                          className="px-5 py-4 text-start text-theme-sm text-gray-600 dark:text-gray-400"
                          onClick={() => navigateToInvoice(inv.invoiceId)}
                        >
                          {formatDate(inv.invoiceDate)}
                        </TableCell>

                        <TableCell
                          className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90"
                          onClick={() => navigateToInvoice(inv.invoiceId)}
                        >
                          {formatMoney(inv.totalAmount, inv.currency_detail?.currencySymbol || inv.currencySymbol)}
                        </TableCell>

                        <TableCell
                          className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90"
                          onClick={() => navigateToInvoice(inv.invoiceId)}
                        >
                          {formatMoney(inv.balanceDue, inv.currency_detail?.currencySymbol || inv.currencySymbol)}
                        </TableCell>

                        <TableCell
                          className="px-5 py-4 text-start"
                          onClick={() => navigateToInvoice(inv.invoiceId)}
                        >
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                              {
                                success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                                info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                                secondary: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
                              }[statusBadgeColor(inv.status)]
                            }`}
                          >
                            {inv.status.toUpperCase()}
                          </span>
                        </TableCell>

                        {/* Actions column - NOT clickable to avoid conflict */}
                        <TableCell className="px-5 py-4 text-start">
                          <button
                            onClick={() => navigateToInvoice(inv.invoiceId)}
                            className="text-gray-600 hover:text-brand-600 transition"
                            title="View invoice"
                          >
                            <Icon src={EyeIcon} className="w-5 h-5" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}