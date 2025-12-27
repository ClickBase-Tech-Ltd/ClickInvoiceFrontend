// app/receipt/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
} from "@react-pdf/renderer";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import api from "../../../lib/api";
import { ChevronLeftIcon } from "@/icons";
import Icon from "@/components/Icons";

// Success Modal (shared with invoice)
function EmailSuccessModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Receipt Sent!</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your receipt has been successfully sent.
        </p>
        <Button onClick={onClose} className="w-full !bg-[#0A66C2] !hover:bg-[#084e96]">
          OK
        </Button>
      </div>
    </div>
  );
}

interface FullReceipt {
  receiptId: string;
  userGeneratedReceiptId?: string | null;
  projectName: string;
  subtotal: number;
  taxPercentage: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  currencySymbol: string;
  status: string;
  receiptDate: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  accountName: string;
  accountNumber: string;
  bank: string;
  items: Array<{
    description: string;
    amount: number;
  }>;
  notes?: string;
  company: {
    name: string;
    email: string;
    phone: string;
    logoUrl: string;
    signatureUrl: string;
  };
  user: {
    currentPlan: number; // From creator.currentPlan
  };
}

const pdfStyles = StyleSheet.create({
  page: { padding: 50, fontSize: 11, fontFamily: "Helvetica", color: "#333" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    borderBottom: "2 solid #e0e0e0",
    paddingBottom: 20,
  },
  logo: { width: 150, height: "auto", objectFit: "contain" },
  companyInfo: { textAlign: "right", maxWidth: 200 },
  companyName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: "#16A34A",
  },
  title: {
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#16A34A",
  },
  receiptNumber: { textAlign: "center", marginBottom: 30, fontSize: 16 },
  section: { marginBottom: 25 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  label: { color: "#666", fontSize: 10 },
  value: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  customerAddress: { fontSize: 10, marginTop: 4, color: "#666", maxWidth: 200 },
  table: { width: "100%", marginVertical: 20, border: "1px solid #e5e7eb" },
  tableHeader: {
    backgroundColor: "#f0fdf4",
    flexDirection: "row",
    borderBottom: "1px solid #e5e7eb",
  },
  tableRow: { flexDirection: "row", borderBottom: "1px solid #e5e7eb" },
  cell: { padding: 12, flex: 1 },
  cellRight: { textAlign: "right" },
  totalRow: { backgroundColor: "#dcfce7", fontFamily: "Helvetica-Bold", fontSize: 12 },
  paidRow: { backgroundColor: "#bbf7d0", fontFamily: "Helvetica-Bold", fontSize: 15 },
  paymentSection: { marginTop: 30, padding: 15, backgroundColor: "#f0fdf4", borderRadius: 6 },
  notes: {
    marginTop: 40,
    fontSize: 11,
    backgroundColor: "#f9fafb",
    padding: 15,
    borderRadius: 6,
  },
  signatureSection: { marginTop: 50, flexDirection: "row", justifyContent: "flex-end" },
  signatureImage: { width: 180, height: 80, objectFit: "contain" },
  signatureLabel: { marginTop: 10, textAlign: "center", fontSize: 10 },
});

const ReceiptPDF = ({ receipt }: { receipt: FullReceipt }) => {
  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2 }).format(value);

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          {receipt.company.logoUrl ? (
            <Image style={pdfStyles.logo} src={receipt.company.logoUrl} />
          ) : (
            <View style={{ width: 150 }} />
          )}
          <View style={pdfStyles.companyInfo}>
            <Text style={pdfStyles.companyName}>{receipt.company.name}</Text>
            <Text>{receipt.company.email}</Text>
            <Text>{receipt.company.phone}</Text>
          </View>
        </View>

        <Text style={pdfStyles.title}>RECEIPT</Text>
        <Text style={pdfStyles.receiptNumber}>
          {receipt.userGeneratedReceiptId || receipt.receiptId}
        </Text>

        <View style={pdfStyles.section}>
          <View style={pdfStyles.row}>
            <View>
              <Text style={pdfStyles.label}>Issued To</Text>
              <Text style={pdfStyles.value}>{receipt.customerName}</Text>
              {receipt.customerAddress && (
                <Text style={pdfStyles.customerAddress}>{receipt.customerAddress}</Text>
              )}
              {receipt.customerEmail && <Text>{receipt.customerEmail}</Text>}
              {receipt.customerPhone && <Text>{receipt.customerPhone}</Text>}
            </View>
            <View>
              <Text style={pdfStyles.label}>Receipt Date</Text>
              <Text>{new Date(receipt.receiptDate).toLocaleDateString("en-GB")}</Text>
              <Text style={pdfStyles.label}>Status</Text>
              <Text style={pdfStyles.value}>{receipt.status}</Text>
            </View>
          </View>
        </View>

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={pdfStyles.cell}>Description</Text>
            <Text style={[pdfStyles.cell, pdfStyles.cellRight]}>Amount</Text>
          </View>
          {receipt.items.map((item, idx) => (
            <View key={idx} style={pdfStyles.tableRow} wrap={false}>
              <Text style={pdfStyles.cell}>{item.description}</Text>
              <Text style={[pdfStyles.cell, pdfStyles.cellRight]}>
                {receipt.currencySymbol} {formatMoney(item.amount)}
              </Text>
            </View>
          ))}
          <View style={[pdfStyles.tableRow, pdfStyles.totalRow]}>
            <Text style={[pdfStyles.cell, { textAlign: "right" }]}>Subtotal</Text>
            <Text style={[pdfStyles.cell, pdfStyles.cellRight]}>
              {receipt.currencySymbol} {formatMoney(receipt.subtotal)}
            </Text>
          </View>
          <View style={[pdfStyles.tableRow, pdfStyles.totalRow]}>
            <Text style={[pdfStyles.cell, { textAlign: "right" }]}>
              Tax ({receipt.taxPercentage}%)
            </Text>
            <Text style={[pdfStyles.cell, pdfStyles.cellRight]}>
              {receipt.currencySymbol} {formatMoney(receipt.taxAmount)}
            </Text>
          </View>
          <View style={[pdfStyles.tableRow, pdfStyles.totalRow]}>
            <Text style={[pdfStyles.cell, { textAlign: "right" }]}>Total</Text>
            <Text style={[pdfStyles.cell, pdfStyles.cellRight]}>
              {receipt.currencySymbol} {formatMoney(receipt.totalAmount)}
            </Text>
          </View>
          <View style={[pdfStyles.tableRow, pdfStyles.paidRow]}>
            <Text style={[pdfStyles.cell, { textAlign: "right", color: "#16A34A" }]}>
              Amount Paid
            </Text>
            <Text style={[pdfStyles.cell, pdfStyles.cellRight, { color: "#16A34A" }]}>
              {receipt.currencySymbol} {formatMoney(receipt.amountPaid)}
            </Text>
          </View>
        </View>

        <View style={pdfStyles.paymentSection}>
          <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 10, fontSize: 12 }}>
            Payment Received Via
          </Text>
          <Text>Account Name: {receipt.accountName}</Text>
          <Text>Account Number: {receipt.accountNumber}</Text>
          <Text>Bank: {receipt.bank}</Text>
        </View>

        {receipt.notes && (
          <View style={pdfStyles.notes}>
            <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 8 }}>
              Notes
            </Text>
            <Text>{receipt.notes}</Text>
          </View>
        )}

        {receipt.company.signatureUrl && (
          <View style={pdfStyles.signatureSection}>
            <View>
              <Image style={pdfStyles.signatureImage} src={receipt.company.signatureUrl} />
              <Text style={pdfStyles.signatureLabel}>Authorized Signature</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusColors: Record<string, string> = {
    ISSUED: "bg-green-100 text-green-800 border-green-200",
    PAID: "bg-green-100 text-green-800 border-green-200",
    VOID: "bg-red-100 text-red-800 border-red-200",
    PARTIAL: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };

  const baseClasses = "px-3 py-1 rounded-full text-sm font-medium border mt-2";
  const colorClasses = statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <span className={`${baseClasses} ${colorClasses}`}>
      {status}
    </span>
  );
};

export default function ReceiptViewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const receiptId = searchParams.get("receiptId");

  const [receipt, setReceipt] = useState<FullReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Email sending states
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [alternateEmail, setAlternateEmail] = useState("");
  const [useAlternateEmail, setUseAlternateEmail] = useState(false);

  const formatMoney = (value: number, symbol: string = "₦") => {
    return `${symbol} ${new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
    }).format(value)}`;
  };

  useEffect(() => {
    if (!receiptId) {
      setError("No receipt ID provided");
      setLoading(false);
      return;
    }

    const fetchReceipt = async () => {
      try {
        const res = await api.get(`/receipts/${receiptId}`);
        const raw = Array.isArray(res.data) ? res.data[0] : res.data;

        if (!raw || !raw.tenant) {
          throw new Error("Receipt or company data not found");
        }

        const items = raw.items.map((item: any) => ({
          description: item.itemDescription,
          amount: parseFloat(item.amount),
        }));

        const subtotal = items.reduce((sum: number, item: any) => sum + item.amount, 0);
        const taxPercentage = parseFloat(raw.taxPercentage || "0");
        const taxAmount = subtotal * (taxPercentage / 100);
        const totalAmount = subtotal + taxAmount;
        const amountPaid = parseFloat(raw.amountPaid || totalAmount);

        const logoUrl = raw.tenant.tenantLogo
          ? `${process.env.NEXT_PUBLIC_FILE_URL}${raw.tenant.tenantLogo}`
          : "";
        const signatureUrl = raw.tenant.authorizedSignature
          ? `${process.env.NEXT_PUBLIC_FILE_URL}${raw.tenant.authorizedSignature}`
          : "";

        const transformed: FullReceipt = {
          receiptId: raw.receiptId || raw.id,
          userGeneratedReceiptId: raw.userGeneratedReceiptId,
          projectName: raw.projectName,
          subtotal,
          taxPercentage,
          taxAmount,
          totalAmount,
          amountPaid,
          currencySymbol: raw.currency_detail?.currencySymbol || "₦",
          status: (raw.status || "ISSUED").toUpperCase(),
          receiptDate: raw.receiptDate || raw.updated_at,
          customerName: raw.customer?.customerName || raw.accountName || "Customer",
          customerEmail: raw.customer?.customerEmail,
          customerPhone: raw.customer?.customerPhone,
          customerAddress: raw.customer?.customerAddress,
          accountName: raw.accountName,
          accountNumber: raw.accountNumber,
          bank: raw.bank,
          items,
          notes: raw.notes,
          company: {
            name: raw.tenant.tenantName,
            email: raw.tenant.tenantEmail,
            phone: raw.tenant.tenantPhone,
            logoUrl,
            signatureUrl,
          },
          user: {
            currentPlan: raw.creator?.currentPlan || 1,
          },
        };

        setReceipt(transformed);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load receipt");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [receiptId]);

  const generatePDF = async () => {
    if (!receipt) return;
    setIsGeneratingPdf(true);
    try {
      const blob = await pdf(<ReceiptPDF receipt={receipt} />).toBlob();
      setPdfBlob(blob);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!receiptId) return;

    try {
      setLoading(true);
      const response = await api.get(`/receipts/${receiptId}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Receipt_${receipt?.userGeneratedReceiptId || receiptId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to download PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (sendToAlternate: boolean = false) => {
    if (!receiptId) return;

    try {
      setIsSendingEmail(true);

      let targetEmail = receipt?.customerEmail || "";

      if (sendToAlternate && alternateEmail.trim()) {
        targetEmail = alternateEmail.trim();
      }

      const payload = { email: targetEmail };

      await api.post(`/receipts/${receiptId}/send-email`, payload);

      setShowSuccessModal(true);
      setUseAlternateEmail(false);
      setAlternateEmail("");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to send receipt");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded mb-8" />
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          <div className="space-y-3">
            <div className="h-10 w-48 bg-gray-200 rounded" />
            <div className="h-5 w-64 bg-gray-200 rounded" />
          </div>
          <div className="h-32 w-32 bg-gray-200 rounded mx-auto sm:mx-0" />
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingSkeleton />;

  if (error || !receipt) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center px-4">
        <p className="text-red-600 text-lg">{error || "Receipt not found"}</p>
        <button onClick={() => window.history.back()} className="mt-6 text-blue-600 hover:underline">
          ← Back to Receipts
        </button>
      </div>
    );
  }

  const isPremium = receipt.user.currentPlan === 2 || receipt.user.currentPlan === 3;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => window.history.back()}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
      >
        <Icon src={ChevronLeftIcon} className="w-5 h-5"/>
        Back to Receipts
      </button>

      <ComponentCard title={`Receipt ${receipt.userGeneratedReceiptId || receipt.receiptId}`}>
        <div className="space-y-8">
          {/* Company Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b pb-8">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0A66C2]">{receipt.company.name}</h1>
              <p className="text-gray-600">{receipt.company.email}</p>
              <p className="text-gray-600">{receipt.company.phone}</p>
            </div>
            {receipt.company.logoUrl && (
              <img
                src={receipt.company.logoUrl}
                alt="Company Logo"
                className="h-24 sm:h-32 object-contain mx-auto sm:mx-0"
              />
            )}
          </div>

          {/* Project & Amount Paid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">{receipt.projectName}</h2>
              <div className="mt-4 space-y-1">
                <p className="text-gray-600 font-medium">Issued To:</p>
                <p className="text-gray-800">{receipt.customerName}</p>
                {receipt.customerAddress && (
                  <p className="text-gray-600 text-sm whitespace-pre-line">{receipt.customerAddress}</p>
                )}
                {receipt.customerEmail && <p className="text-gray-600">{receipt.customerEmail}</p>}
                {receipt.customerPhone && <p className="text-gray-600">{receipt.customerPhone}</p>}
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-2xl sm:text-3xl font-bold text-[#0A66C2]">
                {formatMoney(receipt.amountPaid, receipt.currencySymbol)}
              </p>
              <p className="text-sm text-gray-500 mt-1">Amount Paid</p>
              <StatusBadge status={receipt.status} />
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-gray-500">Receipt Date</p>
              <p className="font-medium">{new Date(receipt.receiptDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Total Amount</p>
              <p className="font-medium">{formatMoney(receipt.totalAmount, receipt.currencySymbol)}</p>
            </div>
            <div>
              <p className="text-gray-500">Amount Paid</p>
              <p className="font-medium text-[#0A66C2]">{formatMoney(receipt.amountPaid, receipt.currencySymbol)}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-full sm:min-w-0">
              <thead>
                <tr className="border-b text-left text-gray-600 bg-blue-50">
                  <th className="py-3 px-2">Description</th>
                  <th className="py-3 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-4 px-2">{item.description}</td>
                    <td className="py-4 px-2 text-right font-medium">
                      {formatMoney(item.amount, receipt.currencySymbol)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-3 px-2 text-right font-medium">Subtotal</td>
                  <td className="py-3 px-2 text-right">{formatMoney(receipt.subtotal, receipt.currencySymbol)}</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 text-right font-medium">Tax ({receipt.taxPercentage}%)</td>
                  <td className="py-3 px-2 text-right">{formatMoney(receipt.taxAmount, receipt.currencySymbol)}</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="py-4 px-2 text-right font-bold text-lg">Total Paid</td>
                  <td className="py-4 px-2 text-right font-bold text-xl text-[#0A66C2]">
                    {formatMoney(receipt.amountPaid, receipt.currencySymbol)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Details */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Payment Received Via</h3>
            <div className="space-y-2">
              <p><strong>Account Name:</strong> {receipt.accountName}</p>
              <p><strong>Account Number:</strong> {receipt.accountNumber}</p>
              <p><strong>Bank:</strong> {receipt.bank}</p>
            </div>
          </div>

          {receipt.notes && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Notes</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded">{receipt.notes}</p>
            </div>
          )}

          {/* Signature */}
          {receipt.company.signatureUrl && (
            <div className="mt-12 flex justify-center sm:justify-end">
              <div className="text-center">
                <img
                  src={receipt.company.signatureUrl}
                  alt="Authorized Signature"
                  className="h-20 object-contain"
                />
                <p className="text-sm text-gray-600 mt-2">Authorized Signature</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-8 border-t">
            <div className="flex flex-col gap-4 w-full">
              {/* Primary Send Button */}
              <button
                onClick={() => handleSendEmail(false)}
                disabled={isSendingEmail || !receipt.customerEmail}
                className={`
                  w-full px-6 py-3 rounded-md text-white transition flex items-center justify-center gap-2
                  bg-[#0A66C2] hover:bg-[#084e96]
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {isSendingEmail && !useAlternateEmail ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending Receipt...
                  </>
                ) : (
                  `Send to ${receipt.customerEmail ?? "Customer Email"}`
                )}
              </button>

              {/* Premium: Alternate Email */}
              {isPremium && (
                <div className="flex flex-col gap-3 bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="useAlternate"
                      checked={useAlternateEmail}
                      onChange={(e) => setUseAlternateEmail(e.target.checked)}
                      className="rounded"
                      disabled={isSendingEmail}
                    />
                    <label htmlFor="useAlternate" className="text-sm font-medium cursor-pointer">
                      Send to alternate email (Premium Feature)
                    </label>
                  </div>

                  {useAlternateEmail && (
                    <>
                      <input
                        type="email"
                        value={alternateEmail}
                        onChange={(e) => setAlternateEmail(e.target.value)}
                        placeholder="alternate@example.com"
                        className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={isSendingEmail}
                      />

                      <button
                        onClick={() => handleSendEmail(true)}
                        disabled={isSendingEmail || !alternateEmail.trim()}
                        className={`
                          w-full px-6 py-3 rounded-md text-white transition flex items-center justify-center gap-2
                          bg-green-600 hover:bg-green-700
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        {isSendingEmail && useAlternateEmail ? (
                          <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending Receipt...
                          </>
                        ) : (
                          "Send to Alternate Email"
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={pdfBlob ? handleDownloadPDF : generatePDF}
              disabled={isGeneratingPdf}
              className="w-full sm:w-auto"
            >
              {isGeneratingPdf ? "Generating PDF..." : "Download PDF"}
            </Button>
          </div>

          {/* Success Modal */}
          <EmailSuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
          />
        </div>
      </ComponentCard>
    </div>
  );
}