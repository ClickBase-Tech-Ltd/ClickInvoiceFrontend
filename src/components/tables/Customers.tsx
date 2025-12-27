// app/customers/page.tsx
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
import Badge from "../../components/ui/badge/Badge";
import { ChevronLeftIcon, MailIcon, EyeIcon } from "@/icons";
import api from "../../../lib/api";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icons";

interface Customer {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerAddress?: string | null;
  created_at: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Selection for bulk actions
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());

  // View Modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Single Email Modal
  const [isSingleEmailModalOpen, setIsSingleEmailModalOpen] = useState(false);
  const [singleEmailCustomer, setSingleEmailCustomer] = useState<Customer | null>(null);
  const [singleSubject, setSingleSubject] = useState("");
  const [singleMessage, setSingleMessage] = useState("");

  // Bulk Email Modal
  const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false);
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");

  const [sendingSingle, setSendingSingle] = useState(false);
  const [sendingBulk, setSendingBulk] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/customers");
        setCustomers(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const toggleCustomerSelection = (customerId: string) => {
    const newSelected = new Set(selectedCustomers);
    newSelected.has(customerId) ? newSelected.delete(customerId) : newSelected.add(customerId);
    setSelectedCustomers(newSelected);
  };

  const selectAll = () => {
    setSelectedCustomers(
      selectedCustomers.size === customers.length
        ? new Set()
        : new Set(customers.map(c => c.customerId))
    );
  };

  const openViewModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewModalOpen(true);
  };

  // Single Email
  const openSingleEmailModal = (customer: Customer) => {
    setSingleEmailCustomer(customer);
    setSingleSubject(`Hello ${customer.customerName}`);
    setSingleMessage(`Dear ${customer.customerName},\n\n`);
    setIsSingleEmailModalOpen(true);
  };

  const handleSendSingleEmail = async () => {
    if (!singleSubject.trim() || !singleMessage.trim()) {
      alert("Please provide subject and message.");
      return;
    }

    setSendingSingle(true);
    try {
      await api.post(`/customers/${singleEmailCustomer?.customerId}/send-email`, {
        subject: singleSubject,
        message: singleMessage,
      });

      alert("Email sent successfully!");
      setIsSingleEmailModalOpen(false);
      setSingleSubject("");
      setSingleMessage("");
      setSingleEmailCustomer(null);
    } catch (err: any) {
      alert("Failed to send email: " + (err?.response?.data?.message || err.message));
    } finally {
      setSendingSingle(false);
    }
  };

  // Bulk Email
  const openBulkEmailModal = () => {
    const ids = selectedCustomers.size > 0
      ? Array.from(selectedCustomers)
      : customers.map(c => c.customerId);

    if (ids.length === 0) {
      alert("No customers available to email.");
      return;
    }

    setBulkSubject("");
    setBulkMessage("Dear Customers,\n\n");
    setIsBulkEmailModalOpen(true);
  };

  const handleSendBulkEmail = async () => {
    if (!bulkSubject.trim() || !bulkMessage.trim()) {
      alert("Please provide subject and message.");
      return;
    }

    const customerIds = selectedCustomers.size > 0
      ? Array.from(selectedCustomers)
      : customers.map(c => c.customerId);

    setSendingBulk(true);
    try {
      await api.post("/customers/broadcast-email", {
        customerIds,
        subject: bulkSubject,
        message: bulkMessage,
      });

      alert(`Broadcast sent to ${customerIds.length} customer(s)!`);
      setIsBulkEmailModalOpen(false);
      setBulkSubject("");
      setBulkMessage("");
      setSelectedCustomers(new Set());
    } catch (err: any) {
      alert("Failed to send broadcast: " + (err?.response?.data?.message || err.message));
    } finally {
      setSendingBulk(false);
    }
  };

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
              Customers
            </h1>
          </div>

          {customers.length > 0 && (
            <Button
              onClick={openBulkEmailModal}
              disabled={customers.length === 0}
              // className="flex items-center gap-2"
              className="!bg-[#0A66C2] hover:!bg-[#084d93] flex items-center gap-2"
            >
              {/* <Icon src={MailIcon} className="w-4 h-4 !text-white" /> */}
              {selectedCustomers.size > 0 ? "Email Selected" : "Broadcast Email"}
            </Button>
          )}
        </div>

        {/* Selection Info */}
        {customers.length > 0 && (
          <div className="text-sm text-gray-600">
            {selectedCustomers.size > 0
              ? `${selectedCustomers.size} selected`
              : `${customers.length} total customers`}
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-12">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.size === customers.length && customers.length > 0}
                        onChange={selectAll}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Name
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Email
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Phone
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Added
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-gray-500 dark:text-gray-400">
                        Loading customers...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-red-600">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-gray-500 dark:text-gray-400">
                        No customers found.{" "}
                        <Button onClick={() => router.push("/customers/create")} variant="outline">
                          Add Customer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow key={customer.customerId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={selectedCustomers.has(customer.customerId)}
                            onChange={() => toggleCustomerSelection(customer.customerId)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="font-medium text-gray-800 dark:text-white/90">
                            {customer.customerName}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                          {customer.customerEmail || "—"}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                          {customer.customerPhone || "—"}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                          {formatDate(customer.created_at)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => openViewModal(customer)}
                              className="text-gray-600 hover:text-brand-600 transition"
                              title="View details"
                            >
                              <Icon src={EyeIcon} className="w-5 h-5" />
                            </button>
                            {customer.customerEmail && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openSingleEmailModal(customer)}
                                className="flex items-center gap-1"
                              >
                                <Icon src={MailIcon} className="w-3 h-3" />
                                Email
                              </Button>
                            )}
                          </div>
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

      {/* View Modal */}
      {viewModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-gray-900 p-8 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold">{selectedCustomer.customerName}</h2>
              <button
                onClick={() => setViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">Email:</span>
                <p className="mt-1">{selectedCustomer.customerEmail || "—"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Phone:</span>
                <p className="mt-1">{selectedCustomer.customerPhone || "—"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Address:</span>
                <p className="mt-1 whitespace-pre-line">{selectedCustomer.customerAddress || "—"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Added:</span>
                <p className="mt-1">{formatDate(selectedCustomer.created_at)}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Button
  onClick={() =>
    router.push(
      `/dashboard/customer-invoices-and-receipts?customerId=${selectedCustomer.customerId}`
    )
  }
  className="!bg-[#0A66C2] hover:!bg-[#084d93]"
>
  View All Invoices & Receipts
</Button>

              <Button variant="outline" onClick={() => setViewModalOpen(false)} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Single Email Modal */}
      {isSingleEmailModalOpen && singleEmailCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Send Email to {singleEmailCustomer.customerName}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={singleSubject}
                  onChange={(e) => setSingleSubject(e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={singleMessage}
                  onChange={(e) => setSingleMessage(e.target.value)}
                  rows={8}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsSingleEmailModalOpen(false)} disabled={sendingSingle}>
                Cancel
              </Button>
              <Button onClick={handleSendSingleEmail} disabled={sendingSingle || !singleSubject.trim() || !singleMessage.trim()}>
                {sendingSingle ? "Sending..." : "Send Email"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Email Modal */}
      {isBulkEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">
              {selectedCustomers.size > 0 ? `Email ${selectedCustomers.size} Selected Customer(s)` : "Broadcast Email to All Customers"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={bulkSubject}
                  onChange={(e) => setBulkSubject(e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subject..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  rows={8}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsBulkEmailModalOpen(false)} disabled={sendingBulk}>
                Cancel
              </Button>
              <Button onClick={handleSendBulkEmail} disabled={sendingBulk || !bulkSubject.trim() || !bulkMessage.trim()}>
                {sendingBulk ? "Sending..." : "Send Broadcast"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}