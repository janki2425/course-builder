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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        
      </SidebarHeader>
      <SidebarContent className="mt-[72px]">
        <div className="flex w-full items-center">
          <div className="relative w-full">
            <button className="flex gap-2 items-center absolute left-1/4 top-0">
              <Image src="/sidebar/left-arrow.svg" alt="logo" width={20} height={20} />
              {
                !isCollapsed && <span className="hidden md:block text-[#374252] text-[14px] font-[500]">Back to Admin</span>
              }
            </button>
          </div>
        </div>
        <div className="relative h-full w-full">
          <SidebarTrigger className="absolute left-1/2 bottom-2 -translate-x-1/2 z-20" />
        </div>
      </SidebarContent>
      <SidebarFooter>
        
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
