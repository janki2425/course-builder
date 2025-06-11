'use client'
import React,{useState} from 'react'
import Image from 'next/image'
import { useModuleEditStore } from '@/app/store/moduleEditStore';
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
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from 'next/navigation'
import { Module } from '@/app/store/Store';
import { useStore } from '@/app/store/Store';

const SortableItem = ({ mod, onRemove, courseId, updateModuleTitle }: { mod: Module, onRemove: (courseId: string | undefined, moduleId: string) => void, getModuleTopicCount: (moduleId: string) => number, courseId?: string, updateModuleTitle: (courseId: string, moduleId: string, newTitle: string) => void }) => {
  const router = useRouter()
  const { setSelectedModule } = useStore();
  const [isEditing, setIsEditingLocal] = useState(false);
  const [inputValue, setInputValue] = useState(mod.title);
  const [isHovered, setIsHovered] = useState(false);


  const handleModuleClick = (id: string) => {
    if (!isEditing) {
      if (courseId) {
        router.push(`/dashboard/courses/${courseId}?module=${id}`);
        // Set the selected module in the store
        setSelectedModule(id);
      } else {
        alert('Module navigation error: No course ID')
      }
    }
  }

  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }

  const handleSave = () => {
    if (inputValue.trim() && courseId) {
      updateModuleTitle(courseId, mod.id, inputValue);
    }
    setIsEditingLocal(false);
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full max-w-[200px] flex items-center justify-between cursor-pointer border-[1px] border-[#E5E7EB] shadow-sm rounded-lg p-2 ${isEditing ? 'bg-white' : ''}`}
    >
      {!isEditing && (
        <div
          className="w-[16px] h-[16px] cursor-grab"
          {...attributes}
          {...listeners}
        >
          <Image src="/sidebar/drag.svg" alt="drag" width={16} height={16} />
        </div>
      )}

      {isEditing ? (
        <input 
          type="text" 
          value={inputValue}
          onChange={handleTitle}
          onClick={(e) => e.stopPropagation()}
          onBlur={handleSave}
          onKeyDown={(e) => { 
            if (e.key === 'Enter') {
              handleSave();
              e.stopPropagation();
            }
          }}
          className="w-full text-center text-[12px] lg:text-[14px] font-[700] focus:outline-none border-[2px] border-gray-700 rounded-lg"
          autoFocus
        />
      ) : (
        <>
          {/* Added onClick for navigation here */}
          <span 
            className="max-w-[120px] text-left text-[12px] lg:text-[14px] font-[700] truncate cursor-pointer"
          >
            {mod.title}
          </span>

          <div className={`flex items-center gap-1 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button 
              type="button" 
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingLocal(true);
              }}
              className="w-[22px] h-[22px] cursor-pointer"
            >
              <Image src="/sidebar/edit.svg" alt="edit" width={14} height={14} />
            </button>

            <button
              type="button"
              className="w-[22px] h-[22px] cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(courseId, mod.id);
              }}
            >
              <Image src="/sidebar/delete.svg" alt="delete" width={14} height={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const SortableItemCollapsed = ({ mod, onClick }: { mod: Module, onClick: (moduleId: string) => void }) => {
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
      }}
    >
      {/* Make only this the drag handle */}
      <div {...attributes} {...listeners} className="w-full h-full" />
    </div>
  );
};

interface ModulesProps {
  isCollapsed: boolean;
  modules: Module[];
  getModuleTopicCount: (moduleId: string) => number;
  courseId?: string;
  removeModule: (courseId: string, moduleId: string) => void;
  updateModuleTitle: (courseId: string, moduleId: string, newTitle: string) => void;
  reorderModules: (courseId: string, orderedModules: Module[]) => void; 
}

const Modules = ({ isCollapsed, modules, getModuleTopicCount, courseId, removeModule, reorderModules, updateModuleTitle }: ModulesProps) => {
  const router = useRouter();
  const { setIsEditing } = useModuleEditStore();
  const { setSelectedModule } = useStore();


  const handleRemoveModule = (courseId: string | undefined, moduleId: string) => {
    if (courseId) {
      console.log("Removing module", moduleId);
      removeModule(courseId, moduleId);
    } else {
      alert('Module removal error: No course ID')
    }
    
  };

  const handleModuleClick = (id: string) => {
    if (!setIsEditing) {
      if (courseId) {
        router.push(`/dashboard/courses/${courseId}?module=${id}`);
        setSelectedModule(id);
      } else {
        alert('Module navigation error: No course ID')
      }
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over?.id);

      const newOrderedModules = arrayMove(modules, oldIndex, newIndex);

      if (courseId) {
        reorderModules(courseId, newOrderedModules);
      } else {
        alert('Module reordering error: No course ID')
      }
    }
  };

  if (isCollapsed) {
    return (
      <div className="flex flex-col gap-2 items-center justify-center mt-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
          <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            {modules.map((mod) => (
              <SortableItemCollapsed key={mod.id} mod={mod} onClick={handleModuleClick} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 pb-[50px]">
      {modules.length === 0 ? (
        <div className="flex items-center justify-center mt-4 text-center">
          <p className="text-[14px] text-gray-500">No modules yet. Click "Add Module" to get started.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
          <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2 items-center justify-center mt-4">
              {modules.map((mod) => (
                <SortableItem key={mod.id} mod={mod} onRemove={handleRemoveModule} getModuleTopicCount={getModuleTopicCount} courseId={courseId} updateModuleTitle={updateModuleTitle} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

export default Modules
