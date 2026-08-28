import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CampaignChannel = "email" | "sms" | "social" | "push" | "other";
export type CampaignStatus = "planned" | "active" | "completed";

export interface Campaign {
  id: string;
  name: string;
  channel: CampaignChannel;
  start_date: string;
  end_date: string;
  status: CampaignStatus;
  notes?: string;
}

export type CampaignInput = Omit<Campaign, "id">;

interface CampaignState {
  items: Campaign[];
  add: (input: CampaignInput) => void;
  update: (id: string, input: CampaignInput) => void;
  remove: (id: string) => void;
}

/**
 * The Laravel API has no campaign-planning tables/endpoints, so this is
 * intentionally a client-only feature persisted to localStorage — a real,
 * working planner that is just not backend-connected. Mirrors the shape of
 * src/store/wishlist-store.ts.
 */
export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (input) => {
        const campaign: Campaign = { id: crypto.randomUUID(), ...input };
        set({ items: [campaign, ...get().items] });
      },
      update: (id, input) => {
        set({
          items: get().items.map((campaign) =>
            campaign.id === id ? { ...campaign, ...input, id } : campaign
          ),
        });
      },
      remove: (id) => {
        set({ items: get().items.filter((campaign) => campaign.id !== id) });
      },
    }),
    {
      name: "royal-sl-campaigns-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
