import React from 'react'
import Image from 'next/image'
import { useModulesStore } from '@/app/store/modulesStore'

const CreateFirstModule = () => {
    const addModule = useModulesStore((state) => state.addModule)
  return (
    <div className='w-full flex justify-center items-center min-h-[calc(100vh-5rem)]'>
      <div className='w-full max-w-[448px] h-full bg-transparent text-center p-[32px]'>
        <div className='flex items-center w-full h-[150px] md:h-[180px] lg:h-[256px] justify-center mb-[16px] md:mb-[24px] transition-all duration-300'>
            <Image src="/course/create-module.png" alt="create-module" width={256} height={256} 
            className='opacity-80 w-[150px] md:w-[180px] lg:w-[256px] h-full transition-all duration-300'
            />
        </div>
        <h2 className='text-[18px] md:text-[20px] lg:text-[24px] font-[700] text-[#1f2937] mb-[8px] md:mb-[12px] lg:mb-[16px] transition-all duration-300'>Create your first course module</h2>
        <p className='text-[12px] lg:text-[16px] text-[#4B5563] mb-[16px] lg:mb-[32px] transition-all duration-300'>Start building your course by creating a module in the sidebar. Add topics to each module to create a comprehensive learning experience.</p>
        <button 
        onClick={() => addModule("New Module")}
        className='w-full max-w-[160px] md:max-w-[185px] cursor-pointer mx-auto bg-[#9B87F5] md:py-[8px] md:px-[16px] py-[6px] px-[12px] rounded-md flex items-center justify-center gap-[8px] transition-all duration-300 hover:bg-[#8c7adc]'>
            <span className='text-[12px] md:text-[14px] text-white transition-all duration-300'>Create First Module</span>
            <Image src="/course/right-arrow.svg" alt="right-arrow" width={16} height={16} className='invert w-[12px] h-[12px] md:w-[16px] md:h-[16px] transition-all duration-300'/>
        </button>
      </div>
    </div>
  )
}

export default CreateFirstModule
