// app/invoice/page.tsx
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

const ShareIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

// ==================== UPDATED TYPES ====================
interface FullInvoice {
  invoiceId: string;
  userGeneratedInvoiceId?: string | null;
  projectName: string;
  subtotal: number;
  taxPercentage: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  currencySymbol: string;
  status: string;
  invoiceDate: string;
  dueDate?: string;
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
}

// ==================== PDF STYLES ====================
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
    color: "#0A66C2",
  },
  title: {
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#0A66C2",
  },
  invoiceNumber: { textAlign: "center", marginBottom: 30, fontSize: 16 },
  section: { marginBottom: 25 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  label: { color: "#666", fontSize: 10 },
  value: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  customerAddress: { fontSize: 10, marginTop: 4, color: "#666", maxWidth: 200 },
  table: { width: "100%", marginVertical: 20, border: "1px solid #e5e7eb" },
  tableHeader: {
    backgroundColor: "#f3f4f6",
    flexDirection: "row",
    borderBottom: "1px solid #e5e7eb",
  },
  tableRow: { flexDirection: "row", borderBottom: "1px solid #e5e7eb" },
  cell: { padding: 12, flex: 1 },
  cellRight: { textAlign: "right" },
  totalRow: { backgroundColor: "#eff6ff", fontFamily: "Helvetica-Bold", fontSize: 12 },
  balanceRow: { backgroundColor: "#fffbeb", fontFamily: "Helvetica-Bold", fontSize: 15 },
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

// ==================== UPDATED PDF COMPONENT ====================
const InvoicePDF = ({ invoice }: { invoice: FullInvoice }) => {
  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2 }).format(value);

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Company Header */}
        <View style={pdfStyles.header}>
          {invoice.company.logoUrl ? (
            <Image style={pdfStyles.logo} src={invoice.company.logoUrl} />
          ) : (
            <View style={{ width: 150 }} />
          )}
          <View style={pdfStyles.companyInfo}>
            <Text style={pdfStyles.companyName}>{invoice.company.name}</Text>
            <Text>{invoice.company.email}</Text>
            <Text>{invoice.company.phone}</Text>
          </View>
        </View>

        <Text style={pdfStyles.title}>INVOICE</Text>
        <Text style={pdfStyles.invoiceNumber}>
          {invoice.userGeneratedInvoiceId || invoice.invoiceId}
        </Text>

        <View style={pdfStyles.section}>
          <View style={pdfStyles.row}>
            <View>
              <Text style={pdfStyles.label}>Bill To</Text>
              <Text style={pdfStyles.value}>{invoice.customerName}</Text>
              {invoice.customerAddress && (
                <Text style={pdfStyles.customerAddress}>{invoice.customerAddress}</Text>
              )}
              {invoice.customerEmail && <Text>{invoice.customerEmail}</Text>}
              {invoice.customerPhone && <Text>{invoice.customerPhone}</Text>}
            </View>
            <View>
              <Text style={pdfStyles.label}>Invoice Date</Text>
              <Text>{new Date(invoice.invoiceDate).toLocaleDateString("en-GB")}</Text>
              {invoice.dueDate && (
                <>
                  <Text style={pdfStyles.label}>Due Date</Text>
                  <Text>{new Date(invoice.dueDate).toLocaleDateString("en-GB")}</Text>
                </>
              )}
              <Text style={pdfStyles.label}>Status</Text>
              <Text style={pdfStyles.value}>{invoice.status}</Text>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={pdfStyles.cell}>Description</Text>
            <Text style={[pdfStyles.cell, pdfStyles.cellRight]}>Amount</Text>
          </View>
          {invoice.items.map((item, idx) => (
            <View key={idx} style={pdfStyles.tableRow} wrap={false}>
              <Text style={pdfStyles.cell}>{item.description}</Text>
              <Text style={[pdfStyles.cell, pdfStyles.cellRight]}>
                {invoice.currencySymbol} {formatMoney(item.amount)}
              </Text>
            </View>
          ))}
          <View style={[pdfStyles.tableRow, pdfStyles.totalRow]}>
            <Text style={[pdfStyles.cell, { textAlign: "right" }]}>Subtotal</Text>
            <Text style={[pdfStyles.cell, pdfStyles.cellRight]}>
              {invoice.currencySymbol} {formatMoney(invoice.subtotal)}
            </Text>
          </View>
          <View style={[pdfStyles.tableRow, pdfStyles.totalRow]}>
            <Text style={[pdfStyles.cell, { textAlign: "right" }]}>
              Tax ({invoice.taxPercentage}%)
            </Text>
            <Text style={[pdfStyles.cell, pdfStyles.cellRight]}>
              {invoice.currencySymbol} {formatMoney(invoice.taxAmount)}
            </Text>
          </View>
          <View style={[pdfStyles.tableRow, pdfStyles.totalRow]}>
            <Text style={[pdfStyles.cell, { textAlign: "right" }]}>Total</Text>
            <Text style={[pdfStyles.cell, pdfStyles.cellRight]}>
              {invoice.currencySymbol} {formatMoney(invoice.totalAmount)}
            </Text>
          </View>
          <View style={[pdfStyles.tableRow, pdfStyles.balanceRow]}>
            <Text style={[pdfStyles.cell, { textAlign: "right", color: "#d97706" }]}>
              Balance Due
            </Text>
            <Text style={[pdfStyles.cell, pdfStyles.cellRight, { color: "#d97706" }]}>
              {invoice.currencySymbol} {formatMoney(invoice.balanceDue)}
            </Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={pdfStyles.paymentSection}>
          <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 10, fontSize: 12 }}>
            Payment Details
          </Text>
          <Text>Account Name: {invoice.accountName}</Text>
          <Text>Account Number: {invoice.accountNumber}</Text>
          <Text>Bank: {invoice.bank}</Text>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={pdfStyles.notes}>
            <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 8 }}>
              Notes
            </Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        {/* Authorized Signature */}
        {invoice.company.signatureUrl && (
          <View style={pdfStyles.signatureSection}>
            <View>
              <Image style={pdfStyles.signatureImage} src={invoice.company.signatureUrl} />
              <Text style={pdfStyles.signatureLabel}>Authorized Signature</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

// ==================== STATUS BADGE COMPONENT ====================
const StatusBadge = ({ status }: { status: string }) => {
  const statusColors: Record<string, string> = {
    UNPAID: "bg-red-100 text-red-800 border-red-200",
    PAID: "bg-green-100 text-green-800 border-green-200",
    OVERDUE: "bg-orange-100 text-orange-800 border-orange-200",
    PARTIAL: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };

  const baseClasses = "px-3 py-1 rounded-full text-sm font-medium border";
  const colorClasses = statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <span className={`${baseClasses} ${colorClasses}`}>
      {status}
    </span>
  );
};

// ==================== SHARE BUTTONS COMPONENT ====================
const ShareButtons = ({ invoice, pdfBlob }: { invoice: FullInvoice, pdfBlob: Blob | null }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareableLink, setShareableLink] = useState<string>("");

  // Generate shareable link
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      setShareableLink(currentUrl);
    }
  }, []);

  const formatMoney = (value: number, symbol: string = "₦") => {
    return `${symbol} ${new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
    }).format(value)}`;
  };

  // Share message template
  const getShareMessage = () => {
    return `Invoice ${invoice.userGeneratedInvoiceId || invoice.invoiceId}
From: ${invoice.company.name}
To: ${invoice.customerName}
Amount: ${formatMoney(invoice.totalAmount, invoice.currencySymbol)}
Status: ${invoice.status}
View Invoice: ${shareableLink}`;
  };

  // Share on WhatsApp
  const shareOnWhatsApp = () => {
    const message = encodeURIComponent(getShareMessage());
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  // Share on Telegram
  const shareOnTelegram = () => {
    const message = encodeURIComponent(getShareMessage());
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareableLink)}&text=${message}`, '_blank');
  };

  // Share on LinkedIn
  const shareOnLinkedIn = () => {
    const title = encodeURIComponent(`Invoice: ${invoice.projectName}`);
    const summary = encodeURIComponent(`Invoice ${invoice.userGeneratedInvoiceId || invoice.invoiceId} from ${invoice.company.name}`);
    const source = encodeURIComponent(invoice.company.name);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableLink)}&title=${title}&summary=${summary}&source=${source}`, '_blank');
  };

  // Share on Facebook
  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}&quote=${encodeURIComponent(getShareMessage())}`, '_blank');
  };

  // Copy link to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy link');
    }
  };

  // Share PDF file if available
  const sharePDF = async () => {
    if (!pdfBlob) {
      alert('Please generate PDF first');
      return;
    }

    try {
      const file = new File([pdfBlob], `Invoice_${invoice.userGeneratedInvoiceId || invoice.invoiceId}.pdf`, { type: 'application/pdf' });
      
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `Invoice ${invoice.userGeneratedInvoiceId || invoice.invoiceId}`,
          text: getShareMessage(),
          files: [file],
        });
      } else {
        alert('Web Share API not supported on this device. Download the PDF and share manually.');
      }
    } catch (err) {
      console.error('Error sharing PDF:', err);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="flex items-center gap-2"
      >
        <ShareIcon className="w-5 h-5" />
        Share Invoice
      </Button>

      {showShareMenu && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50 p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Share via:</span>
              <button
                onClick={() => setShowShareMenu(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  shareOnWhatsApp();
                  setShowShareMenu(false);
                }}
                className="flex items-center justify-center gap-2 p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
              >
                <span className="font-semibold">WhatsApp</span>
              </button>
              
              <button
                onClick={() => {
                  shareOnTelegram();
                  setShowShareMenu(false);
                }}
                className="flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
              >
                <span className="font-semibold">Telegram</span>
              </button>
              
              <button
                onClick={() => {
                  shareOnLinkedIn();
                  setShowShareMenu(false);
                }}
                className="flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg transition-colors"
              >
                <span className="font-semibold">LinkedIn</span>
              </button>
              
              <button
                onClick={() => {
                  shareOnFacebook();
                  setShowShareMenu(false);
                }}
                className="flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
              >
                <span className="font-semibold">Facebook</span>
              </button>
            </div>

            <div className="pt-3 border-t">
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
              >
                <span>Copy Link</span>
              </button>
            </div>

            {pdfBlob && (
              <div className="pt-2 border-t">
                <button
                  onClick={sharePDF}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
                >
                  <span>Share PDF File</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function InvoiceViewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("invoiceId");

  const [invoice, setInvoice] = useState<FullInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [showAmountInput, setShowAmountInput] = useState(false);

  const formatMoney = (value: number, symbol: string = "₦") => {
    return `${symbol} ${new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 2,
    }).format(value)}`;
  };

  useEffect(() => {
    if (!invoiceId) {
      setError("No invoice ID provided");
      setLoading(false);
      return;
    }

    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/invoices/${invoiceId}`);
        const raw = Array.isArray(res.data) ? res.data[0] : res.data;

        if (!raw || !raw.tenant) {
          throw new Error("Invoice or company data not found");
        }

        const items = raw.items.map((item: any) => ({
          description: item.itemDescription,
          amount: parseFloat(item.amount),
        }));

        const subtotal = items.reduce((sum: number, item: any) => sum + item.amount, 0);
        const taxPercentage = parseFloat(raw.taxPercentage || "0");
        const taxAmount = subtotal * (taxPercentage / 100);
        const totalAmount = subtotal + taxAmount;
        const amountPaid = parseFloat(raw.amountPaid || "0");
        const balanceDue = totalAmount - amountPaid;

        // Build full URLs for logo and signature
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const logoUrl = raw.tenant.tenantLogo
          ? `${process.env.NEXT_PUBLIC_FILE_URL}${raw.tenant.tenantLogo}`
          : "";
        const signatureUrl = raw.tenant.authorizedSignature
          ? `${process.env.NEXT_PUBLIC_FILE_URL}${raw.tenant.authorizedSignature}`
          : "";

        // Use customer data from response instead of account data
        const transformed: FullInvoice = {
          invoiceId: raw.invoiceId,
          userGeneratedInvoiceId: raw.userGeneratedInvoiceId,
          projectName: raw.projectName,
          subtotal,
          taxPercentage,
          taxAmount,
          totalAmount,
          amountPaid,
          balanceDue,
          currencySymbol: raw.currency_detail.currencySymbol || "₦",
          status: raw.status.toUpperCase(),
          invoiceDate: raw.invoiceDate,
          dueDate: raw.dueDate,
          // Use customer data instead of account data
          customerName: raw.customer?.customerName || raw.accountName,
          customerEmail: raw.customer?.customerEmail,
          customerPhone: raw.customer?.customerPhone,
          customerAddress: raw.customer?.customerAddress,
          // Keep payment account details separate
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
        };

        setInvoice(transformed);
        setSelectedStatus(transformed.status);
        setAmountPaid(transformed.amountPaid.toString());
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  // ==================== UPDATE STATUS FUNCTION ====================
  const handleStatusUpdate = async () => {
    if (!invoiceId || !selectedStatus) return;

    setIsUpdatingStatus(true);
    try {
      const payload: any = {
        status: selectedStatus.toLowerCase(),
      };

      // If status is PAID and amountPaid is provided, include it
      if (selectedStatus === "PARTIAL_PAYMENT" && amountPaid) {
        payload.amountPaid = parseFloat(amountPaid);
      }

      await api.patch(`/invoices/${invoiceId}/status`, payload);

      // Update local state
      if (invoice) {
        const updatedInvoice = { ...invoice };
        updatedInvoice.status = selectedStatus;
        
        if (selectedStatus === "PARTIAL_PAYMENT" && amountPaid) {
          const paidAmount = parseFloat(amountPaid);
          updatedInvoice.amountPaid = paidAmount;
          updatedInvoice.balanceDue = updatedInvoice.totalAmount - paidAmount;
        }
        
        setInvoice(updatedInvoice);
      }

      alert("Status updated successfully!");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ==================== HANDLE STATUS CHANGE ====================
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
    setShowAmountInput(newStatus === "PARTIAL_PAYMENT");
  };

  // ==================== HANDLE AMOUNT PAID CHANGE ====================
  const handleAmountPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and one decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setAmountPaid(value);
    }
  };

  const generatePDF = async () => {
    if (!invoice) return;
    setIsGeneratingPdf(true);
    try {
      const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob();
      setPdfBlob(blob);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // ==================== DOWNLOAD PDF (BACKEND) ====================
  const handleDownloadPDF = async () => {
    if (!invoiceId) return;

    try {
      setLoading(true);
      const response = await api.get(`/invoices/${invoiceId}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice_${invoice?.userGeneratedInvoiceId || invoiceId}.pdf`;
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

  // ==================== SEND EMAIL (BACKEND) ====================
  const handleSendEmail = async () => {
    if (!invoiceId) return;

    try {
      setLoading(true);
      await api.post(`/invoices/${invoiceId}/send-email`);
      alert("Invoice emailed successfully");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="max-w-4xl mx-auto py-8 animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded mb-8" />
      <ComponentCard title="">
        <div className="space-y-8">
          <div className="flex justify-between">
            <div className="space-y-3">
              <div className="h-10 w-48 bg-gray-200 rounded" />
              <div className="h-5 w-64 bg-gray-200 rounded" />
            </div>
            <div className="h-32 w-32 bg-gray-200 rounded" />
          </div>
          {/* ... rest of skeleton ... */}
        </div>
      </ComponentCard>
    </div>
  );

  if (loading) return <LoadingSkeleton />;

  if (error || !invoice) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-red-600 text-lg">{error || "Invoice not found"}</p>
        <button onClick={() => router.push("/invoices")} className="mt-6 text-blue-600 hover:underline">
          ← Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <button
        onClick={() => window.history.back()}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
      >
        <ChevronLeftIcon className="w-5 h-5" />
        Back
      </button>

      <ComponentCard title={`Invoice ${invoice.userGeneratedInvoiceId || invoice.invoiceId}`}>
        <div className="space-y-8">
          {/* Company Header in Web View */}
          <div className="flex justify-between items-start border-b pb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">{invoice.company.name}</h1>
              <p className="text-gray-600">{invoice.company.email}</p>
              <p className="text-gray-600">{invoice.company.phone}</p>
            </div>
            {invoice.company.logoUrl && (
              <img
                src={invoice.company.logoUrl}
                alt="Company Logo"
                className="h-32 object-contain"
              />
            )}
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{invoice.projectName}</h2>
              <div className="mt-2 space-y-1">
                <p className="text-gray-600 font-medium">Bill To:</p>
                <p className="text-gray-800">{invoice.customerName}</p>
                {invoice.customerAddress && (
                  <p className="text-gray-600 text-sm whitespace-pre-line">{invoice.customerAddress}</p>
                )}
                {invoice.customerEmail && (
                  <p className="text-gray-600">{invoice.customerEmail}</p>
                )}
                {invoice.customerPhone && (
                  <p className="text-gray-600">{invoice.customerPhone}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                {formatMoney(invoice.totalAmount, invoice.currencySymbol)}
              </p>
              <p className="text-sm text-gray-500 mt-1">Balance Due</p>
              <p className="text-xl font-semibold text-orange-600">
                {formatMoney(invoice.balanceDue, invoice.currencySymbol)}
              </p>
            </div>
          </div>

          {/* Status Badge and Dropdown */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-medium">Current Status:</span>
                <StatusBadge status={invoice.status} />
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <label htmlFor="status" className="text-gray-700 font-medium">
                    Change Status:
                  </label>
                  <select
                    id="status"
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UNPAID">UNPAID</option>
                    <option value="PAID">PAID</option>
                    <option value="OVERDUE">OVERDUE</option>
                    <option value="PARTIAL_PAYMENT">PARTIAL PAYMENT</option>
                  </select>
                </div>

                <Button
                  onClick={handleStatusUpdate}
                  disabled={isUpdatingStatus || selectedStatus === invoice.status}
                  className="px-4 py-2"
                >
                  {isUpdatingStatus ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>

            {/* Amount Paid Input (shown only when PAID is selected) */}
            {showAmountInput && (
              <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <label htmlFor="amountPaid" className="text-gray-700 font-medium whitespace-nowrap">
                    Amount Paid ({invoice.currencySymbol}):
                  </label>
                  <input
                    type="text"
                    id="amountPaid"
                    value={amountPaid}
                    onChange={handleAmountPaidChange}
                    placeholder="Enter amount paid"
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                  />
                  <div className="text-sm text-gray-600">
                    Total Invoice: {formatMoney(invoice.totalAmount, invoice.currencySymbol)}
                    {amountPaid && parseFloat(amountPaid) > 0 && (
                      <span className="ml-3">
                        Balance: {formatMoney(invoice.totalAmount - parseFloat(amountPaid), invoice.currencySymbol)}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter the amount that has been paid. This will update the balance due.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-gray-500">Invoice Date</p>
              <p className="font-medium">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            </div>
            {invoice.dueDate && (
              <div>
                <p className="text-gray-500">Due Date</p>
                <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <p className="text-gray-500">Amount Paid</p>
              <p className="font-medium">{formatMoney(invoice.amountPaid, invoice.currencySymbol)}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Invoice Items</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left text-gray-600 bg-gray-50">
                  <th className="py-3">Description</th>
                  <th className="py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-4">{item.description}</td>
                    <td className="py-4 text-right font-medium">
                      {formatMoney(item.amount, invoice.currencySymbol)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-3 text-right font-medium">Subtotal</td>
                  <td className="py-3 text-right">{formatMoney(invoice.subtotal, invoice.currencySymbol)}</td>
                </tr>
                <tr>
                  <td className="py-3 text-right font-medium">Tax ({invoice.taxPercentage}%)</td>
                  <td className="py-3 text-right">{formatMoney(invoice.taxAmount, invoice.currencySymbol)}</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="py-4 text-right font-bold text-lg">Total</td>
                  <td className="py-4 text-right font-bold text-xl">
                    {formatMoney(invoice.totalAmount, invoice.currencySymbol)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Payment Details</h3>
            <p><strong>Account Name:</strong> {invoice.accountName}</p>
            <p><strong>Account Number:</strong> {invoice.accountNumber}</p>
            <p><strong>Bank:</strong> {invoice.bank}</p>
          </div>

          {invoice.notes && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Notes</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded">{invoice.notes}</p>
            </div>
          )}

          {/* Authorized Signature in Web View */}
          {invoice.company.signatureUrl && (
            <div className="mt-12 flex justify-end">
              <div className="text-center">
                <img
                  src={invoice.company.signatureUrl}
                  alt="Authorized Signature"
                  className="h-20 object-contain"
                />
                <p className="text-sm text-gray-600 mt-2">Authorized Signature</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 pt-8 border-t">
            <button
              onClick={handleSendEmail}
              disabled={loading || !invoice.customerEmail}
              className={`
                px-4 py-2 rounded-md text-white transition
                bg-[#0A66C2] hover:bg-[#084e96]
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {loading ? "Sending..." : `Send to ${invoice.customerEmail ?? "Customer Email"}`}
            </button>

            {/* Share Button */}
            {invoice && (
              <ShareButtons invoice={invoice} pdfBlob={pdfBlob} />
            )}

            {!pdfBlob ? (
              <Button variant="outline" onClick={generatePDF} disabled={isGeneratingPdf}>
                {isGeneratingPdf ? "Generating PDF..." : "Download PDF"}
              </Button>
            ) : (
              <Button variant="outline" onClick={handleDownloadPDF}>
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}