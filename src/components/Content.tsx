import React, { useRef , useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/app/store/Store';
import { Topic, Quiz, QuizQuestion, QuizOption } from '@/utils/types';
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
    DragOverlay
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
    deletingQuestionId,
    setDeletingQuestionId
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: topic.id });
    const topicRef = useRef<HTMLDivElement>(null);
    const [topicHeight, setTopicHeight] = useState<string>('auto');

    // Memoized function to update height
    const updateHeight = useCallback(() => {
        if (topicRef.current && !isDragging) {
            const height = topicRef.current.getBoundingClientRect().height;
            setTopicHeight(`${height}px`);
        }
    }, [isDragging]);

    // Calculate height when content changes or renders
    useEffect(() => {
        // Listen for image/video load events to update height
        const images = topicRef.current?.querySelectorAll('img');
        const videos = topicRef.current?.querySelectorAll('video');
        const files = topicRef.current?.querySelectorAll('.file');
        const handleMediaLoad = () => updateHeight();

        images?.forEach(img => img.addEventListener('load', handleMediaLoad));
        videos?.forEach(video => video.addEventListener('loadedmetadata', handleMediaLoad));
        files?.forEach(video => video.addEventListener('loadedmetadata', handleMediaLoad));

        window.addEventListener('resize', updateHeight);

        return () => {
            images?.forEach(img => img.removeEventListener('load', handleMediaLoad));
            videos?.forEach(video => video.removeEventListener('loadedmetadata', handleMediaLoad));
            files?.forEach(file => file.removeEventListener('loadedmetadata', handleMediaLoad));
            window.removeEventListener('resize', updateHeight);
        };
    }, [topic, isEditing, formImageUrl, formVideoUrl, formTableData, formContent, formTitle, updateHeight]);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        boxShadow: isDragging ? '0px 5px 10px rgba(0, 0, 0, 0.1)' : 'none',
        width: '100%',
        flexShrink: 0,
        flexGrow: 0,
        height: isDragging ? topicHeight : 'auto',
        minHeight: topicHeight !== 'auto' ? topicHeight : 'auto',
        overflow: isDragging ? 'hidden' : 'visible',
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
        className={`relative w-full ${isDragging ? 'dragging-topic' : ''}`}>
            <div ref={topicRef} style={{ minHeight: isDragging ? topicHeight : 'auto' }}>
            {isEditing ? (
                <div className={`w-full mt-2 bg-white p-8 rounded-lg shadow border-[1px] border-[#9c53db] text-[14px] font-[400] text-[#313131]`}>
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
                                        console.log('File input onChange triggered');
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
                                        } else {
                                            console.log('No file selected.');
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
                                        width={24}
                                        height={24}
                                        alt='quiz'
                                        className="w-6 h-6"
                                    />
                                    )}
                                    {isEditing ? (
                                        <div className='flex flex-col gap-2'>
                                            <h3 className='text-[18px] font-[500]'>Quiz Title</h3>
                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={e => setFormTitle(e.target.value)}
                                            className="text-[16px] font-medium text-gray-900 border rounded px-3 py-2 w-full"
                                    onClick={e => e.stopPropagation()}
                                            placeholder="Enter quiz title"
                                        />
                                        </div>
                                    ) : (
                                        <h3 className="text-lg font-medium text-gray-900">{topic.title}</h3>
                                    )}
                                </div>
                                {isEditing ? (
                                    <div className='flex flex-col gap-2'>
                                        <h3 className='text-[18px] font-[500]'>Content</h3>
                                <textarea
                                    value={formContent}
                                    onChange={e => setFormContent(e.target.value)}
                                            className="text-gray-600 text-[16px] font-[500] mb-6 w-full border rounded px-3 py-2"
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
                                    {formQuizData?.questions?.map((question, index) => (
                                        <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex flex-col gap-4">
                                                <div className='flex justify-between items-center'>
                                                    <span className="text-gray-700 text-[16px] font-[500]">Question {index + 1}</span>
                                                    <div className='flex gap-2'>
                                    <button
                                                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                        onClick={e => {
                                            e.stopPropagation();
                                                                setEditingQuestionId(question.id);
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
                                                                // Update form state
                                                                const newQuestions = formQuizData?.questions?.filter((q: QuizQuestion) => q.id !== question.id);
                                            setFormQuizData((prev: Quiz) => ({
                                                ...prev,
                                                                    questions: newQuestions
                                                                }));
                                                                // Update topic state immediately
                                                                const updatedTopic = {
                                                                    ...topic,
                                                                    quizData: {
                                                                        id: topic.quizData?.id || crypto.randomUUID(),
                                                                        title: topic.quizData?.title || '',
                                                                        content: topic.quizData?.content || '',
                                                                        questions: newQuestions
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
                                                {formQuizData.questions[index]?.options?.map((option, oIndex) => (
                                                    <div key={option.id} className={`flex items-start gap-3 p-3 border rounded-lg ${option.isCorrect ? 'bg-[#f0fdf4] border-[#9beed5]' : 'bg-white border-gray-200'}`}>
                                                        {editingQuestionId === question.id ? (
                                                            <>
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
                                                                    const newQuestions = [...(formQuizData?.questions || [])];
                                                                                    if (newQuestions[index]) {
                                                                                        (newQuestions[index].options || []).forEach(opt => opt.isCorrect = false); // Clear others for single choice
                                                                                        if (newQuestions[index].options[oIndex]) {
                                                                                            newQuestions[index].options[oIndex] = {
                                                                                                ...newQuestions[index].options[oIndex],
                                                                                                isCorrect: e.target.checked
                                                                                            };
                                                                                            setFormQuizData(prev => ({
                                                                        ...prev,
                                                                        questions: newQuestions
                                                                    }));
                                                                                        }
                                                                                    }
                                                                                }}
                                                                                className="w-4 h-4 text-green-500 border-gray-300 focus:ring-green-500"
                                                                                onClick={e => e.stopPropagation()}
                                                                            />
                                                                        ) : (
                                                        <input
                                                                                type="checkbox"
                                                                                checked={formQuizData.questions[index]?.options[oIndex]?.isCorrect || false}
                                                            onChange={e => {
                                                                const newQuestions = [...(formQuizData?.questions || [])];
                                                                                    if (newQuestions[index] && newQuestions[index].options[oIndex]) {
                                                                                        newQuestions[index].options[oIndex] = {
                                                                                            ...newQuestions[index].options[oIndex],
                                                                    isCorrect: e.target.checked
                                                                };
                                                                                        setFormQuizData(prev => ({
                                                                    ...prev,
                                                                    questions: newQuestions
                                                                }));
                                                                                    }
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
                                                            </>
                                                        ) : (
                                                            <>
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
                                                            </>
                                                        )}
                                                </div>
                                            ))}
                                                {editingQuestionId === question.id && (
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
                                                )}
                                        </div>
                                            {editingQuestionId === question.id && (
                                                <div className="flex justify-end mt-4">
                                                    <button
                                                        className="px-4 py-2 rounded-lg bg-[#9b87f5] hover:bg-[#8f7ce2] text-white text-[14px] font-[500] transition-colors"
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            setEditingQuestionId(null);
                                                        }}
                                                    >
                                                        Done Editing
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
                                                // Update form state
                                                setFormQuizData((prev: Quiz) => ({
                                                    id: prev.id,
                                                    title: prev.title,
                                                    content: prev.content,
                                                    questions: [...(prev?.questions || []), newQuestion]
                                                }));
                                                // Update topic state immediately
                                                const updatedTopic = {
                                                    ...topic,
                                                    quizData: {
                                                        id: crypto.randomUUID(),
                                                        title: topic.quizData?.title || '',
                                                        content: topic.quizData?.content || '',
                                                        questions: [...(topic.quizData?.questions || []), newQuestion]
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
                        <div className='flex-grow rounded-sm'>
                            <div className='w-full whitespace-pre-wrap text-gray-700 text-[14px] md:text-[18px] font-[500] transition-all duration-300'>
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
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <Image
                                        src="/course/modules/topics/quiz.svg"
                                        width={24}
                                        height={24}
                                        alt='quiz'
                                        className="w-6 h-6"
                                    />
                                    <h3 className="text-lg font-medium text-gray-900">{topic.title}</h3>
                                </div>
                                {topic.content && (
                                    <p className="text-gray-600 text-[14px] font-[500] mb-6">{topic.content}</p>
                                )}
                                <div className="space-y-6">
                                    {formQuizData?.questions?.map((question, index) => (
                                        <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                                            <div className="flex flex-col gap-4">
                                                <div className='flex justify-between items-center'>
                                                    <span className="text-gray-700 text-[16px] font-[500]">Question {index + 1}</span>
                                                    <div className='flex gap-2'>
                                                        <button
                                                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                setEditingQuestionId(question.id);
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
                                                                // Update form state
                                                                const newQuestions = formQuizData?.questions?.filter((q: QuizQuestion) => q.id !== question.id);
                                                                setFormQuizData((prev: Quiz) => ({
                                                                    ...prev,
                                                                    questions: newQuestions
                                                                }));
                                                                // Update topic state immediately
                                                                const updatedTopic = {
                                                                    ...topic,
                                                                    quizData: {
                                                                        id: topic.quizData?.id || crypto.randomUUID(),
                                                                        title: topic.quizData?.title || '',
                                                                        content: topic.quizData?.content || '',
                                                                        questions: newQuestions
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
                                                <p className="text-[16px] text-gray-700 font-[500]">{question.question}</p>
                                            </div>
                                            <div className="space-y-3 mt-4">
                                                {question.options.map((option, oIndex) => (
                                                    <div key={option.id} className={`flex items-start gap-3 p-3 border rounded-lg ${option.isCorrect ? 'bg-[#f0fdf4] border-[#9beed5]' : 'bg-white border-gray-200'}`}>
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
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ): null}
                    <div className='min-w-[30px] md:min-w-[50px] max-w-[50px] flex flex-col items-center justify-center gap-2 transition-all duration-300'>
                        <div {...attributes} {...listeners} className="cursor-grab">
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
                    {deleteId === topic.id && (
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

const Content = ({ 
    moduleId,
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

    // Initialize form state when editing topic changes
    useEffect(() => {
        const topicToEdit = topics.find((t: Topic) => t.id === editingTopicId);
        if (topicToEdit) {
            setFormTitle(topicToEdit.title);
            setFormContent(topicToEdit.content || '');
            setFormImageUrl(topicToEdit.imageUrl || '');
            setFormVideoUrl(topicToEdit.videoUrl || '');
            setFormFileUrl(topicToEdit.fileUrl || '');
            setFormTableData(topicToEdit.tableData || [['Header 1', 'Header 2']]);
            setFormQuizData(topicToEdit.quizData || {
                id: crypto.randomUUID(),
                title: '',
                content: '',
                questions: []
            });
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
        }
    }, [editingTopicId, topics]);

    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragStart = (event: DragEndEvent) => {
        const { active } = event;
        const topic = topics.find((t: Topic) => t.id === active.id);
        if (topic) {
            setDraggedTopic(topic);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

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
        if (!moduleId || !courseId || !currentModule) return;
        setDeletingTopicId(topicId);
        try {
            
            const updatedModule = {
                ...currentModule,
                topics: (currentModule.topics || []).filter((t: Topic) => t.id !== topicId) as Topic[]
            };

            const updatedModules = course?.modules.map((mod: Module) => 
                mod.id === moduleId ? updatedModule : mod
            );

            setCourse(courseId, {
                modules: updatedModules
            });

            if (editingTopicId === topicId) {
                setEditingTopicId(null);
                setIsTopicEditing(false);
                const currentSearchParams = new URLSearchParams(searchParams.toString());
                currentSearchParams.delete('topic');
                router.replace(`${pathname}?${currentSearchParams.toString()}`, { scroll: false });
            }

        } finally {
            setDeletingTopicId(null);
            setDeleteId(null);
        }
    };

    const handleUpdateTopic = (topicId: number, updates: Partial<Topic>) => {
        if (!moduleId || !courseId || !currentModule) return;

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
        const updatedTopic = {
            ...topicToSave,
            title: formTitle,
            content: formContent,
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
    

    return (
        <div className='w-full max-w-[1280px] md:p-6 mx-auto flex flex-col items-center justify-center'>
            <div className={`relative w-full min-h-[150px] h-fit flex items-center justify-center  gap-6 rounded-lg p-2 ${topics.length > 0 ? 'border-none shadow-none' : 'border-dashed border-2 border-gray-200'}`}>
                {topics.length > 0 ? (
                    <DndContext 
                        sensors={sensors} 
                        collisionDetection={closestCenter} 
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToVerticalAxis]}
                    >
                        <SortableContext items={topics.map((t: Topic) => t.id)} strategy={verticalListSortingStrategy}>
                            <div className='w-full flex flex-col gap-4 md:gap-8'>
                                {topics.map((topic: Topic) => (
                                    <SortableTopic
                                        key={topic.id}
                                        topic={topic}
                                        isEditing={editingTopicId === topic.id}
                                        editingTopicId={editingTopicId}
                                        setEditingTopicId={setEditingTopicId}
                                        handleUpdateTopic={handleUpdateTopic}
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
                                        editingQuestionId={editingQuestionId}
                                        setEditingQuestionId={setEditingQuestionId}
                                        deletingQuestionId={deletingQuestionId}
                                        setDeletingQuestionId={setDeletingQuestionId}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                        <DragOverlay>
                            {draggedTopic ? (
                                <div
                                    className={`w-full flex flex-row items-center justify-between gap-2 md:gap-4 py-2 rounded-md`}
                                    style={{
                                        opacity: 0.8,
                                        boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.1)',
                                        width: '100%',
                                    }}
                                >
                                    {draggedTopic.type === 'text' ? (
                                        <div className='flex-grow rounded-sm'>
                                            <div className='w-full whitespace-pre-wrap text-gray-700 text-[14px] md:text-[18px] font-[500] p-2 md:p-4 transition-all duration-300'>
                                                {draggedTopic.content || ''}
                                            </div>
                                        </div>
                                    ) : draggedTopic.type === 'image' ? (
                                        <div className='w-full max-w-[calc(100%-30px)] md:max-w-[calc(100%-50px)] transition-all duration-300'>
                                            {draggedTopic.imageUrl ? (
                                                <div className="w-full h-[150px] md:h-[350px] lg:h-[500px] py-2 transition-all duration-300 relative">
                                                    <Image
                                                        src={draggedTopic.imageUrl}
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
                                    ) : draggedTopic.type === 'video' ? (
                                        <div className='flex-grow'>
                                            {draggedTopic.videoUrl ? (
                                                <div className="w-full aspect-video py-2 transition-all duration-300">
                                                    {draggedTopic.videoUrl.startsWith('blob:') ? (
                                                        <video controls className='w-full h-full rounded-sm'>
                                                            <source src={draggedTopic.videoUrl} type="video/mp4" />
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    ) : (
                                                        <Vimeo
                                                            video={draggedTopic.videoUrl || 'video not found'}
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
                                    ) : draggedTopic.type === 'table' ? (
                                        <div className='flex-grow transition-all duration-300 overflow-x-auto'>
                                            <table className="w-full border">
                                                <thead>
                                                    <tr>
                                                        {draggedTopic.tableData?.[0]?.map((cell: string, idx: number) => (
                                                            <th key={idx} className="px-2 py-1 border border-gray-300 text-center text-[14px] md:text-[18px] font-semibold text-gray-700 transition-all duration-300">
                                                                {cell}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {draggedTopic.tableData?.slice(1)?.filter((row: string[]) => row.some((cell: string) => cell !== ''))?.map((row: string[], rIdx: number) => (
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
                                    ) : draggedTopic.type === 'information' ? (
                                        <div
                                            className="w-full rounded-sm"
                                            style={{
                                                backgroundColor: draggedTopic.boxColor ? draggedTopic.boxColor[1] : '#89B4DD',
                                                border: draggedTopic.boxColor ? `1px solid ${draggedTopic.boxColor[0]}` : 'none',
                                            }}
                                        >
                                            <div className="flex flex-col items-start gap-2 p-4">
                                                <div className='flex items-start md:items-center gap-2 transition-all duration-300'>
                                                    <Image
                                                        src={`/course/modules/topics/info-${draggedTopic.boxColor?.[3] || 'blue'}.svg`}
                                                        width={24}
                                                        height={24}
                                                        alt='info'
                                                        className="w-4 h-4 md:w-6 md:h-6 transition-all duration-300"
                                                    />
                                                    <h3 className='text-[15px] md:text-[18px] font-[500] leading-4 transition-all duration-300' style={{
                                                        color: draggedTopic.boxColor ? draggedTopic.boxColor[2] : '#1d316a'
                                                    }}>{draggedTopic.title}</h3>
                                                </div>
                                                <div
                                                    className="w-full whitespace-pre-wrap text-[14px] md:text-[18px] font-[500] transition-all duration-300"
                                                    style={{
                                                        color: draggedTopic.boxColor ? draggedTopic.boxColor[2] : '#374151'
                                                    }}
                                                >
                                                    {draggedTopic.content || ''}
                                                </div>
                                            </div>
                                        </div>
                                    ) : draggedTopic.type === 'file' ? (
                                        <div className='w-full max-w-[calc(100%-30px)] md:max-w-[calc(100%-50px)] transition-all duration-300'>
                                            {draggedTopic.fileUrl ? (
                                                <a href={draggedTopic.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                                    <div className="w-full h-[150px] md:h-[350px] lg:h-[500px] py-2 flex flex-col items-center justify-center bg-gray-100 rounded-sm">
                                                        <Image src="/course/modules/file.svg" alt="File icon" width={48} height={48} className="mb-2"/>
                                                        <span className="text-center text-gray-700">Download File</span>
                                                    </div>
                                                </a>
                                            ) : (
                                                <div className="w-full h-[150px] md:h-[350px] lg:h-[500px] py-2 transition-all duration-300 relative bg-gray-200 rounded-sm flex items-center justify-center text-gray-500">
                                                    No File
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                    <div className='min-w-[30px] md:min-w-[50px] max-w-[50px] flex flex-col items-center justify-center gap-2 transition-all duration-300'>
                                        <div className="cursor-grab">
                                            <Image src='/sidebar/drag.svg' alt='drag' width={16} height={16} className='w-[14px] h-[14px] md:w-[16px] md:h-[16px] opacity-80'/>
                                        </div>
                                        <Image
                                            src="/sidebar/edit.svg"
                                            alt="edit"
                                            width={16}
                                            height={16}
                                            className='opacity-60 cursor-pointer w-[14px] h-[14px] md:w-[16px] md:h-[16px] transition-all duration-300'
                                        />
                                        <Image
                                            src="/sidebar/delete.svg"
                                            alt="delete"
                                            width={16}
                                            height={16}
                                            className='opacity-60 cursor-pointer w-[14px] h-[14px] md:w-[16px] md:h-[16px] transition-all duration-300'
                                        />
                                    </div>
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                ) : (
                    <div className='flex flex-col items-center justify-center gap-2 text-gray-400'>
                        <h3 className='text-[14px] md:text-[16px] font-[400]'>No topics yet</h3>
                        <p className='text-[12px] md:text-[14px]'>Use the "Add New Topic" button below to create content</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Content
