import React, { useState } from "react";
import { useQuizzes } from "../hooks/useApi";
import { QuizList } from "./quiz/QuizList";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import quizBanner from "../assets/images/quiz-banner.png";

export default function QuizzesPage() {
  const [topicFilter, setTopicFilter] = useState<string | undefined>();
  const { data: quizzes, isLoading, error } = useQuizzes(topicFilter);
  const { user } = useAuth();

  const isInstructor = user?.role === "instructor" || user?.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="w-full overflow-hidden">
        <img 
          src={quizBanner} 
          alt="Quiz Banner" 
          className="w-full h-48 md:h-64 lg:h-72 object-cover"
        />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Quizzes</h1>
            <p className="text-gray-600 mt-2">
              Test your knowledge and track your progress
            </p>
          </div>

        {isInstructor && (
          <Link
            to="/quizzes/create"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Create Quiz
          </Link>
        )}
      </div>

      {/* Filters - Future enhancement: Add topic selector */}
      {/* <div className="mb-6">
        <select 
          value={topicFilter || ''} 
          onChange={(e) => setTopicFilter(e.target.value || undefined)}
          className="p-2 border rounded"
        >
          <option value="">All Topics</option>
        </select>
      </div> */}

      <QuizList
        quizzes={quizzes || []}
        loading={isLoading}
        error={error?.message}
        emptyMessage="No quizzes available yet. Check back soon!"
      />
      </div>
    </div>
  );
}
