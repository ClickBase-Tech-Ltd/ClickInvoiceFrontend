// app/admin/users/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { ChevronLeftIcon, EyeIcon, UserIcon } from "@/icons";
import Icon from "@/components/Icons";
import api from "../../../lib/api";
import Badge from "@/components/ui/badge/Badge";

/* ---------------- types ---------------- */

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

/* ---------------- component ---------------- */

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

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
      case "active":
        return "success";
      case "pending":
        return "secondary";
      case "suspended":
        return "error";
      case "inactive":
        return "warning";
      default:
        return "secondary";
    }
  };

  const roleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "info";
      case "USER":
        return "success";
      default:
        return "secondary";
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phoneNumber && user.phoneNumber.includes(searchTerm));

    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    const matchesRole =
      roleFilter === "all" || user.user_role.roleName === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

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
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      // If modal is open, update the selected user
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, status: newStatus });
      }
    } catch (err: any) {
      console.error("Failed to update status:", err);
      alert(err?.response?.data?.message || "Failed to update user status");
    }
  };

  const getPlanName = (planId: number | null) => {
    const plans: Record<number, string> = {
      1: "Starter",
      2: "Professional",
      3: "Enterprise"
    };
    return planId ? plans[planId] || `Plan ${planId}` : "No Plan";
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
              Users Management
            </h1>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total: <span className="font-medium">{users.length}</span>
            {filteredUsers.length !== users.length && (
              <span className="ml-2">
                (Filtered: {filteredUsers.length})
              </span>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div>
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      User
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Contact
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Role
                    </TableCell>
                    {/* <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Plan
                    </TableCell> */}
                    {/* <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Status
                    </TableCell> */}
                    {/* <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Email Verified
                    </TableCell> */}
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
                      <TableCell colSpan={8} className="py-10 text-center text-gray-500 dark:text-gray-400">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-red-600">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-gray-500 dark:text-gray-400">
                        {searchTerm || statusFilter !== "all" || roleFilter !== "all"
                          ? "No users match your filters."
                          : "No users found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                        onClick={() => openModal(user)}
                      >
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20 flex items-center justify-center font-semibold text-[#0A66C2]">
                              {user.firstName[0].toUpperCase()}
                            </div>
                            <div>
                              <span className="font-medium text-gray-800 dark:text-white/90 block">
                                {user.firstName} {user.lastName}
                              </span>
                              {user.otherNames && (
                                <span className="text-xs text-gray-500 block">
                                  ({user.otherNames})
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start">
                          <div className="space-y-1">
                            <div className="text-theme-sm text-gray-600 dark:text-gray-400">
                              {user.email}
                            </div>
                            {user.phoneNumber && (
                              <div className="text-xs text-gray-500">
                                {user.phoneNumber}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start">
                          <Badge
                            color={roleBadgeColor(user.user_role.roleName)}
                            size="sm"
                          >
                            {user.user_role.roleName}
                          </Badge>
                        </TableCell>

                        {/* <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                          {getPlanName(user.currentPlan)}
                        </TableCell> */}

                        {/* <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-2">
                            <Badge
                              color={statusBadgeColor(user.status)}
                              size="sm"
                            >
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </Badge>
                            <select
                              value={user.status}
                              onChange={(e) => handleStatusChange(user.id, e.target.value as User["status"])}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                            >
                              <option value="active">Active</option>
                              <option value="pending">Pending</option>
                              <option value="suspended">Suspended</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </TableCell> */}

                        {/* <TableCell className="px-5 py-4 text-start">
                          {user.email_verified_at ? (
                            <Badge color="success" size="sm">
                              Verified
                            </Badge>
                          ) : (
                            <Badge color="secondary" size="sm">
                              Not Verified
                            </Badge>
                          )}
                        </TableCell> */}

                        <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                          {formatDate(user.created_at)}
                        </TableCell>

                        <TableCell className="px-5 py-4 text-start">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(user);
                            }}
                            className="text-gray-600 hover:text-brand-600 transition"
                            title="View user details"
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
                  {selectedUser.firstName[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedUser.firstName} {selectedUser.lastName}
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
                {/* <button
                  onClick={() => {
                    // Add edit functionality here
                    console.log("Edit user:", selectedUser.id);
                  }}
                  className="px-6 py-3 rounded-lg bg-[#0A66C2] hover:bg-[#084d93] text-white font-medium transition"
                >
                  Edit User
                </button> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}