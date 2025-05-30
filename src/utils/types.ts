export type Course = {
    id: string
    title: string
    modules: any[]
}

export type CourseDetails = {
    courseId: string
    courseTitle: string
    courseDescription: string
    courseImage: string
    courseVideo: string
    modules: any[]
}

export type NavbarState = {
    title: string
    moduleTitle: string
    courses: { [courseId: string]: CourseDetails }
    isEditing: boolean
    isPublished: boolean
    publish: boolean
    save: string[]
    saveCourse: (course: CourseDetails) => void
    setTitle: (title: string) => void
    setModuleTitle: (moduleTitle: string) => void
    setIsEditing: (editing: boolean) => void
    togglePublish: () => void
    setIsPublished: (published: boolean) => void
    setSave: (save: string[]) => void
    setCourse: (courseId: string, courseData: Partial<CourseDetails>) => void
    publishCourse: (course: CourseDetails) => boolean
}