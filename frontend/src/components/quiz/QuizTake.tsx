import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Quiz, QuizQuestion, AnswerSubmission } from "../../types/quiz";
import { useSubmitQuiz } from "../../hooks/useApi";

interface QuizTakeProps {
  quiz: Quiz;
}

export function QuizTake({ quiz }: QuizTakeProps) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit_min * 60); // seconds
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitMutation = useSubmitQuiz(quiz.id);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Check if all questions are answered
    const unanswered = quiz.questions?.filter((q) => !answers[q.id]) || [];
    if (unanswered.length > 0 && timeLeft > 0) {
      const confirm = window.confirm(
        `You have ${unanswered.length} unanswered question(s). Submit anyway?`
      );
      if (!confirm) return;
    }

    setIsSubmitting(true);

    try {
      const submission: AnswerSubmission[] = Object.entries(answers).map(
        ([questionId, answer]) => ({
          questionId,
          answer: String(answer || ""), // Ensure answer is always a string
        })
      );

      console.log("Submitting answers:", submission);

      const result = await submitMutation.mutateAsync(submission);

      console.log("Submit result:", result);

      // Navigate to results page
      navigate(`/quizzes/${quiz.id}/result/${result.id}`);
    } catch (error: any) {
      alert(error.message || "Failed to submit quiz");
      setIsSubmitting(false);
    }
  };

  const progress = quiz.questions
    ? (Object.keys(answers).length / quiz.questions.length) * 100
    : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with timer and progress */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{quiz.title}</h2>
          <div
            className={`text-2xl font-mono font-bold ${
              timeLeft < 60 ? "text-red-600" : "text-gray-700"
            }`}
          >
            Time: {formatTime(timeLeft)}
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {Object.keys(answers).length} / {quiz.questions?.length || 0}{" "}
          questions answered
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions?.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            answer={answers[question.id]}
            onChange={(answer) => handleAnswerChange(question.id, answer)}
          />
        ))}
      </div>

      {/* Submit button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Submitting..." : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
}

interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  answer?: string;
  onChange: (answer: string) => void;
}

function QuestionCard({
  question,
  index,
  answer,
  onChange,
}: QuestionCardProps) {
  const options = Array.isArray(question.options)
    ? question.options
    : question.options
    ? typeof question.options === "string"
      ? JSON.parse(question.options)
      : []
    : [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
          {index + 1}
        </div>

        <div className="flex-grow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            {question.question_text}
            <span className="ml-2 text-sm text-gray-500">
              ({question.points} points)
            </span>
          </h3>

          {question.question_type === "multiple_choice" && (
            <div className="space-y-2">
              {options.map((option: any, idx: number) => {
                const optionText =
                  typeof option === "string"
                    ? option
                    : option.text || option.id || String(option);
                // Submit option.id (like "a", "b", "c") to match database
                const optionValue =
                  typeof option === "string"
                    ? option
                    : option.id || option.text || String(option);

                return (
                  <label
                    key={idx}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      answer === optionValue
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={optionValue}
                      checked={answer === optionValue}
                      onChange={(e) => onChange(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-gray-700">{optionText}</span>
                  </label>
                );
              })}
            </div>
          )}

          {question.question_type === "true_false" && (
            <div className="space-y-2">
              {["True", "False"].map((option) => (
                <label
                  key={option}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answer === option
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={answer === option}
                    onChange={(e) => onChange(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.question_type === "short_answer" && (
            <input
              type="text"
              value={answer || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}
