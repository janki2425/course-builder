import { create } from 'zustand'

type ModuleEditState = {
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
}

export const useModuleEditStore = create<ModuleEditState>((set) => ({
  isEditing: false,
  setIsEditing: (editing) => set({ isEditing: editing }),
})) 