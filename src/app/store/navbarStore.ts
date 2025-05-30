'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { NavbarState, Course, CourseDetails } from '@/utils/types'




export const useNavbarStore = create<NavbarState>()(
  persist(
    (set, get) => ({
      title: 'Untitled Courses',
      moduleTitle: 'New Module',
      courses: {},
      isEditing: false,
      isPublished: false,
      publish: false,
      save: [],
      setTitle: (title) => set({ title }),
      setModuleTitle: (moduleTitle) => set({ moduleTitle }),
      setIsEditing: (editing) => set({ isEditing: editing }),
      setIsPublished: (published) => set({ isPublished: published }),
      togglePublish: () => set((state) => ({ publish: !state.publish })),
      setSave: (save) => set({ save }),
      setCourse: (courseId, courseData) =>
        set((state) => ({
          courses: {
            ...state.courses,
            [courseId]: { ...state.courses[courseId], ...courseData },
          },
        })),
      publishCourse: (course: CourseDetails) => {
        if (course.courseTitle?.trim()) {
          set((state) => ({ publish: !state.publish }));
          return true;
        }
        return false;
      },
      saveCourse: (course: CourseDetails) =>
        set((state) => ({
          courses: {
            ...state.courses,
            [course.courseId]: course,
          },
        })),
      }),
    {
      name: 'navbar-storage',
      partialize: (state) => ({
        title: state.title,
        moduleTitle: state.moduleTitle,
        isEditing: state.isEditing,
        publish: state.publish,
        save: state.save,
        courses: state.courses,
      }),
    }
  )
)
