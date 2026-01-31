// app/admin/subscriptions/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, EyeIcon, XCircleIcon, RefreshCwIcon } from "@/icons";
import Icon from "@/components/Icons";
import api from "../../../lib/api";

/* ---------------- Types ---------------- */

interface Plan {
  planId: number;
  planName: string;
  price: string;
  currency_detail?: {
    currencySymbol: string;
  };
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

/* ---------------- Component ---------------- */

export default function MySubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"cancel" | "renew" | null>(null);
  const [confirmSubId, setConfirmSubId] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/my-subscriptions");
      setSubscriptions(res.data.subscriptions || []);
      setError("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleConfirmAction = async () => {
    if (!confirmSubId || !confirmAction) return;

    setConfirmLoading(true);

    try {
      let endpoint = "";
      let method: "put" | "post" = "put";

      if (confirmAction === "cancel") {
        endpoint = `/subscriptions/${confirmSubId}/cancel`;
      } else if (confirmAction === "renew") {
        endpoint = `/subscriptions/${confirmSubId}/renew`; // Adjust this to your actual renewal endpoint
        // method = "post"; // ← change if your API uses POST for renewal
      }

      await api[method](endpoint);

      // You can replace this with a toast notification library later
      // e.g. toast.success(`Subscription ${confirmAction}ed successfully`);
      console.log(`Subscription ${confirmAction}ed successfully`);

      await fetchSubscriptions();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        `Failed to ${confirmAction} subscription. Please try again.`;
      console.error(message);
      // Replace with toast.error(message) in production
      alert(message); // temporary fallback
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setConfirmAction(null);
      setConfirmSubId(null);
    }
  };

  const openConfirm = (action: "cancel" | "renew", subId: number) => {
    setConfirmAction(action);
    setConfirmSubId(subId);
    setConfirmOpen(true);
  };

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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getStatusBadgeClasses = (status: Subscription["status"]) => {
    const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";
    switch (status) {
      case "active":
        return `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`;
      case "pending":
        return `${base} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`;
      case "cancelled":
      case "failed":
        return `${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`;
      default:
        return `${base} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`;
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
        {/* Header */}
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
            Total: <span className="font-medium">{subscriptions.length}</span> subscription
            {subscriptions.length !== 1 ? "s" : ""}
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
                    <p className="font-medium">
                      {sub?.plan?.currency_detail?.currencySymbol || "₦"}{" "}
                      {formatMoney(sub.plan.price)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status</span>
                    <div className="mt-1">
                      <span className={getStatusBadgeClasses(sub.status)}>
                        {sub.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Next Billing</span>
                    <p className="font-medium">{formatDate(sub.nextBillingDate)}</p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.08] flex flex-col gap-3">
                  {sub.status === "active" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openConfirm("cancel", sub.subscriptionId);
                      }}
                      disabled={confirmLoading}
                    >
                      Cancel Subscription
                    </Button>
                  )}

                  {(sub.status === "cancelled" || sub.status === "failed") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openConfirm("renew", sub.subscriptionId);
                      }}
                      disabled={confirmLoading}
                    >
                      Renew Subscription
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[1200px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Subscriber
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
                      Created
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-gray-500 dark:text-gray-400">
                        Loading subscriptions...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-red-600">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : subscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-gray-500 dark:text-gray-400">
                        No subscriptions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscriptions.map((sub) => (
                      <TableRow
                        key={sub.subscriptionId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                        
                      >
                        <TableCell className="px-5 py-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {sub.user.firstName} {sub.user.lastName}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {sub.user.email}
                          </div>
                        </TableCell>

                        <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-300">
                          {sub.plan.planName}
                        </TableCell>

                        <TableCell className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                          {sub?.plan?.currency_detail?.currencySymbol || "₦"}{" "}
                          {formatMoney(sub.plan.price)}
                        </TableCell>

                        <TableCell className="px-5 py-4">
                          <span className={getStatusBadgeClasses(sub.status)}>
                            {sub.status.toUpperCase()}
                          </span>
                        </TableCell>

                        <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-300">
                          {formatDate(sub.startDate)}
                        </TableCell>

                        <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-300">
                          {formatDate(sub.nextBillingDate)}
                        </TableCell>

                        <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-300">
                          {formatDate(sub.created_at)}
                        </TableCell>

                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal(sub);
                              }}
                              className="text-gray-500 hover:text-brand-600 transition"
                              title="View details"
                            >
                              <Icon src={EyeIcon} className="w-5 h-5" />
                            </button>

                            {sub.status === "active" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openConfirm("cancel", sub.subscriptionId);
                                }}
                                disabled={confirmLoading}
                              >
                                <Icon src={XCircleIcon} className="w-5 h-5" />
                              </Button>
                            )}

                            {(sub.status === "cancelled" || sub.status === "failed") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openConfirm("renew", sub.subscriptionId);
                                }}
                                disabled={confirmLoading}
                              >
                                <Icon src={RefreshCwIcon} className="w-5 h-5" />
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

      {/* Subscription Detail Modal */}
      {isModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-gray-900 p-6 md:p-8 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Subscription Details
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-8">
              {/* User info */}
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20 flex items-center justify-center text-3xl font-bold text-[#0A66C2]">
                  {selectedSub.user.firstName[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
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

              {/* Contact & Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Contact</h4>
                  <p>
                    <strong>Email:</strong> {selectedSub.user.email}
                  </p>
                  {selectedSub.user.phoneNumber && (
                    <p className="mt-2">
                      <strong>Phone:</strong> {selectedSub.user.phoneNumber}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Plan</h4>
                  <p>
                    <strong>Name:</strong> {selectedSub.plan.planName}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedSub?.plan?.currency_detail?.currencySymbol || "₦"}{" "}
                    {formatMoney(selectedSub.plan.price)}
                  </p>
                </div>
              </div>

              {/* Billing Dates */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Billing Dates</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

              {/* Flutterwave ID */}
              {selectedSub.flutterwaveSubscriptionId && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Flutterwave Subscription ID
                  </h4>
                  <code className="block text-sm bg-gray-100 dark:bg-gray-800 px-4 py-2.5 rounded-lg break-all font-mono">
                    {selectedSub.flutterwaveSubscriptionId}
                  </code>
                </div>
              )}

              {/* Metadata */}
              {selectedSub.metadata && Object.keys(selectedSub.metadata).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Payment Metadata
                  </h4>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto font-mono">
                    {JSON.stringify(selectedSub.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                {selectedSub.status === "active" && (
                  <Button
                    variant="destructive"
                    onClick={() => openConfirm("cancel", selectedSub.subscriptionId)}
                    disabled={confirmLoading}
                  >
                    Cancel Subscription
                  </Button>
                )}

                {(selectedSub.status === "cancelled" || selectedSub.status === "failed") && (
                  <Button
                    variant="default"
                    onClick={() => openConfirm("renew", selectedSub.subscriptionId)}
                    disabled={confirmLoading}
                  >
                    Renew Now
                  </Button>
                )}

                <Button variant="outline" onClick={closeModal}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shared Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "cancel" ? "Cancel Subscription?" : "Renew Subscription?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "cancel"
                ? "This action will stop future automatic billings. The current billing period will complete unless it has already expired. This cannot be undone."
                : "This will attempt to reactivate or restart the subscription. The user may need to update their payment method if the previous one failed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmLoading}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmAction();
              }}
              className={
                confirmAction === "cancel"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }
            >
              {confirmLoading
                ? "Processing..."
                : confirmAction === "cancel"
                ? "Yes, Cancel"
                : "Yes, Renew"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}