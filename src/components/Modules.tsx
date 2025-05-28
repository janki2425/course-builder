import React from 'react'
import Image from 'next/image'
import { useModulesStore } from "@/app/store/modulesStore"

const Modules = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const modules = useModulesStore((state) => state.modules);
  const removeModule = useModulesStore((state) => state.removeModule);

  return (
    <div className='w-full h-full flex flex-col gap-4'>
      {!isCollapsed && (
        <div className="flex flex-col gap-2 items-center justify-center mt-4">
          {modules.map((mod) => (
            <div key={mod.id} className="w-full max-w-[200px] flex items-center justify-between cursor-pointer border-[1px] border-[#E5E7EB] shadow-sm rounded-lg p-2 active:bg-[#eff6ff]">
              <div className="w-[16px] h-[16px] cursor-grab"><Image src="/sidebar/drag.svg" alt="drag" width={16} height={16}/></div>
              <span className="max-w-[30px] text-center text-[12px] lg:text-[14px] font-[700] truncate">{mod.title}</span>
              <div className="flex flex-col items-center justify-center gap-[1px]">
                <p className="text-[12px] lg:text-[14px] font-[500]">0</p>
                <span className="text-[12px] lg:text-[14px] font-[500]">Topics</span>
              </div>
              <button type="button" className="w-[22px] h-[22px]">
                <Image src="/sidebar/edit.svg" alt="edit" width={14} height={14}/>
                </button>
              <button type="button" className="w-[22px] h-[22px]" onClick={() => removeModule(mod.id)}>
                <Image src="/sidebar/delete.svg" alt="delete" width={14} height={14}/>
              </button>
            </div>
          ))}
        </div>
      )}
      {isCollapsed && (
        <div className="flex flex-col gap-2 items-center justify-center mt-4">
          {modules.map((mod) => (
            <div
             key={mod.id}
             className="w-full max-w-[47px] h-[17px] flex items-center justify-between cursor-pointer border-[1px] border-[#E5E7EB] shadow-sm rounded-lg active:bg-[#eff6ff]"></div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Modules
