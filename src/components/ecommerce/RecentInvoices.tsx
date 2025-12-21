// components/dashboard/RecentInvoices.tsx
"use client";

import React, { useEffect, useState } from "react";
import api from "../../../lib/api"; // Adjust path if needed (same as in invoice page)

interface Invoice {
  invoiceId: string;
  userGeneratedInvoiceId?: string | null;
  customerName?: string; // from customer object
  accountName?: string; // fallback if no customer
  totalAmount: string | number;
  status: string;
  invoiceDate: string;
  currency_detail: {
    currencySymbol: string;
  };
  customer?: {
    customerName: string;
  };
}

export default function RecentInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 

useEffect(() => {
     const fetchRecentInvoices = async () => {
      setLoading(true);
    try {
      const response = await api.get('/invoices/latest');
      
      if (response.status === 200) {
        const data = Array.isArray(response.data) ? response.data : [response.data];
        setInvoices(data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Failed to load your invoices');
    }
    setLoading(false);
  };
fetchRecentInvoices();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400";
      case "UNPAID":
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400";
      case "OVERDUE":
        return "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Invoices</h3>
        <div className="text-center py-8 text-gray-500">Loading invoices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Invoices</h3>
        <div className="text-center py-8 text-red-600">{error}</div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Invoices</h3>
        <div className="text-center py-8 text-gray-500">No invoices yet</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Invoices
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Invoice
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Client
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {invoices.map((inv) => (
              <tr key={inv.invoiceId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {inv.userGeneratedInvoiceId || inv.invoiceId}
                  <div className="text-xs text-gray-500">{formatDate(inv.invoiceDate)}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {inv.customer?.customerName}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                  {inv.currency_detail.currencySymbol} {Number(inv.balanceDue).toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      inv.status
                    )}`}
                  >
                    {inv.status}
                    {/* {inv.status === "UNPAID" ? "Pending" : inv.status} */}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}