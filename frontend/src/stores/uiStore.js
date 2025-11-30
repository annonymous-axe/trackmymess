/**
 * Global UI State Store (Zustand)
 * 
 * This store manages ONLY UI-related state that needs to be global:
 * - Sidebar open/close state
 * - Theme mode (light/dark)
 * - Global toast/notification visibility
 * 
 * DO NOT store business logic or server data here.
 * Use React Query for server state.
 */
import { create } from 'zustand';

/**
 * UI Store
 * Manages global UI state across the application
 */
export const useUIStore = create((set) => ({
  // ==================== Sidebar State ====================
  sidebarOpen: true,
  
  /**
   * Toggle sidebar open/close
   */
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
  
  /**
   * Set sidebar state explicitly
   * @param {boolean} open - Whether sidebar should be open
   */
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  /**
   * Close sidebar (convenience method)
   */
  closeSidebar: () => set({ sidebarOpen: false }),
  
  /**
   * Open sidebar (convenience method)
   */
  openSidebar: () => set({ sidebarOpen: true }),
  
  // ==================== Theme State ====================
  theme: 'light', // or 'dark'
  
  /**
   * Toggle between light and dark theme
   */
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
  
  /**
   * Set theme explicitly
   * @param {'light' | 'dark'} theme - Theme to set
   */
  setTheme: (theme) => set({ theme }),
  
  // ==================== Search State (Global Search Bar) ====================
  searchOpen: false,
  
  /**
   * Toggle global search open/close
   */
  toggleSearch: () => set((state) => ({ 
    searchOpen: !state.searchOpen 
  })),
  
  /**
   * Set search state explicitly
   * @param {boolean} open - Whether search should be open
   */
  setSearchOpen: (open) => set({ searchOpen: open }),
  
  // ==================== Notification State (Optional) ====================
  notificationsOpen: false,
  
  /**
   * Toggle notifications panel
   */
  toggleNotifications: () => set((state) => ({ 
    notificationsOpen: !state.notificationsOpen 
  })),
  
  /**
   * Set notifications panel state
   * @param {boolean} open - Whether notifications panel should be open
   */
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
}));

/**
 * Selectors for optimized re-renders
 * Use these in components to subscribe to specific slices of state
 */
export const selectSidebarOpen = (state) => state.sidebarOpen;
export const selectTheme = (state) => state.theme;
export const selectSearchOpen = (state) => state.searchOpen;
export const selectNotificationsOpen = (state) => state.notificationsOpen;

/**
 * Example usage in components:
 * 
 * // Subscribe to all state (will re-render on any change)
 * const { sidebarOpen, toggleSidebar } = useUIStore();
 * 
 * // Subscribe to specific state (optimized - only re-renders when that state changes)
 * const sidebarOpen = useUIStore(selectSidebarOpen);
 * const toggleSidebar = useUIStore((state) => state.toggleSidebar);
 */
