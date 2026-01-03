"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";
import { ModalProvider } from "../../../context/ModalContext";
import { TenantProvider } from "../../context/TenantContext"; // ✅ ADD THIS

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <TenantProvider>
      <ModalProvider>
        <div className="min-h-screen xl:flex">
          {/* Sidebar and Backdrop */}
          <AppSidebar />
          <Backdrop />

          {/* Main Content Area */}
          <div
            className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
          >
            {/* Header */}
            <AppHeader />

            {/* Page Content */}
            <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-2">
              {children}
            </div>
          </div>
        </div>
      </ModalProvider>
    </TenantProvider>
  );
}
