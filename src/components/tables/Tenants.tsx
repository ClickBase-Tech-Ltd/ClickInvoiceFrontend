// app/companies/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
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
import { EyeIcon, ChevronLeftIcon } from "@/icons";
import Icon from "@/components/Icons";
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
    currencyId: number;
  };
  payment_gateway: {
    paymentGatewayName: string;
    gatewayId: number;
  };
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  isDefault: number;
}

interface Currency {
  currencyId: number;
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
}

interface Gateway {
  gatewayId: number;
  paymentGatewayName: string;
}

const timezones = [
  { value: "Africa/Lagos", label: "West Africa Time (Lagos, Nigeria) - WAT" },
  { value: "Africa/Accra", label: "Greenwich Mean Time (Accra, Ghana) - GMT" },
  { value: "Africa/Nairobi", label: "East Africa Time (Nairobi, Kenya) - EAT" },
  { value: "Africa/Johannesburg", label: "South Africa Standard Time (Johannesburg) - SAST" },
  { value: "Africa/Cairo", label: "Egypt Standard Time (Cairo) - EET" },
  { value: "Europe/London", label: "Greenwich Mean Time / British Summer Time (London) - GMT/BST" },
  { value: "Europe/Paris", label: "Central European Time (Paris, Berlin) - CET" },
  { value: "America/New_York", label: "Eastern Time (New York) - ET" },
  { value: "America/Chicago", label: "Central Time (Chicago) - CT" },
  { value: "America/Los_Angeles", label: "Pacific Time (Los Angeles) - PT" },
  { value: "Asia/Dubai", label: "Gulf Standard Time (Dubai) - GST" },
  { value: "Asia/Singapore", label: "Singapore Time - SGT" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (Tokyo) - JST" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (Sydney) - AEST" },
  { value: "Pacific/Auckland", label: "New Zealand Time (Auckland) - NZT" },
  { value: "UTC", label: "Coordinated Universal Time - UTC" },
];

export default function CompaniesListPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [statusError, setStatusError] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const { isAnyModalOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        const response = await api.get("/tenants/user-tenants");
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

  useEffect(() => {
    if (editingTenant) {
      // Load currencies and gateways only when editing
      const fetchData = async () => {
        try {
          const [currRes, gateRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/currencies`),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment-gateways`),
          ]);

          if (currRes.ok) setCurrencies(await currRes.json());
          if (gateRes.ok) setGateways(await gateRes.json());
        } catch (err) {
          console.error("Failed to load options:", err);
        }
      };
      fetchData();
    }
  }, [editingTenant]);

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

  const handleEditTenant = (tenant: Tenant) => {
  // Ensure currency is an object
  // const currencyObject = typeof tenant.currency === 'number' 
  //   ? currencies.find(c => c.currencyId === tenant.currency) || tenant.currency
  //   : tenant.currency;

  const currencyObject = tenant.currency && typeof tenant.currency === 'object'
  ? tenant.currency
  : currencies.find(c => c.currencyId === Number(tenant.currency)) || {
      currencyId: 1,
      currencyName: "Naira",
      currencyCode: "NGN",
      currencySymbol: "₦",
      country: "Nigeria"
    };

  setEditingTenant({
    ...tenant,
    currency: currencyObject
  });
  
  setLogoPreview(
    tenant.tenantLogo
      ? `${process.env.NEXT_PUBLIC_FILE_URL}${tenant.tenantLogo}`
      : null
  );
  setSignaturePreview(
    tenant.authorizedSignature
      ? `${process.env.NEXT_PUBLIC_FILE_URL}${tenant.authorizedSignature}`
      : null
  );
  openModal();
};

  const handleCloseModal = () => {
    closeModal();
    setSelectedTenant(null);
    setEditingTenant(null);
    setLogoPreview(null);
    setSignaturePreview(null);
    setSuccessMessage(null);
    setStatusError(null);
  };

const handleStatusToggle = async (tenant: Tenant) => {
  const newStatus = tenant.status === "active" ? "inactive" : "active";
  setUpdatingStatus(tenant.tenantId);

  try {
    await api.patch(`/tenants/${tenant.tenantId}/status`, { status: newStatus });
    setTenants((prev) =>
      prev.map((t) =>
        t.tenantId === tenant.tenantId ? { ...t, status: newStatus } : t
      )
    );
    setStatusError(null);
  } catch (error: any) {
    console.error("Failed to update status:", error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update company status.";
    
    setStatusError(message); // This will show your local error modal
    // REMOVE THIS LINE: openModal({ title: "Action Not Allowed" });
  } finally {
    setUpdatingStatus(null);
  }
};

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!editingTenant) return;

  setIsSubmitting(true);
  
  try {
    const form = e.currentTarget;
    const formData = new FormData();
    
    // Append all form fields
    formData.append('tenantName', (form.elements.namedItem('tenantName') as HTMLInputElement).value);
    formData.append('tenantEmail', (form.elements.namedItem('tenantEmail') as HTMLInputElement).value);
    formData.append('tenantPhone', (form.elements.namedItem('tenantPhone') as HTMLInputElement).value);
    formData.append('timezone', (form.elements.namedItem('timezone') as HTMLSelectElement).value);
    formData.append('currency', (form.elements.namedItem('currency') as HTMLSelectElement).value);
    formData.append('gatewayPreference', (form.elements.namedItem('gatewayPreference') as HTMLSelectElement).value);
    
    // Append files
    if (logoInputRef.current?.files?.[0]) {
      formData.append('tenantLogo', logoInputRef.current.files[0]);
    }
    if (signatureInputRef.current?.files?.[0]) {
      formData.append('authorizedSignature', signatureInputRef.current.files[0]);
    }
    
    // Append required fields
    // formData.append('currency', editingTenant.currencyId || "NGN");
    formData.append('_method', 'PUT');

    // Send request
    const response = await api.post(`/tenants/${editingTenant.tenantId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Update with response data if available
    if (response.data?.tenant) {
      setTenants((prev) =>
        prev.map((t) =>
          t.tenantId === editingTenant.tenantId ? response.data.tenant : t
        )
      );
    }

    setSuccessMessage('Business updated successfully!');
    setTimeout(() => handleCloseModal(), 1500);
  } catch (error: any) {
    console.error('Update error:', error);
    alert(error?.response?.data?.message || 'Failed to update business.');
  } finally {
    setIsSubmitting(false);
  }
};

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSignaturePreview(reader.result as string);
      reader.readAsDataURL(file);
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
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              My Businesses
            </h1>
            <Link
              href="/dashboard/tenants/create"
              className="inline-flex items-center gap-2 rounded-lg !bg-[#0A66C2] hover:!bg-[#084d93] px-4 py-2 text-sm font-medium text-white"
            >
              Add Business
            </Link>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <div className="min-w-[900px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell isHeader>Business Name</TableCell>
                      <TableCell isHeader>Active</TableCell>
                      <TableCell isHeader>Contact</TableCell>
                      <TableCell isHeader>Currency</TableCell>
                      <TableCell isHeader>Status</TableCell>
                      <TableCell isHeader>Created</TableCell>
                      <TableCell isHeader>Actions</TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-10 text-center">
                          Loading businesses...
                        </TableCell>
                      </TableRow>
                    ) : tenants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-10 text-center">
                          No businesses found.{" "}
                          <Link href="/dashboard/tenants/create" className="text-brand-500 hover:underline">
                            Add your first business
                          </Link>
                        </TableCell>
                      </TableRow>
                    ) : (
                      tenants.map((tenant) => (
                        <TableRow key={tenant.tenantId}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden border">
                                {tenant.tenantLogo ? (
                                  <Image
                                    width={40}
                                    height={40}
                                    src={`${process.env.NEXT_PUBLIC_FILE_URL}${tenant.tenantLogo}`}
                                    alt={tenant.tenantName}
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold">
                                    {tenant.tenantName[0].toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <span className="font-medium">{tenant.tenantName}</span>
                            </div>
                          </TableCell>

                          <TableCell>
                            {tenant.isDefault === 1 ? (
                              <Badge size="sm" color="info">Current</Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>

                          <TableCell>
                            <div>
                              <p>{tenant.tenantEmail}</p>
                              <p className="text-xs text-gray-500">{tenant.tenantPhone}</p>
                            </div>
                          </TableCell>

                          <TableCell>
                            {tenant.currency?.currencySymbol} {tenant.currency?.currencyCode}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleStatusToggle(tenant)}
                                disabled={updatingStatus === tenant.tenantId}
                                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                style={{
                                  backgroundColor: tenant.status === "active" ? "#10b981" : "#6b7280",
                                }}
                              >
                                <span
                                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                    tenant.status === "active" ? "translate-x-6" : "translate-x-1"
                                  }`}
                                />
                              </button>
                              <Badge color={tenant.status === "active" ? "success" : "error"}>
                                {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                              </Badge>
                            </div>
                          </TableCell>

                          <TableCell>{formatDate(tenant.created_at)}</TableCell>

                          <TableCell>
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleViewTenant(tenant)}
                                title="View"
                              >
                                <Icon src={EyeIcon} className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleEditTenant(tenant)}
                                className="text-brand-600 hover:text-brand-700 font-medium text-sm"
                              >
                                Edit
                              </button>
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

      {/* View Details Modal */}
      {/* View Details Modal */}
{selectedTenant && !editingTenant && !statusError && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">   <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-semibold">Business Details</h2>
        <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-8">
        {/* Company Header with Logo */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            {selectedTenant.tenantLogo ? (
              <Image 
                width={96} 
                height={96} 
                src={`${process.env.NEXT_PUBLIC_FILE_URL}${selectedTenant.tenantLogo}`} 
                alt={selectedTenant.tenantName}
                className="w-full h-full object-cover"
                unoptimized 
              />
            ) : (
              <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-3xl font-bold text-gray-600 dark:text-gray-400">
                {selectedTenant.tenantName[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTenant.tenantName}</h3>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
              {selectedTenant.isDefault === 1 && (
                <Badge color="info" size="md">Current Business</Badge>
              )}
              <Badge color={selectedTenant.status === "active" ? "success" : "error"} size="md">
                {selectedTenant.status.charAt(0).toUpperCase() + selectedTenant.status.slice(1)}
              </Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ID: #{selectedTenant.tenantId}
              </span>
            </div>
          </div>
        </div>

        {/* Business Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
              Contact Information
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                <p className="font-medium">{selectedTenant.tenantEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                <p className="font-medium">{selectedTenant.tenantPhone || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Country Code</p>
                <p className="font-medium">{selectedTenant.countryCode || "Not specified"}</p>
              </div>
            </div>
          </div>

          {/* Financial Settings */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
              Financial Settings
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Currency</p>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{selectedTenant.currency?.currencySymbol}</span>
                  <span className="font-medium">{selectedTenant.currency?.currencyCode}</span>
                  <span className="text-sm text-gray-500">({selectedTenant.currency?.currencyName})</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Payment Gateway</p>
                <p className="font-medium">
                  {selectedTenant.payment_gateway?.paymentGatewayName || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gateway Preference ID</p>
                <p className="font-medium">{selectedTenant.gatewayPreference}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timezone & Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
              Regional Settings
            </h4>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Timezone</p>
              <p className="font-medium">
                {(() => {
                  const tz = timezones.find(t => t.value === selectedTenant.timezone);
                  return tz ? tz.label : selectedTenant.timezone;
                })()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
              Timeline
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Created Date</p>
                <p className="font-medium">{formatDate(selectedTenant.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="font-medium">{formatDate(selectedTenant.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Authorized Signature */}
        {selectedTenant.authorizedSignature && (
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Authorized Signature
            </h4>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center">
                <div className="w-64 h-24 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <Image
                    width={256}
                    height={96}
                    src={`${process.env.NEXT_PUBLIC_FILE_URL}${selectedTenant.authorizedSignature}`}
                    alt="Authorized Signature"
                    className="max-w-full max-h-full object-contain"
                    unoptimized
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Official signature for documents
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCloseModal}
            className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              handleCloseModal();
              setTimeout(() => handleEditTenant(selectedTenant), 100);
            }}
            className="px-6 py-3 rounded-lg bg-[#0A66C2] hover:bg-[#084d93] text-white font-medium transition-colors"
          >
            Edit Business
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      {/* Edit Modal */}
     {editingTenant && !statusError && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 overflow-y-auto">     <div className="w-full max-w-4xl my-8 bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Edit Business</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {successMessage && (
              <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-center">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Name</label>
                  <input
                    name="tenantName"
                    type="text"
                    defaultValue={editingTenant.tenantName}
                    required
                    className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                  <input
                    name="tenantPhone"
                    type="tel"
                    defaultValue={editingTenant.tenantPhone}
                    required
                    className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                  <input
                    name="tenantEmail"
                    type="email"
                    defaultValue={editingTenant.tenantEmail}
                    required
                    className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                </div>
               <div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
  <select
    name="currency"
    defaultValue={
      // Handle both cases: if currency is an object or just an ID
      editingTenant.currency && typeof editingTenant.currency === 'object' 
        ? editingTenant.currency.currencyId 
        : editingTenant.currency
    }
    className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
    required
  >
    {currencies.map((cur) => (
      <option key={cur.currencyId} value={cur.currencyId}>
        {cur.currencyName} ({cur.currencyCode} - {cur.currencySymbol})
      </option>
    ))}
  </select>
</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Logo</label>
                <input
                  ref={logoInputRef}
                  name="tenantLogo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="mt-1 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand-50 file:text-brand-700"
                />
                {logoPreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Current/Preview:</p>
                    <img src={logoPreview} alt="Logo" className="h-32 w-32 object-contain rounded-lg border" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Authorized Signature</label>
                <input
                  ref={signatureInputRef}
                  name="authorizedSignature"
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureChange}
                  className="mt-1 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand-50 file:text-brand-700"
                />
                {signaturePreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Current/Preview:</p>
                    <img src={signaturePreview} alt="Signature" className="h-24 w-64 object-contain rounded-lg border bg-white" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Timezone</label>
                  <select
                    name="timezone"
                    defaultValue={editingTenant.timezone}
                    className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    required
                  >
                    <option value="">Select timezone</option>
                    {timezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Gateway</label>
                  <select
                    name="gatewayPreference"
                    defaultValue={editingTenant.gatewayPreference}
                    className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    required
                  >
                    {gateways.map((g) => (
                      <option key={g.gatewayId} value={g.gatewayId}>
                        {g.paymentGatewayName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-lg bg-[#0A66C2] hover:bg-[#084d93] text-white font-medium disabled:opacity-70"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {statusError && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
    <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Cannot Change Status
        </h2>
      </div>

      <div className="mb-8">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {statusError}
        </p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            setStatusError(null);
            closeModal();
          }}
          className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}