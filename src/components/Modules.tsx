import React from 'react'
import Image from 'next/image'
import { useModulesStore } from "@/app/store/modulesStore"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from 'next/navigation'


const SortableItem = ({ mod, onRemove }: any) => {
  const router = useRouter()
  const handleModuleClick = (id: string) => {
    router.push(`/modules/${id}`)
  }
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: mod.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => handleModuleClick(mod.id)}
      className="w-full max-w-[200px] flex items-center justify-between cursor-pointer border-[1px] border-[#E5E7EB] shadow-sm rounded-lg p-2 active:bg-[#eff6ff]"
    >
      {/* Only make this the drag handle */}
      <div
        className="w-[16px] h-[16px] cursor-grab"
        {...attributes}
        {...listeners}
      >
        <Image src="/sidebar/drag.svg" alt="drag" width={16} height={16} />
      </div>

      <span className="max-w-[30px] text-center text-[12px] lg:text-[14px] font-[700] truncate">
        {mod.title}
      </span>

      <div className="flex flex-col items-center justify-center gap-[1px]">
        <p className="text-[12px] lg:text-[14px] font-[500]">0</p>
        <span className="text-[12px] lg:text-[14px] font-[500]">Topics</span>
      </div>

      <button type="button" className="w-[22px] h-[22px]">
        <Image src="/sidebar/edit.svg" alt="edit" width={14} height={14} />
      </button>

      <button
        type="button"
        className="w-[22px] h-[22px]"
        onClick={() => onRemove(mod.id)}
      >
        <Image src="/sidebar/delete.svg" alt="delete" width={14} height={14} />
      </button>
    </div>
  );
};

const SortableItemCollapsed = ({ mod, onClick }: any) => {
  const router = useRouter()
  const handleModuleClick = (id: string) => {
    router.push(`/modules/${id}`)
  }
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: mod.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-full max-w-[47px] h-[17px] flex items-center justify-between cursor-pointer border-[1px] border-[#E5E7EB] shadow-sm rounded-lg active:bg-[#eff6ff]"
      onClick={() => {
        onClick(mod.id)
        handleModuleClick(mod.id)
      }}
    >
      {/* Make only this the drag handle */}
      <div {...attributes} {...listeners} className="w-full h-full" />
    </div>
  );
};


const Modules = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const router = useRouter()
  const modules = useModulesStore((state) => state.modules);
  const setModules = useModulesStore((state) => state.setModules);
  const removeModule = useModulesStore((state) => state.removeModule);

  const sensors = useSensors(useSensor(PointerSensor));

  
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over?.id);

      setModules(arrayMove(modules, oldIndex, newIndex));
    }
  };



  if (isCollapsed) {
    const handleModuleClick = (id: string) => {
      router.push(`/modules/${id}`);
    };
    return (
      <div className="flex flex-col gap-2 items-center justify-center mt-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            {modules.map((mod) => (
              <SortableItemCollapsed key={mod.id} mod={mod} onClick={handleModuleClick}/>
            ))}
          </SortableContext>
        </DndContext>
      </div>
    );
  }
  

  return (
    <div
    className="w-full h-full flex flex-col gap-4 pb-[50px]">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
          <div 
          
          className="flex flex-col gap-2 items-center justify-center mt-4">
            {modules.map((mod) => (
              <SortableItem key={mod.id} mod={mod} onRemove={removeModule} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default Modules
