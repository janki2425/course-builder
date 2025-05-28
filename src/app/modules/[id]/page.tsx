'use client'
import React from 'react'
import { useNavbarStore } from '@/app/store/navbarStore';


const Page = () => {
    const {
        moduleTitle,
        isEditing,
        setModuleTitle,
        setIsEditing,
      } = useNavbarStore()

      const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setModuleTitle(e.target.value)
      }
  return (
    <div className='w-full h-full mx-auto'>
        <div className='flex items-center justify-center'>
        <div className={`flex items-center transition-all duration-300 ${isEditing ? 'w-auto p-2 rounded-lg border-[2px] border-gray-700' : 'w-fit'}`}>
            {isEditing ? (
                <input 
                    type="text" 
                    onChange={handleTitle}
                    value={moduleTitle}
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
                    {moduleTitle}
                </h1>
            )}
        </div>
        </div>
    </div>
  )
}

export default Page
