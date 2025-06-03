import React, { useState } from 'react'
import Image from 'next/image';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useNavbarStore } from '@/app/store/navbarStore';
import { Topic, TopicType , Module } from '@/utils/types';
import { useModuleEditStore } from '@/app/store/moduleEditStore'; 

export const topicTypes = [
    {
        id: 1,
        name: 'Text Topic',
        type: 'text',
        icon: '/course/modules/text.svg',
        selected: false
    },
    {
        id: 2,
        name: 'Image Topic',
        type: 'image',
        icon: '/course/modules/image.svg',
        selected: false
    },
    {
        id: 3,
        name: 'Video Topic',
        type: 'video',
        icon: '/course/modules/video.svg',
        selected: false
    },
    {
        id: 4,
        name: 'Table Topic',
        type: 'table',
        icon: '/course/modules/table.svg',
        selected: false
    },
    {
        id: 5,
        name: 'Information Topic',
        type: 'information',
        icon: '/course/modules/text.svg',
        selected: false
    }
]
type TableEditorProps = {
    value: string[][];
    onChange: (val: string[][]) => void;
  };
  const TableEditor: React.FC<TableEditorProps> = ({ value, onChange }) => {
    const maxColumns = 10;
    const addRow = () => onChange([...value, Array(value[0].length).fill('Cell content')]);
    const addCol = () => {
      if (value[0].length < maxColumns) {
        onChange(value.map((row, i) =>
          [...row, i === 0 ? `Header ${row.length + 1}` : 'Cell content']
        ));
      }
    };
    const updateCell = (rowIdx: number, colIdx: number, val: string) => {
      const newTable = value.map((row, r) =>
        row.map((cell, c) => (r === rowIdx && c === colIdx ? val : cell))
      );
      onChange(newTable);
    };
    return (
      <div className="mb-6">
        <table className="w-full border mb-4">
          <thead>
            <tr>
              {value[0].map((cell, idx) => (
                <th key={idx} className="px-2 py-1">{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {value.slice(1).map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="border px-2 py-1">
                    <input
                      className="w-full focus:border p-1 rounded-sm focus:outline-none"
                      placeholder='Cell content'
                      value={cell}
                      onChange={e => updateCell(rIdx + 1, cIdx, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
         </tbody>
        </table>
        <button type="button" className="mr-2 px-2 py-1 border rounded" onClick={addRow}>Add Row</button>
        <button
          type="button"
          className="px-2 py-1 border rounded"
          onClick={addCol}
          disabled={value[0].length >= maxColumns}
        >
          Add Column
          </button>
      </div>
  );
};


const Content = ({ moduleId, topicId }: { moduleId: string, topicId: string | null }) => {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const courseId = params.courseId as string;
    const { courses, updateModuleTitleInCourse, updateModuleDurationInCourse, setCourse, _hasHydrated } = useNavbarStore();
    const course = courseId ? courses[courseId] : null;
    const currentModule = course?.modules?.find(mod => mod.id === moduleId);
    const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
    const topics = currentModule.topics || [];
    const activeTopic = topics.find((t: Topic) => t.id === editingTopicId);

    const { isEditing, setIsEditing } = useModuleEditStore();
    const [inputValue, setInputValue] = useState('');
    const [isAddingTopic, setIsAddingTopic] = useState(false);
    const [isEditingTopicTitle, setIsEditingTopicTitle] = useState(false);
    const [topicTitle, setTopicTitle] = useState('');
    const [formTitle, setFormTitle] = useState('');
    const [formContent, setFormContent] = useState('');
    const [formImageUrl, setFormImageUrl] = useState('');
    const [formVideoUrl, setFormVideoUrl] = useState('');
    const [formTableData, setFormTableData] = useState([['Header 1', 'Header 2'], ['', '']]);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [deletingTopicId, setDeletingTopicId] = useState<number | null>(null);


    const openEditForm = (topic: Topic) => {
        setEditingTopicId(topic.id);
        setFormTitle(topic.title);
        setFormContent(topic.content || '');
        setFormImageUrl(topic.imageUrl || '');
        setFormVideoUrl(topic.videoUrl || '');
        setFormTableData(topic.tableData || [['Header 1', 'Header 2'], ['', '']]);
        
        // Update URL with topic ID
        const currentSearchParams = new URLSearchParams(searchParams.toString());
        currentSearchParams.set('topic', topic.id.toString());
        router.push(`${pathname}?${currentSearchParams.toString()}`);
    };

    const handleDeleteTopic = async (topicId: number) => {
        if (!moduleId || !courseId || !currentModule) return;
        setDeletingTopicId(topicId);
        try {
            await new Promise(res => setTimeout(res, 400));
            
            // Update module with topic removed
            const updatedModule = {
                ...currentModule,
                topics: (currentModule.topics || []).filter((t: Topic) => t.id !== topicId) as Topic[]
            };

            // Update course with updated module
            const updatedModules = course?.modules.map((mod: Module) => 
                mod.id === moduleId ? updatedModule : mod
            );

            setCourse(courseId, {
                modules: updatedModules
            });
        } finally {
            setDeletingTopicId(null);
            setPendingDeleteId(null);
        }
    };

    const handleUpdateTopic = (topicId: number, updates: Partial<Topic>) => {
        if (!moduleId || !courseId || !currentModule) return;

        // Update module with updated topic
        const updatedModule = {
            ...currentModule,
            topics: (currentModule.topics || []).map((t: Topic) => t.id === topicId ? { ...t, ...updates } : t) as Topic[] 
        };

        // Update course with updated module
        const updatedModules = course?.modules.map((mod: Module) => 
            mod.id === moduleId ? updatedModule : mod
        );

        setCourse(courseId, {
            modules: updatedModules
        });
    };

  return (
    <div className='w-full max-w-[870px] p-4 md:p-6 mx-auto flex flex-col items-center justify-center'>
      <div className={`relative w-full min-h-[150px] h-fit flex items-center justify-center  gap-6 rounded-lg p-2 ${topics.length > 0 ? 'border-none shadow-none' : 'border-dashed border-2 border-gray-200'}`}>
                    {topics.length > 0 ? (
                    <div className='w-full flex flex-col gap-4'>
                        {topics.map((topic: Topic) => {
                            const topicType = topicTypes.find(tt => tt.name.toLowerCase().includes(topic.type));
                            const isActive = topic.id === editingTopicId;
                            const isEditing = editingTopicId === topic.id;

                            return (
                                <React.Fragment key={topic.id}>
                                    {/* Render the form below the topic card */}
                                    {isEditing ? (
                                        <div className="w-full mt-2 bg-white p-8 rounded-lg shadow border-[1px] border-[#9c53db] text-[14px] font-[400] text-[#8a8a8a]">
                                            <label className="block mb-1">Topic Title</label>
                                            <input
                                                type="text"
                                                value={topic.title || ''}
                                                onChange={e => handleUpdateTopic(topic.id, { title: e.target.value })}
                                                className="w-full mb-2 border text-[#212223] rounded px-2 py-1"
                                            />
                                            <label className="block text-sm font-medium mb-1">Content</label>
                                            {topic.type === 'text' || topic.type === 'information' ? (
                                                <textarea
                                                placeholder='Enter text content...'
                                                    value={topic.content || ''}
                                                    onChange={e => handleUpdateTopic(topic.id, { content: e.target.value })}
                                                    className="w-full h-[130px] text-[#212223] mb-2 border rounded px-2 py-1"
                                                    rows={3}
                                                />
                                            ) : topic.type === 'image' ? (
                                                <div className="w-full flex flex-col items-center justify-center border-dashed border-2 border-gray-300 rounded-lg mb-4 relative bg-white">
                                                    <label
                                                        htmlFor={`image-upload-${topic.id}`}
                                                        className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-4"
                                                    >
                                                        {topic.imageUrl ? (
                                                            <div className="relative w-full h-auto max-h-[250px] mb-4">
                                                                <Image 
                                                                    src={topic.imageUrl} 
                                                                    alt="Preview" 
                                                                    fill
                                                                    className="object-cover rounded-lg"
                                                                />
                                                                
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <span className="text-[#6B7280] font-semibold mb-2">Image Upload</span>
                                                                <div className="px-4 py-2 bg-white border border-gray-300 rounded-md text-black font-medium hover:bg-[#f3f0fa] transition">
                                                                    Upload Image
                                                                </div>
                                                            </>
                                                        )}
                                                        <input
                                                            id={`image-upload-${topic.id}`}
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={e => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const url = URL.createObjectURL(file);
                                                                    handleUpdateTopic(topic.id, { imageUrl: url });
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                            ) : topic.type === 'video' ? (
                                                <div className="w-full h-[130px] flex flex-col items-center justify-center border-dashed mb-4 border-2 border-gray-300 rounded-lg relative bg-white">
                                                    <p className='text-[16px] text-black font-[500] opacity-60 mb-4'>Video upload or URL</p>
                                                    <div className="flex w-full h-fit items-center justify-center gap-4 px-4">
                                                    
                                                        <label
                                                            htmlFor={`video-upload-${topic.id}`}
                                                            className="flex flex-col items-center justify-center cursor-pointer"
                                                        >
                                                            <div className="w-[120px] px-4 py-2 bg-white border border-gray-300 rounded-md text-[14px] text-black font-[400] hover:bg-[#f3f0fa] transition leading-[120%]">
                                                                Upload Video
                                                            </div>
                                                            <input
                                                                id={`video-upload-${topic.id}`}
                                                                type="file"
                                                                accept="video/*"
                                                                className="hidden"
                                                                onChange={e => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        const url = URL.createObjectURL(file);
                                                                        handleUpdateTopic(topic.id, { videoUrl: url });
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="Or paste YouTube/Video URL"
                                                            value={topic.videoUrl && !topic.videoUrl.startsWith('blob:') ? topic.videoUrl : ''}
                                                            onChange={e => handleUpdateTopic(topic.id, { videoUrl: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-md text-[#212223] focus:outline-none"
                                                        />
                                                    </div>
                                                    {topic.videoUrl && (
                                                        <div className="w-full flex justify-center mt-2">
                                                            <span className="text-green-600 font-medium">
                                                                {topic.videoUrl.startsWith('blob:')
                                                                    ? 'Video uploaded'
                                                                    : topic.videoUrl}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : topic.type === 'table' ? (
                                                <TableEditor
                                                value={topic.tableData as string[][] || [['Header 1', 'Header 2'], ['', '']]}
                                                onChange={data => handleUpdateTopic(topic.id, { tableData: data })}
                                                />
                                            ) : null}
                                            <div className="flex gap-2">
                                                <button
                                                    className="px-3 py-1 rounded-md bg-white border-[1px] border-[#9b87f5] text-[14px] text-black"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        setEditingTopicId(null);
                                                        // Remove topic ID from URL
                                                        const currentSearchParams = new URLSearchParams(searchParams.toString());
                                                        currentSearchParams.delete('topic');
                                                        router.push(`${pathname}?${currentSearchParams.toString()}`);
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    className="py-2 px-4 rounded-md bg-[#9b87f5] text-white text-[14px] font-[500]"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        setEditingTopicId(null);
                                                        // Remove topic ID from URL
                                                        const currentSearchParams = new URLSearchParams(searchParams.toString());
                                                        currentSearchParams.delete('topic');
                                                        router.push(`${pathname}?${currentSearchParams.toString()}`);
                                                    }}
                                                >
                                                    Save Topic
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="relative w-full flex px-4 py-4 md:py-8 items-center justify-between shadow-lg rounded-lg"
                                            onClick={() => openEditForm(topic)}
                                        >
                                            <div className='w-full flex items-center gap-4 pr-2'>
                                                <Image src='/sidebar/drag.svg' alt='drag' width={16} height={16} className='w-[14px] h-[14px] md:w-[16px] md:h-[16px] opacity-80'/>
                                                <Image src={topicType?.icon || ''} alt={topicType?.name || ''} width={20} height={20} className='w-[16px] h-[16px] md:w-[20px] md:h-[20px] opacity-80'/>
                                                <h3 className='text-[12px] md:text-[14px] font-[500] text-[#020817] opacity-80 truncate'>
                                                    {/* {topic.title} */}
                                                    {topic.title || ''}
                                                </h3>
                                            </div>
                                            <div className='flex items-center justify-center gap-4 transition-all duration-300'>
                                                <Image
                                                    src="/sidebar/edit.svg"
                                                    alt="edit"
                                                    width={16}
                                                    height={16}
                                                    className='opacity-60 cursor-pointer w-[14px] h-[14px] md:w-[16px] md:h-[16px]'
                                                    onClick={(e)=>{
                                                        openEditForm(topic)
                                                        e.stopPropagation()
                                                    }}
                                                />
                                                <Image
                                                    src="/sidebar/delete.svg"
                                                    alt="delete"
                                                    width={16}
                                                    height={16}
                                                    className='opacity-60 cursor-pointer w-[14px] h-[14px] md:w-[16px] md:h-[16px]'
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        setPendingDeleteId(topic.id);
                                                    }}
                                                />
                                            </div>
                                            {pendingDeleteId === topic.id && (
                                                <div 
                                                    className="absolute right-0 top-10 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex flex-col items-center min-w-[200px]"
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    <span className="mb-2 text-sm text-gray-800">Delete this topic?</span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            className="px-2 text-[12px] font-[500] py-1 rounded bg-gray-100 text-gray-800"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                setPendingDeleteId(null);
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            className="px-3 text-[12px] font-[500] py-1 rounded bg-red-500 text-white"
                                                            disabled={deletingTopicId === topic.id}
                                                            onClick={async e => {
                                                                e.stopPropagation();
                                                                handleDeleteTopic(topic.id);
                                                            }}
                                                        >
                                                            {deletingTopicId === topic.id ? "Deleting..." : "Delete"}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                        
                    ) : (
                        <div className='flex flex-col items-center justify-center gap-2 text-gray-400'>
                            <h3 className='text-[14px] md:text-[16px] font-[400]'>No topics yet</h3>
                            <p className='text-[12px] md:text-[14px]'>Use the "Add New Topic" button below to create content</p>
                        </div>
                    )}
                </div>
    </div>
  )
}

export default Content
