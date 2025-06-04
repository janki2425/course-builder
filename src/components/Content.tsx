import React, { useState } from 'react'
import Image from 'next/image';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useNavbarStore } from '@/app/store/navbarStore';
import { Topic , Module } from '@/utils/types';
import { useModuleEditStore } from '@/app/store/moduleEditStore'; 
import Vimeo from '@u-wave/react-vimeo';

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

const boxColorList=[
    {
        id:1,
        color:'blue',
    },
    {
        id:2,
        color:'green',
    },
    {
        id:3,
        color:'yellow',
    },
    {
        id:4,
        color:'red',
    },
]

type TableEditorProps = {
    value: string[][];
    onChange: (val: string[][]) => void;
};

  const TableEditor: React.FC<TableEditorProps> = ({ value, onChange }) => {
    const maxColumns = 10;
    const addRow = () => onChange([...value, Array(value[0].length).fill('')]);
    const addCol = () => {
      if (value[0].length < maxColumns) {
        onChange(value.map((row, i) =>
          [...row, i === 0 ? `Header ${row.length + 1}` : '']
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
                <th key={idx} className="px-2 py-1 border">{cell}</th>
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
          className="px-2 py-1 mr-2 border rounded"
          onClick={addCol}
          disabled={value[0].length >= maxColumns}
        >
          Add Column
          </button>
          <button 
            type="button" 
            className="mr-2 px-2 py-1 border rounded text-red-400"
            onClick={() => onChange([['Header 1', 'Header 2']])}
          >
            Clear Table
          </button>
      </div>
  );
};


const Content = ({ 
    moduleId, 
    topicId,
    isTopicEditing,
    editingTopicId,
    setEditingTopicId
}: { 
    moduleId: string, 
    topicId: string | null,
    isTopicEditing: boolean,
    editingTopicId: number | null,
    setEditingTopicId: (id: number | null) => void
}) => {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const courseId = params.courseId as string;
    const { courses, setCourse } = useNavbarStore();
    const course = courseId ? courses[courseId] : null;
    const currentModule = course?.modules?.find(mod => mod.id === moduleId);
    const topics = currentModule?.topics || [];
    const activeTopic = topics.find((t: Topic) => t.id === editingTopicId);

    
    const { setIsTopicEditing } = useModuleEditStore();
    const [formTitle, setFormTitle] = useState('');
    const [formContent, setFormContent] = useState('');
    const [formImageUrl, setFormImageUrl] = useState('');
    const [formVideoUrl, setFormVideoUrl] = useState('');
    const [formTableData, setFormTableData] = useState([['Header 1', 'Header 2']]);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [deletingTopicId, setDeletingTopicId] = useState<number | null>(null);


    const openEditForm = (topic: Topic) => {
        setEditingTopicId(topic.id);
        setFormTitle(topic.title);
        setFormContent(topic.content || '');
        setFormImageUrl(topic.imageUrl || '');
        setFormVideoUrl(topic.videoUrl || '');
        setFormTableData(topic.tableData || [['Header 1', 'Header 2']]);
        
        setIsTopicEditing(true) 
        // Update URL with topic ID
        const currentSearchParams = new URLSearchParams(searchParams.toString());
        currentSearchParams.set('topic', topic.id.toString());
        router.push(`${pathname}?${currentSearchParams.toString()}`, { scroll: false });
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

    const handleSaveTopic = (topicId: number) => {
        setIsTopicEditing(false);
        setEditingTopicId(null);
        // Remove topic ID from URL
        const currentSearchParams = new URLSearchParams(searchParams.toString());
        currentSearchParams.delete('topic');
        router.push(`${pathname}?${currentSearchParams.toString()}`, { scroll: false });
    };

    const handleBoxColor = (topic: Topic, color: string) => {
        handleUpdateTopic(topic.id, { boxColor: color });
    };

  return (
    <div className='w-full max-w-[1280px] md:p-6 mx-auto flex flex-col items-center justify-center'>
      <div className={`relative w-full min-h-[150px] h-fit flex items-center justify-center  gap-6 rounded-lg p-2 ${topics.length > 0 ? 'border-none shadow-none' : 'border-dashed border-2 border-gray-200'}`}>
                    {topics.length > 0 ? (
                    <div className='w-full flex flex-col gap-4 md:gap-8'>
                        {topics.map((topic: Topic) => {
                            const isEditing = editingTopicId === topic.id;
                            return (
                                <React.Fragment key={topic.uniqueId}>
                                    {/* Render the form below the topic card */}
                                    {isEditing ? (
                                        <div className={`w-full mt-2 bg-white p-8 rounded-lg shadow border-[1px] border-[#9c53db] text-[14px] font-[400] text-[#8a8a8a]`}>
                                            {topic.type === 'text'  ? (
                                            <>
                                            <label className="block mb-1">Topic Title</label>
                                            <input
                                                type="text"
                                                value={topic.title || ''}
                                                onChange={e => handleUpdateTopic(topic.id, { title: e.target.value })}
                                                className="w-full mb-2 border text-[#212223] rounded px-2 py-1"
                                            />
                                            <label className="block text-sm font-medium mb-1">Content</label>
                                            <textarea
                                                placeholder='Enter text content...'
                                                    value={topic.content || ''}
                                                    onChange={e => handleUpdateTopic(topic.id, { content: e.target.value })}
                                                    className="w-full h-[130px] text-[#212223] mb-2 border rounded px-2 py-1"
                                                    rows={3}
                                                />
                                            </>
                                            ):topic.type === 'information' ? ( 
                                                <>
                                                <label className="block mb-1">Topic Title</label>
                                                <input
                                                    type="text"
                                                    value={topic.title || ''}
                                                    onChange={e => handleUpdateTopic(topic.id, { title: e.target.value })}
                                                    className="w-full mb-2 border text-[#212223] rounded px-2 py-1"
                                                />
                                                <div className='flex flex-col gap-1 mb-2'>
                                                    <label className='text-[#212223]'>Box Color</label>
                                                    <div className='flex gap-2'>
                                                        {boxColorList.map((colorObj,index)=>(
                                                            <div key={index}>
                                                                <div 
                                                                onClick={()=>handleBoxColor(topic, colorObj.color)}
                                                                className={`w-8 h-8 rounded-full cursor-pointer ${colorObj.color === 'blue' ? "bg-blue-600" : colorObj.color === 'green' ? 'bg-green-600' : 
                                                                colorObj.color === 'yellow' ? "bg-yellow-600" : colorObj.color === 'red' ? 'bg-red-600' : ''} border-[1px] border-black`}></div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <label className="block text-sm font-medium mb-1">Content</label>
                                                <textarea
                                                placeholder='Enter text content...'
                                                    value={topic.content || ''}
                                                    onChange={e => handleUpdateTopic(topic.id, { content: e.target.value })}
                                                    className="w-full h-[130px] text-[#212223] mb-2 border rounded px-2 py-1"
                                                    rows={3}
                                                />
                                                </>
                                             ):("")}
                                            {topic.type === 'image' ? (
                                                <div className="w-full flex flex-col items-center justify-center border-dashed border-2 border-gray-300 rounded-lg mb-4 relative bg-white">
                                                    <label
                                                        htmlFor={`image-upload-${topic.id}`}
                                                        className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                                                    >
                                                        {topic.imageUrl ? (
                                                            <div className="w-full h-[150px] md:h-[300px] lg:h-[500px] py-2 transition-all duration-300">
                                                                <Image 
                                                                    src={topic.imageUrl} 
                                                                    alt="Preview" 
                                                                    fill
                                                                    className="object-cover rounded-lg"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className='py-4 flex flex-col items-center'>
                                                                <span className="text-[#6B7280] font-semibold mb-2">Image Upload</span>
                                                                <div className="px-4 py-2 bg-white border border-gray-300 rounded-md text-black font-medium hover:bg-[#f3f0fa] transition">
                                                                    Upload Image
                                                                </div>
                                                            </div>
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
                                                                    ? 'Local video selected (temporary URL)'
                                                                    : topic.videoUrl}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : topic.type === 'table' ? (
                                                <TableEditor
                                                value={topic.tableData as string[][] || [['Header 1', 'Header 2']]}
                                                onChange={data => handleUpdateTopic(topic.id, { tableData: data })}
                                                />
                                            ) : null}
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    className="px-3 py-1 rounded-md bg-white border-[1px] border-[#9b87f5] text-[14px] text-black cursor-pointer"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        handleSaveTopic(topic.id)
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    className="py-2 px-4 rounded-md bg-[#9b87f5] text-white text-[14px] font-[500] cursor-pointer"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        handleSaveTopic(topic.id)
                                                    }}
                                                >
                                                    Save Topic
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='relative w-full h-full'>
                                            <div className='w-full flex flex-row items-center justify-between gap-2 md:gap-4'>
                                                {topic.type === 'text' ? (
                                                    <div className='flex-grow bg-gray-50 rounded-sm border border-gray-200'>
                                                        <div className='w-full whitespace-pre-wrap text-gray-700 text-[14px] md:text-[18px] font-[500] p-2 md:p-4 transition-all duration-300'>
                                                            {topic.content || ''}
                                                        </div>
                                                    </div>
                                                ) : topic.type === 'image' ? (
                                                    <div className='w-full max-w-[calc(100%-30px)] md:max-w-[calc(100%-50px)] transition-all duration-300'> {/* Increased to 50px to account for icon space */}
                                                        {topic.imageUrl ? (
                                                            <div className="w-full h-[150px] md:h-[350px] lg:h-[500px] py-2 transition-all duration-300 relative">
                                                                <Image 
                                                                    src={topic.imageUrl} 
                                                                    alt="Preview" 
                                                                    width={0}
                                                                    height={0}
                                                                    sizes="100vw"
                                                                    className="w-full h-full object-cover rounded-sm"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-[150px] md:h-[350px] lg:h-[500px] py-2 transition-all duration-300 relative bg-gray-200 rounded-sm flex items-center justify-center text-gray-500">
                                                                No Image
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : topic.type === 'video' ? (
                                                    <div className='flex-grow'>
                                                        {topic.videoUrl ? (
                                                            <div className="w-full aspect-video py-2 transition-all duration-300">
                                                                {topic.videoUrl.startsWith('blob:') ? (
                                                                    <video controls className='w-full h-full rounded-sm'>
                                                                        <source src={topic.videoUrl} type="video/mp4" /> {/* Assuming mp4 for local, adjust type if needed */}
                                                                        Your browser does not support the video tag.
                                                                    </video>
                                                                ) : (
                                                                    <Vimeo
                                                                        video={topic.videoUrl || 'video not found'}
                                                                        responsive
                                                                        autoplay={false}
                                                                        className='w-full h-full rounded-sm'
                                                                    />
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-[150px] md:h-[350px] lg:h-[500px] py-2 transition-all duration-300 relative bg-gray-200 rounded-sm flex items-center justify-center text-gray-500">
                                                                No video
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : topic.type === 'table' ? (
                                                    <div className='flex-grow bg-gray-50 p-4 rounded-sm transition-all duration-300 overflow-x-auto'>
                                                        <table className="w-full border">
                                                            <thead>
                                                                <tr>
                                                                    {topic.tableData?.[0]?.map((cell, idx) => (
                                                                        <th key={idx} className="px-2 py-1 border border-gray-300 text-center text-[14px] md:text-[18px] font-semibold text-gray-700 transition-all duration-300">
                                                                            {cell}
                                                                        </th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {topic.tableData?.slice(1)?.filter(row => row.some(cell => cell !== ''))?.map((row, rIdx) => (
                                                                    <tr key={rIdx}>
                                                                        {row.map((cell, cIdx) => (
                                                                            <td key={cIdx} className="border px-2 py-1 text-[14px] md:text-[18px] text-gray-600 transition-all duration-300">
                                                                                {cell}
                                                                            </td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : topic.type === 'information' ? (
                                                    <div className={`flex-grow ${topic.boxColor ? `bg-${topic.boxColor}-600` : 'bg-gray-50'} rounded-sm`}>
                                                        <div className={`w-full whitespace-pre-wrap text-[14px] md:text-[18px] font-[500] p-4 ${topic.boxColor ? 'text-white' : 'text-gray-700'} transition-all duration-300`}>
                                                            {topic.content || ''}
                                                        </div>
                                                    </div>
                                                ) : null}
                                                <div className='min-w-[30px] md:min-w-[50px] max-w-[50px] flex flex-col items-center justify-center gap-2 transition-all duration-300'> {/* Increased width */}
                                                    <Image src='/sidebar/drag.svg' alt='drag' width={16} height={16} className='w-[14px] h-[14px] md:w-[16px] md:h-[16px] opacity-80'/>
                                                    <Image
                                                        src="/sidebar/edit.svg"
                                                        alt="edit"
                                                        width={16}
                                                        height={16}
                                                        className='opacity-60 cursor-pointer w-[14px] h-[14px] md:w-[16px] md:h-[16px] transition-all duration-300'
                                                        onClick={(e) => {
                                                            openEditForm(topic);
                                                            e.stopPropagation();
                                                        }}
                                                    />
                                                    <Image
                                                        src="/sidebar/delete.svg"
                                                        alt="delete"
                                                        width={16}
                                                        height={16}
                                                        className='opacity-60 cursor-pointer w-[14px] h-[14px] md:w-[16px] md:h-[16px] transition-all duration-300'
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            setPendingDeleteId(topic.id);
                                                        }}
                                                    />
                                                </div>
                                                {pendingDeleteId === topic.id && (
                                                    <div 
                                                        className="absolute right-0 top-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 md:p-4 flex flex-col items-center min-w-[100px] md:min-w-[200px] transition-all duration-300"
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        <span className="mb-2 text-[12px] md:text-[14px] text-gray-800">Delete this topic?</span>
                                                        <div className="flex gap-2">
                                                            <button
                                                                className="px-2 text-[10px] md:text-[12px] font-[500] py-1 rounded bg-gray-100 text-gray-800 transition-all duration-300"
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    setPendingDeleteId(null);
                                                                }}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                className="px-3 text-[10px] md:text-[12px] font-[500] py-1 rounded bg-red-500 text-white transition-all duration-300"
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
