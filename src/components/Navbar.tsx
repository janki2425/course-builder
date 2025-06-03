'use client'
import React from 'react'
import Image from 'next/image'
import { useNavbarStore } from '@/app/store/navbarStore'
import { toast } from 'react-hot-toast'
import { useModulesStore } from '@/app/store/modulesStore'


const Navbar = () => {
    const {
        title,
        courseDescription,
        isEditing,
        isPublished,
        setTitle,
        setIsEditing,
        togglePublish,
        saveCourse,
        setIsPublished,
        courses
      } = useNavbarStore()

      const modules = useModulesStore((state) => state.modules)
      const [currentCourseId, setCurrentCourseId] = React.useState<string | null>(null)

      const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value)
      }

      const handlePublish = () => {
        if (!isPublished) {
          // Try to publish
          // Generate a unique course ID
          let courseId = 0;
          for (let i=1;i<=1000; i++){
            if(useNavbarStore.getState().courses[i] === undefined){
              courseId = i;
              break;
            }
          }
          if (!courseId) return;
          const course = {
            courseId: courseId ? courseId.toString() : '',
            courseTitle: title,
            courseDescription: courseDescription,
            courseImage: "image-url-or-empty-string",
            courseVideo: "video-url-or-empty-string",
            modules
          };
          const success = useNavbarStore.getState().publishCourse(course);
          if (success && title.trim() && modules.length > 0) {
            setIsPublished(true);
            toast.success(<p className='text-[16px] font-[500]'>Course published!</p>);
          } else {
            setIsPublished(false);
            toast.error(<p className='text-[16px] font-[500]'>Please enter course details before publishing.</p>);
          }
        } else {
          // Unpublish
          setIsPublished(false);
          toast('Course unpublished.', { icon: '🚫' });
        }
      }

      const handleSave = () => {
        let courseId = currentCourseId;
        if (!courseId) {
          // Try to find by title
          const existing = Object.values(courses).find(
            (c: any) => c.courseTitle === title
          );
          if (existing) {
            courseId = existing.courseId;
            setCurrentCourseId(courseId);
          }
        }
        if (!courseId) {
          // Generate a new ID only if this is a new course
          for (let i = 1; i <= 1000; i++) {
            if (courses[i] === undefined) {
              courseId = i.toString();
              setCurrentCourseId(courseId);
              break;
            }
          }
        }
        if (!courseId) return;
        const course = {
          courseId: courseId ? courseId : '',
          courseTitle: title,
          courseDescription: "Your description here",
          courseImage: "image-url-or-empty-string",
          courseVideo: "video-url-or-empty-string",
          modules
        }
        saveCourse(course)
        window.location.reload();
        toast.success(
            <div className='flex flex-col items-start justify-start gap-2'>
                <p className='text-[16px] font-[500]'>Course saved!</p>
                <p className='text-[14px] font-[400]'>All changes have been saved successfully.</p>
            </div>
            ,{
            style:{
                borderRadius: '8px',
                background: '#ffffff',
                color: '#020817',
            },
            duration: 5000,
            icon: null
        });
      }
      
  return (
    <div className='w-full sticky top-0 z-50 h-[72px] bg-white border-b border-gray-200 mx-auto shadow-sm'>
      <div className='w-full h-full flex justify-between items-center px-4 lg:px-[24px] transition-all duration-300'>
        <div className={`flex items-center transition-all duration-300 ${isEditing ? 'w-auto p-2 rounded-lg border-[2px] border-gray-700' : 'w-fit'}`}>
            {isEditing ? (
                <input 
                    type="text" 
                    onChange={handleTitle}
                    value={title}
                    className='w-full max-w-[200px] text-[12px] md:text-[18px] focus:outline-none text-[#020817] font-bold transition-all duration-300'
                    autoFocus
                    onBlur={() => setIsEditing(false)}
                    onKeyDown={e => { if (e.key === 'Enter') setIsEditing(false); }}
                />
            ) : (
                <h1 
                    className='text-[14px] md:text-[24px] text-[#020817] font-bold hover:text-[#9b87f5] cursor-pointer transition-all duration-300'
                    onClick={() => setIsEditing(true)}
                >
                    {title}
                </h1>
            )}
        </div>
        <div className='flex items-center gap-2 md:gap-4 transition-all duration-300'>
            <div className='flex items-center md:gap-2'>
                <div className='md:w-[40px] md:h-[40px] w-[24px] h-[24px] flex items-center justify-center cursor-pointer transition-all duration-300'>
                    <Image src={'/navbar/back-arrow.svg'} alt='back-arrow' width={24} height={24}  className='md:w-[24px] md:h-[24px] w-[16px] h-[16px]'/>
                </div>
                <div className='md:w-[40px] md:h-[40px] w-[24px] h-[24px] flex items-center justify-center cursor-pointer transition-all duration-300'>
                    <Image src={'/navbar/next-arrow.svg'} alt='next-arrow' width={24} height={24}  className='md:w-[24px] md:h-[24px] w-[16px] h-[16px]'/>
                </div>
            </div>
            <button 
            onClick={handleSave}
            className='flex min-w-[70px] items-center justify-center gap-1 md:gap-2 py-2 md:px-4 px-2 leading-none cursor-pointer text-white rounded-md bg-[#9b87f5] hover:bg-[#8c7adc] transition-all duration-300'>
                <Image src={'/navbar/file.svg'} alt='file' width={24} height={24} className='invert md:w-[24px] md:h-[24px] w-[16px] h-[16px]'/>
                <p className='text-[12px] md:text-[14px] font-[500] leading-none'>save course</p>
            </button>
            <div className='flex items-center gap-2'>
                <label htmlFor="publish" className='text-[12px] md:text-[14px] text-[#020817] font-[500]'>Publish</label>
                <div 
                onClick={handlePublish}
                className={`md:w-10 md:h-[24px] w-8 h-4 cursor-pointer flex items-center rounded-full transition-all duration-300 ${isPublished ? 'bg-[#9b87f5]' : 'bg-gray-300'}`}>
                    <div className={`md:w-5 md:h-5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isPublished ? 'translate-x-full' : 'translate-x-[1px]'}`}></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar
