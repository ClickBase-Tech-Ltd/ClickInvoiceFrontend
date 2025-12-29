// components/sidebar/AppSidebar.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import Icon from "@/components/Icons";
import {
  GridIcon,
  GroupIcon,
  DocsIcon,
  PageIcon,
  UserCircleIcon,
  BoxIconLine,
  ChevronDownIcon,
  HorizontaLDots,
  BoltIcon,
  PlugInIcon,
  ChatIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { CogIcon } from "@heroicons/react/24/outline";

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
      icon: <Icon src={GridIcon} />,
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      // icon: <DocsIcon />,
      icon: <Icon src={DocsIcon} />,
      name: "Invoices",
      path: "/dashboard/invoices",
    },
    {
      // icon: <PageIcon />,
      icon: <Icon src={PageIcon} />,
      name: "Receipts",
      path: "/dashboard/receipts",
    },
    {
      // icon: <BoxIconLine />,
      icon: <Icon src={BoxIconLine} />,
      name: "Customers",
      path: "/dashboard/customers",
    },
    {
      // icon: <UserCircleIcon />,
      icon: <Icon src={UserCircleIcon} />,
      name: "Profile",
      path: "/dashboard/profile",
    },
  ];

  // Super Admin sees Tenants management
  if (role === "SUPER_ADMIN") {
    return [
      {
        // icon: <GroupIcon />,
        icon: <Icon src={GroupIcon} />,
        name: "Businesses",
        path: "/dashboard/tenants",
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
        // icon: <GridIcon />,
        icon: <Icon src={GridIcon} />,
        name: "Dashboard",
        path: "/dashboard",
      },
      {
      // icon: <BoxIconLine />,
      icon: <Icon src={BoxIconLine} />,
      name: "My Customers",
      path: "/dashboard/customers",
    },
    {
        // icon: <GroupIcon />,
        icon: <Icon src={GroupIcon} />,
        name: "My Businesses",
        path: "/dashboard/tenants",
      },
      {
        // icon: <DocsIcon />,
        icon: <Icon src={DocsIcon} />,
        name: "My Invoices",
        path: "/dashboard/invoices",
      },
      {
        // icon: <PageIcon />,
        icon: <Icon src={PageIcon} />,
        name: "My Receipts",
        path: "/dashboard/receipts",
      },
      {
        // icon: <UserCircleIcon />,
        icon: <Icon src={UserCircleIcon} />,
        name: "Profile",
        path: "/dashboard/profile",
      },
      {
        // icon: <UserCircleIcon />,
        icon: <Icon src={PlugInIcon} />,
        name: "Settings",
        path: "/dashboard/profile",
      },

      {
        // icon: <UserCircleIcon />,
        icon: <Icon src={ChatIcon} />,
        name: "Support",
        path: "/dashboard/support",
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

  // const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const isActive = useCallback(
  (path: string) => {
    // Dashboard should only be active on exact match
    if (path === "/dashboard") {
      return pathname === "/dashboard/";
    }

    // Other routes can match subpaths
    return pathname === path || pathname.startsWith(path + "/");
  },
  [pathname]
);


  const renderMenuItems = () => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.path ? (
  <Link
  href={nav.path}
  className={`menu-item group transition-colors
    ${
      isActive(nav.path)
        ? "bg-[#0A66C2] text-white"
        : "menu-item-inactive hover:bg-[#0A66C2] hover:text-white"
    }
  `}
>

<span
  className={`transition-colors ${
    isActive(nav.path)
      ? "invert brightness-0"
      : "group-hover:invert group-hover:brightness-0"
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
      <div className="hidden lg:block py-8 flex items-center pt-5">
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
                  // <HorizontaLDots />
                  <Icon src={HorizontaLDots} />

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