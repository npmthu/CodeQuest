import React from "react";
import { QuizCard } from "./QuizCard";
import type { Quiz } from "../../types/quiz";

interface QuizListProps {
  quizzes: Quiz[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

export function QuizList({
  quizzes,
  loading,
  error,
  emptyMessage = "No quizzes available",
}: QuizListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-gray-100 rounded-lg animate-pulse">
            <div className="h-6 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="p-12 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-6xl mb-4">📝</div>
        <p className="text-gray-600 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} />
      ))}
    </div>
  );
}
