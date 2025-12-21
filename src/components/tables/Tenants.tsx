// app/companies/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Image from "next/image";
import Link from "next/link";
import { EyeIcon } from "@/icons";
import api from "../../../lib/api";
import { useModal } from "../../../context/ModalContext";

interface Tenant {
  tenantId: number;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  tenantLogo: string | null;
  authorizedSignature: string | null;
  timezone: string;
  countryCode: string | null;
  gatewayPreference: number;
  currency: {
    currencyName: string;
    currencyCode: string;
    currencySymbol: string;
    country: string;
  };
  payment_gateway: {
    paymentGatewayName: string;
  };
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  isDefault: number;
}

export default function CompaniesListPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  const { isAnyModalOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        const response = await api.get("/tenants");
        setTenants(response.data ?? []);
      } catch (error) {
        console.error("Error fetching tenants:", error);
        setTenants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    openModal();
  };

  const handleCloseModal = () => {
    closeModal();
    setSelectedTenant(null);
  };

  const handleStatusToggle = async (tenant: Tenant) => {
    const newStatus = tenant.status === "active" ? "inactive" : "active";
    setUpdatingStatus(tenant.tenantId);

    try {
      await api.patch(`/tenants/${tenant.tenantId}`, { status: newStatus });
      setTenants((prev) =>
        prev.map((t) =>
          t.tenantId === tenant.tenantId ? { ...t, status: newStatus } : t
        )
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update company status. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div
        className={`transition-all duration-300 ${
          isAnyModalOpen ? "blur-md pointer-events-none" : ""
        }`}
      >
        <div className="space-y-6 py-6 px-4 md:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              My Tenants
            </h1>
            <Link
              href="/tenants/create"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
            >
              Add Tenant
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[900px]">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Tenant
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Active
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Contact
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Currency
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Status
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
                        <TableCell colSpan={7} className="py-10 text-center text-gray-500 dark:text-gray-400">
                          Loading tenants...
                        </TableCell>
                      </TableRow>
                    ) : tenants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-10 text-center text-gray-500 dark:text-gray-400">
                          No companies found.{" "}
                          <Link href="/tenants/create" className="text-brand-500 hover:underline">
                            Add your first tenant
                          </Link>
                        </TableCell>
                      </TableRow>
                    ) : (
                      tenants.map((tenant) => (
                        <TableRow key={tenant.tenantId}>
                          <TableCell className="px-5 py-4 text-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 overflow-hidden rounded-full border border-gray-200 dark:border-gray-700 flex-shrink-0">
                                {tenant.tenantLogo ? (
                                  <Image
                                    width={40}
                                    height={40}
                                    src={`${process.env.NEXT_PUBLIC_FILE_URL}${tenant.tenantLogo}`}
                                    alt={tenant.tenantName}
                                    className="w-full h-full object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 text-xs font-medium">
                                    {tenant.tenantName.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                  {tenant.tenantName}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          {/* Active Column */}
                          <TableCell className="px-4 py-3 text-start">
                            {tenant.isDefault === 1 ? (
                              <Badge size="sm" color="info">Current</Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>

                          <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                            <div>
                              <p>{tenant.tenantEmail}</p>
                              <p className="text-xs text-gray-500">{tenant.tenantPhone}</p>
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                            {tenant.currency.currencySymbol} {tenant.currency.currencyCode}
                          </TableCell>

                          <TableCell className="px-4 py-3 text-start">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleStatusToggle(tenant)}
                                disabled={updatingStatus === tenant.tenantId}
                                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50"
                                style={{
                                  backgroundColor: tenant.status === "active" ? "#10b981" : "#6b7280",
                                }}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    tenant.status === "active" ? "translate-x-6" : "translate-x-1"
                                  }`}
                                />
                              </button>

                              <Badge
                                size="sm"
                                color={tenant.status === "active" ? "success" : "error"}
                              >
                                {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                              </Badge>
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                            {formatDate(tenant.created_at)}
                          </TableCell>

                          <TableCell className="px-4 py-3 text-start">
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleViewTenant(tenant)}
                                className="text-gray-600 hover:text-brand-600 transition"
                                title="View details"
                              >
                                <EyeIcon className="w-5 h-5" />
                              </button>

                              <Link
                                href={`/companies/${tenant.tenantId}/edit`}
                                className="text-brand-500 hover:text-brand-600 text-sm font-medium"
                              >
                                Edit
                              </Link>
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
      </div>

      {/* Tenant Details Modal */}
      {isAnyModalOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold">Tenant Details</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                  {selectedTenant.tenantLogo ? (
                    <Image
                      width={80}
                      height={80}
                      src={`${process.env.NEXT_PUBLIC_FILE_URL}${selectedTenant.tenantLogo}`}
                      alt={selectedTenant.tenantName}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-500">
                      {selectedTenant.tenantName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedTenant.tenantName}</h3>
                  {selectedTenant.isDefault === 1 && (
                    <Badge color="info" size="sm">Default Tenant</Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Email:</span>
                  <p className="mt-1">{selectedTenant.tenantEmail}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Phone:</span>
                  <p className="mt-1">{selectedTenant.tenantPhone}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Currency:</span>
                  <p className="mt-1">
                    {selectedTenant.currency.currencySymbol} {selectedTenant.currency.currencyName} ({selectedTenant.currency.currencyCode})
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Country:</span>
                  <p className="mt-1">{selectedTenant.currency.country}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Timezone:</span>
                  <p className="mt-1">{selectedTenant.timezone}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Payment Gateway:</span>
                  <p className="mt-1">{selectedTenant.payment_gateway.paymentGatewayName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Status:</span>
                  <p className="mt-1">
                    <Badge color={selectedTenant.status === "active" ? "success" : "error"}>
                      {selectedTenant.status.charAt(0).toUpperCase() + selectedTenant.status.slice(1)}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Created:</span>
                  <p className="mt-1">{formatDate(selectedTenant.created_at)}</p>
                </div>
              </div>

              {selectedTenant.authorizedSignature && (
                <div>
                  <span className="font-medium text-gray-500 block mb-2">Authorized Signature:</span>
                  <Image
                    width={200}
                    height={100}
                    src={`${process.env.NEXT_PUBLIC_FILE_URL}${selectedTenant.authorizedSignature}`}
                    alt="Authorized Signature"
                    className="border rounded-lg"
                    unoptimized
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
