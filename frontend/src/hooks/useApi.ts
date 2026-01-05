import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";
import {
  topicService,
  lessonService,
  problemService,
  quizService,
  forumService,
  submissionService,
  userService,
  aiService,
} from "../services";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE || "http://localhost:3000/api";

// Helper to get auth headers
async function getAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    ...(session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {}),
  };
}

// Generic fetch wrapper
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return data;
}

// Auth Hooks
export function useRegister() {
  return useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      fullName?: string;
    }) => {
      return apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      // Use Supabase client for login
      const { data, error } = await supabase.auth.signInWithPassword(payload);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return null;

      const result = await apiFetch("/auth/me");
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// User Stats Hook
export function useUserStats() {
  return useQuery({
    queryKey: ["userStats"],
    queryFn: async () => {
      // Keep using apiFetch for stats as this endpoint might not be in userService yet
      const result = await apiFetch("/users/me/stats");
      return result.data;
    },
    enabled: true,
  });
}

// User Learning Profile Hook
export function useUserProgress() {
  return useQuery({
    queryKey: ["userProgress"],
    queryFn: async () => {
      const result = await apiFetch("/users/me/learning-profile");
      return result.data;
    },
  });
}

// Update User Profile Hook
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      display_name?: string;
      bio?: string;
      avatar_url?: string;
    }) => {
      return userService.updateProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const result = await apiFetch("/users/change-password", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return result.data;
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async (payload: { password: string }) => {
      const result = await apiFetch("/users/account", {
        method: "DELETE",
        body: JSON.stringify(payload),
      });
      return result.data;
    },
  });
}

export function useRevokeSession() {
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const result = await apiFetch(`/users/sessions/${sessionId}/revoke`, {
        method: "POST",
      });
      return result.data;
    },
  });
}

// Course Hooks
export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const result = await apiFetch("/courses");
      return result.data;
    },
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const result = await apiFetch(`/courses/${id}`);
      return result.data;
    },
    enabled: !!id,
  });
}

export function useCourseProgress(courseId: string) {
  return useQuery({
    queryKey: ["courseProgress", courseId],
    queryFn: async () => {
      const result = await apiFetch(`/courses/${courseId}/progress`);
      return result.data;
    },
    enabled: !!courseId,
  });
}

// Enrollment Hooks
export function useMyEnrollments() {
  return useQuery({
    queryKey: ["myEnrollments"],
    queryFn: async () => {
      const result = await apiFetch("/enrollments");
      return result.data;
    },
  });
}

export function useEnrollInCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const result = await apiFetch(`/enrollments/${courseId}`, {
        method: "POST",
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myEnrollments"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useCheckEnrollment(courseId: string) {
  return useQuery({
    queryKey: ["enrollment", courseId],
    queryFn: async () => {
      const result = await apiFetch(`/enrollments/check/${courseId}`);
      return result.data;
    },
    enabled: !!courseId,
  });
}

// Leaderboard Hook
export function useLeaderboard(limit: number = 100) {
  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: async () => {
      const result = await apiFetch(`/users/leaderboard?limit=${limit}`);
      return result.data;
    },
  });
}

// Topics Hooks
export function useTopics() {
  return useQuery({
    queryKey: ["topics"],
    queryFn: () => topicService.getTopics(),
  });
}

export function useTopic(id: string) {
  return useQuery({
    queryKey: ["topic", id],
    queryFn: () => topicService.getTopicById(id),
    enabled: !!id,
  });
}

// Lessons Hooks
export function useLessons(topicId?: string) {
  return useQuery({
    queryKey: ["lessons", topicId],
    queryFn: () => lessonService.getLessons(topicId),
  });
}

export function useLesson(id: string) {
  return useQuery({
    queryKey: ["lesson", id],
    queryFn: () => lessonService.getLessonById(id),
    enabled: !!id,
  });
}

// Current lesson for a topic (computed client-side for now)
export function useGetCurrentLesson(topicId?: string) {
  return useQuery({
    queryKey: ["currentLesson", topicId],
    queryFn: async () => {
      const result = await apiFetch(
        `/lessons/current${topicId ? `?topicId=${topicId}` : ""}`
      );
      return result.data || null;
    },
    enabled: !!topicId,
    staleTime: 60 * 1000,
  });
}

export function useUpdateLessonProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      completed,
      timeSpentSec,
    }: {
      lessonId: string;
      completed?: boolean;
      timeSpentSec?: number;
    }) => {
      return lessonService.updateProgress(lessonId, {
        completed,
        timeSpentSec,
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific lesson to update isCompleted status
      queryClient.invalidateQueries({
        queryKey: ["lesson", variables.lessonId],
      });
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
    },
  });
}

// Problems Hooks
export function useProblems() {
  return useQuery({
    queryKey: ["problems"],
    queryFn: () => problemService.getProblems(),
  });
}

export function useProblemsByTopic(topicId?: string | null) {
  return useQuery({
    queryKey: ["problems", "topic", topicId],
    queryFn: async () => {
      if (!topicId) return [];
      const result = await apiFetch(`/problems?topic_id=${topicId}`);
      return result.data || [];
    },
    enabled: !!topicId,
  });
}

export function useProblem(id: string) {
  return useQuery({
    queryKey: ["problem", id],
    queryFn: () => problemService.getProblemById(id),
    enabled: !!id,
  });
}

// Submissions Hook
export function useSubmitCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      problemId: string;
      code: string;
      languageId: string;
    }) => {
      return submissionService.createSubmission({
        problemId: payload.problemId,
        code: payload.code,
        languageId: payload.languageId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
    },
  });
}

export function useSubmissions(problemId?: string) {
  return useQuery({
    queryKey: ["submissions", problemId],
    queryFn: () => submissionService.getUserSubmissions(),
  });
}

// Instructor Hooks
export function useInstructorStats() {
  return useQuery({
    queryKey: ["instructorStats"],
    queryFn: async () => {
      const result = await apiFetch("/instructor/stats");
      return result.data;
    },
  });
}

export function useInstructorCourses() {
  return useQuery({
    queryKey: ["instructorCourses"],
    queryFn: async () => {
      const result = await apiFetch("/instructor/courses");
      return result.data;
    },
  });
}

export function useInstructorAnalytics() {
  return useQuery({
    queryKey: ["instructorAnalytics"],
    queryFn: async () => {
      const result = await apiFetch("/instructor/analytics");
      return result.data;
    },
  });
}

export function useInstructorActivities() {
  return useQuery({
    queryKey: ["instructorActivities"],
    queryFn: async () => {
      const result = await apiFetch("/instructor/activities");
      return result.data;
    },
  });
}

// Business Hooks
export function useBusinessStats() {
  return useQuery({
    queryKey: ["businessStats"],
    queryFn: async () => {
      const result = await apiFetch("/business/stats");
      return result.data;
    },
  });
}

export function useBusinessLeaderboard(limit: number = 10) {
  return useQuery({
    queryKey: ["businessLeaderboard", limit],
    queryFn: async () => {
      const result = await apiFetch(`/business/leaderboard?limit=${limit}`);
      return result.data;
    },
  });
}

export function useBusinessAnalytics() {
  return useQuery({
    queryKey: ["businessAnalytics"],
    queryFn: async () => {
      const result = await apiFetch("/business/analytics");
      return result.data;
    },
  });
}

export function useBusinessCohorts() {
  return useQuery({
    queryKey: ["businessCohorts"],
    queryFn: async () => {
      const result = await apiFetch("/business/cohorts");
      return result.data;
    },
  });
}

export function useBusinessActivities() {
  return useQuery({
    queryKey: ["businessActivities"],
    queryFn: async () => {
      const result = await apiFetch("/business/activities");
      return result.data;
    },
  });
}

export function useAddLearner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      department?: string;
      cohort?: string;
    }) => {
      const result = await apiFetch("/business/learners", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessLearners"] });
    },
  });
}

export function useUpdateLearner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id: string;
      name?: string;
      department?: string;
      cohort?: string;
    }) => {
      const { id, ...body } = payload;
      const result = await apiFetch(`/business/learners/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessLearners"] });
    },
  });
}

export function useDeleteLearner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await apiFetch(`/business/learners/${id}`, {
        method: "DELETE",
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessLearners"] });
    },
  });
}

export function useAddInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      specialization?: string;
      cohorts?: string[];
      bio?: string;
    }) => {
      const result = await apiFetch("/business/instructors", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessInstructors"] });
    },
  });
}

export function useUpdateInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id: string;
      name?: string;
      specialization?: string;
      cohorts?: string[];
      bio?: string;
    }) => {
      const { id, ...body } = payload;
      const result = await apiFetch(`/business/instructors/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessInstructors"] });
    },
  });
}

export function useDeleteInstructor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await apiFetch(`/business/instructors/${id}`, {
        method: "DELETE",
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessInstructors"] });
    },
  });
}

// Forum Hooks

/**
 * Fetch forum posts with optional tag filter
 * @param tag - Optional tag to filter posts by
 */
export function useForumPosts(tag?: string | null) {
  return useQuery({
    // Include tag in query key to refetch when tag changes
    queryKey: ["forumPosts", tag || "all"],
    queryFn: async () => await forumService.getPosts(tag || undefined),
  });
}

export function useForumPost(id: string) {
  return useQuery({
    queryKey: ["forumPost", id],
    queryFn: () => forumService.getPostById(id),
    enabled: !!id,
  });
}

export function useUserVotes(postId: string) {
  return useQuery({
    queryKey: ["userVotes", postId],
    queryFn: async () => {
      const result = await apiFetch(`/forum/posts/${postId}/votes`);
      return result.data as {
        postVote: string | null;
        replyVotes: Record<string, string>;
      };
    },
    enabled: !!postId,
  });
}

export function useCreateForumPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      contentMarkdown: string;
      relatedProblem_id?: string;
      tags?: string[];
    }) => {
      return forumService.createPost(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
    },
  });
}

export function useCreateForumReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      contentMarkdown,
      codeSnippet,
      parentReplyId,
    }: {
      postId: string;
      contentMarkdown: string;
      codeSnippet?: any;
      parentReplyId?: string;
    }) => {
      return apiFetch(`/forum/posts/${postId}/replies`, {
        method: "POST",
        body: JSON.stringify({
          contentMarkdown,
          codeSnippet,
          parentReplyId,
        }),
      });
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["forumPost", variables.postId],
      });
      await queryClient.cancelQueries({ queryKey: ["forumPosts"] });

      const previousPost = queryClient.getQueryData<any>([
        "forumPost",
        variables.postId,
      ]);
      const previousList = queryClient.getQueryData<any>(["forumPosts"]);

      // create optimistic reply (temp id)
      const optimisticReply = {
        id: `temp-${Date.now()}`,
        post_id: variables.postId,
        author_id:
          (await supabase.auth.getSession()).data.session?.user?.id ?? "anon",
        author: {
          id:
            (await supabase.auth.getSession()).data.session?.user?.id ?? "anon",
          display_name: "You",
          avatar_url: null,
        },
        parent_reply_id: variables.parentReplyId ?? null,
        content_markdown: variables.contentMarkdown,
        code_snippet: variables.codeSnippet ?? null,
        upvotes: 0,
        is_accepted_answer: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (previousPost) {
        queryClient.setQueryData(
          ["forumPost", variables.postId],
          (old: any) => ({
            ...old,
            reply_count: (old?.reply_count ?? 0) + 1,
            replies: [optimisticReply, ...(old?.replies ?? [])],
          })
        );
      }

      // update posts list cache (if present)
      if (previousList) {
        queryClient.setQueryData(
          ["forumPosts"],
          (old: any[]) =>
            old?.map((p) =>
              p.id === variables.postId
                ? { ...p, reply_count: (p.reply_count ?? 0) + 1 }
                : p
            ) ?? old
        );
      }

      return { previousPost, previousList, optimisticReply };
    },

    onError: (_err, variables, context: any) => {
      // rollback
      if (context?.previousPost) {
        queryClient.setQueryData(
          ["forumPost", variables.postId],
          context.previousPost
        );
      }
      if (context?.previousList) {
        queryClient.setQueryData(["forumPosts"], context.previousList);
      }
    },
    onSuccess: (data, variables, context: any) => {
      // if server returns the created reply, replace temp id in forumPost.replies
      const createdReply = data?.data ?? null;
      if (createdReply) {
        queryClient.setQueryData(
          ["forumPost", variables.postId],
          (old: any) => {
            if (!old) return old;
            const replies = (old.replies ?? []).map((r: any) =>
              r.id &&
              r.id.toString().startsWith("temp-") &&
              context?.optimisticReply &&
              r.id === context.optimisticReply.id
                ? createdReply
                : r
            );
            return { ...old, replies };
          }
        );
      }
      // finally ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["forumPost", variables.postId],
      });
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["forumPost", variables.postId],
      });
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
    },
  });
}

export function useVoteForumItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      votableType,
      votableId,
      voteType,
      _postId,
    }: {
      votableType: "post" | "reply";
      votableId: string;
      voteType: "upvote" | "downvote";
      _postId: string; // needed to update userVotes cache
    }) => {
      return apiFetch("/forum/vote", {
        method: "POST",
        body: JSON.stringify({ votableType, votableId, voteType }),
      });
    },

    onMutate: async (variables) => {
      const { votableType, votableId, voteType, _postId } = variables;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["forumPost", _postId] });
      await queryClient.cancelQueries({ queryKey: ["forumPosts"] });
      await queryClient.cancelQueries({ queryKey: ["userVotes", _postId] });

      // Snapshot previous values
      const previousPost = queryClient.getQueryData(["forumPost", _postId]);
      const previousList = queryClient.getQueryData(["forumPosts"]);
      const previousVotes = queryClient.getQueryData([
        "userVotes",
        _postId,
      ]) as any;

      // Determine if this is toggling off or changing vote
      const currentVote =
        votableType === "post"
          ? previousVotes?.postVote
          : previousVotes?.replyVotes?.[votableId];

      const isToggleOff = currentVote === voteType;
      const delta = isToggleOff ? -1 : currentVote ? 0 : 1;

      // Optimistically update post/reply upvotes
      if (votableType === "post") {
        queryClient.setQueryData(["forumPost", _postId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            upvotes: Math.max(0, (old.upvotes ?? 0) + delta),
          };
        });

        queryClient.setQueryData(["forumPosts"], (old: any[]) => {
          if (!old) return old;
          return old.map((p) =>
            p.id === votableId
              ? { ...p, upvotes: Math.max(0, (p.upvotes ?? 0) + delta) }
              : p
          );
        });
      } else {
        // Update reply upvotes
        queryClient.setQueryData(["forumPost", _postId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            replies:
              old.replies?.map((r: any) =>
                r.id === votableId
                  ? { ...r, upvotes: Math.max(0, (r.upvotes ?? 0) + delta) }
                  : r
              ) || [],
          };
        });
      }

      // Update user votes cache
      queryClient.setQueryData(["userVotes", _postId], (old: any) => {
        if (!old) return old;
        if (votableType === "post") {
          return {
            ...old,
            postVote: isToggleOff ? null : voteType,
          };
        } else {
          return {
            ...old,
            replyVotes: {
              ...old.replyVotes,
              [votableId]: isToggleOff ? undefined : voteType,
            },
          };
        }
      });

      return { previousPost, previousList, previousVotes };
    },

    onError: (_err, variables, context: any) => {
      // Rollback on error
      if (context?.previousPost) {
        queryClient.setQueryData(
          ["forumPost", variables._postId],
          context.previousPost
        );
      }
      if (context?.previousList) {
        queryClient.setQueryData(["forumPosts"], context.previousList);
      }
      if (context?.previousVotes) {
        queryClient.setQueryData(
          ["userVotes", variables._postId],
          context.previousVotes
        );
      }
    },

    onSuccess: (_data, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["forumPost", variables._postId],
      });
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      queryClient.invalidateQueries({
        queryKey: ["userVotes", variables._postId],
      });
    },
  });
}

// Delete Forum Post Hook
export function useDeleteForumPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      return apiFetch(`/forum/posts/${postId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
    },
  });
}

// Delete Reply Hook
export function useDeleteReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      replyId,
      _postId,
    }: {
      replyId: string;
      _postId: string;
    }) => {
      return apiFetch(`/forum/replies/${replyId}`, {
        method: "DELETE",
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["forumPost", variables._postId],
      });
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
    },
  });
}

// Interview Hooks
export function useInterviewSessions() {
  return useQuery({
    queryKey: ["interviewSessions"],
    queryFn: async () => {
      const result = await apiFetch("/interview/sessions?limit=1000");
      return result.data || [];
    },
  });
}

export function useInterviewSession(id: string) {
  return useQuery({
    queryKey: ["interviewSession", id],
    queryFn: async () => {
      const result = await apiFetch(`/interview/sessions/${id}`);
      return result.data || null;
    },
    enabled: !!id,
  });
}

export function useCreateInterviewSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      interviewerId?: string;
      interviewType: string;
      difficulty?: string;
      scheduledAt?: string;
      durationMin?: number;
      notes?: string;
    }) => {
      return apiFetch("/interview/sessions", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviewSessions"] });
    },
  });
}

export function useUpdateInterviewSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      startedAt,
      endedAt,
      recordingUrl,
      notes,
    }: {
      id: string;
      status?: string;
      startedAt?: string;
      endedAt?: string;
      recordingUrl?: string;
      notes?: string;
    }) => {
      return apiFetch(`/interview/sessions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          startedAt,
          endedAt,
          recordingUrl,
          notes,
        }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["interviewSession", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["interviewSessions"] });
    },
  });
}

export function useSubmitInterviewFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      to_user_id,
      overall_rating,
      communication_rating,
      problem_solving_rating,
      technical_knowledge_rating,
      feedback_text,
      recommended_topics,
    }: {
      sessionId: string;
      to_user_id: string;
      overall_rating: number;
      communication_rating?: number;
      problem_solving_rating?: number;
      technical_knowledge_rating?: number;
      feedback_text?: string;
      recommended_topics?: any;
    }) => {
      return apiFetch(`/interview/sessions/${sessionId}/feedback`, {
        method: "POST",
        body: JSON.stringify({
          to_user_id,
          overall_rating,
          communication_rating,
          problem_solving_rating,
          technical_knowledge_rating,
          feedback_text,
          recommended_topics,
        }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["interviewSession", variables.sessionId],
      });
    },
  });
}

export function useAvailableInterviewers() {
  return useQuery({
    queryKey: ["availableInterviewers"],
    queryFn: async () => {
      const result = await apiFetch("/interview/available-interviewers");
      return result.data;
    },
  });
}

// Notes Hooks
export function useNotes() {
  return useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const result = await apiFetch("/notes");
      return result.data || [];
    },
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: ["note", id],
    queryFn: async () => {
      const result = await apiFetch(`/notes/${id}`);
      return result.data || null;
    },
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title?: string;
      contentMarkdown?: string;
      isPrivate?: boolean;
      tags?: string[];
      problemId?: string;
      lessonId?: string;
    }) => {
      return apiFetch("/notes", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useUpdateNote(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title?: string;
      contentMarkdown?: string;
      isPrivate?: boolean;
      tags?: string[];
    }) => {
      return apiFetch(`/notes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note", id] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiFetch(`/notes/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

// ============================================
// Quiz Hooks
// ============================================

const QUIZ_KEYS = {
  all: ["quizzes"] as const,
  lists: () => [...QUIZ_KEYS.all, "list"] as const,
  list: (filters?: { topicId?: string }) =>
    [...QUIZ_KEYS.lists(), filters] as const,
  details: () => [...QUIZ_KEYS.all, "detail"] as const,
  detail: (id: string) => [...QUIZ_KEYS.details(), id] as const,
  attempts: (quizId: string) =>
    [...QUIZ_KEYS.detail(quizId), "attempts"] as const,
  statistics: (quizId: string) =>
    [...QUIZ_KEYS.detail(quizId), "statistics"] as const,
};

// Get all quizzes (with optional topic filter)
export function useQuizzes(topicId?: string) {
  return useQuery({
    queryKey: QUIZ_KEYS.list({ topicId }),
    queryFn: () => quizService.getQuizzes(topicId),
  });
}

// Get single quiz by ID
export function useQuiz(quizId: string | undefined) {
  return useQuery({
    queryKey: QUIZ_KEYS.detail(quizId || ""),
    queryFn: async () => {
      if (!quizId) throw new Error("Quiz ID required");
      return quizService.getQuizById(quizId);
    },
    enabled: !!quizId,
  });
}

// Create new quiz (instructor/admin only)
export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await apiFetch("/quizzes", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.lists() });
    },
  });
}

// Update quiz
export function useUpdateQuiz(quizId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await apiFetch(`/quizzes/${quizId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.detail(quizId) });
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.lists() });
    },
  });
}

// Delete quiz
export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      await apiFetch(`/quizzes/${quizId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.lists() });
    },
  });
}

// Submit quiz answers
export function useSubmitQuiz(quizId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answers: any[]) => {
      return quizService.submitQuiz(quizId, { answers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.detail(quizId) });
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.attempts(quizId) });
    },
  });
}

// Get quiz attempts/results
export function useQuizResults(quizId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUIZ_KEYS.attempts(quizId),
    queryFn: async () => {
      const result = await apiFetch(`/quizzes/${quizId}/results`);
      return result.data;
    },
    enabled: enabled && !!quizId,
  });
}

// Get specific result detail
export function useQuizResult(quizId: string, resultId: string | undefined) {
  return useQuery({
    queryKey: [...QUIZ_KEYS.attempts(quizId), resultId],
    queryFn: async () => {
      if (!resultId) throw new Error("Result ID required");
      const result = await apiFetch(`/quizzes/${quizId}/result/${resultId}`);
      return result.data;
    },
    enabled: !!resultId,
  });
}

// Get quiz statistics (instructor/admin only)
export function useQuizStatistics(quizId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUIZ_KEYS.statistics(quizId),
    queryFn: async () => {
      const result = await apiFetch(`/quizzes/${quizId}/statistics`);
      return result.data;
    },
    enabled: enabled && !!quizId,
  });
}

// Get my quiz results
export function useMyQuizResults() {
  return useQuery({
    queryKey: ["my-quiz-results"],
    queryFn: async () => {
      const result = await apiFetch("/user/quiz-results");
      return result.data;
    },
  });
}

// ============================================
// AI Hooks
// ============================================

// Request AI code review for a submission
export function useRequestCodeReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      code,
      language,
      problemTitle,
    }: {
      submissionId: string;
      code: string;
      language: string;
      problemTitle?: string;
    }) => {
      const result = await apiFetch("/ai/code-review", {
        method: "POST",
        body: JSON.stringify({ submissionId, code, language, problemTitle }),
      });
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["codeReview", variables.submissionId],
      });
    },
  });
}

// Get existing code review
export function useCodeReview(submissionId: string | undefined) {
  return useQuery({
    queryKey: ["codeReview", submissionId],
    queryFn: async () => {
      if (!submissionId) throw new Error("Submission ID required");
      const result = await apiFetch(`/ai/code-review/${submissionId}`);
      return result.data;
    },
    enabled: !!submissionId,
    // If the review doesn't exist yet, retry a few times and poll while missing
    retry: 3,
    // When the query is in error state (e.g., 404), poll every 2s to pick up the review
    refetchInterval: (query) => (query.state.status === "error" ? 2000 : false),
  });
}

// Request AI notebook assistance
export function useNotebookAssist() {
  return useMutation({
    mutationFn: async ({
      question,
      context,
      sourceType,
      sourceId,
    }: {
      question: string;
      context?: string;
      sourceType?: string;
      sourceId?: string;
    }) => {
      const result = await apiFetch("/ai/notebook-assist", {
        method: "POST",
        body: JSON.stringify({ question, context, sourceType, sourceId }),
      });
      return result.data;
    },
  });
}

// Generate summary from notebook content
export function useGenerateSummary() {
  return useMutation({
    mutationFn: async (content: string) => {
      return aiService.generateSummary({ content });
    },
  });
}

// Generate mindmap from notebook content
export function useGenerateMindmap() {
  return useMutation({
    mutationFn: async (content: string) => {
      return aiService.generateMindmap({ content });
    },
  });
}

// ============================================
// Certificate Hooks
// ============================================

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  serialNumber: string;
  certificateUrl?: string;
  issuedAt: string;
  userName: string;
  courseTitle: string;
}

// Get certificate by ID
export function useCertificate(certificateId: string) {
  return useQuery({
    queryKey: ["certificate", certificateId],
    queryFn: async () => {
      const result = await apiFetch(`/certificates/${certificateId}`);
      return result.data as Certificate;
    },
    enabled: !!certificateId,
  });
}

// Check if user has certificate for a course
export function useCourseCertificate(courseId: string) {
  return useQuery({
    queryKey: ["courseCertificate", courseId],
    queryFn: async () => {
      const result = await apiFetch(`/certificates/course/${courseId}`);
      return result.data as Certificate | null;
    },
    enabled: !!courseId,
  });
}

// Claim a certificate for a completed course
export function useClaimCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const result = await apiFetch("/certificates/claim", {
        method: "POST",
        body: JSON.stringify({ courseId }),
      });
      return result.data as Certificate;
    },
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({
        queryKey: ["courseCertificate", courseId],
      });
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
  });
}

// Download certificate as PDF
export function useDownloadCertificatePDF() {
  return useMutation({
    mutationFn: async (certificateId: string) => {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE}/certificates/${certificateId}/download`,
        {
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to download certificate: ${response.statusText}`
        );
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get("content-disposition");
      let filename = "certificate.pdf";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Get the blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      return filename;
    },
  });
}
