// React hooks and components imported below
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuizResult } from "../hooks/useApi";

export default function QuizResultPage() {
  const { id, resultId } = useParams<{ id: string; resultId: string }>();
  useNavigate();
  const {
    data: result,
    isLoading,
    error,
  } = useQuizResult(id || "", resultId || "");

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error?.message || "Result not found"}</p>
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

  const passed = result.passed;
  const percentage =
    result.percentage || Math.round((result.score / result.total_points) * 100);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link
          to={`/quizzes/${id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          ← Back to quiz
        </Link>

        {/* Result summary */}
        <div
          className={`rounded-lg shadow-lg p-8 mb-8 ${
            passed
              ? "bg-green-50 border-2 border-green-300"
              : "bg-red-50 border-2 border-red-300"
          }`}
        >
          <div className="text-center">
            <h1
              className={`text-4xl font-bold mb-4 ${
                passed ? "text-green-800" : "text-red-800"
              }`}
            >
              {passed ? "Congratulations!" : "Keep Practicing!"}
            </h1>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {result.score} / {result.total_points} points
            </div>
            <div className="text-2xl font-semibold text-gray-700 mb-6">
              {percentage}%
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-2xl font-bold text-gray-900">
                  {result.details?.filter((q: any) => q.isCorrect).length || 0}
                </div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-2xl font-bold text-gray-900">
                  {result.details?.filter((q: any) => !q.isCorrect).length || 0}
                </div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-2xl font-bold text-gray-900">
                  {result.details?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>

            {result.submitted_at && (
              <div className="mt-6 text-gray-600">
                Submitted: {new Date(result.submitted_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Question breakdown */}
        {result.details && result.details.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Question Breakdown</h2>
            <div className="space-y-6">
              {result.details.map((question: any, index: number) => (
                <div
                  key={question.questionId || index}
                  className={`border-l-4 p-6 rounded-r-lg ${
                    question.isCorrect
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg flex-grow">
                      Question {index + 1}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded font-semibold ${
                          question.isCorrect
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {question.isCorrect ? "Correct" : "Incorrect"}
                      </span>
                      <span className="text-gray-700 font-semibold">
                        {question.points} pts
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-800 mb-4">{question.question_text}</p>

                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold text-gray-700">
                        Your answer:{" "}
                      </span>
                      <span
                        className={
                          question.isCorrect ? "text-green-700" : "text-red-700"
                        }
                      >
                        {question.userAnswer || "(No answer)"}
                      </span>
                    </div>

                    {!question.isCorrect && (
                      <div>
                        <span className="font-semibold text-gray-700">
                          Correct answer:{" "}
                        </span>
                        <span className="text-green-700">
                          {question.correctAnswer ||
                            question.correct_answer ||
                            "N/A"}
                        </span>
                      </div>
                    )}

                    {question.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <span className="font-semibold text-blue-800">
                          💡 Explanation:{" "}
                        </span>
                        <span className="text-blue-900">
                          {question.explanation}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex gap-4">
          <Link
            to="/quizzes"
            className="flex-grow px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Browse More Quizzes
          </Link>
        </div>
      </div>
    </div>
  );
}
