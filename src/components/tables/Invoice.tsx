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
import Icon from "@/components/Icons";


// Add this Success Modal near the top (after imports)
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
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Invoice Sent!</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Your invoice has been successfully sent.
        </p>
        <Button onClick={onClose} className="w-full !bg-[#0A66C2] !hover:bg-[#084e96]">
          OK
        </Button>
      </div>
    </div>
  );
}

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

// ==================== TYPES ====================
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
  user: {
    currentPlan: number; // 1 = free, 2 = premium, 3 = pro, etc.
  };
}

// ==================== PDF STYLES (unchanged) ====================
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

// ==================== PDF COMPONENT ====================
const InvoicePDF = ({ invoice }: { invoice: FullInvoice }) => {
  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2 }).format(value);

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
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

        <View style={pdfStyles.paymentSection}>
          <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 10, fontSize: 12 }}>
            Payment Details
          </Text>
          <Text>Account Name: {invoice.accountName}</Text>
          <Text>Account Number: {invoice.accountNumber}</Text>
          <Text>Bank: {invoice.bank}</Text>
        </View>

        {invoice.notes && (
          <View style={pdfStyles.notes}>
            <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 8 }}>
              Notes
            </Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

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

const StatusBadge = ({ status }: { status: string }) => {
  const statusColors: Record<string, string> = {
    UNPAID: "bg-red-100 text-red-800 border-red-200",
    PAID: "bg-green-100 text-green-800 border-green-200",
    OVERDUE: "bg-orange-100 text-orange-800 border-orange-200",
    PARTIAL: "bg-yellow-100 text-yellow-800 border-yellow-200",
    PARTIAL_PAYMENT: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };

  const baseClasses = "px-3 py-1 rounded-full text-sm font-medium border";
  const colorClasses = statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <span className={`${baseClasses} ${colorClasses}`}>
      {status.replace("_", " ")}
    </span>
  );
};

const ShareButtons = ({ invoice, pdfBlob }: { invoice: FullInvoice, pdfBlob: Blob | null }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareableLink, setShareableLink] = useState<string>("");

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

  const getShareMessage = () => {
    return `Invoice ${invoice.userGeneratedInvoiceId || invoice.invoiceId}
From: ${invoice.company.name}
To: ${invoice.customerName}
Amount: ${formatMoney(invoice.totalAmount, invoice.currencySymbol)}
Status: ${invoice.status}
View Invoice: ${shareableLink}`;
  };

  const shareOnWhatsApp = () => {
    const message = encodeURIComponent(getShareMessage());
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareOnTelegram = () => {
    const message = encodeURIComponent(getShareMessage());
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareableLink)}&text=${message}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const title = encodeURIComponent(`Invoice: ${invoice.projectName}`);
    const summary = encodeURIComponent(`Invoice ${invoice.userGeneratedInvoiceId || invoice.invoiceId} from ${invoice.company.name}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableLink)}&title=${title}&summary=${summary}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}&quote=${encodeURIComponent(getShareMessage())}`, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      alert('Link copied to clipboard!');
    } catch (err) {
      alert('Failed to copy link');
    }
  };

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
        alert('Web Share API not supported. Download and share manually.');
      }
    } catch (err) {
      console.error('Error sharing:', err);
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
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { shareOnWhatsApp(); setShowShareMenu(false); }} className="flex items-center justify-center gap-2 p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg">
                WhatsApp
              </button>
              <button onClick={() => { shareOnTelegram(); setShowShareMenu(false); }} className="flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg">
                Telegram
              </button>
              <button onClick={() => { shareOnLinkedIn(); setShowShareMenu(false); }} className="flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg">
                LinkedIn
              </button>
              <button onClick={() => { shareOnFacebook(); setShowShareMenu(false); }} className="flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg">
                Facebook
              </button>
            </div>

            <div className="pt-3 border-t">
              <button onClick={copyToClipboard} className="w-full p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg">
                Copy Link
              </button>
            </div>

            {pdfBlob && (
              <div className="pt-2 border-t">
                <button onClick={sharePDF} className="w-full p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg">
                  Share PDF File
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
  const [alternateEmail, setAlternateEmail] = useState("");
  const [useAlternateEmail, setUseAlternateEmail] = useState(false);
  
  const [isSendingEmail, setIsSendingEmail] = useState(false); // New state for email sending
  const [showSuccessModal, setShowSuccessModal] = useState(false); // For success modal

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

        const logoUrl = raw.tenant.tenantLogo
          ? `${process.env.NEXT_PUBLIC_FILE_URL}${raw.tenant.tenantLogo}`
          : "";
        const signatureUrl = raw.tenant.authorizedSignature
          ? `${process.env.NEXT_PUBLIC_FILE_URL}${raw.tenant.authorizedSignature}`
          : "";

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
          customerName: raw.customer?.customerName || raw.accountName,
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

  const handleStatusUpdate = async () => {
    if (!invoiceId || !selectedStatus) return;

    setIsUpdatingStatus(true);
    try {
      const payload: any = {
        status: selectedStatus.toLowerCase().replace("_payment", ""),
      };

      if (selectedStatus === "PARTIAL_PAYMENT" && amountPaid) {
        payload.amountPaid = parseFloat(amountPaid);
      }

      await api.patch(`/invoices/${invoiceId}/status`, payload);

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

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
    setShowAmountInput(newStatus === "PARTIAL_PAYMENT");
  };

  const handleAmountPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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

const handleSendEmail = async (sendToAlternate: boolean = false) => {
  if (!invoiceId) return;

  try {
    setIsSendingEmail(true);

    let targetEmail = invoice.customerEmail;

    if (sendToAlternate && alternateEmail.trim()) {
      targetEmail = alternateEmail.trim();
    }

    const payload = { email: targetEmail };

    await api.post(`/invoices/${invoiceId}/send-email`, payload);

    setShowSuccessModal(true);
    setUseAlternateEmail(false);
    setAlternateEmail("");
  } catch (err: any) {
    alert(err?.response?.data?.message || "Failed to send email");
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

  if (error || !invoice) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center px-4">
        <p className="text-red-600 text-lg">{error || "Invoice not found"}</p>
        <button onClick={() => router.push("/invoices")} className="mt-6 text-blue-600 hover:underline">
          ← Back to Invoices
        </button>
      </div>
    );
  }

const isPremium = invoice.user.currentPlan === 2 || invoice.user.currentPlan === 3;
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <button
        onClick={() => window.history.back()}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
      >
        <Icon src={ChevronLeftIcon} className="w-5 h-5"/>
        Back
      </button>

      <ComponentCard title={`Invoice ${invoice.userGeneratedInvoiceId || invoice.invoiceId}`}>
        <div className="space-y-8">
          {/* Company Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b pb-8">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0A66C2]">{invoice.company.name}</h1>
              <p className="text-gray-600">{invoice.company.email}</p>
              <p className="text-gray-600">{invoice.company.phone}</p>
            </div>
            {invoice.company.logoUrl && (
              <img
                src={invoice.company.logoUrl}
                alt="Company Logo"
                className="h-24 sm:h-32 object-contain mx-auto sm:mx-0"
              />
            )}
          </div>

          {/* Project & Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">{invoice.projectName}</h2>
              <div className="mt-4 space-y-1">
                <p className="text-gray-600 font-medium">Bill To:</p>
                <p className="text-gray-800">{invoice.customerName}</p>
                {invoice.customerAddress && (
                  <p className="text-gray-600 text-sm whitespace-pre-line">{invoice.customerAddress}</p>
                )}
                {invoice.customerEmail && <p className="text-gray-600">{invoice.customerEmail}</p>}
                {invoice.customerPhone && <p className="text-gray-600">{invoice.customerPhone}</p>}
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-2xl sm:text-3xl font-bold">
                {formatMoney(invoice.totalAmount, invoice.currencySymbol)}
              </p>
              <p className="text-sm text-gray-500 mt-1">Balance Due</p>
              <p className="text-lg sm:text-xl font-semibold text-orange-600">
                {formatMoney(invoice.balanceDue, invoice.currencySymbol)}
              </p>
            </div>
          </div>

          {/* Status Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <span className="text-gray-700 font-medium">Current Status:</span>
                  <StatusBadge status={invoice.status} />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <label htmlFor="status" className="text-gray-700 font-medium whitespace-nowrap">
                      Change Status:
                    </label>
                    <select
                      id="status"
                      value={selectedStatus}
                      onChange={handleStatusChange}
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
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
                    className="w-full sm:w-auto"
                  >
                    {isUpdatingStatus ? "Updating..." : "Update"}
                  </Button>
                </div>
              </div>

              {showAmountInput && (
                <div className="p-4 bg-blue-50 rounded border border-blue-200">
                  <div className="flex flex-col gap-3">
                    <label htmlFor="amountPaid" className="text-gray-700 font-medium">
                      Amount Paid ({invoice.currencySymbol}):
                    </label>
                    <input
                      type="text"
                      id="amountPaid"
                      value={amountPaid}
                      onChange={handleAmountPaidChange}
                      placeholder="Enter amount paid"
                      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="text-sm text-gray-600">
                      Total: {formatMoney(invoice.totalAmount, invoice.currencySymbol)}
                      {amountPaid && parseFloat(amountPaid) > 0 && (
                        <span className="ml-3">
                          Balance: {formatMoney(invoice.totalAmount - parseFloat(amountPaid), invoice.currencySymbol)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
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

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-full sm:min-w-0">
              <thead>
                <tr className="border-b text-left text-gray-600 bg-gray-50">
                  <th className="py-3 px-2">Description</th>
                  <th className="py-3 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-4 px-2">{item.description}</td>
                    <td className="py-4 px-2 text-right font-medium">
                      {formatMoney(item.amount, invoice.currencySymbol)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-3 px-2 text-right font-medium">Subtotal</td>
                  <td className="py-3 px-2 text-right">{formatMoney(invoice.subtotal, invoice.currencySymbol)}</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 text-right font-medium">Tax ({invoice.taxPercentage}%)</td>
                  <td className="py-3 px-2 text-right">{formatMoney(invoice.taxAmount, invoice.currencySymbol)}</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="py-4 px-2 text-right font-bold text-lg">Total</td>
                  <td className="py-4 px-2 text-right font-bold text-xl">
                    {formatMoney(invoice.totalAmount, invoice.currencySymbol)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Details */}
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Payment Details</h3>
            <div className="space-y-2">
              <p><strong>Account Name:</strong> {invoice.accountName}</p>
              <p><strong>Account Number:</strong> {invoice.accountNumber}</p>
              <p><strong>Bank:</strong> {invoice.bank}</p>
            </div>
          </div>

          {invoice.notes && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Notes</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded">{invoice.notes}</p>
            </div>
          )}

          {/* Signature */}
          {invoice.company.signatureUrl && (
            <div className="mt-12 flex justify-center sm:justify-end">
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

         {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-8 border-t">
            <div className="flex flex-col gap-4 w-full">
              {/* Primary Send Button */}
              <button
                onClick={() => handleSendEmail(false)}
                disabled={isSendingEmail || !invoice.customerEmail}
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
                    Sending Invoice...
                  </>
                ) : (
                  `Send to ${invoice.customerEmail ?? "Customer Email"}`
                )}
              </button>

              {/* Premium: Alternate Email */}
              {isPremium && (
                <div className="flex flex-col gap-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
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
                        className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            Sending Invoice...
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

            {invoice && <ShareButtons invoice={invoice} pdfBlob={pdfBlob} />}

            {!pdfBlob ? (
              <Button variant="outline" onClick={generatePDF} disabled={isGeneratingPdf} className="w-full sm:w-auto">
                {isGeneratingPdf ? "Generating..." : "Download PDF"}
              </Button>
            ) : (
              <Button variant="outline" onClick={handleDownloadPDF} className="w-full sm:w-auto">
                Download PDF
              </Button>
            )}
          </div>

          <EmailSuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
          />
        </div>
      </ComponentCard>
    </div>
  );
}