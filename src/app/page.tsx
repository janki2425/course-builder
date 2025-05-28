'use client'
import CreateModule from "@/components/CreateModule"
import { useSidebarStore } from "@/app/store/sidebarStore";

export default function Home() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  return (
    <div
      className={`transition-all duration-300 ${
        isCollapsed
          ? 'ml-[60px] max-w-[calc(100vw-60px)]'
          : 'ml-[220px] max-w-[calc(100vw-220px)]'
      }`}
    >
      <CreateModule/>
    </div>
  );
}
