import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setHapticsEnabled } from "@/lib/haptics";

interface SettingsState {
  haptics: boolean;
  notifications: boolean;
  reduceMotion: boolean;
  setHaptics: (v: boolean) => void;
  setNotifications: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      haptics: true,
      notifications: false,
      reduceMotion: false,
      setHaptics: (v) => {
        setHapticsEnabled(v);
        set({ haptics: v });
      },
      setNotifications: (v) => set({ notifications: v }),
      setReduceMotion: (v) => {
        document.documentElement.classList.toggle("reduce-motion", v);
        set({ reduceMotion: v });
      },
    }),
    {
      name: "kaster-settings",
      onRehydrateStorage: () => (state) => {
        if (state) {
          setHapticsEnabled(state.haptics);
          document.documentElement.classList.toggle("reduce-motion", state.reduceMotion);
        }
      },
    }
  )
);
