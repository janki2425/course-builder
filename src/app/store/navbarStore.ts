'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { NavbarState } from '@/utils/types'

export const useNavbarStore = create<NavbarState>()(
  persist(
    (set, get) => ({
      title: 'Untitled courses',
      moduleTitle: 'New module',
      courses: {},
      isEditing: false,
      publish: false,
      save: [],
      setTitle: (title) => set({ title }),
      setModuleTitle: (moduleTitle) => set({ moduleTitle }),
      setIsEditing: (editing) => set({ isEditing: editing }),
      togglePublish: () => set((state) => ({ publish: !state.publish })),
      setSave: (save) => set({ save }),
      setCourse: (courseId, courseData) =>
        set((state) => ({
          courses: {
            ...state.courses,
            [courseId]: { ...state.courses[courseId], ...courseData },
          },
        })),
      publishCourse: () => {
        const courses = get().courses;
        const title = get().title;
        const course = courses[title];
        if (course?.courseTitle?.trim()) {
          set((state) => ({ publish: !state.publish }));
          return true;
        }
        return false;
      },
    }),
    {
      name: 'navbar-storage', // key in localStorage
      partialize: (state) => ({ moduleTitle: state.moduleTitle }) // only persist necessary parts
    }
  )
)
