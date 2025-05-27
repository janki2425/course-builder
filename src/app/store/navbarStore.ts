import { create } from 'zustand';
import { NavbarState, CourseDetails } from '@/utils/types';

export const useNavbarStore = create<NavbarState>((set ,get) => ({
    title: 'Untitled courses',
    courses: {},
    isEditing: false,
    publish: false,
    save: [],
    setTitle: (title) => set({ title }),
    setIsEditing: (editing) => set({ isEditing: editing }),
    togglePublish: () => set((state) => ({ publish: !state.publish })),
    setSave: (save) => set({ save }),
    setCourse: (courseId, courseData) => set((state) => ({
        courses: {
            ...state.courses,
            [courseId]: { ...state.courses[courseId], ...courseData }
        }
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
    
}))