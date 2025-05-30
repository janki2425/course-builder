import { create } from "zustand";
import { persist } from 'zustand/middleware';

type Module = {
  id: string;
  title: string;
  duration: number;
};

type ModulesState = {
  modules: Module[];
  addModule: (title: string) => void;
  removeModule: (id: string) => void;
  setModules: (newModules: Module[]) => void;
  updateModuleTitle: (id: string, newTitle: string) => void;
  updateModuleDuration: (id: string, duration: number) => void;
};

export const useModulesStore = create<ModulesState>()(
  persist(
    (set, get) => ({
      modules: [],
      addModule: (title) =>
        set((state) => {
          const newModule = { 
            id: Date.now().toString(), 
            title,
            duration: 15,
          };
          return { 
            modules: [...state.modules, newModule]
          };
        }),
      removeModule: (id) =>
        set((state) => ({
          modules: state.modules.filter((mod) => mod.id !== id)
        })),
      setModules: (newModules: Module[]) => {
        set({ modules: newModules });
      },
      updateModuleTitle: (id: string, newTitle: string) => {
        set((state) => {
          const moduleExists = state.modules.some(mod => mod.id === id);
          
          if (!moduleExists) {
            return state;
          }

          const updatedModules = state.modules.map((mod) =>
            mod.id === id ? { ...mod, title: newTitle } : mod
          );
          return { modules: updatedModules };
        });
      },
      updateModuleDuration: (id, duration) => set((state) => ({
        modules: state.modules.map(mod =>
          mod.id === id ? { ...mod, duration } : mod
        )
      })),
    }),
    {
      name: 'modules-storage',
      partialize: (state) => ({ modules: state.modules })
    }
  )
);
