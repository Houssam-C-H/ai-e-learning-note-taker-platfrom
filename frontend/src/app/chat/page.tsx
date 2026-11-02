'use client';

import { useState } from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { useCourses } from '@/hooks/useCourses';
import { ChatWindow } from '@/components/chat/ChatWindow';

export default function ChatPage() {
  const { courses } = useCourses();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-accent" />
            AI Academic Tutor
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Query transcripts, ask for explanations, or recall professor remarks across the entire semester.
          </p>
        </div>
      </div>

      <ChatWindow
        courses={courses}
        selectedCourseId={selectedCourseId}
        onSelectCourse={setSelectedCourseId}
      />
    </div>
  );
}

