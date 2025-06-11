'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Topic } from '@/utils/types'

export type Module = {
  id: string;
  title: string;
  duration: number;
  topics: Topic[];
}

export type CourseDetails = {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  courseImage: string;
  courseVideo: string;
  modules: Module[];
  isPublished?: boolean;
}

export interface NavbarState {
  // Course state
  title: string;
  courseDescription: string;
  courses: Record<string, CourseDetails>;
  
  // Module state
  moduleTitle: string;
  selectedModule: string | null;
  
  // UI state
  isEditing: boolean;
  isPublished: boolean;
  publish: boolean;
  save: any[];
  
  // Actions
  setTitle: (title: string) => void;
  setModuleTitle: (moduleTitle: string) => void;
  setIsEditing: (editing: boolean) => void;
  setCourseDescription: (courseDescription: string) => void;
  setIsPublished: (published: boolean) => void;
  togglePublish: () => void;
  setSave: (save: any[]) => void;
  setSelectedModule: (moduleId: string | null) => void;
  setCourse: (courseId: string, courseData: Partial<CourseDetails>) => void;
  addModuleToCourse: (courseId: string, module: Module) => void;
  removeModuleFromCourse: (courseId: string, moduleId: string) => void;
  updateModuleTitleInCourse: (courseId: string, moduleId: string, newTitle: string) => void;
  reorderModulesInCourse: (courseId: string, orderedModules: Module[]) => void;
  updateModuleDurationInCourse: (courseId: string, moduleId: string, newDuration: number) => void;
  publishCourse: (course: CourseDetails) => boolean;
  saveCourse: (course: CourseDetails) => void;
  deleteCourse: (courseId: string) => void;
}

export const useStore = create<NavbarState>()(
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
      selectedModule: null,
      setTitle: (title) => set({ title }),
      setModuleTitle: (moduleTitle) => set({ moduleTitle }),
      setIsEditing: (editing) => set({ isEditing: editing }),
      setCourseDescription: (courseDescription: string) => set({ courseDescription }),
      setIsPublished: (published) => set({ isPublished: published }),
      togglePublish: () => set((state) => ({ publish: !state.publish })),
      setSave: (save) => set({ save }),
      setSelectedModule: (moduleId: string | null) => set({ selectedModule: moduleId }),
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
          if (!course) return state;

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
          if (!course) return state;

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
          if (!course) return state;

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
          if (!course) return state;

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
        const state = get();
        const courseToPublish = state.courses[course.courseId];

        if (!courseToPublish || !courseToPublish.courseTitle?.trim() || (courseToPublish.modules || []).length === 0) {
          return false;
        }

        const updatedCourse = {
          ...courseToPublish,
          isPublished: !courseToPublish.isPublished
        };

        const updatedCourses = {
          ...state.courses,
          [course.courseId]: updatedCourse,
        };
        localStorage.setItem('course-storage', JSON.stringify({ state: { courses: updatedCourses } }));
        
        set({ courses: updatedCourses });
        return true;
      },
      saveCourse: (course: CourseDetails) =>
        set((state) => ({
          courses: {
            ...state.courses,
            [course.courseId]: course,
          },
        })),
      deleteCourse: (courseId: string) => {
        set((state) => {
          const updatedCourses = { ...state.courses };
          delete updatedCourses[courseId];
          localStorage.setItem('course-storage', JSON.stringify({ state: { courses: updatedCourses } }));
          return { courses: updatedCourses };
        });
      },
    }),
    {
      name: 'course-storage',
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