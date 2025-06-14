'use client'
import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useStore } from '@/app/store/Store';
import { AppSidebar } from '@/components/app-sidebar';
import CreateFirstModule from '@/components/CreateFirstModule';
import ModulePage from './modules/[moduleId]/page';

const CourseDetailsPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  const courseId = params.courseId as string;
  const moduleId = searchParams.get('module');
  
  const { courses, setTitle } = useStore();
  const course = courses[courseId];

  // Update navbar title when course data is loaded
  useEffect(() => {
    if (course) {
      setTitle(course.courseTitle);
    }
  }, [course, setTitle]);

  if (!course) {
    return <div className="flex items-center justify-center min-h-screen">Course not found</div>;
  }

  return (
    <div className='flex'>
      <AppSidebar courseId={courseId}/>
      {moduleId ? (
        <ModulePage />
      ) : (
        <CreateFirstModule courseId={courseId}/>
      )}
    </div>
  );
};

export default CourseDetailsPage; 