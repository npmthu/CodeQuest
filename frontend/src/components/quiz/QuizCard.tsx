import React from "react";
import { Link } from "react-router-dom";
import type { Quiz } from "../../types/quiz";

interface QuizCardProps {
  quiz: Quiz;
}

export function QuizCard({ quiz }: QuizCardProps) {
  // Backend now returns count as number, not array
  const questionCount =
    typeof quiz.questions === "number"
      ? quiz.questions
      : Array.isArray(quiz.questions)
      ? quiz.questions.length
      : 0;

  const attemptCount =
    typeof quiz.attempts === "number"
      ? quiz.attempts
      : Array.isArray(quiz.attempts)
      ? quiz.attempts.length
      : 0;

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

      {quiz.topic && (
        <div className="mb-3">
          <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded">
            Topic: {quiz.topic.name}
          </span>
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>Duration: {quiz.time_limit_min} min</span>
        <span>{questionCount} questions</span>
        <span>Pass: {quiz.passing_score}%</span>
      </div>

      {attemptCount > 0 && (
        <div className="mt-3 text-sm text-gray-500">
          {attemptCount} attempt{attemptCount !== 1 ? "s" : ""}
        </div>
      )}

      {quiz.hasTaken && (
        <div className="mt-3">
          <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-sm rounded font-medium">
            Completed
          </span>
        </div>
      )}
    </Link>
  );
}
