'use client'
import { useSidebarStore } from "@/app/store/sidebarStore";
import DashboardPage from "./dashboard/page";

export default function Home() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);


  return (
    <div>
      <DashboardPage/>
    </div>
  );
}
