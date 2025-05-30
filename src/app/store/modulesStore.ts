import { create } from "zustand";
import { persist } from "zustand/middleware";

type Module = { id: string; title: string; duration: number; };

type ModulesState = {
  modules: Module[];
  addModule: (title: string) => void;
  removeModule: (id: string) => void;
  updateModuleTitle: (id: string, newTitle: string) => void;
  updateModuleDuration: (id: string, duration: number) => void;
  setModules: (newModules: Module[]) => void; 
};

export const useModulesStore = create<ModulesState>()(
  persist(
    (set) => ({
      modules: [],
      addModule: (title) =>
        set((state) => ({
          modules: [
            ...state.modules,
            { id: Date.now().toString(), title, duration: 15 },
          ],
        })),
      removeModule: (id) =>
        set((state) => ({
          modules: state.modules.filter((mod) => mod.id !== id),
        })),
      updateModuleTitle: (id, newTitle) =>
        set((state) => ({
          modules: state.modules.map((mod) =>
            mod.id === id ? { ...mod, title: newTitle } : mod
          ),
        })),
      updateModuleDuration: (id, duration) =>
        set((state) => ({
          modules: state.modules.map((mod) =>
            mod.id === id ? { ...mod, duration } : mod
          ),
        })),
      setModules: (newModules) => set({ modules: newModules }),
    }),
    { name: "modules-storage" }
  )
);
