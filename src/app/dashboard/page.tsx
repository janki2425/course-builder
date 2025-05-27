"use client"
import { useSidebar } from "@/components/ui/sidebar"

export default function Page() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  
  return (
    <>
    </>
  )
}
