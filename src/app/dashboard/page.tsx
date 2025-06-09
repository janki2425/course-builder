'use client'

import React from "react"
import Image from "next/image"
import { useNavbarStore } from "@/app/store/navbarStore"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useMediaQuery } from "usehooks-ts"

export default function DashboardPage() {
  const courses = useNavbarStore((s) => s.courses);
  const [showCreateCourseModal, setShowCreateCourseModal] = React.useState(false);
  const { saveCourse, deleteCourse } = useNavbarStore();
  const router = useRouter();

  const [newCourseName, setNewCourseName] = React.useState('');
  const [newCourseType, setNewCourseType] = React.useState('');
  const [newCourseDescription, setNewCourseDescription] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleCreateCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCourseName.trim()) {
      toast.error('Please enter a course name.');
      return;
    }

    let courseId = 0;
    for (let i = 1; i <= 1000; i++) {
      if (courses[i] === undefined) {
        courseId = i;
        break;
      }
    }

    if (!courseId) {
      toast.error('Could not generate a unique course ID.');
      return;
    }

    const newCourse = {
      courseId: courseId.toString(),
      courseTitle: newCourseName,
      courseDescription: newCourseDescription,
      courseImage: "",
      courseVideo: "",
      modules: [], 
    };

    saveCourse(newCourse);

    setNewCourseName('');
    setNewCourseType('');
    setNewCourseDescription('');
    setShowCreateCourseModal(false);

    toast.success('Course created successfully!');
  };

  const handleCreateCourse = () => {
    setShowCreateCourseModal(true);
  }

  const handleCloseModal = () => {
    setShowCreateCourseModal(false);
  }

  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    
    <div className={`w-full bg-gray-100 mx-auto min-h-screen ${isMobile ? 'ml-[45px] max-w-[calc(100vw-45px)]' : 'ml-[220px] max-w-[calc(100vw-220px)]'}`}>
      <div className="p-4 md:p-12 transition-all duration-300">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 transition-all duration-300">
          <h2 className="text-[24px] font-[600]">Courses</h2>
          <button 
          onClick={handleCreateCourse}
          className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2 text-white px-4 py-2 rounded-sm cursor-pointer">
            <Image src="course/modules/add.svg" alt="plus" width={14} height={14} className="invert"/>
            <span className="text-[12px] font-[500]"> Create Course</span>
          </button>
        </div>
        <div className="w-full border border-gray-300 mt-8 rounded-[2px] transition-all duration-300">
          <div className="w-full flex items-center justify-end border-b border-gray-300 p-2">
            <input 
              type="search" 
              placeholder="Search by course name" 
              className="w-full max-w-[270px] px-2 py-1 text-[12px] rounded-sm border border-gray-300 focus:outline-none" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
            <div className="w-full overflow-x-auto transition-all duration-300">
              <table className="w-full min-w-[550px]">
                <thead className="w-full border-b border-gray-300">
                <tr>
                  <th className="text-[12px] font-[400] px-4 py-2 text-left">Id</th>
                  <th className="text-[12px] font-[400] px-4 py-2 text-left">Name</th>
                  <th className="text-[12px] font-[400] px-4 py-2 text-left">Description</th>
                  <th className="text-[12px] font-[400] px-4 py-2 text-left">Total Modules</th>
                  <th className="text-[12px] font-[400] px-4 py-2 text-left"></th>
                </tr>
                </thead>
                <tbody className="w-full">
                {Object.values(courses)
                    .reverse()
                    .filter(course =>
                        course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((course, idx) => (
                    <tr 
                      key={course.courseId}
                      className="cursor-pointer hover:bg-gray-200 transition-colors duration-150"
                      onClick={() => router.push(`/dashboard/courses/${course.courseId}`)}
                    >
                    <td className="text-[12px] font-[400] px-4 py-2">{course.courseId}</td>
                    <td className="text-[12px] font-[400] px-4 py-2">{course.courseTitle}</td>
                    <td className="text-[12px] font-[400] px-4 py-2">{course.courseDescription}</td>
                    <td className="text-[12px] font-[400] px-4 py-2">{course.modules ? course.modules.length : 0}</td>
                    <td className="text-[12px] font-[400] px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Image src="course/dashboard/edit.svg" alt="edit" width={14} height={14}/>
                        <Image 
                          src="course/dashboard/delete.svg" 
                          alt="delete" 
                          width={14} 
                          height={14} 
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCourse(course.courseId);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
      </div>

      {/* Create Course Modal */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className='w-full bg-white max-w-[800px] max-h-[600px] mx-auto rounded-md shadow-md px-6 py-10 overflow-y-auto transition-all duration-300'>
            <div className="flex justify-between items-center mb-4 lg:mb-8 transition-all duration-300">
               <h2 className='text-[20px] lg:text-[30px] font-[600] transition-all duration-300'>Create Course</h2>
            </div>
            
              <form className='w-full h-full' onSubmit={handleCreateCourseSubmit}>
                  <div className='w-full flex flex-col gap-2 mb-4 lg:mb-6 transition-all duration-300'>
                      <h4 className='text-[14px] lg:text-[16px] font-[500] transition-all duration-300'>Course Name</h4>
                      <input 
                      type="text" 
                      placeholder='Enter Course Name' 
                      className='w-full text-[14px] lg:text-[16px] transition-all duration-300 p-2 rounded-md border border-gray-300'
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      />
                  </div>
                  <div className='w-full flex flex-col gap-2 mb-4 lg:mb-6 transition-all duration-300'>
                      <h4 className='text-[14px] lg:text-[16px] font-[500] transition-all duration-300'>Course Type</h4>
                      <div className='w-full flex items-center gap-8'>
                          <div className='flex items-center gap-2 transition-all duration-300'>
                              <input 
                              type="radio" 
                              name="course-type" 
                              id="course-type-1"
                              value="Professional"
                              checked={newCourseType === 'Professional'}
                              onChange={(e) => setNewCourseType(e.target.value)}
                              />
                              <label htmlFor="course-type-1" className="text-[12px] lg:text-[14px]">Professional</label>
                          </div>
                          <div className='flex items-center gap-2 transition-all duration-300'>
                              <input 
                              type="radio" 
                              name="course-type" 
                              id="course-type-2"
                              value="Interview"
                              checked={newCourseType === 'Interview'}
                              onChange={(e) => setNewCourseType(e.target.value)}
                              />
                              <label htmlFor="course-type-2" className="text-[12px] lg:text-[14px]">Interview</label>
                          </div>  
                      </div>
                  </div>
                  <div className='w-full flex flex-col gap-2 mb-4 lg:mb-6 transition-all duration-300'>
                      <label htmlFor="course-description" className='className="text-[14px] lg:text-[16px] font-[500]'>Course Description</label>
                      <textarea name="course-description" id="course-description" placeholder='Enter Course Description' className='w-full h-[120px] text-[14px] lg:text-[16px] p-2 rounded-md border border-gray-300 transition-all duration-300'
                      value={newCourseDescription}
                      onChange={(e) => setNewCourseDescription(e.target.value)}
                      />
                  </div>
                  <div className='w-full flex justify-end gap-4'>
                      <button type='button' onClick={handleCloseModal} className='bg-gray-300 hover:bg-gray-400 text-[#020817] text-[14px] lg:text-[20px] font-[500] px-4 py-2 rounded-md cursor-pointer transition-all duration-300'>Cancel</button>
                      <button type='submit' className='bg-blue-500 hover:bg-blue-600 text-white text-[14px] lg:text-[20px] font-[500] px-4 py-2 rounded-md cursor-pointer transition-all duration-300'>Create</button>
                  </div>
              </form>
             
          </div>
        </div>
      )}
    </div>
  )
}
