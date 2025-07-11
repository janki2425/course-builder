import React, { useRef , useState, useEffect, useMemo, } from 'react'
import Image from 'next/image';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/app/store/Store';
import { Topic, Quiz } from '@/utils/types';
import { Module } from '@/app/store/Store';
import { useModuleEditStore } from '@/app/store/moduleEditStore'; 
import Vimeo from '@u-wave/react-vimeo';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from "@dnd-kit/utilities";
import TopicTable from './TopicTable';
import { toast } from 'react-hot-toast';

export const topicTypes = [
    {
        id: 1,
        name: 'Text Topic',
        type: 'text',
        // icon: '/course/modules/text.svg',
        selected: false
    },
    {
        id: 2,
        name: 'Image Topic',
        type: 'image',
        // icon: '/course/modules/image.svg',
        selected: false
    },
    {
        id: 3,
        name: 'Video Topic',
        type: 'video',
        // icon: '/course/modules/video.svg',
        selected: false
    },
    {
        id: 4,
        name: 'Table Topic',
        type: 'table',
        // icon: '/course/modules/table.svg',
        selected: false
    },
    {
        id: 5,
        name: 'Information Topic',
        type: 'information',
        // icon: '/course/modules/text.svg',
        selected: false
    },
    {
        id: 6,
        name:'file Topic',
        type:'file',
        // icon:'/course/modules/file.svg',
        selected: false
    },
    {
        id: 7,
        name:'quiz Topic',
        type:'quiz',
        // icon:'/course/module/quiz.svg',
        selected: false
    }
]


interface SortableTopicProps {
    topic: Topic;
    isEditing: boolean;
    editingTopicId: number | null;
    setEditingTopicId: (id: number | null) => void;
    handleUpdateTopic: (topicId: number, updates: Partial<Topic>) => void;
    handleDeleteTopic: (topicId: number) => Promise<void>;
    deleteId: number | null;
    setDeleteId: (id: number | null) => void;
    deletingTopicId: number | null;
    handleBoxColor: (topic: Topic, color: string) => void;
    formTitle: string;
    setFormTitle: (title: string) => void;
    formContent: string;
    setFormContent: (content: string) => void;
    formImageUrl: string;
    setFormImageUrl: (url: string) => void;
    formVideoUrl: string;
    setFormVideoUrl: (url: string) => void;
    formFileUrl: string;
    setFormFileUrl: (url: string) => void;
    formTableData: string[][];
    setFormTableData: (data: string[][]) => void;
    formQuizData: Quiz;
    setFormQuizData: (data: Quiz | ((prev: Quiz) => Quiz)) => void;
    handleSaveTopic: (topicId: number) => void;
    editingQuestionId: string | null;
    setEditingQuestionId: (id: string | null) => void;
    deletingQuestionId: string | null;
    setDeletingQuestionId: (id: string | null) => void;
}

const SortableTopic: React.FC<SortableTopicProps> = ({
    topic,
    isEditing,
    setEditingTopicId,
    handleDeleteTopic,
    deleteId,
    setDeleteId,
    deletingTopicId,
    handleBoxColor,
    formTitle,
    setFormTitle,
    formContent,
    setFormContent,
    formImageUrl,
    setFormImageUrl,
    formVideoUrl,
    setFormVideoUrl,
    formFileUrl,
    setFormFileUrl,
    formTableData,
    setFormTableData,
    formQuizData,
    setFormQuizData,
    handleSaveTopic,
    handleUpdateTopic,
    editingQuestionId,
    setEditingQuestionId,
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: topic.id });

    const contentRef = useRef<HTMLDivElement>(null);

    console.log(`SortableTopic rendering boxColor for topic ${topic.id}:`, topic.boxColor);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1, // Make the original item transparent when dragging
        boxShadow: isDragging ? '0px 5px 10px rgba(0, 0, 0, 0.1)' : 'none',
        width: '100%',
        flexShrink: 0,
        flexGrow: 0,
        position: 'relative' as const,
        zIndex: isDragging ? 1 : 'auto',
    };

    const boxColorList = [
        { id: 1, color: 'blue' },
        { id: 2, color: 'green' },
        { id: 3, color: 'yellow' },
        { id: 4, color: 'red' },
    ];

    return (
        <div
            ref={setNodeRef} 
            style={style}
            className={`relative w-full ${isDragging ? 'dragging-topic' : ''}`}
        >
            <div ref={contentRef}>
            {isEditing ? (
                <div className={`w-full mt-2 bg-white p-4 md:p-8 rounded-lg shadow border-[1px] border-[#9c53db] text-[14px] font-[400] text-[#313131]`}>
                    {topic.type === 'text' ? (
                        <>
                            <label className="block text-sm font-medium mb-1">Content</label>
                            <textarea
                                placeholder='Enter text content...'
                                value={formContent}
                                onChange={e => setFormContent(e.target.value)}
                                className="w-full h-[130px] text-[#212223] mb-2 border rounded px-2 py-1"
                                rows={3}
                                onClick={e => e.stopPropagation()}
                                onKeyDown={e => e.stopPropagation()}
                            />
                        </>
                    ) : topic.type === 'information' ? (
                        <>
                            <label className="block mb-1">Topic Title</label>
                            <input
                                type="text"
                                value={formTitle}
                                onChange={e => setFormTitle(e.target.value)}
                                className="w-full mb-2 border text-[#212223] rounded px-2 py-1"
                                onClick={e => e.stopPropagation()}
                                onKeyDown={e => e.stopPropagation()}
                            />
                            <div className='flex flex-col gap-1 mb-2'>
                                <label className='text-[#212223]'>Box Color</label>
                                <div className='flex gap-2'>
                                    {boxColorList.map((colorObj, index) => (
                                        <div key={index}>
                                            <div
                                                onClick={e => { e.stopPropagation(); handleBoxColor(topic, colorObj.color); }}
                                                className={`w-8 h-8 rounded-full cursor-pointer ${colorObj.color === 'blue' ? "bg-blue-600" : colorObj.color === 'green' ? 'bg-green-600' : colorObj.color === 'yellow' ? "bg-yellow-600" : colorObj.color === 'red' ? 'bg-red-600' : ''} border-[1px] border-black`}
                                            ></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <label className="block text-sm font-medium mb-1">Content</label>
                            <textarea
                                placeholder='Enter text content...'
                                value={formContent}
                                onChange={e => setFormContent(e.target.value)}
                                className="w-full h-[130px] text-[#212223] mb-2 border rounded px-2 py-1"
                                rows={3}
                                onClick={e => e.stopPropagation()}
                                onKeyDown={e => e.stopPropagation()}
                            />
                        </>
                    ) : ('')}
                    {topic.type === 'image' ? (
                        <div className="w-full flex flex-col items-center justify-center border-dashed border-2 border-gray-300 rounded-lg mb-4 relative bg-white">
                            <label
                                htmlFor={`image-upload-${topic.id}`}
                                className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                                onClick={e => e.stopPropagation()}
                            >
                                {formImageUrl ? (
                                    <div className="w-full h-[150px] md:h-[300px] lg:h-[500px] py-2 transition-all duration-300">
                                        <Image
                                            src={formImageUrl}
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
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormImageUrl(reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    onClick={e => e.stopPropagation()}
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
                                    onClick={e => e.stopPropagation()}
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
                                                setFormVideoUrl(url);
                                            }
                                        }}
                                        onClick={e => e.stopPropagation()}
                                    />
                                </label>
                                <input
                                    type="text"
                                    placeholder="Or paste YouTube/Video URL"
                                    value={formVideoUrl && !formVideoUrl.startsWith('blob:') ? formVideoUrl : ''}
                                    onChange={e => setFormVideoUrl(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-[#212223] focus:outline-none"
                                    onClick={e => e.stopPropagation()}
                                    onKeyDown={e => e.stopPropagation()}
                                />
                            </div>
                            {formVideoUrl && (
                                <div className="w-full flex justify-center mt-2">
                                    <span className="text-green-600 font-medium">
                                        {formVideoUrl.startsWith('blob:')
                                            ? 'Local video selected (temporary URL)'
                                            : formVideoUrl}
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : topic.type === 'table' ? (
                        <TopicTable
                            value={formTableData}
                            onChange={setFormTableData}
                        />
                    ) : topic.type === 'file' ? (
                        <div className="w-full flex flex-col items-center justify-center border-dashed border-2 border-gray-300 rounded-lg mb-4 relative bg-white">
                            <label
                                htmlFor={`file-upload-${topic.id}`}
                                className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                                onClick={e => e.stopPropagation()}
                            >
                                {formFileUrl ? (
                                    <div className="w-full h-[100px] md:h-[150px] lg:h-[200px] py-2 flex flex-col items-center justify-center bg-gray-100 rounded-lg">
                                        <Image src="/course/modules/file.svg" alt="File icon" width={48} height={48} className="mb-2"/>
                                        <span className="text-center text-gray-700">File Selected</span>
                                    </div>
                                ) : (
                                    <div className='py-4 flex flex-col items-center'>
                                        <span className="text-[#6B7280] font-semibold mb-2">File Upload</span>
                                        <div className="px-4 py-2 bg-white border border-gray-300 rounded-md text-black font-medium hover:bg-[#f3f0fa] transition">
                                            Upload File
                                        </div>
                                    </div>
                                )}
                                <input
                                    id={`file-upload-${topic.id}`}
                                    type="file"
                                    accept="*/*"
                                    className="hidden"
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
                                            if (file.size > MAX_FILE_SIZE) {
                                                console.warn(`File is too large! Maximum allowed size is ${MAX_FILE_SIZE / (1024 * 1024)} MB.`);
                                                alert(`File is too large! Maximum allowed size is ${MAX_FILE_SIZE / (1024 * 1024)} MB.`);
                                                e.target.value = '';
                                                setFormFileUrl('');
                                                return;
                                            }
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormFileUrl(reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    onClick={e => e.stopPropagation()}
                                />
                            </label>
                        </div>
                    ): topic.type === 'quiz' ? (
                        <div className='w-full max-w-[calc(100%-30px)] md:max-w-[calc(100%-50px)] transition-all duration-300'>
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    {isEditing ? (
                                        ''
                                    ):(
                                        <Image
                                        src="/course/modules/topics/quiz.svg"
                                        width={16}
                                        height={16}
                                        alt='quiz'
                                        className="w-4 h-4 md:w-6 md:h-6"
                                    />
                                    )}
                                    {isEditing ? (
                                        <div className='flex flex-col gap-2'>
                                            <h3 className='text-[18px] font-[500]'>Quiz Title</h3>
                                            <input
                                                type="text"
                                                value={formTitle}
                                                onChange={e => {
                                                    setFormTitle(e.target.value);
                                                    setFormQuizData(prev => ({
                                                        ...prev,
                                                        title: e.target.value
                                                    }));
                                                }}
                                                required
                                                className="text-[16px] font-medium text-gray-900 border rounded px-3 py-2 w-full"
                                                onClick={e => e.stopPropagation()}
                                                placeholder="Enter quiz title"
                                            />
                                        </div>
                                    ) : (
                                        <h3 className="text-[14px] md:text-[18px] font-medium text-gray-900">{topic.title}</h3>
                                    )}
                                </div>
                                {isEditing ? (
                                    <div className='flex flex-col gap-2'>
                                        <h3 className='text-[14px] md:text-[18px] font-[500]'>Content</h3>
                                        <textarea
                                            value={formContent}
                                            onChange={e => {
                                                setFormContent(e.target.value);
                                                setFormQuizData(prev => ({
                                                    ...prev,
                                                    content: e.target.value
                                                }));
                                            }}
                                            className="text-gray-600 text-[14px] md:text-[16px] font-[500] mb-6 w-full border rounded px-3 py-2"
                                            onClick={e => e.stopPropagation()}
                                            placeholder="Enter quiz description..."
                                            rows={3}
                                        />
                                    </div>
                                ) : (
                                    topic.content && (
                                        <p className="text-gray-600 text-[14px] font-[500] mb-6">{topic.content}</p>
                                    )
                                )}
                                <div className="space-y-6">
                                    {(isEditing ? formQuizData?.questions : topic.quizData?.questions)?.map((question, index) => (
                                        <div key={question.id} className="border rounded-lg p-2 md:p-4 bg-gray-50">
                                            <div className="flex flex-col gap-4">
                                                <div className='flex justify-between items-center flex-wrap'>
                                                    <span className="text-gray-700 text-[16px] font-[500]">Question {index + 1}</span>
                                                    <div className='flex gap-2'>
                                                        <button
                                                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                setEditingQuestionId(question.id);
                                                                if (!isEditing) {
                                                                    setFormQuizData(topic.quizData || {
                                                                        id: crypto.randomUUID(),
                                                                        title: topic.title || '',
                                                                        content: topic.content || '',
                                                                        questions: []
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            <Image 
                                                                src={'/course/dashboard/edit.svg'} 
                                                                width={18} 
                                                                height={18} 
                                                                alt='edit'
                                                            />
                                                        </button>
                                                        <button
                                                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                const newQuestions = (isEditing ? formQuizData : topic.quizData)?.questions?.filter(q => q.id !== question.id);
                                                                setFormQuizData((prev: Quiz) => ({
                                                                    ...prev,
                                                                    questions: newQuestions || []
                                                                }));
                                                                const updatedTopic = {
                                                                    ...topic,
                                                                    quizData: {
                                                                        id: formQuizData.id || topic.quizData?.id || crypto.randomUUID(),
                                                                        title: formTitle,
                                                                        content: formContent,
                                                                        questions: newQuestions || []
                                                                    }
                                                                };
                                                                handleUpdateTopic(topic.id, updatedTopic);
                                                            }}
                                                        >
                                                            <Image 
                                                                src={'/course/dashboard/delete.svg'} 
                                                                width={18} 
                                                                height={18} 
                                                                alt='delete'
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                                {editingQuestionId === question.id ? (
                                                    <div className='flex flex-col'>
                                                        <textarea
                                                            value={formQuizData.questions[index]?.question || ''}
                                                            onChange={e => {
                                                                const newQuestions = [...(formQuizData?.questions || [])];
                                                                if (newQuestions[index]) {
                                                                    newQuestions[index] = {
                                                                        ...newQuestions[index],
                                                                        question: e.target.value
                                                                    };
                                                                    setFormQuizData(prev => ({
                                                                        ...prev,
                                                                        questions: newQuestions
                                                                    }));
                                                                }
                                                            }}
                                                            className="w-full border rounded px-3 py-2 bg-white"
                                                            onClick={e => e.stopPropagation()}
                                                            placeholder="Enter question"
                                                            rows={2}
                                                        />
                                                        <div className='flex flex-col gap-2 mt-4'>
                                                            <h3 className="text-[14px] text-gray-700 font-[500]">Question Type</h3>
                                                            <div className="flex gap-4">
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        checked={formQuizData.questions[index]?.type === 'single'}
                                                                        onChange={e => {
                                                                            const newQuestions = [...(formQuizData?.questions || [])];
                                                                            if (newQuestions[index]) {
                                                                                newQuestions[index] = {
                                                                                    ...newQuestions[index],
                                                                                    type: 'single',
                                                                                    options: (newQuestions[index].options || []).map(opt => ({
                                                                                        ...opt,
                                                                                        isCorrect: false
                                                                                    }))
                                                                                };
                                                                                setFormQuizData(prev => ({
                                                                                    ...prev,
                                                                                    questions: newQuestions
                                                                                }));
                                                                            }
                                                                        }}
                                                                        className="w-4 h-4 text-[#9b87f5] border-gray-300 focus:ring-[#9b87f5]"
                                                                        onClick={e => e.stopPropagation()}
                                                                    />
                                                                    <span className="text-[14px] text-gray-700">Single Choice</span>
                                                                </label>
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        checked={formQuizData.questions[index]?.type === 'multiple'}
                                                                        onChange={e => {
                                                                            const newQuestions = [...(formQuizData?.questions || [])];
                                                                            if (newQuestions[index]) {
                                                                                newQuestions[index] = {
                                                                                    ...newQuestions[index],
                                                                                    type: 'multiple'
                                                                                };
                                                                                setFormQuizData(prev => ({
                                                                                    ...prev,
                                                                                    questions: newQuestions
                                                                                }));
                                                                            }
                                                                        }}
                                                                        className="w-4 h-4 text-[#9b87f5] border-gray-300 focus:ring-[#9b87f5]"
                                                                        onClick={e => e.stopPropagation()}
                                                                    />
                                                                    <span className="text-[14px] text-gray-700">Multiple Choice</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-[16px] text-gray-700 font-[500]">{question.question}</p>
                                                )}
                                            </div>
                                            <div className="space-y-3 mt-4">
                                                {editingQuestionId === question.id ? (
                                                    <>
                                                        {formQuizData.questions[index]?.options?.map((option, oIndex) => (
                                                            <div key={option.id} className={`flex items-start gap-3 p-3 border rounded-lg ${option.isCorrect ? 'bg-[#f0fdf4] border-[#9beed5]' : 'bg-white border-gray-200'}`}>
                                                                <div className="flex-grow space-y-2">
                                                                    <input
                                                                        type="text"
                                                                        value={formQuizData.questions[index]?.options[oIndex]?.text || ''}
                                                                        onChange={e => {
                                                                            const newQuestions = [...(formQuizData?.questions || [])];
                                                                            if (newQuestions[index] && newQuestions[index].options[oIndex]) {
                                                                                newQuestions[index].options[oIndex] = {
                                                                                    ...newQuestions[index].options[oIndex],
                                                                                    text: e.target.value
                                                                                };
                                                                                setFormQuizData(prev => ({
                                                                                    ...prev,
                                                                                    questions: newQuestions
                                                                                }));
                                                                            }
                                                                        }}
                                                                        className="w-full border rounded px-3 py-2"
                                                                        onClick={e => e.stopPropagation()}
                                                                        placeholder="Enter option text"
                                                                    />
                                                                    <div className="flex items-center gap-2">
                                                                        {formQuizData.questions[index]?.type === 'single' ? (
                                                                            <input
                                                                                type="radio"
                                                                                checked={formQuizData.questions[index]?.options[oIndex]?.isCorrect || false}
                                                                                onChange={e => {
                                                                                    setFormQuizData(prev => {
                                                                                        const newQuestions = [...(prev?.questions || [])];
                                                                                        if (newQuestions[index]) {
                                                                                            // Clear others for single choice, ensuring new option objects
                                                                                            const updatedOptions = (newQuestions[index].options || []).map((opt, idx) => ({
                                                                                                ...opt,
                                                                                                isCorrect: idx === oIndex ? e.target.checked : false // Only set current one to checked
                                                                                            }));
                                                                                            newQuestions[index] = {
                                                                                                ...newQuestions[index],
                                                                                                options: updatedOptions
                                                                                            };
                                                                                        }
                                                                                        return { ...prev, questions: newQuestions };
                                                                                    });
                                                                                }}
                                                                                className="w-4 h-4 text-green-500 border-gray-300 focus:ring-green-500"
                                                                                onClick={e => e.stopPropagation()}
                                                                            />
                                                                        ) : (
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={formQuizData.questions[index]?.options[oIndex]?.isCorrect || false}
                                                                                onChange={e => {
                                                                                    setFormQuizData(prev => {
                                                                                        const newQuestions = [...(prev?.questions || [])];
                                                                                        if (newQuestions[index] && newQuestions[index].options[oIndex]) {
                                                                                            const updatedOptions = [...(newQuestions[index].options || [])];
                                                                                            updatedOptions[oIndex] = {
                                                                                                ...updatedOptions[oIndex],
                                                                                                isCorrect: e.target.checked
                                                                                            };
                                                                                            newQuestions[index] = {
                                                                                                ...newQuestions[index],
                                                                                                options: updatedOptions
                                                                                            };
                                                                                        }
                                                                                        return { ...prev, questions: newQuestions };
                                                                                    });
                                                                                }}
                                                                                className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                                                                                onClick={e => e.stopPropagation()}
                                                                            />
                                                                        )}
                                                                        <span className="text-sm text-gray-600">Mark as correct answer</span>
                                                                    </div>
                                                                    <textarea
                                                                        value={formQuizData.questions[index]?.options[oIndex]?.explanation || ''}
                                                                        onChange={e => {
                                                                            const newQuestions = [...(formQuizData?.questions || [])];
                                                                            if (newQuestions[index] && newQuestions[index].options[oIndex]) {
                                                                                newQuestions[index].options[oIndex] = {
                                                                                    ...newQuestions[index].options[oIndex],
                                                                                    explanation: e.target.value
                                                                                };
                                                                                setFormQuizData(prev => ({
                                                                                    ...prev,
                                                                                    questions: newQuestions
                                                                                }));
                                                                            }
                                                                        }}
                                                                        className="w-full border rounded px-3 py-2"
                                                                        onClick={e => e.stopPropagation()}
                                                                        placeholder="Enter explanation (optional)"
                                                                        rows={2}
                                                                    />
                                                                </div>
                                                                <button
                                                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                        const newQuestions = [...(formQuizData?.questions || [])];
                                                                        if (newQuestions[index]) {
                                                                            newQuestions[index] = {
                                                                                ...newQuestions[index],
                                                                                options: (newQuestions[index].options || []).filter((_, i) => i !== oIndex)
                                                                            };
                                                                            setFormQuizData(prev => ({
                                                                                ...prev,
                                                                                questions: newQuestions
                                                                            }));
                                                                        }
                                                                    }}
                                                                >
                                                                    <Image src={'/course/modules/topics/cross.svg'} width={16} height={16} alt='delete'/>
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            className="w-full px-4 py-3 flex items-center justify-center gap-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                const newQuestions = [...(formQuizData?.questions || [])];
                                                                if (newQuestions[index]) {
                                                                    const newOptions = [...(newQuestions[index].options || []), {
                                                                        id: crypto.randomUUID(),
                                                                        text: '',
                                                                        isCorrect: false
                                                                    }];
                                                                    newQuestions[index] = {
                                                                        ...newQuestions[index],
                                                                        options: newOptions
                                                                    };
                                                                    setFormQuizData(prev => ({
                                                                        ...prev,
                                                                        questions: newQuestions
                                                                    }));
                                                                }
                                                            }}
                                                        >
                                                            <Image src={'/course/modules/add.svg'} width={16} height={16} alt='add'/>
                                                            <span className='text-[14px] text-gray-700 font-[500]'>Add Option</span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        {question.options?.map((option, oIndex) => (
                                                            <div key={option.id} className={`flex items-start gap-1 md:gap-3 p-3 border rounded-lg ${option.isCorrect ? 'bg-[#f0fdf4] border-[#9beed5]' : 'bg-white border-gray-200'}`}>
                                                                <div className="pt-1">
                                                                    {question.type === 'single' ? (
                                                                        <input
                                                                            type="radio"
                                                                            checked={option.isCorrect}
                                                                            readOnly
                                                                            className="w-4 h-4 text-green-500 border-gray-300 focus:ring-green-500"
                                                                        />
                                                                    ) : (
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={option.isCorrect}
                                                                            readOnly
                                                                            className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                                                                        />
                                                                    )}
                                                                </div>
                                                                <div className="flex-grow">
                                                                    <p className="text-[16px] text-gray-700 font-[500]">{option.text}</p>
                                                                    {option.explanation && (
                                                                        <p className="text-sm text-gray-500 mt-1">{option.explanation}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                            {editingQuestionId === question.id && (
                                                <div className="flex justify-end mt-4">
                                                    <button
                                                        className="px-4 py-2 rounded-lg bg-[#9b87f5] hover:bg-[#8f7ce2] text-white text-[14px] font-[500] transition-colors"
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            const currentQuestion = formQuizData.questions[index];
                                                            
                                                            // Check if question has options
                                                            if (!currentQuestion?.options || currentQuestion.options.length === 0) {
                                                                toast.error('Please add at least one option to the question.');
                                                                return;
                                                            }

                                                            // Check if any option is marked as correct
                                                            const hasCorrectOption = currentQuestion.options.some(opt => opt.isCorrect === true);
                                                            
                                                            if (!hasCorrectOption) {
                                                                toast.error('Please select at least one correct option for this question.');
                                                                return;
                                                            }

                                                            // Check if all options have text
                                                            const hasEmptyOptions = currentQuestion.options.some(opt => !opt.text.trim());
                                                            if (hasEmptyOptions) {
                                                                toast.error('Please fill in all option texts.');
                                                                return;
                                                            }

                                                            const updatedQuestions = formQuizData.questions;
                                                            const updatedTopic = {
                                                                ...topic,
                                                                quizData: {
                                                                    id: formQuizData.id || topic.quizData?.id || crypto.randomUUID(),
                                                                    title: formTitle,
                                                                    content: formContent,
                                                                    questions: updatedQuestions || []
                                                                }
                                                            };
                                                            handleUpdateTopic(topic.id, updatedTopic);
                                                            setEditingQuestionId(null);
                                                        }}
                                                    >
                                                        Done
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {isEditing && (
                                        <button
                                            className="w-full px-4 py-3 flex items-center justify-center gap-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                                            onClick={e => {
                                                e.stopPropagation();
                                                const newQuestion = {
                                                    id: crypto.randomUUID(),
                                                    question: '',
                                                    type: 'single' as const,
                                                    options: []
                                                };
                                                // Preserve existing quiz data when adding new question
                                                setFormQuizData((prev: Quiz) => ({
                                                    ...prev,
                                                    title: formTitle,
                                                    content: formContent,
                                                    questions: [...(prev?.questions || []), newQuestion]
                                                }));
                                                const updatedTopic = {
                                                    ...topic,
                                                    quizData: {
                                                        id: formQuizData.id || topic.quizData?.id || crypto.randomUUID(),
                                                        title: formTitle,
                                                        content: formContent,
                                                        questions: [...(formQuizData?.questions || []), newQuestion]
                                                    }
                                                };
                                                handleUpdateTopic(topic.id, updatedTopic);
                                                setEditingQuestionId(newQuestion.id);
                                            }}
                                        >
                                            <Image src={'/course/modules/add.svg'} width={16} height={16} alt='add'/>
                                            <span className='text-[14px] text-gray-700 font-[500]'>Add Question</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ): null}
                    <div className="flex gap-2 justify-end mt-4">
                        <button
                            className="px-3 py-1 rounded-md bg-white hover:bg-[#f8f8f8] border-[1px] border-[#9b87f5] text-[14px] text-black cursor-pointer"
                            onClick={e => {
                                e.stopPropagation();
                                setEditingTopicId(null);
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            className="py-2 px-4 rounded-md bg-[#9b87f5] hover:bg-[#8f7ce2] text-white text-[14px] font-[500] cursor-pointer"
                            onClick={e => {
                                e.stopPropagation();
                                handleSaveTopic(topic.id);
                            }}
                        >
                            Save Topic
                        </button>
                    </div>
                </div>
            ) : (
                <div className='w-full flex flex-row items-center justify-between gap-2 md:gap-4 py-2 rounded-md'>
                    {topic.type === 'text' ? (
                        <div className='flex-grow rounded-sm py-2'>
                            <div className='w-full whitespace-pre-wrap px-2 text-gray-700 text-[14px] md:text-[18px] font-[500] transition-all duration-300'>
                                {topic.content || ''}
                            </div>
                        </div>
                    ) : topic.type === 'image' ? (
                        <div className='w-full max-w-[calc(100%-30px)] md:max-w-[calc(100%-50px)] transition-all duration-300'>
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
                                            <source src={topic.videoUrl} type="video/mp4" />
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
                        <div className='flex-grow transition-all duration-300 overflow-x-auto'>
                            <table className="w-full border">
                                <thead>
                                    <tr>
                                        {topic.tableData?.[0]?.map((cell: string, idx: number) => (
                                            <th key={idx} className="px-2 py-1 border border-gray-300 text-center text-[14px] md:text-[18px] font-semibold text-gray-700 transition-all duration-300">
                                                {cell}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {topic.tableData?.slice(1)?.filter((row: string[]) => row.some((cell: string) => cell !== ''))?.map((row: string[], rIdx: number) => (
                                        <tr key={rIdx}>
                                            {row.map((cell: string, cIdx: number) => (
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
                        <div
                            className="w-full rounded-sm"
                            style={{
                                backgroundColor: topic.boxColor ? topic.boxColor[1] : '#89B4DD',
                                border: topic.boxColor ? `1px solid ${topic.boxColor[0]}` : 'none',
                            }}
                        >
                            <div className="flex flex-col items-start gap-2 p-4">
                                <div className='flex items-start md:items-center gap-2 transition-all duration-300'>
                                    <Image
                                        src={`/course/modules/topics/info-${topic.boxColor?.[3] || 'blue'}.svg`}
                                        width={24}
                                        height={24}
                                        alt='info'
                                        className="w-4 h-4 md:w-6 md:h-6 transition-all duration-300"
                                    />
                                    <h3 className='text-[15px] md:text-[18px] font-[500] leading-4 transition-all duration-300' style={{
                                        color: topic.boxColor ? topic.boxColor[2] : '#1d316a'
                                    }}>{topic.title}</h3>
                                </div>
                                <div
                                    className="w-full whitespace-pre-wrap text-[14px] md:text-[18px] font-[500] transition-all duration-300"
                                    style={{
                                        color: topic.boxColor ? topic.boxColor[2] : '#374151'
                                    }}
                                >
                                    {topic.content || ''}
                                </div>
                            </div>
                        </div>
                    ) : topic.type === 'file' ? (
                        <div className='w-full max-w-[calc(100%-30px)] md:max-w-[calc(100%-50px)] transition-all duration-300'>
                            {topic.fileUrl ? (
                                <a href={topic.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                    <div className="w-full h-[100px] md:h-[150px] lg:h-[200px] py-2 flex flex-col items-center justify-center bg-gray-100 rounded-sm">
                                        <Image src="/course/modules/file.svg" alt="File icon" width={48} height={48} className="mb-2"/>
                                        <span className="text-center text-gray-700">Download File</span>
                                    </div>
                                </a>
                            ) : (
                                <div className="w-full h-[100px] md:h-[150px] lg:h-[200px] py-2 transition-all duration-300 relative bg-gray-200 rounded-sm flex items-center justify-center text-gray-500">
                                    No File
                                </div>
                            )}
                        </div>
                    ) : topic.type === 'quiz' ? (
                        <div className='w-full max-w-[calc(100%-30px)] md:max-w-[calc(100%-50px)] transition-all duration-300'>
                            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-2 md:mb-4 transition-all duration-300">
                                    <Image
                                        src="/course/modules/topics/quiz.svg"
                                        width={24}
                                        height={24}
                                        alt='quiz'
                                        className="className='w-[16px] h-[16px] md:w-[24px] md:h-[24px] transition-all duration-300'"
                                    />
                                    <h3 className="text-md md:text-lg font-medium text-gray-900">{topic.title}</h3>
                                </div>
                                {topic.content && (
                                    <p className="text-gray-600 text-[14px] font-[500] mb-6">{topic.content}</p>
                                )}
                                <div className="space-y-6">
                                    {(isEditing ? formQuizData?.questions : topic.quizData?.questions)?.map((question, index) => (
                                        <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                                            <div className="flex flex-col gap-4">
                                                <div className='flex justify-between items-center flex-wrap'>
                                                    <span className="text-gray-700 text-[14px] md:text-[16px] font-[500] transition-all duration-300">Question {index + 1}</span>
                                                    <div className='flex gap-1 md:gap-2'>
                                                        <button
                                                            className="p-1 md:p-2 hover:bg-gray-200 rounded-full transition-colors"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                setEditingQuestionId(question.id);
                                                                if (!isEditing) {
                                                                    setFormQuizData(topic.quizData || {
                                                                        id: crypto.randomUUID(),
                                                                        title: topic.title || '',
                                                                        content: topic.content || '',
                                                                        questions: []
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            <Image 
                                                                src={'/course/dashboard/edit.svg'} 
                                                                width={18} 
                                                                height={18} 
                                                                alt='edit'
                                                                className='w-[14px] h-[14px] md:w-[18px] md:h-[18px] transition-all duration-300'
                                                            />
                                                        </button>
                                                        <button
                                                            className="p-1 md:p-2 hover:bg-gray-200 rounded-full transition-colors"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                const newQuestions = (isEditing ? formQuizData : topic.quizData)?.questions?.filter(q => q.id !== question.id);
                                                                setFormQuizData((prev: Quiz) => ({
                                                                    ...prev,
                                                                    questions: newQuestions || []
                                                                }));
                                                                const updatedTopic = {
                                                                    ...topic,
                                                                    quizData: {
                                                                        id: formQuizData.id || topic.quizData?.id || crypto.randomUUID(),
                                                                        title: formTitle,
                                                                        content: formContent,
                                                                        questions: newQuestions || []
                                                                    }
                                                                };
                                                                handleUpdateTopic(topic.id, updatedTopic);
                                                            }}
                                                        >
                                                            <Image 
                                                                src={'/course/dashboard/delete.svg'} 
                                                                width={18} 
                                                                height={18} 
                                                                alt='delete'
                                                                className='w-[14px] h-[14px] md:w-[18px] md:h-[18px] transition-all duration-300'
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                                {editingQuestionId === question.id ? (
                                                    <div className='flex flex-col'>
                                                        <textarea
                                                            value={formQuizData.questions[index]?.question || ''}
                                                            onChange={e => {
                                                                const newQuestions = [...(formQuizData?.questions || [])];
                                                                if (newQuestions[index]) {
                                                                    newQuestions[index] = {
                                                                        ...newQuestions[index],
                                                                        question: e.target.value
                                                                    };
                                                                    setFormQuizData(prev => ({
                                                                        ...prev,
                                                                        questions: newQuestions
                                                                    }));
                                                                }
                                                            }}
                                                            className="w-full text-[12px] md:text-[14px] border rounded px-3 py-2 bg-white"
                                                            onClick={e => e.stopPropagation()}
                                                            placeholder="Enter question"
                                                            rows={2}
                                                        />
                                                        <div className='flex flex-col gap-2 mt-4'>
                                                            <h3 className="text-[14px] text-gray-700 font-[500]">Question Type</h3>
                                                            <div className="flex gap-4">
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        checked={formQuizData.questions[index]?.type === 'single'}
                                                                        onChange={e => {
                                                                            const newQuestions = [...(formQuizData?.questions || [])];
                                                                            if (newQuestions[index]) {
                                                                                newQuestions[index] = {
                                                                                    ...newQuestions[index],
                                                                                    type: 'single',
                                                                                    options: (newQuestions[index].options || []).map(opt => ({
                                                                                        ...opt,
                                                                                        isCorrect: false
                                                                                    }))
                                                                                };
                                                                                setFormQuizData(prev => ({
                                                                                    ...prev,
                                                                                    questions: newQuestions
                                                                                }));
                                                                            }
                                                                        }}
                                                                        className="w-4 h-4 text-[#9b87f5] border-gray-300 focus:ring-[#9b87f5]"
                                                                        onClick={e => e.stopPropagation()}
                                                                    />
                                                                    <span className="text-[14px] text-gray-700">Single Choice</span>
                                                                </label>
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        checked={formQuizData.questions[index]?.type === 'multiple'}
                                                                        onChange={e => {
                                                                            const newQuestions = [...(formQuizData?.questions || [])];
                                                                            if (newQuestions[index]) {
                                                                                newQuestions[index] = {
                                                                                    ...newQuestions[index],
                                                                                    type: 'multiple'
                                                                                };
                                                                                setFormQuizData(prev => ({
                                                                                    ...prev,
                                                                                    questions: newQuestions
                                                                                }));
                                                                            }
                                                                        }}
                                                                        className="w-4 h-4 text-[#9b87f5] border-gray-300 focus:ring-[#9b87f5]"
                                                                        onClick={e => e.stopPropagation()}
                                                                    />
                                                                    <span className="text-[14px] text-gray-700">Multiple Choice</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-[14px] md:text-[16px] text-gray-700 font-[500]">{question.question}</p>
                                                )}
                                            </div>
                                            <div className="space-y-3 mt-4">
                                                {editingQuestionId === question.id ? (
                                                    <>
                                                        {formQuizData.questions[index]?.options?.map((option, oIndex) => (
                                                            <div key={option.id} className={`flex items-start gap-1 md:gap-3 p-3 border rounded-lg ${option.isCorrect ? 'bg-[#f0fdf4] border-[#9beed5]' : 'bg-white border-gray-200'}`}>
                                                                <div className="flex-grow space-y-2">
                                                                    <input
                                                                        type="text"
                                                                        value={formQuizData.questions[index]?.options[oIndex]?.text || ''}
                                                                        onChange={e => {
                                                                            const newQuestions = [...(formQuizData?.questions || [])];
                                                                            if (newQuestions[index] && newQuestions[index].options[oIndex]) {
                                                                                newQuestions[index].options[oIndex] = {
                                                                                    ...newQuestions[index].options[oIndex],
                                                                                    text: e.target.value
                                                                                };
                                                                                setFormQuizData(prev => ({
                                                                                    ...prev,
                                                                                    questions: newQuestions
                                                                                }));
                                                                            }
                                                                        }}
                                                                        className="w-full text-[12px] md:text-[14px] border rounded px-3 py-2"
                                                                        onClick={e => e.stopPropagation()}
                                                                        placeholder="Enter option text"
                                                                    />
                                                                    <div className="flex items-center gap-2">
                                                                        {formQuizData.questions[index]?.type === 'single' ? (
                                                                            <input
                                                                                type="radio"
                                                                                checked={formQuizData.questions[index]?.options[oIndex]?.isCorrect || false}
                                                                                onChange={e => {
                                                                                    setFormQuizData(prev => {
                                                                                        const newQuestions = [...(prev?.questions || [])];
                                                                                        if (newQuestions[index]) {
                                                                                            // Clear others for single choice, ensuring new option objects
                                                                                            const updatedOptions = (newQuestions[index].options || []).map((opt, idx) => ({
                                                                                                ...opt,
                                                                                                isCorrect: idx === oIndex ? e.target.checked : false // Only set current one to checked
                                                                                            }));
                                                                                            newQuestions[index] = {
                                                                                                ...newQuestions[index],
                                                                                                options: updatedOptions
                                                                                            };
                                                                                        }
                                                                                        return { ...prev, questions: newQuestions };
                                                                                    });
                                                                                }}
                                                                                className="w-4 h-4 text-green-500 border-gray-300 focus:ring-green-500"
                                                                                onClick={e => e.stopPropagation()}
                                                                            />
                                                                        ) : (
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={formQuizData.questions[index]?.options[oIndex]?.isCorrect || false}
                                                                                onChange={e => {
                                                                                    setFormQuizData(prev => {
                                                                                        const newQuestions = [...(prev?.questions || [])];
                                                                                        if (newQuestions[index] && newQuestions[index].options[oIndex]) {
                                                                                            const updatedOptions = [...(newQuestions[index].options || [])];
                                                                                            updatedOptions[oIndex] = {
                                                                                                ...updatedOptions[oIndex],
                                                                                                isCorrect: e.target.checked
                                                                                            };
                                                                                            newQuestions[index] = {
                                                                                                ...newQuestions[index],
                                                                                                options: updatedOptions
                                                                                            };
                                                                                        }
                                                                                        return { ...prev, questions: newQuestions };
                                                                                    });
                                                                                }}
                                                                                className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                                                                                onClick={e => e.stopPropagation()}
                                                                            />
                                                                        )}
                                                                        <span className="text-[10px] md:text-[14px] text-gray-600">Mark as correct answer</span>
                                                                    </div>
                                                                    <textarea
                                                                        value={formQuizData.questions[index]?.options[oIndex]?.explanation || ''}
                                                                        onChange={e => {
                                                                            const newQuestions = [...(formQuizData?.questions || [])];
                                                                            if (newQuestions[index] && newQuestions[index].options[oIndex]) {
                                                                                newQuestions[index].options[oIndex] = {
                                                                                    ...newQuestions[index].options[oIndex],
                                                                                    explanation: e.target.value
                                                                                };
                                                                                setFormQuizData(prev => ({
                                                                                    ...prev,
                                                                                    questions: newQuestions
                                                                                }));
                                                                            }
                                                                        }}
                                                                        className="w-full text-[12px] md:text-[16px] border rounded px-3 py-2"
                                                                        onClick={e => e.stopPropagation()}
                                                                        placeholder="Enter explanation (optional)"
                                                                        rows={2}
                                                                    />
                                                                </div>
                                                                <button
                                                                    className="p-1 md:p-2 hover:bg-gray-200 rounded-full transition-colors"
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                        const newQuestions = [...(formQuizData?.questions || [])];
                                                                        if (newQuestions[index]) {
                                                                            newQuestions[index] = {
                                                                                ...newQuestions[index],
                                                                                options: (newQuestions[index].options || []).filter((_, i) => i !== oIndex)
                                                                            };
                                                                            setFormQuizData(prev => ({
                                                                                ...prev,
                                                                                questions: newQuestions
                                                                            }));
                                                                        }
                                                                    }}
                                                                >
                                                                    <Image src={'/course/modules/topics/cross.svg'} width={16} height={16} alt='delete'/>
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            className="w-full px-4 py-3 flex items-center justify-center gap-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                const newQuestions = [...(formQuizData?.questions || [])];
                                                                if (newQuestions[index]) {
                                                                    const newOptions = [...(newQuestions[index].options || []), {
                                                                        id: crypto.randomUUID(),
                                                                        text: '',
                                                                        isCorrect: false
                                                                    }];
                                                                    newQuestions[index] = {
                                                                        ...newQuestions[index],
                                                                        options: newOptions
                                                                    };
                                                                    setFormQuizData(prev => ({
                                                                        ...prev,
                                                                        questions: newQuestions
                                                                    }));
                                                                }
                                                            }}
                                                        >
                                                            <Image src={'/course/modules/add.svg'} width={16} height={16} alt='add'/>
                                                            <span className='text-[14px] text-gray-700 font-[500]'>Add Option</span>
                                                        </button>
                                                    </>
                                                ): (
                                                        <>
                                                            {question.options?.map((option, oIndex) => (
                                                                <div key={option.id} className={`flex items-center gap-3 p-2 md:p-3 border rounded-lg ${option.isCorrect ? 'bg-[#f0fdf4] border-[#9beed5]' : 'bg-white border-gray-200'}`}>
                                                                    <div className="pt-1">
                                                                        {question.type === 'single' ? (
                                                                            <input
                                                                                type="radio"
                                                                                checked={option.isCorrect}
                                                                                readOnly
                                                                                className="w-4 h-4 text-green-500 border-gray-300 focus:ring-green-500"
                                                                            />
                                                                        ) : (
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={option.isCorrect}
                                                                                readOnly
                                                                                className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-grow">
                                                                        <p className="text-[16px] text-gray-700 font-[500]">{option.text}</p>
                                                                        {option.explanation && (
                                                                            <p className="text-[10px] md:text-sm text-gray-500 mt-1">{option.explanation}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </>
                                                    )}
                                                </div>
                                            {editingQuestionId === question.id && (
                                                <div className="flex justify-end mt-4">
                                                    <button
                                                        className="px-4 py-2 rounded-lg bg-[#9b87f5] hover:bg-[#8f7ce2] text-white text-[14px] font-[500] transition-colors"
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            const currentQuestion = formQuizData.questions[index];
                                                            
                                                            // Check if question has options
                                                            if (!currentQuestion?.options || currentQuestion.options.length === 0) {
                                                                toast.error('Please add at least one option to the question.');
                                                                return;
                                                            }

                                                            // Check if any option is marked as correct
                                                            const hasCorrectOption = currentQuestion.options.some(opt => opt.isCorrect === true);
                                                            
                                                            if (!hasCorrectOption) {
                                                                toast.error('Please select at least one correct option for this question.');
                                                                return;
                                                            }

                                                            // Check if all options have text
                                                            const hasEmptyOptions = currentQuestion.options.some(opt => !opt.text.trim());
                                                            if (hasEmptyOptions) {
                                                                toast.error('Please fill in all option texts.');
                                                                return;
                                                            }

                                                            const updatedQuestions = formQuizData.questions;
                                                            const updatedTopic = {
                                                                ...topic,
                                                                quizData: {
                                                                    id: formQuizData.id || topic.quizData?.id || crypto.randomUUID(),
                                                                    title: formTitle,
                                                                    content: formContent,
                                                                    questions: updatedQuestions || []
                                                                }
                                                            };
                                                            handleUpdateTopic(topic.id, updatedTopic);
                                                            setEditingQuestionId(null);
                                                        }}
                                                    >
                                                        Done
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {isEditing && (
                                        <button
                                            className="w-full px-4 py-3 flex items-center justify-center gap-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                                            onClick={e => {
                                                e.stopPropagation();
                                                const newQuestion = {
                                                    id: crypto.randomUUID(),
                                                    question: '',
                                                    type: 'single' as const,
                                                    options: []
                                                };
                                                // Preserve existing quiz data when adding new question
                                                setFormQuizData((prev: Quiz) => ({
                                                    ...prev,
                                                    title: formTitle,
                                                    content: formContent,
                                                    questions: [...(prev?.questions || []), newQuestion]
                                                }));
                                                const updatedTopic = {
                                                    ...topic,
                                                    quizData: {
                                                        id: formQuizData.id || topic.quizData?.id || crypto.randomUUID(),
                                                        title: formTitle,
                                                        content: formContent,
                                                        questions: [...(formQuizData?.questions || []), newQuestion]
                                                    }
                                                };
                                                handleUpdateTopic(topic.id, updatedTopic);
                                                setEditingQuestionId(newQuestion.id);
                                            }}
                                        >
                                            <Image src={'/course/modules/add.svg'} width={16} height={16} alt='add'/>
                                            <span className='text-[14px] text-gray-700 font-[500]'>Add Question</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : null}
                    <div className='min-w-[30px] md:min-w-[50px] max-w-[50px] flex flex-col items-center justify-center gap-2 transition-all duration-300'>
                        <div className="cursor-grab" {...attributes} {...listeners}>
                            <Image src='/sidebar/drag.svg' alt='drag' width={16} height={16} className='w-[14px] h-[14px] md:w-[16px] md:h-[16px] opacity-80'/>
                        </div>
                        <Image
                            src="/sidebar/edit.svg"
                            alt="edit"
                            width={16}
                            height={16}
                            className='opacity-60 cursor-pointer w-[14px] h-[14px] md:w-[16px] md:h-[16px] transition-all duration-300'
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditingTopicId(topic.id);
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
                                setDeleteId(topic.id);
                            }}
                        />
                    </div>
                    {deleteId === topic.id && !isEditing && (
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
                                        setDeleteId(null);
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
            )}
            </div>
        </div>
    );
};

interface ContentProps {
    moduleId: string;
    topicId: string | null;
    isTopicEditing: boolean;
    editingTopicId: number | null;
    setEditingTopicId: (id: number | null) => void;
    onTopicDelete?: (topicId: number) => Promise<void>;
}

const Content = ({ 
    moduleId,
    isTopicEditing,
    editingTopicId,
    setEditingTopicId,
    onTopicDelete
}: ContentProps) => {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const courseId = params.courseId as string;
    const { courses, setCourse } = useStore();
    const course = courseId ? courses[courseId] : null;
    const currentModule = course?.modules?.find(mod => mod.id === moduleId);
    const topics = useMemo(() => currentModule?.topics || [], [currentModule?.topics]);

    const { setIsTopicEditing } = useModuleEditStore();

    const [formTitle, setFormTitle] = useState('');
    const [formContent, setFormContent] = useState('');
    const [formImageUrl, setFormImageUrl] = useState('');
    const [formVideoUrl, setFormVideoUrl] = useState('');
    const [formFileUrl, setFormFileUrl] = useState('');
    const [formTableData, setFormTableData] = useState([['Header 1', 'Header 2']]);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deletingTopicId, setDeletingTopicId] = useState<number | null>(null);
    const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
    const [draggedTopic, setDraggedTopic] = useState<Topic | null>(null);
    const [formQuizData, setFormQuizData] = useState<Quiz>({
        id: crypto.randomUUID(),
        title: '',
        content: '',
        questions: []
    });
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<number | null>(null);
    const activeTopic = topics.find((t: Topic) => t.id === activeId);

    // Initialize form state when editing topic changes
    useEffect(() => {
        const topicToEdit = topics.find((t: Topic) => t.id === editingTopicId);
        if (topicToEdit) {
            setFormImageUrl(topicToEdit.imageUrl || '');
            setFormVideoUrl(topicToEdit.videoUrl || '');
            setFormFileUrl(topicToEdit.fileUrl || '');
            setFormTableData(topicToEdit.tableData || [['Header 1', 'Header 2']]);

            if (topicToEdit.type === 'quiz') {
                const loadedQuizData = topicToEdit.quizData || {
                    id: crypto.randomUUID(),
                    title: topicToEdit.title || '',
                    content: topicToEdit.content || '',
                    questions: []
                };
                setFormQuizData({ ...loadedQuizData, questions: loadedQuizData.questions });
                setFormTitle(loadedQuizData.title || ''); // Provide default empty string
                setFormContent(loadedQuizData.content || ''); // Provide default empty string
            } else {
                // For non-quiz topics, use the general topic title/content
                setFormTitle(topicToEdit.title);
                setFormContent(topicToEdit.content || '');
                setFormQuizData({
                    id: crypto.randomUUID(),
                    title: '',
                    content: '',
                    questions: []
                });
            }
        } else {
            // Clear form if no topic is being edited
            setFormTitle('');
            setFormContent('');
            setFormImageUrl('');
            setFormVideoUrl('');
            setFormFileUrl('');
            setFormTableData([['Header 1', 'Header 2']]);
            setFormQuizData({
                id: crypto.randomUUID(),
                title: '',
                content: '',
                questions: []
            });
            setDeleteId(null);
            setDeletingTopicId(null);
        }
    }, [editingTopicId, topics]); // Dependencies remain the same

    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragStart = (event: DragEndEvent) => {
        const { active } = event;
        setActiveId(Number(active.id));
        const topic = topics.find((t: Topic) => t.id === active.id);
        if (topic) {
            setDraggedTopic(topic);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (active.id !== over?.id && currentModule) {
            const oldIndex = topics.findIndex((t: Topic) => t.id === active.id);
            const newIndex = topics.findIndex((t: Topic) => t.id === over?.id);

            const newOrderedTopics = arrayMove(topics, oldIndex, newIndex);

            const updatedModule = {
                ...currentModule,
                topics: newOrderedTopics
            };

            const updatedModules = course?.modules.map((mod: Module) => 
                mod.id === moduleId ? updatedModule : mod
            );

            setCourse(courseId, {
                modules: updatedModules
            });
        }
        setDraggedTopic(null);
    };


    const handleDeleteTopic = async (topicId: number) => {
        if (onTopicDelete) {
            await onTopicDelete(topicId);
        }
    };

    const handleUpdateTopic = (topicId: number, updates: Partial<Topic>) => {
        if (!moduleId || !courseId || !currentModule) return;

        console.log("handleUpdateTopic received updates:", updates);

        const updatedModule = {
            ...currentModule,
            topics: (currentModule.topics || []).map((t: Topic) => t.id === topicId ? { ...t, ...updates } : t) as Topic[] 
        };

        const updatedModules = course?.modules.map((mod: Module) => 
            mod.id === moduleId ? updatedModule : mod
        );

        setCourse(courseId, {
            modules: updatedModules
        });
    };

    const handleSaveTopic = (topicId: number) => {
        if (!moduleId || !courseId || !currentModule) return;
        const topicToSave = topics.find((t: Topic) => t.id === topicId);
        if (!topicToSave) return;

        // Add validation for quiz title
        if (topicToSave.type === 'quiz') {
            // Use formTitle directly for validation, as it reflects the input's current value
            if (!formTitle.trim()) {
                toast.error('Quiz title is required');
                return;
            }
        }

        const updatedTopic = {
            ...topicToSave,
            title: topicToSave.type === 'quiz' ? formQuizData.title : formTitle,
            content: topicToSave.type === 'quiz' ? formQuizData.content : formContent,
            imageUrl: formImageUrl,
            videoUrl: formVideoUrl,
            fileUrl: formFileUrl,
            tableData: formTableData,
            quizData: topicToSave.type === 'quiz' ? formQuizData : undefined
        };
        const updatedModule = {
            ...currentModule,
            topics: (currentModule.topics || []).map((t: Topic) => t.id === topicId ? updatedTopic : t) as Topic[]
        };
        const updatedModules = course?.modules.map((mod: Module) =>
            mod.id === moduleId ? updatedModule : mod
        );
        setCourse(courseId, { modules: updatedModules });
        setIsTopicEditing(false);
        setEditingTopicId(null);
        const currentSearchParams = new URLSearchParams(searchParams.toString());
        currentSearchParams.delete('topic');
        router.replace(`${pathname}?${currentSearchParams.toString()}`, { scroll: false });
        setDeleteId(null);
        setDeletingTopicId(null);
    };

    const handleBoxColor = (topic: Topic, color: string ) => {
        const colorList = {
            blue: ['#223C53', '#89B4DD', '#1d316a','blue'],
            red: ['#532227', '#DD898C', '#6A1D22' ,'red'],
            green: ['#245322', '#89DD8F', '#1D6A1D','green'],
            yellow: ['#505322', '#DBDD89', '#6A691D','yellow']
        };
        const defaultBoxColor = ['#223C53', '#89B4DD', '#1d316a','blue'];
        // Always set a color - either the selected one or default
        const boxColor = color ? colorList[color as keyof typeof colorList] : defaultBoxColor;
        handleUpdateTopic(topic.id, { boxColor });
    };
    
    const handleEditClick = (topicId: number | null) => {
        if (topicId !== null) {
            setEditingTopicId(topicId);
            setIsTopicEditing(true);
            // Update URL with topic ID
            const currentSearchParams = new URLSearchParams(searchParams.toString());
            currentSearchParams.set('topic', topicId.toString());
            router.push(`${pathname}?${currentSearchParams.toString()}`, { scroll: false });
        }
    };

    return (
        <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd} 
            modifiers={[restrictToVerticalAxis]}
        >
            <SortableContext strategy={verticalListSortingStrategy} items={topics.map((topic: Topic) => topic.id)}>
                <div className='w-full h-auto mx-auto'>
                    <div className='w-full gap-2 max-w-[1280px] p-3 md:p-6 mx-auto flex flex-col items-center justify-center'>
                        {topics.map((topic, index) => (
                            <SortableTopic
                                key={topic.id}
                                topic={topic}
                                isEditing={isTopicEditing && editingTopicId === topic.id}
                                editingTopicId={editingTopicId}
                                setEditingTopicId={handleEditClick}
                                handleDeleteTopic={handleDeleteTopic}
                                deleteId={deleteId}
                                setDeleteId={setDeleteId}
                                deletingTopicId={deletingTopicId}
                                handleBoxColor={handleBoxColor}
                                formTitle={formTitle}
                                setFormTitle={setFormTitle}
                                formContent={formContent}
                                setFormContent={setFormContent}
                                formImageUrl={formImageUrl}
                                setFormImageUrl={setFormImageUrl}
                                formVideoUrl={formVideoUrl}
                                setFormVideoUrl={setFormVideoUrl}
                                formFileUrl={formFileUrl}
                                setFormFileUrl={setFormFileUrl}
                                formTableData={formTableData}
                                setFormTableData={setFormTableData}
                                formQuizData={formQuizData}
                                setFormQuizData={setFormQuizData}
                                handleSaveTopic={handleSaveTopic}
                                handleUpdateTopic={handleUpdateTopic}
                                editingQuestionId={editingQuestionId}
                                setEditingQuestionId={setEditingQuestionId}
                                deletingQuestionId={deletingQuestionId}
                                setDeletingQuestionId={setDeletingQuestionId}
                            />
                        ))}
                    </div>
                </div>
            </SortableContext>
            <DragOverlay>
                {activeId ? (
                    <div className="w-full max-w-[1280px] p-3 md:p-6 mx-auto">
                        <div className="w-full flex flex-row items-center justify-between gap-2 md:gap-4 py-2 rounded-md bg-white shadow-lg opacity-80">
                            {activeTopic?.type === 'text' ? (
                                <div className='flex-grow rounded-sm py-2'>
                                    <div className='w-full whitespace-pre-wrap px-2 text-gray-700 text-[14px] md:text-[18px] font-[500]'>
                                        {activeTopic.content || ''}
                                    </div>
                                </div>
                            ) : activeTopic?.type === 'image' ? (
                                <div className='w-full max-w-[calc(100%-30px)] md:max-w-[calc(100%-50px)]'>
                                    {activeTopic.imageUrl ? (
                                        <div className="w-full h-[150px] md:h-[350px] lg:h-[500px] py-2 relative">
                                            <Image
                                                src={activeTopic.imageUrl}
                                                alt="Preview"
                                                width={0}
                                                height={0}
                                                sizes="100vw"
                                                className="w-full h-full object-cover rounded-sm"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-[150px] md:h-[350px] lg:h-[500px] py-2 relative bg-gray-200 rounded-sm flex items-center justify-center text-gray-500">
                                            No Image
                                        </div>
                                    )}
                                </div>
                            ) : activeTopic?.type === 'video' ? (
                                <div className='flex-grow'>
                                    {activeTopic.videoUrl ? (
                                        <div className="w-full aspect-video py-2">
                                            {activeTopic.videoUrl.startsWith('blob:') ? (
                                                <video controls className='w-full h-full rounded-sm'>
                                                    <source src={activeTopic.videoUrl} type="video/mp4" />
                                                    Your browser does not support the video tag.
                                                </video>
                                            ) : (
                                                <Vimeo
                                                    video={activeTopic.videoUrl || 'video not found'}
                                                    responsive
                                                    autoplay={false}
                                                    className='w-full h-full rounded-sm'
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full h-[150px] md:h-[350px] lg:h-[500px] py-2 relative bg-gray-200 rounded-sm flex items-center justify-center text-gray-500">
                                            No video
                                        </div>
                                    )}
                                </div>
                            ) : activeTopic?.type === 'table' ? (
                                <div className='flex-grow overflow-x-auto'>
                                    <table className="w-full border">
                                        <thead>
                                            <tr>
                                                {activeTopic.tableData?.[0]?.map((cell: string, idx: number) => (
                                                    <th key={idx} className="px-2 py-1 border border-gray-300 text-center text-[14px] md:text-[18px] font-semibold text-gray-700">
                                                        {cell}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeTopic.tableData?.slice(1)?.filter((row: string[]) => row.some((cell: string) => cell !== ''))?.map((row: string[], rIdx: number) => (
                                                <tr key={rIdx}>
                                                    {row.map((cell: string, cIdx: number) => (
                                                        <td key={cIdx} className="border px-2 py-1 text-[14px] md:text-[18px] text-gray-600">
                                                            {cell}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : activeTopic?.type === 'information' ? (
                                <div
                                    className="w-full rounded-sm"
                                    style={{
                                        backgroundColor: activeTopic.boxColor ? activeTopic.boxColor[1] : '#89B4DD',
                                        border: activeTopic.boxColor ? `1px solid ${activeTopic.boxColor[0]}` : 'none',
                                    }}
                                >
                                    <div className="flex flex-col items-start gap-2 p-4">
                                        <div className='flex items-start md:items-center gap-2'>
                                            <Image
                                                src={`/course/modules/topics/info-${activeTopic.boxColor?.[3] || 'blue'}.svg`}
                                                width={24}
                                                height={24}
                                                alt='info'
                                                className="w-4 h-4 md:w-6 md:h-6"
                                            />
                                            <h3 className='text-[15px] md:text-[18px] font-[500] leading-4' style={{
                                                color: activeTopic.boxColor ? activeTopic.boxColor[2] : '#1d316a'
                                            }}>{activeTopic.title}</h3>
                                        </div>
                                        <div
                                            className="w-full whitespace-pre-wrap text-[14px] md:text-[18px] font-[500]"
                                            style={{
                                                color: activeTopic.boxColor ? activeTopic.boxColor[2] : '#374151'
                                            }}
                                        >
                                            {activeTopic.content || ''}
                                        </div>
                                    </div>
                                </div>
                            ) : activeTopic?.type === 'file' ? (
                                <div className='w-full max-w-[calc(100%-30px)] md:max-w-[calc(100%-50px)]'>
                                    {activeTopic.fileUrl ? (
                                        <div className="w-full h-[100px] md:h-[150px] lg:h-[200px] py-2 flex flex-col items-center justify-center bg-gray-100 rounded-sm">
                                            <Image src="/course/modules/file.svg" alt="File icon" width={48} height={48} className="mb-2"/>
                                            <span className="text-center text-gray-700">File</span>
                                        </div>
                                    ) : (
                                        <div className="w-full h-[100px] md:h-[150px] lg:h-[200px] py-2 relative bg-gray-200 rounded-sm flex items-center justify-center text-gray-500">
                                            No File
                                        </div>
                                    )}
                                </div>
                            ) : activeTopic?.type === 'quiz' ? (
                                <div className='w-full max-w-[calc(100%-30px)] md:max-w-[calc(100%-50px)]'>
                                    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2 md:mb-4">
                                            <Image
                                                src="/course/modules/topics/quiz.svg"
                                                width={24}
                                                height={24}
                                                alt='quiz'
                                                className="w-[16px] h-[16px] md:w-[24px] md:h-[24px]"
                                            />
                                            <h3 className="text-md md:text-lg font-medium text-gray-900">{activeTopic.title}</h3>
                                        </div>
                                        {activeTopic.content && (
                                            <p className="text-gray-600 text-[14px] font-[500] mb-6">{activeTopic.content}</p>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                            <div className='min-w-[30px] md:min-w-[50px] max-w-[50px] flex flex-col items-center justify-center gap-2'>
                                <div className="cursor-grab">
                                    <Image src='/sidebar/drag.svg' alt='drag' width={16} height={16} className='w-[14px] h-[14px] md:w-[16px] md:h-[16px] opacity-80'/>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default Content
