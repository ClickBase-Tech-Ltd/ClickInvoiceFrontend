// app/customers/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import { ChevronLeftIcon, MailIcon } from "@/icons";
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
    <div className="max-w-6xl mx-auto py-8">
      <button
        onClick={() => window.history.back()}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900"
      >
        {/* <ChevronLeftIcon className="w-5 h-5" /> */}
        <Icon src={ChevronLeftIcon} className="w-5 h-5"/>
        Back
      </button>

      <ComponentCard title="Customers">
        {customers.length > 0 && (
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              {selectedCustomers.size > 0
                ? `${selectedCustomers.size} selected`
                : `${customers.length} total customers`}
            </div>

            <Button
              onClick={openBulkEmailModal}
              disabled={customers.length === 0}
              className="flex items-center gap-2"
            >
              {/* <MailIcon className="w-4 h-4" /> */}
              <Icon src={MailIcon} className="w-4 h-4" />
              {selectedCustomers.size > 0 ? "Email Selected" : "Broadcast Email"}
            </Button>
          </div>
        )}

        {/* Loading / Error / Empty states */}
        {loading && <p className="text-center text-sm text-gray-500 py-8">Loading customers...</p>}
        {!loading && error && <p className="text-center text-sm text-red-600 py-8">{error}</p>}
        {!loading && !error && customers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-6">No customers found.</p>
            <Button onClick={() => router.push("/customers/create")}>Add Customer</Button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && customers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-left text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-4 font-medium">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.size === customers.length && customers.length > 0}
                      onChange={selectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="py-4 font-medium">Name</th>
                  <th className="py-4 font-medium">Email</th>
                  <th className="py-4 font-medium">Phone</th>
                  <th className="py-4 font-medium">Added</th>
                  <th className="py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {customers.map((customer) => (
                  <tr key={customer.customerId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-4">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.has(customer.customerId)}
                        onChange={() => toggleCustomerSelection(customer.customerId)}
                        className="rounded"
                      />
                    </td>
                    <td className="py-4 font-medium">{customer.customerName}</td>
                    <td className="py-4">{customer.customerEmail || "-"}</td>
                    <td className="py-4">{customer.customerPhone || "-"}</td>
                    <td className="py-4">{formatDate(customer.created_at)}</td>
                    <td className="py-4 text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openViewModal(customer)}>
                        View
                      </Button>
                      {customer.customerEmail && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSingleEmailModal(customer)}
                          className="flex items-center gap-1"
                        >
                          {/* <MailIcon className="w-3 h-3" /> */}
                          <Icon src={MailIcon} className="w-3 h-3"  />
                          Email
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ComponentCard>

      {/* View Modal */}
      {viewModalOpen && selectedCustomer && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">{selectedCustomer.customerName}</h2>
            <div className="space-y-4 text-sm">
              <div><span className="font-medium text-gray-600">Email:</span> <p>{selectedCustomer.customerEmail || "—"}</p></div>
              <div><span className="font-medium text-gray-600">Phone:</span> <p>{selectedCustomer.customerPhone || "—"}</p></div>
              <div><span className="font-medium text-gray-600">Address:</span> <p className="whitespace-pre-line">{selectedCustomer.customerAddress || "—"}</p></div>
              <div><span className="font-medium text-gray-600">Added:</span> <p>{formatDate(selectedCustomer.created_at)}</p></div>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <Button
                onClick={() => router.push(`/customer-invoices-and-receipts?customerId=${selectedCustomer.customerId}`)}
                className="w-full"
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
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
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
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
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