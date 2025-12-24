// components/sidebar/AppSidebar.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  GridIcon,
  GroupIcon,
  DocsIcon,
  PageIcon,
  UserCircleIcon,
  BoxIconLine,
  ChevronDownIcon,
  HorizontaLDots,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";

// ====== USER ROLE TYPE ======
type UserRole = "super_admin" | "admin" | "user" | null;

// ====== GET CURRENT USER ROLE (adjust based on your auth method) ======
const useUserRole = (): UserRole => {
  const [role, setRole] = useState<UserRole>(null);

  useEffect(() => {
    // Example: Get from localStorage, context, or API
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setRole(parsed.role || "user");
    }
    // Or fetch from API: api.get("/me") → setRole(res.data.role)
  }, []);

  return role;
};

// ====== MENU CONFIGURATION BASED ON ROLE ======
const getMenuItems = (role: UserRole) => {
  const baseItems = [
    {
      icon: <GridIcon />,
      name: "Dashboard",
      path: "/",
    },
    {
      icon: <DocsIcon />,
      name: "Invoices",
      path: "/invoices",
    },
    {
      icon: <PageIcon />,
      name: "Receipts",
      path: "/receipts",
    },
    {
      icon: <BoxIconLine />,
      name: "Customers",
      path: "/customers",
    },
    {
      icon: <UserCircleIcon />,
      name: "Profile",
      path: "/profile",
    },
  ];

  // Super Admin sees Tenants management
  if (role === "SUPER_ADMIN") {
    return [
      {
        icon: <GroupIcon />,
        name: "Tenants",
        path: "/tenants",
      },
      ...baseItems,
    ];
  }

  // Admin sees everything except Tenants
  if (role === "ADMIN") {
    return baseItems;
  }

  // Regular user: limited access
  if (role === "USER") {
    return [
      {
        icon: <GridIcon />,
        name: "Dashboard",
        path: "/",
      },
      {
      icon: <BoxIconLine />,
      name: "My Customers",
      path: "/customers",
    },
    {
        icon: <GroupIcon />,
        name: "My Tenants",
        path: "/tenants",
      },
      {
        icon: <DocsIcon />,
        name: "My Invoices",
        path: "/invoices",
      },
      {
        icon: <PageIcon />,
        name: "My Receipts",
        path: "/receipts",
      },
      {
        icon: <UserCircleIcon />,
        name: "Profile",
        path: "/profile",
      },
    ];
  }

  // Not logged in or unknown role
  return [];
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const userRole = useUserRole();

  const navItems: NavItem[] = getMenuItems(userRole);

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const renderMenuItems = () => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.path ? (
            <Link
              href={nav.path}
              className={`menu-item group ${
                isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
              }`}
            >
              <span
                className={`${
                  isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
            </Link>
          ) : null}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex items-center pt-5 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={250}
                height={70}
                priority
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={250}
                height={70}
                priority
              />
            </>
          ) : (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo-icon.svg"
                alt="Logo Icon"
                width={32}
                height={32}
                priority
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-icon-dark.svg"
                alt="Logo"
                width={32}
                height={32}
                priority
              />
            </>
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems()}
            </div>
          </div>
        </nav>

        {(isExpanded || isHovered || isMobileOpen) && <SidebarWidget />}
      </div>
    </aside>
  );
};

export default AppSidebar;