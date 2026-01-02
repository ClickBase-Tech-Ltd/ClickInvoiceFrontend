// app/admin/subscriptions/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { ChevronLeftIcon, EyeIcon } from "@/icons";
import Icon from "@/components/Icons";
import api from "../../../lib/api";

/* ---------------- types ---------------- */

interface Plan {
  planId: number;
  planName: string;
  price: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  otherNames?: string | null;
  email: string;
  phoneNumber?: string | null;
}

interface Subscription {
  subscriptionId: number;
  userId: number;
  planId: number;
  flutterwaveSubscriptionId: string | null;
  status: "pending" | "active" | "cancelled" | "failed";
  startDate: string | null;
  nextBillingDate: string | null;
  created_at: string;
  metadata: any | null;
  user: User;
  plan: Plan;
}

/* ---------------- component ---------------- */

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await api.get("/subscribers");
        setSubscriptions(res.data.subscriptions || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load subscriptions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const formatDate = (date: string | null) =>
    date
      ? new Date(date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

  const formatMoney = (price: string) => {
    const num = parseFloat(price);
    if (isNaN(num)) return "₦0.00";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const statusBadgeColor = (status: Subscription["status"]) => {
    switch (status) {
      case "active":
        return "success";
      case "pending":
        return "secondary";
      case "cancelled":
      case "failed":
        return "error";
      default:
        return "secondary";
    }
  };

  const openModal = (sub: Subscription) => {
    setSelectedSub(sub);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSub(null);
    document.body.style.overflow = "unset";
  };

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
              Subscriptions Management
            </h1>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total: <span className="font-medium">{subscriptions.length}</span> subscription{subscriptions.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Loading subscriptions...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No subscriptions found.
            </div>
          ) : (
            subscriptions.map((sub) => (
              <div
                key={sub.subscriptionId}
                onClick={() => openModal(sub)}
                className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5 shadow-sm cursor-pointer transition hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20 flex items-center justify-center text-xl font-bold text-[#0A66C2] flex-shrink-0">
                      {sub.user.firstName[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {sub.user.firstName} {sub.user.lastName}
                        {sub.user.otherNames && (
                          <span className="text-sm text-gray-500"> ({sub.user.otherNames})</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {sub.user.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(sub);
                    }}
                    className="p-2 text-gray-600 hover:text-brand-600 transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="View details"
                  >
                    <Icon src={EyeIcon} className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4 border-gray-100 dark:border-white/[0.08]">
                  <div>
                    <span className="text-gray-500">Plan</span>
                    <p className="font-medium">{sub.plan.planName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount</span>
                    <p className="font-medium">{formatMoney(sub.plan.price)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status</span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          {
                            success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                            error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                            secondary: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
                          }[statusBadgeColor(sub.status)]
                        }`}
                      >
                        {sub.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Next Billing</span>
                    <p className="font-medium">{formatDate(sub.nextBillingDate)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View (hidden on mobile) */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[900px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Subscriber
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Email
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Plan
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Amount
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Status
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Start Date
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Next Billing
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-gray-500 dark:text-gray-400">
                        Loading subscriptions...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-red-600">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : subscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-gray-500 dark:text-gray-400">
                        No subscriptions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscriptions.map((sub) => (
                      <TableRow
                        key={sub.subscriptionId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        <TableCell className="px-5 py-4 text-start">
                          <span className="font-medium text-gray-800 dark:text-white/90">
                            {sub.user.firstName} {sub.user.lastName}
                          </span>
                          {sub.user.otherNames && (
                            <span className="block text-xs text-gray-500">({sub.user.otherNames})</span>
                          )}
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                          {sub.user.email}
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                          {sub.plan.planName}
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                          {formatMoney(sub.plan.price)}
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                              {
                                success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                                info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                                secondary: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
                              }[statusBadgeColor(sub.status)]
                            }`}
                          >
                            {sub.status.toUpperCase()}
                          </span>
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                          {formatDate(sub.startDate)}
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                          {formatDate(sub.nextBillingDate)}
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(sub);
                            }}
                            className="text-gray-600 hover:text-brand-600 transition"
                            title="View subscription details"
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

      {/* Modal remains unchanged - already responsive */}
      {isModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Subscription Details
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20 flex items-center justify-center text-2xl font-bold text-[#0A66C2]">
                  {selectedSub.user.firstName[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">
                    {selectedSub.user.firstName} {selectedSub.user.lastName}
                  </h3>
                  {selectedSub.user.otherNames && (
                    <p className="text-sm text-gray-500 mt-1">({selectedSub.user.otherNames})</p>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Subscription ID: #{selectedSub.subscriptionId}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Contact</h4>
                  <p><strong>Email:</strong> {selectedSub.user.email}</p>
                  {selectedSub.user.phoneNumber && (
                    <p className="mt-2"><strong>Phone:</strong> {selectedSub.user.phoneNumber}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Plan</h4>
                  <p><strong>Name:</strong> {selectedSub.plan.planName}</p>
                  <p className="mt-2 text-xl font-semibold">{formatMoney(selectedSub.plan.price)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Billing Dates</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{formatDate(selectedSub.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Next Billing</p>
                    <p className="font-medium">{formatDate(selectedSub.nextBillingDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">{formatDate(selectedSub.created_at)}</p>
                  </div>
                </div>
              </div>

              {selectedSub.flutterwaveSubscriptionId && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Flutterwave ID</h4>
                  <code className="block text-sm bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg break-all">
                    {selectedSub.flutterwaveSubscriptionId}
                  </code>
                </div>
              )}

              {selectedSub.metadata && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Payment Metadata</h4>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(selectedSub.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 rounded-lg bg-[#0A66C2] hover:bg-[#084d93] text-white font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}