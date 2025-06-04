import { create } from 'zustand'

type ModuleEditState = {
  isEditing: boolean
  isTopicEditing:boolean
  boxColor: string
  setIsEditing: (editing: boolean) => void
  setIsTopicEditing:(editing:boolean) => void
  setBoxColor : (color:string) => void
}

export const useModuleEditStore = create<ModuleEditState>((set) => ({
  isEditing: false,
  isTopicEditing:false,
  boxColor:'',
  setIsEditing: (editing) => set({ isEditing: editing }),
  setIsTopicEditing: (editing) => set({ isTopicEditing: editing }),
  setBoxColor:(color) => set({boxColor:color})
})) 