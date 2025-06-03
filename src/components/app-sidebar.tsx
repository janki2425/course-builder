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
import { useModulesStore, Module } from "@/app/store/modulesStore"
import { useSidebarStore } from "@/app/store/sidebarStore"
import { useTopicsStore } from "@/app/store/topicsStore"
import { useNavbarStore } from '@/app/store/navbarStore'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  courseId?: string; // courseId is optional
}

export function AppSidebar({
  courseId,
  ...props
}: AppSidebarProps) {
  const { state, setOpen } = useSidebar()
  const isCollapsed = state === "collapsed"
  const router = useRouter()
  const setCollapsed = useSidebarStore((s) => s.setCollapsed)
  const { courses, addModuleToCourse, removeModuleFromCourse, updateModuleTitleInCourse, reorderModulesInCourse, _hasHydrated } = useNavbarStore()

  
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    setCollapsed(isCollapsed)
  }, [isCollapsed, setCollapsed])

  useEffect(() => {
    if (isMobile) setOpen(false)
  }, [isMobile, setOpen])

  const course = courseId ? courses[courseId] : null

  const modules = courseId && course ? course.modules || [] : []


  // Wait for the store to be rehydrated and check if the current course data is available
  if (!_hasHydrated || (courseId && !course)) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>{/* Optional: add a skeleton header */}</SidebarHeader>
        <SidebarContent className="mt-[72px] p-4">
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-8 bg-gray-300 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
            <div className="h-10 bg-gray-300 rounded"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-300 rounded"></div>
              <div className="h-6 bg-gray-300 rounded"></div>
              <div className="h-6 bg-gray-300 rounded"></div>
            </div>
          </div>
        </SidebarContent>
        <SidebarFooter>{/* Optional: add a skeleton footer */}</SidebarFooter>
        <SidebarRail />
      </Sidebar>
    );
  }

  console.log('AppSidebar modules:', modules);

  const topicsByModule = courseId && course ? (course.modules || []).reduce((acc, mod) => ({...acc, [mod.id]: mod.topics || []}), {}) : {}


  const totalTopics = modules.reduce((acc, mod) => acc + (mod.topics?.length || 0), 0)
  const totalDuration = modules.reduce((acc, mod) => acc + mod.duration, 0)

  const getModuleTopicCount = (moduleId: string) => {
    const currentModule = modules.find(mod => mod.id === moduleId)
    return currentModule?.topics?.length || 0
  }

  const handleAddModule = () => {
    if (courseId) {
      const newModule: Module = { id: Date.now().toString(), title: "New Module", duration: 15, topics: [] }
      addModuleToCourse(courseId, newModule)
    }
  }


  const handleBackToDashboard = () => {
    router.push("/dashboard")
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
              onClick={handleBackToDashboard}
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
                    Back to Dashboard
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
                    <p className="text-[#111928] text-[12px] font-[700]">{totalTopics}</p>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#6B7280] text-[12px] font-[400]">Est. Duration</span>
                    <p className="text-[#111928] text-[12px] font-[700]">{totalDuration} minutes</p>
                  </div>
                </div>
                </div>
              )}
              <div className="w-full flex justify-center">
                {!isCollapsed && (
                  <button
                  type="button"
                  onClick={handleAddModule}
                  disabled={!courseId}
                  className='hidden md:flex cursor-pointer w-full bg-[#9b87f5] text-white text-[14px] font-[500] justify-center items-center gap-2 rounded-lg py-2 px-4 max-w-[200px] transition-all duration-200 hover:bg-[#8c7adc]'
                >
                  <Image src="/sidebar/add.svg" alt="add" width={20} height={20} className="invert w-[20px] h-[20px] md:w-[16px] md:h-[16px] lg:w-[20px] lg:h-[20px] transition-transform duration-200 group-hover:translate-x-[-2px]"/>
                  <span className="text-[12px] lg:text-[14px] font-[500]">Add Module</span>
                </button>
                )}
                {isCollapsed && (
                  <button
                  type="button"
                  onClick={handleAddModule}
                  disabled={!courseId}
                  className='w-full bg-[#9b87f5] cursor-pointer text-white text-[14px] font-[500] flex justify-center items-center gap-2 rounded-lg py-2 max-w-[40px]'
                >
                  <Image src="/sidebar/add.svg" alt="add" width={16} height={16} className="invert"/>
                </button>
                )}
              </div>
            </div>
            <Modules
              isCollapsed={isCollapsed}
              modules={modules}
              getModuleTopicCount={getModuleTopicCount}
              courseId={courseId}
              removeModule={removeModuleFromCourse}
              updateModuleTitle={updateModuleTitleInCourse}
              reorderModules={reorderModulesInCourse}
            />
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
