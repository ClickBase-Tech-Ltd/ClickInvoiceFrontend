// app/admin/users/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { ChevronLeftIcon, EyeIcon, MailIcon, UserIcon } from "@/icons";
import Icon from "@/components/Icons";
import api from "../../../lib/api";
import Badge from "@/components/ui/badge/Badge";

/* ---------------- Types ---------------- */

interface UserRole {
  roleId: number;
  roleName: string;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  otherNames: string | null;
  email: string;
  phoneNumber: string | null;
  email_verified_at: string | null;
  role: number;
  currentPlan: number | null;
  status: "active" | "pending" | "suspended" | "inactive";
  otp_expires_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user_role: UserRole;
}

/* ---------------- Modals ---------------- */

// Success Modal
function EmailSuccessModal({
  isOpen,
  message,
  onClose,
}: {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 dark:bg-black/40 backdrop-blur-md">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 ring-1 ring-black/5 dark:ring-white/10">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Email Sent!</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
          <Button onClick={onClose} className="w-full !bg-[#0A66C2] hover:!bg-[#084d93]">
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}

// Error Modal
function EmailErrorModal({
  isOpen,
  message,
  onClose,
}: {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 dark:bg-black/40 backdrop-blur-md">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 ring-1 ring-black/5 dark:ring-white/10">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Failed to Send</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Component ---------------- */

const ITEMS_PER_PAGE = 10;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Selection & Email States
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

  // Single Email Modal
  const [isSingleEmailModalOpen, setIsSingleEmailModalOpen] = useState(false);
  const [singleEmailUser, setSingleEmailUser] = useState<User | null>(null);
  const [singleSubject, setSingleSubject] = useState("");
  const [singleMessage, setSingleMessage] = useState("");

  // Bulk Email Modal
  const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false);
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");

  // Feedback
  const [showEmailSuccess, setShowEmailSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showEmailError, setShowEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");

  const [sendingSingle, setSendingSingle] = useState(false);
  const [sendingBulk, setSendingBulk] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatDate = (date: string | null) =>
    date
      ? new Date(date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const statusBadgeColor = (status: User["status"]) => {
    switch (status) {
      case "active": return "success";
      case "pending": return "secondary";
      case "suspended": return "error";
      case "inactive": return "warning";
      default: return "secondary";
    }
  };

  const roleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN": return "info";
      case "USER": return "success";
      default: return "secondary";
    }
  };

  // Filtering
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchTerm === "" ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phoneNumber && user.phoneNumber.includes(searchTerm));

      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const matchesRole = roleFilter === "all" || user.user_role.roleName === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const openModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    document.body.style.overflow = "unset";
  };

  const handleStatusChange = async (userId: number, newStatus: User["status"]) => {
    try {
      await api.patch(`/users/${userId}/status`, { status: newStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, status: newStatus });
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update user status");
    }
  };

  const getPlanName = (planId: number | null) => {
    const plans: Record<number, string> = { 1: "Starter", 2: "Professional", 3: "Enterprise" };
    return planId ? plans[planId] || `Plan ${planId}` : "No Plan";
  };

  // Selection Logic
  const toggleUserSelection = (userId: number) => {
    const newSelected = new Set(selectedUsers);
    newSelected.has(userId) ? newSelected.delete(userId) : newSelected.add(userId);
    setSelectedUsers(newSelected);
  };

  const selectAll = () => {
    setSelectedUsers(
      selectedUsers.size === paginatedUsers.length
        ? new Set()
        : new Set(paginatedUsers.map(u => u.id))
    );
  };

  // Single Email
  const openSingleEmailModal = (user: User) => {
    setSingleEmailUser(user);
    setSingleSubject(`Hello ${user.firstName} ${user.lastName}`);
    setSingleMessage(`Dear ${user.firstName},\n\n`);
    setIsSingleEmailModalOpen(true);
  };

  const handleSendSingleEmail = async () => {
    if (!singleSubject.trim() || !singleMessage.trim()) {
      setEmailErrorMessage("Please provide subject and message.");
      setShowEmailError(true);
      return;
    }

    setSendingSingle(true);
    try {
      await api.post(`/users/${singleEmailUser?.id}/send-email`, {
        subject: singleSubject,
        message: singleMessage,
      });

      setSuccessMessage("Email sent successfully!");
      setShowEmailSuccess(true);
      setIsSingleEmailModalOpen(false);
      setSingleSubject("");
      setSingleMessage("");
    } catch (err: any) {
      setEmailErrorMessage(err?.response?.data?.message || "Failed to send email.");
      setShowEmailError(true);
    } finally {
      setSendingSingle(false);
    }
  };

  // Bulk Email
  const openBulkEmailModal = () => {
    if (filteredUsers.length === 0) {
      setEmailErrorMessage("No users to email.");
      setShowEmailError(true);
      return;
    }

    setBulkSubject("");
    setBulkMessage("Dear Users,\n\n");
    setIsBulkEmailModalOpen(true);
  };

  const handleSendBulkEmail = async () => {
    if (!bulkSubject.trim() || !bulkMessage.trim()) {
      setEmailErrorMessage("Please provide subject and message.");
      setShowEmailError(true);
      return;
    }

    const userIds = selectedUsers.size > 0
      ? Array.from(selectedUsers)
      : filteredUsers.map(u => u.id);

    setSendingBulk(true);
    try {
      await api.post("/users/broadcast-email", {
        userIds,
        subject: bulkSubject,
        message: bulkMessage,
      });

      setSuccessMessage(`Email broadcast sent to ${userIds.length} user(s)!`);
      setShowEmailSuccess(true);
      setIsBulkEmailModalOpen(false);
      setBulkSubject("");
      setBulkMessage("");
      setSelectedUsers(new Set());
    } catch (err: any) {
      setEmailErrorMessage(err?.response?.data?.message || "Failed to send broadcast.");
      setShowEmailError(true);
    } finally {
      setSendingBulk(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="space-y-6 py-6 px-4 md:px-6 lg:px-8">
        {/* Header - Responsive */}
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
              Users Management
            </h1>
          </div>

          {filteredUsers.length > 0 && (
            <Button
              onClick={openBulkEmailModal}
              className="!bg-[#0A66C2] hover:!bg-[#084d93] flex items-center gap-2 w-full sm:w-auto"
            >
              <Icon src={MailIcon} className="w-4 h-4" />
              {selectedUsers.size > 0 ? `Email Selected (${selectedUsers.size})` : "Broadcast Email"}
            </Button>
          )}
        </div>

        {/* Selection Info */}
        {filteredUsers.length > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedUsers.size > 0
              ? `${selectedUsers.size} of ${filteredUsers.length} selected`
              : `${filteredUsers.length} total users`}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading users...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No users found.</div>
          ) : (
            <>
              {paginatedUsers.map((user) => (
                <div
                  key={user.id}
                  className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded mt-1"
                      />
                      <div className="w-12 h-12 rounded-full bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20 flex items-center justify-center font-semibold text-[#0A66C2]">
                        {user.firstName ? user.firstName[0].toUpperCase() : "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                          {user.otherNames && <span className="text-sm text-gray-500"> ({user.otherNames})</span>}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4 border-gray-100 dark:border-white/[0.08]">
                    <div>
                      <span className="text-gray-500">Role</span>
                      <div className="mt-1">
                        <Badge color={roleBadgeColor(user.user_role.roleName)} size="sm">
                          {user.user_role.roleName}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Status</span>
                      <div className="mt-1">
                        <Badge color={statusBadgeColor(user.status)} size="sm">
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone</span>
                      <p className="font-medium">{user.phoneNumber || "—"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Created</span>
                      <p className="font-medium text-xs">{formatDate(user.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-white/[0.08]">
                    <button
                      onClick={() => openModal(user)}
                      className="p-2 text-gray-600 hover:text-brand-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="View details"
                    >
                      <Icon src={EyeIcon} className="w-5 h-5" />
                    </button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openSingleEmailModal(user)}
                      className="flex items-center gap-1"
                    >
                      <Icon src={MailIcon} className="w-3 h-3" />
                      Email
                    </Button>
                  </div>
                </div>
              ))}

              {/* Mobile Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border disabled:opacity-50"
                  >
                    ←
                  </button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border disabled:opacity-50"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="w-12 px-5 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={selectAll}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell isHeader>User</TableCell>
                  <TableCell isHeader>Contact</TableCell>
                  <TableCell isHeader>Role</TableCell>
                  <TableCell isHeader>Created</TableCell>
                  <TableCell isHeader>Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="py-10 text-center">Loading users...</TableCell></TableRow>
                ) : error ? (
                  <TableRow><TableCell colSpan={6} className="py-10 text-center text-red-600">{error}</TableCell></TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="py-10 text-center">No users found.</TableCell></TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20 flex items-center justify-center font-semibold text-[#0A66C2]">
                            {user.firstName ? user.firstName[0].toUpperCase() : "?"}
                          </div>
                          <div>
                            <span className="font-medium block">
                              {user.firstName} {user.lastName}
                            </span>
                            {user.otherNames && <span className="text-xs text-gray-500 block">({user.otherNames})</span>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="text-theme-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                          {user.phoneNumber && <div className="text-xs text-gray-500">{user.phoneNumber}</div>}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge color={roleBadgeColor(user.user_role.roleName)} size="sm">
                          {user.user_role.roleName}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-400">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openModal(user)}
                            className="text-gray-600 hover:text-brand-600"
                            title="View details"
                          >
                            <Icon src={EyeIcon} className="w-5 h-5" />
                          </button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openSingleEmailModal(user)}
                            className="flex items-center gap-1"
                          >
                            <Icon src={MailIcon} className="w-3 h-3" />
                            Email
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Desktop Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-white/[0.05]">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Previous
                </button>
                <span className="text-sm px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

 

       {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                User Details
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
              {/* User Header */}
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20 flex items-center justify-center text-3xl font-bold text-[#0A66C2]">
                  {selectedUser.firstName ? selectedUser.firstName[0].toUpperCase() : "?"}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedUser.firstName ? selectedUser.firstName[0].toUpperCase() : "?"} {selectedUser.lastName ? selectedUser.lastName[0].toUpperCase() : "?"}
                  </h3>
                  {selectedUser.otherNames && (
                    <p className="text-sm text-gray-500 mt-1">({selectedUser.otherNames})</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-3">
                    <Badge color={roleBadgeColor(selectedUser.user_role.roleName)} size="md">
                      {selectedUser.user_role.roleName}
                    </Badge>
                    <Badge color={statusBadgeColor(selectedUser.status)} size="md">
                      {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                    </Badge>
                    {selectedUser.email_verified_at ? (
                      <Badge color="success" size="md">Email Verified</Badge>
                    ) : (
                      <Badge color="secondary" size="md">Email Not Verified</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    User ID: #{selectedUser.id}
                  </p>
                </div>
              </div>

              {/* User Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                      <p className="font-medium break-all">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                      <p className="font-medium">{selectedUser.phoneNumber || "Not provided"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                    Account Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Current Plan</p>
                      <p className="font-medium">{getPlanName(selectedUser.currentPlan)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Role ID</p>
                      <p className="font-medium">{selectedUser.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <div className="flex items-center gap-2">
                        <Badge color={statusBadgeColor(selectedUser.status)}>
                          {selectedUser.status}
                        </Badge>
                        <select
                          value={selectedUser.status}
                          onChange={(e) => handleStatusChange(selectedUser.id, e.target.value as User["status"])}
                          className="text-sm px-3 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="suspended">Suspended</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                    Verification Timeline
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email Verified</p>
                      <p className="font-medium">{formatDate(selectedUser.email_verified_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">OTP Expires</p>
                      <p className="font-medium">{formatDate(selectedUser.otp_expires_at)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                    Account Timeline
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Created Date</p>
                      <p className="font-medium">{formatDate(selectedUser.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                      <p className="font-medium">{formatDate(selectedUser.updated_at)}</p>
                    </div>
                    {selectedUser.deleted_at && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Deleted Date</p>
                        <p className="font-medium">{formatDate(selectedUser.deleted_at)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Close
                </button>
              
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Email Modal */}
      {isSingleEmailModalOpen && singleEmailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">
              Send Email to {singleEmailUser.firstName} {singleEmailUser.lastName}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={singleSubject}
                  onChange={(e) => setSingleSubject(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={singleMessage}
                  onChange={(e) => setSingleMessage(e.target.value)}
                  rows={8}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsSingleEmailModalOpen(false)} disabled={sendingSingle}>
                Cancel
              </Button>
              <Button
                onClick={handleSendSingleEmail}
                disabled={sendingSingle || !singleSubject.trim() || !singleMessage.trim()}
                className="!bg-[#0A66C2]"
              >
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
              {selectedUsers.size > 0
                ? `Broadcast to ${selectedUsers.size} Selected User(s)`
                : "Broadcast Email to All Users"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={bulkSubject}
                  onChange={(e) => setBulkSubject(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter subject..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  rows={8}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsBulkEmailModalOpen(false)} disabled={sendingBulk}>
                Cancel
              </Button>
              <Button
                onClick={handleSendBulkEmail}
                disabled={sendingBulk || !bulkSubject.trim() || !bulkMessage.trim()}
                className="!bg-[#0A66C2]"
              >
                {sendingBulk ? "Sending..." : "Send Broadcast"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success & Error Modals */}
      <EmailSuccessModal isOpen={showEmailSuccess} message={successMessage} onClose={() => setShowEmailSuccess(false)} />
      <EmailErrorModal isOpen={showEmailError} message={emailErrorMessage} onClose={() => setShowEmailError(false)} />
    </div>
  );
}