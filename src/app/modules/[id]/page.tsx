'use client'
import React, { useState, useEffect } from 'react'
import { useModulesStore } from '@/app/store/modulesStore';
import { useModuleEditStore } from '@/app/store/moduleEditStore';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Topic, useTopicsStore, TopicType } from '@/app/store/topicsStore';


const topicTypes = [
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
    <div className="mb-2">
      <table className="w-full border mb-2">
        <thead>
          <tr>
            {value[0].map((cell, idx) => (
              <th key={idx} className="border px-2 py-1">{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {value.slice(1).map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="border px-2 py-1">
                  <input
                    className="w-full"
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

const Page = () => {
    const params = useParams();
    const moduleId = params.id as string;
    const modules = useModulesStore((state) => state.modules);
    const updateModuleTitle = useModulesStore((state) => state.updateModuleTitle);
    const updateModuleDuration = useModulesStore((state) => state.updateModuleDuration);
    const { isEditing, setIsEditing } = useModuleEditStore();
    const [inputValue, setInputValue] = useState('');
    const [isAddingTopic, setIsAddingTopic] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
    const [isEditingTopicTitle, setIsEditingTopicTitle] = useState(false);
    const [topicTitle, setTopicTitle] = useState('');
    const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
    const [formTitle, setFormTitle] = useState('');
    const [formContent, setFormContent] = useState('');
    const [formImageUrl, setFormImageUrl] = useState('');
    const [formVideoUrl, setFormVideoUrl] = useState('');
    const [formTableData, setFormTableData] = useState([['Header 1', 'Header 2'], ['Cell content', 'Cell content']]);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [deletingTopicId, setDeletingTopicId] = useState<number | null>(null);

    const currentModule = modules.find(mod => mod.id === moduleId);
    const moduleTitle = currentModule?.title || 'New Module';
    const moduleDuration = currentModule?.duration;

    // Set initial input value when editing starts
    useEffect(() => {
        if (isEditing) {
            setInputValue(moduleTitle);
        }
    }, [isEditing, moduleTitle]);

    useEffect(() => {
        if (selectedTopic) {
            const topicName = topicTypes.find(topic => topic.id === selectedTopic)?.name || '';
            setTopicTitle(`New ${topicName}`);
            setIsEditingTopicTitle(false);
        }
    }, [selectedTopic]);

    const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    }

    const handleSave = () => {
        if (inputValue.trim() && moduleId) {
            updateModuleTitle(moduleId, inputValue);
        }
        setIsEditing(false);
    }

    const {
        topicsByModule,
        activeTopicId,
        addTopic,
        setActiveTopicId,
        updateTopic,
        deleteTopic,
    } = useTopicsStore();

    const topics = topicsByModule[moduleId] || [];
    const activeTopic = topics.find(t => t.id === activeTopicId);

    const handleTopicTitleChange = (val: string) => {
        if (activeTopic) updateTopic(moduleId, activeTopic.id, { title: val });
    };

    const handleTopicContentChange = (val: string) => {
        if (activeTopic) updateTopic(moduleId, activeTopic.id, { content: val });
    };

    const handleTopicSelection = (topicTypeId: number) => {
        const topicType = topicTypes.find(t => t.id === topicTypeId);
        if (!topicType) return;
        addTopic(moduleId, topicType.type as TopicType, topicType.name);
        // Find the new topic and open the form
        setTimeout(() => {
            const latest = useTopicsStore.getState().topicsByModule[moduleId].at(-1);
            if (latest) openEditForm(latest);
        }, 0);
        setIsAddingTopic(false);
    };

    const openEditForm = (topic: Topic) => {
        setEditingTopicId(topic.id);
        setFormTitle(topic.title);
        setFormContent(topic.content || '');
        setFormImageUrl(topic.imageUrl || '');
        setFormVideoUrl(topic.videoUrl || '');
        setFormTableData(topic.tableData || [['Header 1', 'Header 2'], ['Cell content', 'Cell content']]);
    };

    if (!currentModule) {
        return <div className='w-full h-full flex items-center justify-center'>Module not found</div>;
    }

    const totalDuration = modules.reduce((acc, mod) => acc + (mod.duration || 0), 0);

    return (
        <div className='w-full h-auto mx-auto'>
            <div className='w-full max-w-[870px] p-6 mx-auto flex flex-col items-center justify-center'>
               <div className='flex items-start gap-4 w-full'>
                <div className={`w-full flex items-start transition-all mb-[36px] duration-300 ${isEditing ? 'w-auto' : 'w-fit'}`}>
                        {isEditing ? (
                            <input 
                                type="text" 
                                onChange={handleTitle}
                                value={inputValue}
                                className='w-full max-w-[300px] text-[12px] md:text-[18px] focus:outline-none text-[#020817] py-1 px-2 rounded-lg border-[2px] border-gray-700 font-bold transition-all duration-300'
                                autoFocus
                                onBlur={handleSave}
                                onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
                            />
                        ) : (
                            <h1 
                                className='text-[14px] md:text-[20px] text-[#020817] font-[500] hover:text-[#9b87f5] cursor-pointer transition-all duration-300'
                                onClick={() => setIsEditing(true)}
                            >
                                {moduleTitle}
                            </h1>
                        )}
                    </div>
                    <div className='w-fit flex items-center gap-2 p-2'>
                        <label htmlFor="time" className='text-[14px] md:text-[14px] text-[#020817] font-[500] mb-1'>Duration</label>
                        <input 
                        type="number" 
                        id="time"
                        name="time"
                        min={1}
                        max={100}
                        value={moduleDuration}
                        onChange={e => {
                            const val = e.target.value;
                            updateModuleDuration(moduleId, val === "" ? 0 : Number(val))
                        }}
                        className='w-[60px] text-[14px] focus:outline-none text-[#020817] py-1 px-2 rounded-md border-[1px] bg-white border-gray-300 font-bold transition-all duration-300' />
                        <p className='text-[14px] md:text-[14px] text-[#020817] font-[500] mb-1'>min</p>
                    </div>
               </div>

                    {/* display topic details */}
                <div className={`relative w-full min-h-[150px] h-fit flex items-center justify-center  gap-6 rounded-lg p-2 ${activeTopic ? 'border-none shadow-none' : 'border-dashed border-2 border-gray-200'}`}>
                    {activeTopic ? (  
                    <div className='w-full flex flex-col gap-4'>
                        {topics.map(topic => {
                            const topicType = topicTypes.find(tt => tt.name.toLowerCase().includes(topic.type));
                            const isActive = topic.id === activeTopicId;
                            const isEditing = editingTopicId === topic.id;

                            return (
                                <React.Fragment key={topic.id}>
                                    {/* Render the form below the topic card */}
                                    {isEditing ? (
                                        <div className="w-full mt-2 bg-white p-8 rounded-lg shadow border-[1px] border-[#9c53db] text-[14px] font-[400] text-[#8a8a8a]">
                                            <label className="block mb-1">Topic Title</label>
                                            <input
                                                type="text"
                                                value={topic.title}
                                                onChange={e => updateTopic(moduleId, topic.id, { title: e.target.value })}
                                                className="w-full mb-2 border text-[#212223] rounded px-2 py-1"
                                            />
                                            <label className="block text-sm font-medium mb-1">Content</label>
                                            {topic.type === 'text' || topic.type === 'information' ? (
                                                <textarea
                                                placeholder='Enter text content...'
                                                    value={topic.content || ''}
                                                    onChange={e => updateTopic(moduleId, topic.id, { content: e.target.value })}
                                                    className="w-full h-[130px] text-[#212223] mb-2 border rounded px-2 py-1"
                                                    rows={3}
                                                />
                                            ) : topic.type === 'image' ? (
                                                <div className="w-full h-[130px] flex flex-col items-center justify-center border-dashed border-2 border-gray-300 rounded-lg mb-4 relative bg-white">
                                                    <label
                                                        htmlFor={`image-upload-${topic.id}`}
                                                        className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                                                    >
                                                        {topic.imageUrl ? (
                                                            <img src={topic.imageUrl} alt="Preview" className="max-h-28 object-contain" />
                                                        ) : (
                                                            <>
                                                                <span className="text-[6B7280] font-semibold mb-2">Image Upload</span>
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
                                                                    updateTopic(moduleId, topic.id, { imageUrl: url });
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
                                                                        updateTopic(moduleId, topic.id, { videoUrl: url });
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="Or paste YouTube/Video URL"
                                                            value={topic.videoUrl && !topic.videoUrl.startsWith('blob:') ? topic.videoUrl : ''}
                                                            onChange={e => updateTopic(moduleId, topic.id, { videoUrl: e.target.value })}
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
                                                    value={topic.tableData || [['Header 1', 'Header 2'], ['Cell content', 'Cell content']]}
                                                    onChange={data => updateTopic(moduleId, topic.id, { tableData: data })}
                                                />
                                            ) : null}
                                            <div className="flex gap-2">
                                                <button
                                                    className="px-3 py-1 rounded-md bg-white border-[1px] border-[#9b87f5] text-[14px] text-black"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        setEditingTopicId(null)
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    className="py-2 px-4 rounded-md bg-[#9b87f5] text-white text-[14px] font-[500]"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        setEditingTopicId(null);
                                                    }}
                                                >
                                                    Save Topic
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="relative w-full flex px-4 py-8 items-center justify-between shadow-lg rounded-lg"
                                            onClick={() => setActiveTopicId(topic.id)}
                                        >
                                            <div className='w-full flex items-center gap-4'>
                                                <Image src='/sidebar/drag.svg' alt='drag' width={16} height={16} className='opacity-80'/>
                                                <Image src={topicType?.icon || ''} alt={topicType?.name || ''} width={20} height={20} className='opacity-80'/>
                                                <h3 className='text-[14px] font-[500] text-[#020817] opacity-80'>
                                                    {topic.title}
                                                </h3>
                                            </div>
                                            <div className='flex items-center justify-center gap-4 transition-all duration-300'>
                                                <Image
                                                    src="/sidebar/edit.svg"
                                                    alt="edit"
                                                    width={16}
                                                    height={16}
                                                    className='opacity-60 cursor-pointer'
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        openEditForm(topic);
                                                    }}
                                                />
                                                <Image
                                                    src="/sidebar/delete.svg"
                                                    alt="delete"
                                                    width={16}
                                                    height={16}
                                                    className='opacity-60 cursor-pointer'
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
                                                                setDeletingTopicId(topic.id);
                                                                try {
                                                                    await new Promise(res => setTimeout(res, 400));
                                                                    deleteTopic(moduleId, topic.id);
                                                                } finally {
                                                                    setDeletingTopicId(null);
                                                                    setPendingDeleteId(null);
                                                                }
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
            
                <div className='w-full flex items-center justify-center rounded-lg border-dashed border-[2px] border-gray-200 mt-[24px]'>
                    {/* i want to display a button with a plus icon and a text "Add New Topic" */}
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
                    <div className='w-full flex flex-col gap-1 items-start justify-center text-[14px] text-[#020817] font-[400] p-2 mt-2 shadow-lg rounded-lg'>
                        {topicTypes.map((topic) => (
                        <div
                            key={topic.id}
                            onClick={() => handleTopicSelection(topic.id)}
                            className={`w-full py-[2px] flex items-center gap-3 hover:bg-[#f3f3f3] p-4 rounded-sm cursor-pointer transition-all duration-300`}
                        >
                            {topics.some(t => t.type === topic.type && t.id === activeTopicId) && (
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

export default Page
