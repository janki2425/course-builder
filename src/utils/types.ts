export type CourseDetails = {
    courseId: string
    courseTitle: string
    courseDescription: string
    courseImage: string
    courseVideo: string
}

export type NavbarState = {
    title: string
    moduleTitle: string
    courses: { [courseId: string]: CourseDetails }
    isEditing: boolean
    publish: boolean
    save: string[]
    setTitle: (title: string) => void
    setModuleTitle: (moduleTitle: string) => void
    setIsEditing: (editing: boolean) => void
    togglePublish: () => void
    setSave: (save: string[]) => void
    setCourse: (courseId: string, courseData: Partial<CourseDetails>) => void
    publishCourse: () => boolean
}