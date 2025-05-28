import { create } from "zustand";

type Module = {
  id: string;
  title: string;
};

type ModulesState = {
  modules: Module[];
  addModule: (title: string) => void;
  removeModule: (id: string) => void;
  setModules: (newModules: Module[]) => void;
};

export const useModulesStore = create<ModulesState>((set) => ({
  modules: [],
  addModule: (title) =>
    set((state) => ({
      modules: [
        ...state.modules,
        { id: Date.now().toString(), title }
      ],
    })),
  removeModule: (id) =>
    set((state) => ({
      modules: state.modules.filter((mod) => mod.id !== id),
    })),
  setModules: (newModules: Module[]) => set({ modules: newModules }),
}));
