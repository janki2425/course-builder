"use client"
import { useSidebar } from "@/components/ui/sidebar"
import Image from "next/image"
import { useNavbarStore } from "@/app/store/navbarStore"

export default function Page() {
  const { state } = useSidebar()
  const courses = useNavbarStore((s) => s.courses);

  return (
    <div className="w-full max-w-[1440px] bg-gray-100 mx-auto min-h-screen">
      <div className="p-12">
        <div className="flex justify-between items-center">
          <h2 className="text-[24px] font-[600]">Courses</h2>
          <button className="bg-blue-500 flex items-center gap-2 text-white px-4 py-2 rounded-sm">
            <Image src="course/modules/add.svg" alt="plus" width={14} height={14} className="invert"/>
            <span className="text-[12px] font-[500]"> Create Course</span>
          </button>
        </div>
        <div className="w-full border border-gray-300 py-2 mt-8 rounded-[2px]">
          <div className="w-full flex items-center justify-end border-b border-gray-300 p-2">
            <input type="search" placeholder="Search by course name" className="w-full max-w-[270px] px-2 py-1 text-[12px] rounded-sm border border-gray-300 focus:outline-none" />
          </div>
          <div className="w-full flex items-center justify-between py-2">
            <h3 className="text-[12px] font-[400] px-4">Id</h3>
            <h3 className="text-[12px] font-[400]">Name</h3>
            <h3 className="text-[12px] font-[400]">Description</h3>
            <h3 className="text-[12px] font-[400]">Total Modules</h3>
            <h3>{''}</h3>
          </div>
          {Object.values(courses).map((course, idx) => (
            <div key={course.courseId} className="w-full flex items-center justify-between py-2">
              <h3 className="text-[12px] font-[400] px-4">{idx + 1}</h3>
              <h3 className="text-[12px] font-[400]">{course.courseTitle}</h3>
              <h3 className="text-[12px] font-[400]">{course.courseDescription}</h3>
              <h3 className="text-[12px] font-[400]">{course.modules ? course.modules.length : 0}</h3>
              <h3>{''}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
