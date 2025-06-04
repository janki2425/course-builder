import { create } from 'zustand'

type ModuleEditState = {
  isEditing: boolean
  isTopicEditing:boolean
  setIsEditing: (editing: boolean) => void
  setIsTopicEditing:(editing:boolean) => void
}

export const useModuleEditStore = create<ModuleEditState>((set) => ({
  isEditing: false,
  isTopicEditing:false,
  setIsEditing: (editing) => set({ isEditing: editing }),
  setIsTopicEditing: (editing) => set({ isTopicEditing: editing }),
})) 