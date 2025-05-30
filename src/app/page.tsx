'use client'
import CreateFirstModule from "@/components/CreateFirstModule"
import { useSidebarStore } from "@/app/store/sidebarStore";

export default function Home() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  // className={`transition-all duration-300 ${
  //   isCollapsed
  //     ? 'ml-[60px] max-w-[calc(100vw-60px)]'
  //     : 'ml-[220px] max-w-[calc(100vw-220px)]'
  // }`}
  return (
    <div
      
    >
      <CreateFirstModule/>
    </div>
  );
}
