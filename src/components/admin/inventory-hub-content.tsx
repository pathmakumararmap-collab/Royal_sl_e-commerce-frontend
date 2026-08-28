"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { AdjustmentsTab } from "@/components/admin/inventory-tabs/adjustments-tab";
import { DamagesTab } from "@/components/admin/inventory-tabs/damages-tab";
import { LowStockAlertsTab } from "@/components/admin/inventory-tabs/low-stock-alerts-tab";
import { MovementsTab } from "@/components/admin/inventory-tabs/movements-tab";
import { ReturnsTab } from "@/components/admin/inventory-tabs/returns-tab";
import { StockLevelsTab } from "@/components/admin/inventory-tabs/stock-levels-tab";
import { TransfersTab } from "@/components/admin/inventory-tabs/transfers-tab";

const TABS = [
  { value: "stock", label: "Stock Levels" },
  { value: "alerts", label: "Low Stock Alerts" },
  { value: "movements", label: "Movements" },
  { value: "transfers", label: "Transfers" },
  { value: "adjustments", label: "Adjustments" },
  { value: "returns", label: "Returns" },
  { value: "damages", label: "Damages" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export function InventoryHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: TabValue = TABS.some((tab) => tab.value === tabParam)
    ? (tabParam as TabValue)
    : "stock";

  function onTabChange(value: string) {
    router.push(`/admin/inventory?tab=${value}`);
  }

  return (
    <div className="animate-in-fade-up space-y-6">
      <PageHeader
        title="Inventory"
        description="Stock levels, low stock alerts, movements, transfers, adjustments, returns, and damages across all warehouses."
      />

      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="bg-card shadow-luxury-sm flex h-auto flex-wrap justify-start gap-1 rounded-xl border p-1.5">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="stock" className="mt-5">
          <StockLevelsTab />
        </TabsContent>
        <TabsContent value="alerts" className="mt-5">
          <LowStockAlertsTab />
        </TabsContent>
        <TabsContent value="movements" className="mt-5">
          <MovementsTab />
        </TabsContent>
        <TabsContent value="transfers" className="mt-5">
          <TransfersTab />
        </TabsContent>
        <TabsContent value="adjustments" className="mt-5">
          <AdjustmentsTab />
        </TabsContent>
        <TabsContent value="returns" className="mt-5">
          <ReturnsTab />
        </TabsContent>
        <TabsContent value="damages" className="mt-5">
          <DamagesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
