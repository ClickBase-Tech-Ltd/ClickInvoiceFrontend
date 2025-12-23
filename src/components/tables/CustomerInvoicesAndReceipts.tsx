// app/invoices/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Button from "../ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import api from "../../../lib/api";
import { useRouter, useSearchParams } from "next/navigation";

/* ---------------- types ---------------- */

interface Invoice {
  invoiceId: string;
  userGeneratedInvoiceId?: string | null;
  projectName: string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  currencySymbol: string;
  status: "draft" | "sent" | "paid" | "overdue";
  invoiceDate: string;
  type: "invoice"; // discriminator
}

interface Receipt {
  receiptId: string;
  userGeneratedReceiptId?: string | null;
  projectName: string;
  totalAmount: number;
  amountPaid: number;
  currencySymbol: string;
  status: "issued" | "void" | "partial";
  receiptDate: string;
  type: "receipt"; // discriminator
}

type Document = Invoice | Receipt;

/* ---------------- component ---------------- */

export default function CustomerInvoicesAndReceipts() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [documents, setDocuments] = useState<Document[]>([]);
  const [customerName, setCustomerName] = useState<string>("Customer");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- Money Formatter ---------------- */
  const formatMoney = (value: number | null | undefined, currencySymbol: string = "$") => {
    const num = Number(value);
    if (isNaN(num) || value == null) return `${currencySymbol}0.00`;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(num)
      .replace("$", currencySymbol);
  };

  /* ---------------- Date Formatter ---------------- */
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  /* ---------------- Status Badge Color ---------------- */
  const statusColor = (status: string, type: "invoice" | "receipt") => {
    if (type === "receipt") {
      switch (status) {
        case "issued":
        case "paid":
          return "bg-green-100 text-green-700";
        case "void":
          return "bg-red-100 text-red-700";
        case "partial":
          return "bg-yellow-100 text-yellow-700";
        default:
          return "bg-gray-100 text-gray-700";
      }
    }

    // Invoice statuses
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

  /* ---------------- Fetch Data ---------------- */
  useEffect(() => {
    if (!customerId) {
      setError("No customer specified.");
      setLoading(false);
      return;
    }

    const fetchCustomerDocuments = async () => {
      try {
        // Fetch customer name
        const customerRes = await api.get(`/customers/${customerId}/invoices-and-receipt`);
        setCustomerName(customerRes.data.customerName || "Customer");

        // Fetch invoices
        const invoicesRes = await api.get(`/invoices?customerId=${customerId}`);
        const invoices: Invoice[] = (invoicesRes.data || []).map((i: any) => ({
          ...i,
          type: "invoice" as const,
          currencySymbol: i.currency_detail?.currencySymbol || "$",
        }));

        // Fetch receipts
        const receiptsRes = await api.get(`/receipts?customerId=${customerId}`);
        const receipts: Receipt[] = (receiptsRes.data || []).map((r: any) => ({
          ...r,
          type: "receipt" as const,
          currencySymbol: r.currency_detail?.currencySymbol || "$",
        }));

        // Combine and sort by date (newest first)
        const combined = [...invoices, ...receipts].sort((a, b) => {
          const dateA = new Date(a.type === "invoice" ? a.invoiceDate : a.receiptDate);
          const dateB = new Date(b.type === "invoice" ? b.invoiceDate : b.receiptDate);
          return dateB.getTime() - dateA.getTime();
        });

        setDocuments(combined);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load customer documents");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDocuments();
  }, [customerId]);

  /* ---------------- View Handler ---------------- */
  const handleViewDocument = (doc: Document) => {
    if (doc.type === "invoice") {
      router.push(`/invoice?invoiceId=${doc.invoiceId}`);
    } else {
      router.push(`/receipt?receiptId=${doc.receiptId}`);
    }
  };

  /* ---------------- UI ---------------- */

  if (!customerId) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center">
        <p className="text-red-600">Invalid access: No customer selected.</p>
        <button
          onClick={() => router.push("/customers")}
          className="mt-4 text-blue-600 hover:underline"
        >
          ← Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Back */}
      <button
        onClick={() => window.history.back()}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900"
      >
        <ChevronLeftIcon className="w-5 h-5" />
        Back
      </button>

      <ComponentCard title={`${customerName}'s Invoices and Receipts`}>
        {/* Loading */}
        {loading && (
          <p className="text-center text-sm text-gray-500 py-8">
            Loading invoices and receipts...
          </p>
        )}

        {/* Error */}
        {!loading && error && (
          <p className="text-center text-sm text-red-600 py-8">{error}</p>
        )}

        {/* Empty */}
        {!loading && !error && documents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-6">
              No invoices or receipts found for {customerName}.
            </p>
            <Button onClick={() => router.push("/invoices/create")}>
              Create Invoice
            </Button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && documents.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-left text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-4 font-medium">Type</th>
                  <th className="py-4 font-medium">Document</th>
                  <th className="py-4 font-medium">Project</th>
                  <th className="py-4 font-medium">Date</th>
                  <th className="py-4 font-medium">Total</th>
                  <th className="py-4 font-medium">
                    {documents.some(d => d.type === "invoice") ? "Balance Due" : "Amount Paid"}
                  </th>
                  <th className="py-4 font-medium">Status</th>
                  <th className="py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {documents.map((doc) => (
                  <tr
                    key={doc.type === "invoice" ? doc.invoiceId : doc.receiptId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          doc.type === "invoice"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {doc.type.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-4 font-medium">
                      {doc.type === "invoice"
                        ? doc.userGeneratedInvoiceId || doc.invoiceId
                        : doc.userGeneratedReceiptId || doc.receiptId}
                    </td>

                    <td className="py-4">{doc.projectName || "-"}</td>

                    <td className="py-4">
                      {formatDate(doc.type === "invoice" ? doc.invoiceDate : doc.receiptDate)}
                    </td>

                    <td className="py-4 font-medium">
                      {formatMoney(doc.totalAmount, doc.currencySymbol)}
                    </td>

                    <td className="py-4 font-medium">
                      {doc.type === "invoice"
                        ? formatMoney(doc.balanceDue, doc.currencySymbol)
                        : formatMoney(doc.amountPaid, doc.currencySymbol)}
                    </td>

                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                          doc.status,
                          doc.type
                        )}`}
                      >
                        {doc.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument(doc)}
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