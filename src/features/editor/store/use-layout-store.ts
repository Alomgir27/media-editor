  import { ILayoutState } from "../interfaces/layout";
  import { create } from "zustand";

const useLayoutStore = create<ILayoutState>((set) => ({
  activeMenuItem: "audios",
  showMenuItem: true,
  cropTarget: null,
  showControlItem: false,
  showToolboxItem: false,
  activeToolboxItem: null,
  floatingControl: null,
  // Audio mode controls - default to English mode
  activeAudioMode: "english",
  instrumentsEnabled: true,
  setCropTarget: (cropTarget) => set({ cropTarget }),
  setActiveMenuItem: (showMenu) => set({ activeMenuItem: showMenu }),
  setShowMenuItem: (showMenuItem) => set({ showMenuItem }),
  setShowControlItem: (showControlItem) => set({ showControlItem }),
  setShowToolboxItem: (showToolboxItem) => set({ showToolboxItem }),
  setActiveToolboxItem: (activeToolboxItem) => set({ activeToolboxItem }),
  setFloatingControl: (floatingControl) => set({ floatingControl }),
  trackItem: null,
  setTrackItem: (trackItem) => set({ trackItem }),
  isControlPanelCollapsed: true, // Default collapsed
  setIsControlPanelCollapsed: (collapsed: boolean) =>
    set({ isControlPanelCollapsed: collapsed }),
  // Audio mode actions
  setActiveAudioMode: (mode) => set({ activeAudioMode: mode }),
  setInstrumentsEnabled: (enabled) => set({ instrumentsEnabled: enabled }),
}));

export default useLayoutStore;
