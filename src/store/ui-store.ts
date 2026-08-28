import { create } from "zustand";

interface UiState {
  isMobileNavOpen: boolean;
  isCartOpen: boolean;
  isAdminSidebarCollapsed: boolean;
  setMobileNavOpen: (open: boolean) => void;
  setCartOpen: (open: boolean) => void;
  toggleAdminSidebar: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  isMobileNavOpen: false,
  isCartOpen: false,
  isAdminSidebarCollapsed: false,
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
  setCartOpen: (open) => set({ isCartOpen: open }),
  toggleAdminSidebar: () =>
    set((state) => ({ isAdminSidebarCollapsed: !state.isAdminSidebarCollapsed })),
}));
