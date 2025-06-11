'use client'
import React, { useState, useEffect } from 'react'
import { useModuleEditStore } from '@/app/store/moduleEditStore';
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useNavbarStore } from '@/app/store/navbarStore';
import { Topic, TopicType,Module } from '@/utils/types';
import Content, { topicTypes } from '@/components/Content';

const ModulePage = () => {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const courseId = params.courseId as string;
    const moduleId = searchParams.get('module') || '';
    const topicId = searchParams.get('topic');
    
    const { courses, updateModuleTitleInCourse, updateModuleDurationInCourse, setCourse} = useNavbarStore();
    const course = courseId ? courses[courseId] : null;
    const currentModule = course?.modules?.find(mod => mod.id === moduleId);
    const moduleTitle = currentModule?.title || 'New Module';
    const moduleDuration = currentModule?.duration;

    
    const { isEditing, setIsEditing } = useModuleEditStore();
    const { isTopicEditing, setIsTopicEditing } = useModuleEditStore();
    const [inputValue, setInputValue] = useState('');
    const [isAddingTopic, setIsAddingTopic] = useState(false);
    const [editingTopicId, setEditingTopicId] = useState<number | null>(null);

    // Add click handler to close topic selector
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isAddingTopic && !target.closest('.topic-selector')) {
                setIsAddingTopic(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAddingTopic]);

    const topics = currentModule?.topics || [];

    // Set initial input value when editing starts
    useEffect(() => {
        if (isEditing) {
            setInputValue(moduleTitle);
        }
    }, [isEditing, moduleTitle]);

     // Handle case where course or module is not found
     if (!course) {
        return <div className='w-full h-full flex items-center justify-center'>Course not found</div>;
    }

    if (!currentModule) {
        return <div className='w-full h-full flex items-center justify-center'>Module not found</div>;
    }



    const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    }

    const handleSave = () => {
        if (inputValue.trim() && moduleId && courseId) {
            updateModuleTitleInCourse(courseId, moduleId as string, inputValue);
        }
        setIsEditing(false);
    }
    

    const handleTopicSelection = (topicTypeId: number) => {
        const topicType = topicTypes.find(t => t.id === topicTypeId);
        if (!topicType || !moduleId || !courseId || !currentModule) return;

        // Create new topic
        const newTopic: Topic = {
            id: (currentModule.topics?.length || 0) + 1,
            uniqueId: crypto.randomUUID(),
            title: `New ${topicType.name}`,
            type: topicType.type as TopicType,
            content: '',
            imageUrl: '',
            videoUrl: '',
            tableData: topicType.type === 'table' ? [['Header 1', 'Header 2']] : undefined,
            boxColor: topicType.type === 'information' ? ['#223C53', '#89B4DD', '#1d316a','blue'] : undefined
        };

        // Update module with new topic
        const updatedModule = {
            ...currentModule,
            topics: [...(currentModule.topics || []), newTopic] as Topic[]
        };

        // Update course with updated module
        const updatedModules = course?.modules.map((mod: Module) => 
            mod.id === (moduleId as string) ? updatedModule : mod
        );

        setCourse(courseId, {
            modules: updatedModules
        });

        // Set editing state for new topic
        setEditingTopicId(newTopic.id);
        setIsTopicEditing(true);
        setIsAddingTopic(false);
        
        // Update URL with topic ID
        const currentSearchParams = new URLSearchParams(searchParams.toString());
        currentSearchParams.set('topic', newTopic.id.toString());
        router.push(`${pathname}?${currentSearchParams.toString()}`, { scroll: false });
    };


    return (
        <div className='w-full h-auto mx-auto'>
            <div className='w-full max-w-[1280px] p-4 md:p-6 mx-auto flex flex-col items-center justify-center'>
               <div className='flex flex-col md:flex-row items-start gap-4 md:gap-0 w-full px-6'>
                    <div className={`w-full flex items-start transition-all mb-[36px] md:mb-0 duration-300 ${isEditing ? 'w-auto' : 'w-fit'}`}>
                        {isEditing ? (
                            <input 
                                type="text" 
                                onChange={handleTitle}
                                value={inputValue}
                                className='w-full max-w-[300px] text-[12px] md:text-[22px] focus:outline-none text-[#020817] py-1 px-2 rounded-lg border-[2px] border-gray-700 font-bold transition-all duration-300'
                                autoFocus
                                onBlur={handleSave}
                                onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
                            />
                        ) : (
                            <h1 
                                className='text-[14px] md:text-[22px] lg:text-[28px] text-[#020817] font-[500] hover:text-[#9b87f5] cursor-pointer transition-all duration-300'
                                onClick={() => setIsEditing(true)}
                            >
                                {moduleTitle}
                            </h1>
                        )}
                    </div>
                    <div className='w-fit flex items-center gap-2'>
                        <label htmlFor="time" className='text-[12px] md:text-[14px] text-[#020817] font-[500] mb-1'>Duration</label>
                        <input 
                        type="number" 
                        id="time"
                        name="time"
                        min={1}
                        max={100}
                        value={moduleDuration}
                        onChange={e => {
                            const val = e.target.value;
                            updateModuleDurationInCourse(courseId, moduleId, val === "" ? 0 : Number(val))
                        }}
                        className='w-[60px] text-[12px] md:text-[14px] focus:outline-none text-[#020817] py-1 px-2 rounded-md border-[1px] bg-white border-gray-300 font-bold transition-all duration-300' />
                        <p className='text-[12px] md:text-[14px] text-[#020817] font-[500] mb-1'>min</p>
                    </div>
               </div>

                    {/* display topic details */}
                    {moduleId && (
                        <Content 
                            moduleId={moduleId} 
                            topicId={topicId} 
                            isTopicEditing={isTopicEditing}
                            editingTopicId={editingTopicId}
                            setEditingTopicId={setEditingTopicId}
                        />
                    )}
            
                <div className='w-full flex items-center justify-center rounded-lg border-dashed border-[2px] border-gray-200 mt-[24px]'>
                    <button 
                    onClick={() => setIsAddingTopic(true)}
                    className='w-full flex items-center justify-between text-[12px] md:text-[18px] border-none focus:outline-none text-[#020817] p-2 rounded-lg transition-all duration-300'>
                        <div className='flex items-center justify-center gap-2'>
                            <Image src="/course/modules/add.svg" alt="add" width={16} height={16} className='opacity-50'/>
                            <span className='text-gray-400 text-[12px] md:text-[14px]'>Add New Topic</span>
                        </div>
                        <Image src="/course/modules/down-arrow.svg" alt="add" width={16} height={16} className='opacity-50'/>
                    </button>
                </div>
                {isAddingTopic && (
                    <div className='topic-selector w-full flex flex-col gap-1 items-start justify-center text-[14px] text-[#020817] font-[400] p-2 mt-2 shadow-lg rounded-lg transition-all duration-300'>
                        {topicTypes.map((topic) => (
                        <div
                            key={topic.id}
                            onClick={() => handleTopicSelection(topic.id)}
                            className={`w-full py-[2px] flex items-center gap-3 hover:bg-[#f3f3f3] p-4 rounded-sm cursor-pointer transition-all duration-300`}
                        >
                            {topics.some((t: Topic) => t.type === topic.type && t.id === editingTopicId) && (
                                <Image src="/course/modules/selected.svg" alt={topic.name} width={12} height={12} className='opacity-50'/>
                            )}
                            <p className='cursor-pointer transition-all duration-300'>{topic.name}</p>
                        </div>
                        ))}
                    </div>
                    )}
            </div>
        </div>
    )
}

export default ModulePage
