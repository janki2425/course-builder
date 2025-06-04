import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Module = {
  id: string;
  title: string;
  duration: number;
  topics: Topic[];
}


export type TopicType = 'text' | 'image' | 'video' | 'table' | 'information';
export type Topic = {
    id: number;
    uniqueId: string;
    type: TopicType;
    title: string;
    content?: string;
    imageUrl?: string;
    videoUrl?: string;
    tableData?: string[][];
    duration?: number;
    topics?: Topic[];
};

export type Course = {
    id: string
    title: string
    modules: Module[]
}

export type CourseDetails = {
    courseId: string
    courseTitle: string
    courseDescription: string
    courseImage: string
    courseVideo: string
    modules: any[]
    isPublished?: boolean
}

export type NavbarState = {
    title: string
    moduleTitle: string
    courses: { [courseId: string]: CourseDetails }
    courseDescription: string
    isEditing: boolean
    isPublished: boolean
    publish: boolean
    save: string[]
    selectedModule: string | null
    saveCourse: (course: CourseDetails) => void
    setTitle: (title: string) => void
    setModuleTitle: (moduleTitle: string) => void
    setIsEditing: (editing: boolean) => void
    setCourseDescription: (courseDescription: string) => void
    togglePublish: () => void
    setIsPublished: (published: boolean) => void
    setSave: (save: string[]) => void
    setSelectedModule: (moduleId: string | null) => void
    setCourse: (courseId: string, courseData: Partial<CourseDetails>) => void
    deleteCourse: (courseId: string) => void
    addModuleToCourse: (courseId: string, module: Module) => void
    removeModuleFromCourse: (courseId: string, moduleId: string) => void
    updateModuleTitleInCourse: (courseId: string, moduleId: string, newTitle: string) => void
    reorderModulesInCourse: (courseId: string, orderedModules: Module[]) => void
    updateModuleDurationInCourse: (courseId: string, moduleId: string, newDuration: number) => void
    publishCourse: (course: CourseDetails) => boolean
    _hasHydrated?: boolean;
}

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
      selectedModule: null,
      setTitle: (title) => set({ title }),
      setModuleTitle: (moduleTitle) => set({ moduleTitle }),
      setIsEditing: (editing) => set({ isEditing: editing }),
      setCourseDescription: (courseDescription: string) => set({ courseDescription }),
      setIsPublished: (published) => set({ isPublished: published }),
      togglePublish: () => set((state) => ({ publish: !state.publish })),
      setSave: (save) => set({ save }),
      setSelectedModule: (moduleId: string | null) => set({ selectedModule: moduleId }),
      setCourse: (courseId: string, courseData: Partial<CourseDetails>) =>
        set((state) => ({
          courses: {
            ...state.courses,
            [courseId]: { ...state.courses[courseId], ...courseData },
          },
        })),
      deleteCourse: (courseId: string) =>
        set((state) => {
          const updatedCourses = { ...state.courses };
          delete updatedCourses[courseId];
          return { courses: updatedCourses };
        }),
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
      updateModuleTitleInCourse: (courseId: string, moduleId: string, newTitle: string) =>
        set((state) => {
          const course = state.courses[courseId];
          if (!course) return state; // Course not found

          const updatedModules = course.modules.map((mod) =>
            mod.id === moduleId ? { ...mod, title: newTitle } : mod
          );

          return {
            courses: {
              ...state.courses,
              [courseId]: { ...course, modules: updatedModules },
            },
          };
        }),
      reorderModulesInCourse: (courseId: string, orderedModules: Module[]) =>
        set((state) => {
          const course = state.courses[courseId];
          if (!course) return state; // Course not found

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
          if (!course) return state; // Course not found

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
);

