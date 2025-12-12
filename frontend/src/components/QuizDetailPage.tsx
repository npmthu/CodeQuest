import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuiz, useQuizResults, useQuizStatistics } from "../hooks/useApi";
import { QuizTake } from "./quiz/QuizTake";
import { useAuth } from "../contexts/AuthContext";

export default function QuizDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showTake, setShowTake] = useState(false);

  const isInstructor = user?.role === "instructor" || user?.role === "admin";

  const { data: quiz, isLoading, error } = useQuiz(id);
  const { data: results } = useQuizResults(id || "", isInstructor);
  const { data: statistics } = useQuizStatistics(id || "", isInstructor);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-8"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error?.message || "Quiz not found"}</p>
          <Link
            to="/quizzes"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            ← Back to quizzes
          </Link>
        </div>
      </div>
    );
  }

  // If user is taking the quiz
  if (showTake) {
    return (
      <div className="container mx-auto px-4 py-8">
        <QuizTake quiz={quiz} />
      </div>
    );
  }

  const questionCount = Array.isArray(quiz.questions)
    ? quiz.questions.length
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link
          to="/quizzes"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          ← Back to quizzes
        </Link>

        {/* Quiz header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900">{quiz.title}</h1>
            {quiz.difficulty && (
              <span
                className={`px-3 py-1 text-sm font-medium rounded ${
                  quiz.difficulty === "Easy" || quiz.difficulty === "Beginner"
                    ? "bg-green-100 text-green-800"
                    : quiz.difficulty === "Medium" ||
                      quiz.difficulty === "Intermediate"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {quiz.difficulty}
              </span>
            )}
          </div>

          {quiz.description && (
            <p className="text-gray-700 text-lg mb-6">{quiz.description}</p>
          )}

          {quiz.topic && (
            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded">
                📚 {quiz.topic.name}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900">
                {questionCount}
              </div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900">
                {quiz.time_limit_min}
              </div>
              <div className="text-sm text-gray-600">Minutes</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900">
                {quiz.passing_score}%
              </div>
              <div className="text-sm text-gray-600">To Pass</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900">
                {results?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Attempts</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            {quiz.hasTaken ? (
              <div className="flex-grow">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <p className="text-green-800 font-semibold">
                    ✓ You've completed this quiz
                  </p>
                  <Link
                    to={`/quizzes/${quiz.id}/results`}
                    className="text-blue-600 hover:underline mt-2 inline-block"
                  >
                    View your results →
                  </Link>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowTake(true)}
                className="flex-grow px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Quiz
              </button>
            )}

            {isInstructor && (
              <Link
                to={`/quizzes/${quiz.id}/edit`}
                className="px-6 py-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Edit Quiz
              </Link>
            )}
          </div>
        </div>

        {/* Statistics (for instructors) */}
        {isInstructor && statistics && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6">Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {statistics.totalAttempts}
                </div>
                <div className="text-sm text-gray-600">Total Attempts</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {statistics.averageScore}%
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {statistics.highestScore}%
                </div>
                <div className="text-sm text-gray-600">Highest Score</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {statistics.lowestScore}%
                </div>
                <div className="text-sm text-gray-600">Lowest Score</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {statistics.passRate}%
                </div>
                <div className="text-sm text-gray-600">Pass Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3">📋 Instructions</h3>
          <ul className="space-y-2 text-blue-800">
            <li>
              • You have {quiz.time_limit_min} minutes to complete this quiz
            </li>
            <li>• The quiz will auto-submit when time runs out</li>
            <li>• You need {quiz.passing_score}% or higher to pass</li>
            <li>• Each quiz can only be taken once</li>
            <li>• Make sure you have a stable internet connection</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
