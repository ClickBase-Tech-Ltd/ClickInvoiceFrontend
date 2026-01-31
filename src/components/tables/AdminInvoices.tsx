"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Button from "../ui/button/Button";
import { ChevronLeftIcon, EyeIcon } from "@/icons";
import api from "../../../lib/api";
import { useRouter } from "next/navigation";
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

const ITEMS_PER_PAGE = 10;

export default function AdminInvoices() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await api.get("/invoices/admin");
        setInvoices(res.data || []);
        setCurrentPage(1); // reset to page 1 on data load
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

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
    router.push(`/dashboard/admin/invoice?invoiceId=${invoiceId}`);
  };

  // ─── Pagination Calculations ────────────────────────────────────────
  const totalPages = Math.ceil(invoices.length / ITEMS_PER_PAGE);

  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return invoices.slice(start, start + ITEMS_PER_PAGE);
  }, [invoices, currentPage]);

  // Safety reset if current page is invalid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="relative min-h-screen">
      <div className="space-y-6 py-6 px-4 md:px-6 lg:px-8">
        {/* Responsive Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900"
            >
              <Icon src={ChevronLeftIcon} className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              All Invoices (Admin)
            </h1>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total: <span className="font-medium">{invoices.length}</span> invoice{invoices.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Loading invoices...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No invoices found.
            </div>
          ) : (
            <>
              {paginatedInvoices.map((inv) => (
                <div
                  key={inv.invoiceId}
                  onClick={() => navigateToInvoice(inv.invoiceId)}
                  className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5 shadow-sm cursor-pointer transition hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold text-lg text-gray-900 dark:text-white">
                        {inv.userGeneratedInvoiceId || inv.invoiceId}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {inv.projectName || "No project"}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToInvoice(inv.invoiceId);
                      }}
                      className="p-2 text-gray-600 hover:text-brand-600 transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="View invoice"
                    >
                      <Icon src={EyeIcon} className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4 border-gray-100 dark:border-white/[0.08]">
                    <div>
                      <span className="text-gray-500">Date</span>
                      <p className="font-medium">{formatDate(inv.invoiceDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Amount Paid</span>
                      <p className="font-medium">
                        {formatMoney(inv.amountPaid, inv.currency_detail?.currencySymbol || inv.currencySymbol)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Balance Due</span>
                      <p className="font-medium">
                        {formatMoney(inv.balanceDue, inv.currency_detail?.currencySymbol || inv.currencySymbol)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status</span>
                      <div className="mt-1">
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
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Mobile Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 mt-8 px-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(currentPage * ITEMS_PER_PAGE, invoices.length)} of {invoices.length}
                  </p>

                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                    >
                      ← Prev
                    </button>

                    <div className="flex items-center gap-3">
                      <label htmlFor="mobile-page-select" className="text-sm whitespace-nowrap">
                        Page:
                      </label>
                      <select
                        id="mobile-page-select"
                        value={currentPage}
                        onChange={(e) => setCurrentPage(Number(e.target.value))}
                        className="min-w-[80px] px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                      >
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <option key={page} value={page}>
                            {page}
                          </option>
                        ))}
                      </select>
                      <span className="text-sm text-gray-500">of {totalPages}</span>
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
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
                      Amount Paid
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
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedInvoices.map((inv) => (
                      <TableRow
                        key={inv.invoiceId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      >
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
                          {formatMoney(inv.amountPaid, inv.currency_detail?.currencySymbol || inv.currencySymbol)}
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

          {/* Desktop Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-white/[0.05] gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, invoices.length)} of {invoices.length} invoices
              </p>

              <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Previous
                </button>

                <div className="flex items-center gap-3">
                  <label
                    htmlFor="desktop-page-select"
                    className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap hidden sm:block"
                  >
                    Go to page:
                  </label>
                  <select
                    id="desktop-page-select"
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    className="min-w-[90px] px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <option key={page} value={page}>
                        {page}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                    of {totalPages}
                  </span>
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}