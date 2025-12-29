// app/(dashboard)/dashboard/page.tsx
"use client"; // <- Important, now this runs in the browser

import React, { useEffect, useState } from "react";
import BasicDashboard from "@/components/ecommerce/BasicDashboard";
import SuperAdminDashboard from "@/components/ecommerce/SuperAdminDashboard";
import { getRole } from "../../../lib/auth";

const DashboardPage: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userRole = getRole();
    setRole(userRole);
  }, []);

  if (!role) return <div>Loading...</div>;

  const isSuperAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

  return isSuperAdmin ? <SuperAdminDashboard /> : <BasicDashboard />;
};

export default DashboardPage;
