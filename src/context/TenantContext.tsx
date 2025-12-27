"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../../lib/api";

export interface Tenant {
  tenantId: number;
  tenantName: string;
  tenantLogo: string | null;
  isDefault: number;
}

interface TenantContextType {
  tenants: Tenant[];
  currentTenant: Tenant | null;
  loading: boolean;
  switchTenant: (tenant: Tenant) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/user", { withCredentials: true });
      const data = res.data;

      const fetchedTenants: Tenant[] =
        (data.user?.default_tenant || []).map((t: any) => ({
          tenantId: t.tenantId,
          tenantName: t.tenantName,
          tenantLogo: t.tenantLogo,
          isDefault: Number(t.isDefault),
        }));

      const defaultTenant =
        fetchedTenants.find((t) => t.isDefault === 1) ||
        fetchedTenants[0] ||
        null;

      setTenants(fetchedTenants);
      setCurrentTenant(defaultTenant);

      console.log("Current tenant:", defaultTenant);

      // ← ONLY IN BROWSER
      if (typeof window !== "undefined" && defaultTenant) {
        localStorage.setItem("currentTenantId", String(defaultTenant.tenantId));
        localStorage.setItem("currentTenant", JSON.stringify(defaultTenant));
      }
    } catch (err) {
      console.error("Failed to fetch tenant data:", err);
      setTenants([]);
      setCurrentTenant(null);

      // ← ONLY IN BROWSER
      if (typeof window !== "undefined") {
        localStorage.removeItem("currentTenantId");
        localStorage.removeItem("currentTenant");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const switchTenant = async (tenant: Tenant) => {
    if (tenant.tenantId === currentTenant?.tenantId) return;

    setLoading(true);
    try {
      await api.patch(`/tenants/${tenant.tenantId}/set-default`, {});

      setCurrentTenant(tenant);
      setTenants((prev) =>
        prev.map((t) => ({
          ...t,
          isDefault: t.tenantId === tenant.tenantId ? 1 : 0,
        }))
      );

      // ← ONLY IN BROWSER
      if (typeof window !== "undefined") {
        localStorage.setItem("currentTenant", JSON.stringify(tenant));
        localStorage.setItem("currentTenantId", String(tenant.tenantId));
      }
    } catch (err) {
      console.error("Failed to switch tenant:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  return (
    <TenantContext.Provider
      value={{
        tenants,
        currentTenant,
        loading,
        switchTenant,
        refreshUserData,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used inside TenantProvider");
  return ctx;
};