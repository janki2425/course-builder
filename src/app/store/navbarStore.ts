'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { NavbarState, Course, CourseDetails } from '@/utils/types'
import { Module } from '@/app/store/modulesStore'




export const useNavbarStore = create<NavbarState>()(
  persist(
    (set, get) => ({
      title: 'Untitled Courses',
      moduleTitle: 'New Module',
      courses: {},
      courseDescription: 'course description',
      isEditing: false,
      isPublished: false,
      publish: false,
      save: [],
      setTitle: (title) => set({ title }),
      setModuleTitle: (moduleTitle) => set({ moduleTitle }),
      setIsEditing: (editing) => set({ isEditing: editing }),
      setCourseDescription: (courseDescription: string) => set({ courseDescription }),
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
      addModuleToCourse: (courseId: string, module: Module) =>
        set((state) => {
          const course = state.courses[courseId];
          if (!course) return state; // Course not found

          const updatedModules = [...(course.modules || []), module];

          return {
            courses: {
              ...state.courses,
              [courseId]: { ...course, modules: updatedModules },
            },
          };
        }),
      removeModuleFromCourse: (courseId: string, moduleId: string) =>
        set((state) => {
          const course = state.courses[courseId];
          if (!course) return state; // Course not found

          const updatedModules = (course.modules || []).filter(
            (mod) => mod.id !== moduleId
          );

          return {
            courses: {
              ...state.courses,
              [courseId]: { ...course, modules: updatedModules },
            },
          };
        }),
      updateModuleTitleInCourse: (courseId, moduleId, newTitle) =>
        set((state) => {
          const course = state.courses[courseId];
          if (!course) return state; // Course not found

          const updatedModules = (course.modules || []).map((mod) =>
            mod.id === moduleId ? { ...mod, title: newTitle } : mod
          );

          return {
            courses: {
              ...state.courses,
              [courseId]: { ...course, modules: updatedModules },
            },
          };
        }),
      reorderModulesInCourse: (courseId, orderedModules) =>
        set((state) => {
          const course = state.courses[courseId];
          if (!course) return state; // Course not found

          // Assuming orderedModules is the new array of modules in the desired order
          return {
            courses: {
              ...state.courses,
              [courseId]: { ...course, modules: orderedModules },
            },
          };
        }),
      updateModuleDurationInCourse: (courseId: string, moduleId: string, newDuration: number) =>
        set((state) => {
          const course = state.courses[courseId];
          if (!course) return state;

          const updatedModules = course.modules.map((mod) =>
            mod.id === moduleId ? { ...mod, duration: newDuration } : mod
          );

          return {
            courses: {
              ...state.courses,
              [courseId]: { ...course, modules: updatedModules },
            },
          };
        }),
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
