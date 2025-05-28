"use client"

import * as React from "react"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useMediaQuery } from "usehooks-ts"
import Modules from "./Modules"
import { useModulesStore } from "@/app/store/modulesStore"
import { useSidebarStore } from "@/app/store/sidebarStore"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, setOpen } = useSidebar()
  const isCollapsed = state === "collapsed"
  const router = useRouter()
  const setCollapsed = useSidebarStore((s) => s.setCollapsed)
  const modules = useModulesStore((state) => state.modules)
  
  // Use your media query hook
  const isMobile = useMediaQuery("(max-width: 767px)")

  const addModule = useModulesStore((state) => state.addModule)

  // Sync Zustand state with sidebar state
  useEffect(() => {
    setCollapsed(isCollapsed)
  }, [isCollapsed, setCollapsed])

  // Force collapse on mobile
  useEffect(() => {
    if (isMobile) setOpen(false)
  }, [isMobile, setOpen])

  const handleBackToAdmin = () => {
    router.push("/admin")
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        
      </SidebarHeader>
      <SidebarContent className="mt-[72px]">
        <div className="flex w-full items-center">
          <div className="relative w-full">
            <button 
              type="button"
              onClick={handleBackToAdmin}
              className="flex gap-2 p-2 cursor-pointer items-center hover:bg-[#f2f2f2] rounded-lg mt-2 ml-2 w-fit transition-all duration-200 hover:translate-x-[-2px]"
            >
              <Image 
                src="/sidebar/left-arrow.svg" 
                alt="Back to Admin" 
                width={20} 
                height={20} 
                className="w-[20px] h-[20px] md:w-[16px] md:h-[16px] lg:w-[20px] lg:h-[20px] transition-transform duration-200 group-hover:translate-x-[-2px]"
              />
              {!isCollapsed && (
                  <span className="hidden md:block text-[#374252] text-[12px] lg:text-[14px] font-[500]">
                    Back to Admin
                  </span>
                )
              }
            </button>
            <div className="mt-2 lg:mt-4 w-full flex flex-col gap-4 justify-center items-center">
              {!isCollapsed && (
                <div className="bg-[#F2F2F2] w-full max-w-[200px] border-[1px] border-[#E5E7EB] rounded-lg p-4">
                <h3 className="text-[#6B7280] text-[14px] font-[500]">Course Statistics</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                  <div className="flex flex-col">
                    <span className="text-[#6B7280] text-[12px] font-[400]">Modules</span>
                    <p className="text-[#111928] text-[12px] font-[700]">{modules.length}</p>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#6B7280] text-[12px] font-[400]">Topics</span>
                    <p className="text-[#111928] text-[12px] font-[700]">0</p>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#6B7280] text-[12px] font-[400]">Est. Duration</span>
                    <p className="text-[#111928] text-[12px] font-[700]">0 minutes</p>
                  </div>
                </div>
                </div>
              )}
              <div className="w-full flex justify-center">
                {!isCollapsed && (
                  <button
                  type="button"
                  onClick={() => addModule("New Module")}
                  className='hidden md:flex cursor-pointer w-full bg-[#9b87f5] text-white text-[14px] font-[500] justify-center items-center gap-2 rounded-lg py-2 px-4 max-w-[200px] transition-all duration-200 hover:bg-[#8c7adc]'
                >
                  <Image src="/sidebar/add.svg" alt="add" width={20} height={20} className="invert w-[20px] h-[20px] md:w-[16px] md:h-[16px] lg:w-[20px] lg:h-[20px] transition-transform duration-200 group-hover:translate-x-[-2px]"/>
                  <span className="text-[12px] lg:text-[14px] font-[500]">Add Module</span>
                </button>
                )}
                {isCollapsed && (
                  <button
                  type="button"
                  onClick={() => addModule("New Module")}
                  className='w-full bg-[#9b87f5] cursor-pointer text-white text-[14px] font-[500] flex justify-center items-center gap-2 rounded-lg py-2 max-w-[40px]'
                >
                  <Image src="/sidebar/add.svg" alt="add" width={16} height={16} className="invert"/>
                </button>
                )}
              </div>
            </div>
            <Modules isCollapsed={isCollapsed}/>
          </div>
        </div>
        <div className="relative h-full w-full">
          <SidebarTrigger
            disabled={isMobile}
            className={`absolute left-1/2 bottom-2 -translate-x-1/2 z-20 cursor-pointer w-full max-w-[200px] ${isCollapsed ? "max-w-[30px]" : "max-w-[200px]"} hover:bg-[#f2f2f2] p-4 rounded-lg transition-all duration-200`}
          />
        </div>
      </SidebarContent>
      <SidebarFooter>
        
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
