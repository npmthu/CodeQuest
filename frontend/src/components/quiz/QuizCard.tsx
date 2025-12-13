import React from "react";
import { Link } from "react-router-dom";
import type { Quiz } from "../../interfaces/quiz.interface";

interface QuizCardProps {
  quiz: Quiz;
}

export function QuizCard({ quiz }: QuizCardProps) {
  // Quiz from the interface doesn't include questions or attempts count in the basic Quiz type
  // These would be part of QuizDetail if needed

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
      case "beginner":
        return "bg-green-100 text-green-800";
      case "medium":
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Link
      to={`/quizzes/${quiz.id}`}
      className="block p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-bold text-gray-900">{quiz.title}</h3>
        {quiz.difficulty && (
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(
              quiz.difficulty
            )}`}
          >
            {quiz.difficulty}
          </span>
        )}
      </div>

      {quiz.description && (
        <p className="text-gray-600 mb-4 line-clamp-2">{quiz.description}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500">
        {quiz.timeLimitMin && (
          <span>Duration: {quiz.timeLimitMin} min</span>
        )}
        <span>Pass: {quiz.passingScore}%</span>
        {!quiz.isPublished && (
          <span className="text-orange-600 font-medium">Draft</span>
        )}
      </div>

      {quiz.createdAt && (
        <div className="mt-3 text-sm text-gray-500">
          Created: {new Date(quiz.createdAt).toLocaleDateString()}
        </div>
      )}
    </Link>
  );
}
