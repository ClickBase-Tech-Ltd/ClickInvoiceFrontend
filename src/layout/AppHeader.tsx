"use client";

import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import { useModal } from "../../context/ModalContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../../lib/api";
import { useTenant } from "../context/TenantContext";

interface Tenant {
  tenantId: number;
  tenantName: string;
  tenantLogo: string | null;
  isDefault: number;
}

const AppHeader: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { isAnyModalOpen } = useModal();
  const router = useRouter();

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
const [isDropdownOpen, setDropdownOpen] = useState(false); // NEW for desktop

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const { tenants, currentTenant, loading, switchTenant } = useTenant();

  // Sidebar toggle
  const handleToggle = () => {
    if (window.innerWidth >= 1024) toggleSidebar();
    else toggleMobileSidebar();
  };

  // Tenant switch handler
  const handleTenantSwitch = async (tenant: Tenant) => {
  if (tenant.tenantId === currentTenant?.tenantId || loading) return;

  try {
    await switchTenant(tenant);

    setMobileMenuOpen(false);
    setDropdownOpen(false);

    // 🔄 HARD reload to refetch everything
    window.location.reload();

    // If you ever want a softer reload instead:
    // router.refresh();
  } catch (error: any) {
    console.error("Switch failed:", error);
    alert(
      error.response?.data?.message ||
        "Failed to switch tenant. Please try again."
    );
  }
};


  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".mobile-menu")) {
        setMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);


  // Close desktop tenant dropdown on outside click
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (!(event.target as HTMLElement).closest(".tenant-switcher")) {
      setDropdownOpen(false);
    }
  };

  if (isDropdownOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [isDropdownOpen]);


  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/user", { withCredentials: true });
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) router.push("/");
  }, [isAuthenticated, router]);

  // Token refresh interceptor
  const refreshToken = useCallback(async () => {
    try {
      await api.post("/refresh", {}, { withCredentials: true });
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (
          error.response?.status === 401 &&
          error.config &&
          !error.config.__isRetryRequest
        ) {
          error.config.__isRetryRequest = true;
          const refreshed = await refreshToken();
          if (refreshed) return api(error.config);
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, [refreshToken]);

  return (
    <header
      className={`sticky top-0 z-40 flex w-full border-b bg-white dark:border-gray-800 dark:bg-gray-900 ${
        isAnyModalOpen ? "blur-md pointer-events-none" : ""
      }`}
    >
      <div className="flex w-full flex-col justify-between lg:flex-row lg:px-6">
        {/* LEFT: Hamburger toggle */}
        <div className="flex items-center justify-between px-3 py-3 lg:py-4 w-full lg:w-auto">
          <button
            onClick={handleToggle}
            className="flex h-10 w-10 items-center justify-center rounded-lg border text-gray-500 dark:border-gray-700 lg:hidden"
          >
            ☰
          </button>

          {/* Centered logo on mobile */}
          <div className="absolute left-1/2 transform -translate-x-1/2 lg:hidden">
            <Link href="/">
              <Image
                width={160}
                height={40}
                src="/images/logo/logo.svg"
                alt="Logo"
              />
            </Link>
          </div>

          {/* Three-dot mobile menu */}
          <div className="relative lg:hidden ml-auto">
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg border"
            >
              ⋮
            </button>
            {isMobileMenuOpen && (
              <div className="mobile-menu absolute right-0 mt-2 w-56 rounded-lg border bg-white shadow dark:bg-gray-800 z-50">
                {/* Theme toggle */}
                <div className="px-4 py-2 border-b">
                  <ThemeToggleButton />
                </div>

                {/* Notifications */}
                <div className="px-4 py-2 border-b">
                  <NotificationDropdown />
                </div>

                {/* Tenant switcher */}
                {tenants.length > 0 && currentTenant && (
                  <div className="px-4 py-2">
                    <div className="text-sm font-medium mb-2">Switch Tenant</div>
                    {tenants.map((tenant) => (
                      <button
                        key={tenant.tenantId}
                        onClick={() => handleTenantSwitch(tenant)}
                        disabled={tenant.tenantId === currentTenant.tenantId}
                        className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {tenant.tenantName}
                        {tenant.tenantId === currentTenant.tenantId && (
                          <span className="ml-2 text-xs text-brand-600">
                            Current
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Desktop menu */}
        <div className="hidden lg:flex items-center gap-4 px-4 py-3 lg:px-0">
          {/* Tenant Switcher */}
          {/* Desktop Tenant Switcher */}
{tenants.length > 0 && currentTenant && (
  <div className="relative tenant-switcher">
    <button
      onClick={() => setDropdownOpen(!isDropdownOpen)}
      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-gray-900 dark:text-white"
    >
      {currentTenant?.tenantLogo ? (
        <Image
          width={20}
          height={20}
          src={`${process.env.NEXT_PUBLIC_FILE_URL}${currentTenant.tenantLogo}`}
          alt={currentTenant.tenantName}
          className="rounded-full"
          unoptimized
        />
      ) : (
        <div className="h-5 w-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs">
          {currentTenant?.tenantName?.charAt(0) || "T"}
        </div>
      )}
      <span>{currentTenant?.tenantName || "Select Tenant"}</span>
    </button>

    {isDropdownOpen && (
      <div className="absolute right-0 mt-2 w-64 rounded-lg border bg-white shadow dark:bg-gray-800 z-50">
        {tenants.map((tenant) => (
          <button
            key={tenant.tenantId}
            onClick={() => handleTenantSwitch(tenant)}
            disabled={tenant.tenantId === currentTenant?.tenantId}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-900 dark:text-white ${
              tenant.tenantId === currentTenant?.tenantId
                ? "bg-brand-50 font-medium dark:bg-gray-700"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <span>{tenant.tenantName}</span>
            {tenant.tenantId === currentTenant?.tenantId && (
              <span className="ml-auto text-xs text-brand-600">
                Current
              </span>
            )}
          </button>
        ))}
      </div>
    )}
  </div>
)}

          <ThemeToggleButton />
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
