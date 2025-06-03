'use client'
import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useNavbarStore } from '@/app/store/navbarStore';
import { AppSidebar } from '@/components/app-sidebar';
import CreateFirstModule from '@/components/CreateFirstModule';

const CourseDetailsPage = () => {
  const params = useParams();
  const courseId = params.courseId as string;

  const { courses, setTitle } = useNavbarStore();
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
      <CreateFirstModule/>
    </div>
  );
};

export default CourseDetailsPage; 