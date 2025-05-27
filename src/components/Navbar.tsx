'use client'
import React, { useState } from 'react'
import Image from 'next/image'
const Navbar = () => {
    const [publish, setPublish] = useState(false);
    const [save, setSave] = useState(false);
    const [title, setTitle] = useState('Untitled courses');
    const [isEditing, setIsEditing] = useState(false);

    const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    }

    const handlePublish = () => {
        setPublish(!publish);
    }
    const handleSave = () => {
        setSave(!save);
    }
  return (
    <div className='w-full h-[72px] bg-white border-b border-gray-200 mx-auto shadow-sm'>
      <div className='w-full h-full flex justify-between items-center px-4 md:px-10 transition-all duration-300'>
        <div className={`flex items-center transition-all duration-300 ${isEditing ? 'w-auto p-2 rounded-lg border-[2px] border-gray-700' : 'w-fit'}`}>
            {isEditing ? (
                <input 
                    type="text" 
                    onChange={handleTitle}
                    value={title}
                    className='w-auto text-[18px] focus:outline-none text-[#020817] font-bold transition-all duration-300'
                    autoFocus
                    onBlur={() => setIsEditing(false)}
                    onKeyDown={e => { if (e.key === 'Enter') setIsEditing(false); }}
                />
            ) : (
                <h1 
                    className='text-[18px] md:text-[24px] text-[#020817] font-bold hover:text-[#9b87f5] cursor-pointer transition-all duration-300'
                    onClick={() => setIsEditing(true)}
                >
                    {title}
                </h1>
            )}
        </div>
        <div className='flex items-center gap-2 md:gap-4 transition-all duration-300'>
            <div className='flex items-center gap-2'>
                <div className='w-[40px] h-[40px] flex items-center justify-center cursor-pointer transition-all duration-300'>
                    <Image src={'/navbar/back-arrow.svg'} alt='back-arrow' width={24} height={24} />
                </div>
                <div className='w-[40px] h-[40px] flex items-center justify-center cursor-pointer transition-all duration-300'>
                    <Image src={'/navbar/next-arrow.svg'} alt='next-arrow' width={24} height={24} />
                </div>
            </div>
            <button 
            onClick={handleSave}
            className='flex items-center justify-center gap-2 py-2 px-4 leading-none cursor-pointer text-white rounded-md bg-[#9b87f5] transition-all duration-300'>
                <Image src={'/navbar/file.svg'} alt='file' width={24} height={24} className='invert'/>
                <p className='text-[14px] font-[500] leading-none'>save course</p>
            </button>
            <div className='flex items-center gap-2'>
                <label htmlFor="publish" className='text-[14px] text-[#020817] font-[500]'>Publish</label>
                {/* i want toggle on/off button */}
                <div 
                onClick={handlePublish}
                className={`w-10 h-5 cursor-pointer rounded-full transition-all duration-300 ${publish ? 'bg-[#9b87f5]' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 ${publish ? 'translate-x-full' : 'translate-x-0'}`}></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar
