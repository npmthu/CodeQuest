import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

// Helper to get auth headers
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
  };
}

// Generic fetch wrapper
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers }
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
    mutationFn: async (payload: { email: string; password: string; fullName?: string }) => {
      return apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
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
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
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
    }
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const result = await apiFetch('/auth/me');
      return result.data;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

// User Stats Hook
export function useUserStats() {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const result = await apiFetch('/users/me/stats');
      return result.data;
    },
    enabled: true
  });
}

// User Learning Profile Hook
export function useUserProgress() {
  return useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const result = await apiFetch('/users/me/learning-profile');
      return result.data;
    }
  });
}

// Leaderboard Hook
export function useLeaderboard(limit: number = 100) {
  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      const result = await apiFetch(`/users/leaderboard?limit=${limit}`);
      return result.data;
    }
  });
}

// Topics Hooks
export function useTopics() {
  return useQuery({
    queryKey: ['topics'],
    queryFn: async () => {
      const result = await apiFetch('/topics');
      return result.data;
    }
  });
}

export function useTopic(id: string) {
  return useQuery({
    queryKey: ['topic', id],
    queryFn: async () => {
      const result = await apiFetch(`/topics/${id}`);
      return result.data;
    },
    enabled: !!id
  });
}

// Lessons Hooks
export function useLessons(topicId?: string) {
  return useQuery({
    queryKey: ['lessons', topicId],
    queryFn: async () => {
      const endpoint = topicId ? `/lessons?topicId=${topicId}` : '/lessons';
      const result = await apiFetch(endpoint);
      return result.data;
    }
  });
}

export function useLesson(id: string) {
  return useQuery({
    queryKey: ['lesson', id],
    queryFn: async () => {
      const result = await apiFetch(`/lessons/${id}`);
      return result.data;
    },
    enabled: !!id
  });
}

export function useUpdateLessonProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      lessonId, 
      isCompleted, 
      progressPercentage 
    }: { 
      lessonId: string; 
      isCompleted?: boolean; 
      progressPercentage?: number 
    }) => {
      return apiFetch(`/lessons/${lessonId}/progress`, {
        method: 'POST',
        body: JSON.stringify({ isCompleted, progressPercentage })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    }
  });
}

// Problems Hooks
export function useProblems() {
  return useQuery({
    queryKey: ['problems'],
    queryFn: async () => {
      const result = await apiFetch('/problems');
      return result.data;
    }
  });
}

export function useProblem(id: string) {
  return useQuery({
    queryKey: ['problem', id],
    queryFn: async () => {
      const result = await apiFetch(`/problems/${id}`);
      return result.data;
    },
    enabled: !!id
  });
}

// Submissions Hook
export function useSubmitCode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: { 
      problemId: string; 
      code: string; 
      languageId: string 
    }) => {
      return apiFetch('/submissions', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    }
  });
}

export function useSubmissions(problemId?: string) {
  return useQuery({
    queryKey: ['submissions', problemId],
    queryFn: async () => {
      const endpoint = problemId ? `/submissions?problemId=${problemId}` : '/submissions';
      const result = await apiFetch(endpoint);
      return result.data;
    }
  });
}

// Instructor Hooks
export function useInstructorStats() {
  return useQuery({
    queryKey: ['instructorStats'],
    queryFn: async () => {
      const result = await apiFetch('/instructor/stats');
      return result.data;
    }
  });
}

export function useInstructorCourses() {
  return useQuery({
    queryKey: ['instructorCourses'],
    queryFn: async () => {
      const result = await apiFetch('/instructor/courses');
      return result.data;
    }
  });
}

export function useInstructorAnalytics() {
  return useQuery({
    queryKey: ['instructorAnalytics'],
    queryFn: async () => {
      const result = await apiFetch('/instructor/analytics');
      return result.data;
    }
  });
}

export function useInstructorActivities() {
  return useQuery({
    queryKey: ['instructorActivities'],
    queryFn: async () => {
      const result = await apiFetch('/instructor/activities');
      return result.data;
    }
  });
}

// Business Hooks
export function useBusinessStats() {
  return useQuery({
    queryKey: ['businessStats'],
    queryFn: async () => {
      const result = await apiFetch('/business/stats');
      return result.data;
    }
  });
}

export function useBusinessLeaderboard(limit: number = 10) {
  return useQuery({
    queryKey: ['businessLeaderboard', limit],
    queryFn: async () => {
      const result = await apiFetch(`/business/leaderboard?limit=${limit}`);
      return result.data;
    }
  });
}

export function useBusinessAnalytics() {
  return useQuery({
    queryKey: ['businessAnalytics'],
    queryFn: async () => {
      const result = await apiFetch('/business/analytics');
      return result.data;
    }
  });
}

export function useBusinessCohorts() {
  return useQuery({
    queryKey: ['businessCohorts'],
    queryFn: async () => {
      const result = await apiFetch('/business/cohorts');
      return result.data;
    }
  });
}

export function useBusinessActivities() {
  return useQuery({
    queryKey: ['businessActivities'],
    queryFn: async () => {
      const result = await apiFetch('/business/activities');
      return result.data;
    }
  });
}

// Forum Hooks
export function useForumPosts() {
  return useQuery({
    queryKey: ['forumPosts'],
    queryFn: async () => {
      const result = await apiFetch('/forum/posts');
      return result.data;
    }
  });
}

export function useForumPost(id: string) {
  return useQuery({
    queryKey: ['forumPost', id],
    queryFn: async () => {
      const result = await apiFetch(`/forum/posts/${id}`);
      return result.data;
    },
    enabled: !!id
  });
}

export function useUserVotes(postId: string) {
  return useQuery({
    queryKey: ['userVotes', postId],
    queryFn: async () => {
      const result = await apiFetch(`/forum/posts/${postId}/votes`);
      return result.data as { postVote: string | null; replyVotes: Record<string, string> };
    },
    enabled: !!postId
  });
}

export function useCreateForumPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      content_markdown: string;
      related_problem_id?: string;
      tags?: any;
    }) => {
      return apiFetch('/forum/posts', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
    }
  });
}

export function useCreateForumReply() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      postId, 
      content_markdown, 
      code_snippet, 
      parent_reply_id 
    }: {
      postId: string;
      content_markdown: string;
      code_snippet?: any;
      parent_reply_id?: string;
    }) => {
      return apiFetch(`/forum/posts/${postId}/replies`, {
        method: 'POST',
        body: JSON.stringify({ content_markdown, code_snippet, parent_reply_id })
      });
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['forumPost', variables.postId] });
      await queryClient.cancelQueries({ queryKey: ['forumPosts'] });

      const previousPost = queryClient.getQueryData<any>(['forumPost', variables.postId]);
      const previousList = queryClient.getQueryData<any>(['forumPosts']);

      // create optimistic reply (temp id)
      const optimisticReply = {
        id: `temp-${Date.now()}`,
        post_id: variables.postId,
        author_id: (await supabase.auth.getSession()).data.session?.user?.id ?? 'anon',
        author: {
          id: (await supabase.auth.getSession()).data.session?.user?.id ?? 'anon',
          display_name: 'You',
          avatar_url: null
        },
        parent_reply_id: variables.parent_reply_id ?? null,
        content_markdown: variables.content_markdown,
        code_snippet: variables.code_snippet ?? null,
        upvotes: 0,
        is_accepted_answer: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      if (previousPost) {
        queryClient.setQueryData(['forumPost', variables.postId], (old: any) => ({
          ...old,
          reply_count: (old?.reply_count ?? 0) + 1,
          replies: [optimisticReply, ...(old?.replies ?? [])]
        }));
      }

      // update posts list cache (if present)
      if (previousList) {
        queryClient.setQueryData(['forumPosts'], (old: any[]) =>
          old?.map(p => p.id === variables.postId ? { ...p, reply_count: (p.reply_count ?? 0) + 1 } : p) ?? old
        );
      }

      return { previousPost, previousList, optimisticReply };
    },

    onError: (_err, variables, context: any) => {
      // rollback
      if (context?.previousPost) {
        queryClient.setQueryData(['forumPost', variables.postId], context.previousPost);
      }
      if (context?.previousList) {
        queryClient.setQueryData(['forumPosts'], context.previousList);
      }
    },
    onSuccess: (data, variables, context: any) => {
      // if server returns the created reply, replace temp id in forumPost.replies
      const createdReply = data?.data ?? null;
      if (createdReply) {
        queryClient.setQueryData(['forumPost', variables.postId], (old: any) => {
          if (!old) return old;
          const replies = (old.replies ?? []).map((r: any) =>
            r.id && r.id.toString().startsWith('temp-') && context?.optimisticReply && r.id === context.optimisticReply.id
              ? createdReply
              : r
          );
          return { ...old, replies };
        });
      }
      // finally ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['forumPost', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forumPost', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
    }
  });
}

export function useVoteForumItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      votable_type,
      votable_id,
      vote_type,
      postId
    }: {
      votable_type: 'post' | 'reply';
      votable_id: string;
      vote_type: 'upvote' | 'downvote';
      postId: string; // needed to update userVotes cache
    }) => {
      return apiFetch('/forum/vote', {
        method: 'POST',
        body: JSON.stringify({ votable_type, votable_id, vote_type })
      });
    },
    
    onMutate: async (variables) => {
      const { votable_type, votable_id, vote_type, postId } = variables;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['forumPost', postId] });
      await queryClient.cancelQueries({ queryKey: ['forumPosts'] });
      await queryClient.cancelQueries({ queryKey: ['userVotes', postId] });

      // Snapshot previous values
      const previousPost = queryClient.getQueryData(['forumPost', postId]);
      const previousList = queryClient.getQueryData(['forumPosts']);
      const previousVotes = queryClient.getQueryData(['userVotes', postId]) as any;

      // Determine if this is toggling off or changing vote
      const currentVote = votable_type === 'post' 
        ? previousVotes?.postVote 
        : previousVotes?.replyVotes?.[votable_id];
      
      const isToggleOff = currentVote === vote_type;
      const delta = isToggleOff ? -1 : (currentVote ? 0 : 1);

      // Optimistically update post/reply upvotes
      if (votable_type === 'post') {
        queryClient.setQueryData(['forumPost', postId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            upvotes: Math.max(0, (old.upvotes ?? 0) + delta)
          };
        });

        queryClient.setQueryData(['forumPosts'], (old: any[]) => {
          if (!old) return old;
          return old.map(p => 
            p.id === votable_id 
              ? { ...p, upvotes: Math.max(0, (p.upvotes ?? 0) + delta) }
              : p
          );
        });
      } else {
        // Update reply upvotes
        queryClient.setQueryData(['forumPost', postId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            replies: old.replies?.map((r: any) =>
              r.id === votable_id
                ? { ...r, upvotes: Math.max(0, (r.upvotes ?? 0) + delta) }
                : r
            ) || []
          };
        });
      }

      // Update user votes cache
      queryClient.setQueryData(['userVotes', postId], (old: any) => {
        if (!old) return old;
        if (votable_type === 'post') {
          return {
            ...old,
            postVote: isToggleOff ? null : vote_type
          };
        } else {
          return {
            ...old,
            replyVotes: {
              ...old.replyVotes,
              [votable_id]: isToggleOff ? undefined : vote_type
            }
          };
        }
      });

      return { previousPost, previousList, previousVotes };
    },

    onError: (_err, variables, context: any) => {
      // Rollback on error
      if (context?.previousPost) {
        queryClient.setQueryData(['forumPost', variables.postId], context.previousPost);
      }
      if (context?.previousList) {
        queryClient.setQueryData(['forumPosts'], context.previousList);
      }
      if (context?.previousVotes) {
        queryClient.setQueryData(['userVotes', variables.postId], context.previousVotes);
      }
    },

    onSuccess: (_data, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['forumPost', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userVotes', variables.postId] });
    }
  });
}

// Delete Forum Post Hook
export function useDeleteForumPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: string) => {
      return apiFetch(`/forum/posts/${postId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
    }
  });
}

// Delete Reply Hook
export function useDeleteReply() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ replyId, postId }: { replyId: string; postId: string }) => {
      return apiFetch(`/forum/replies/${replyId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forumPost', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
    }
  });
}

// Interview Hooks
export function useInterviewSessions() {
  return useQuery({
    queryKey: ['interviewSessions'],
    queryFn: async () => {
      const result = await apiFetch('/interview/sessions');
      return result.data;
    }
  });
}

export function useInterviewSession(id: string) {
  return useQuery({
    queryKey: ['interviewSession', id],
    queryFn: async () => {
      const result = await apiFetch(`/interview/sessions/${id}`);
      return result.data;
    },
    enabled: !!id
  });
}

export function useCreateInterviewSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: {
      interviewer_id?: string;
      interview_type: string;
      difficulty: string;
      scheduled_at?: string;
      duration_min?: number;
      communication_mode?: string;
    }) => {
      return apiFetch('/interview/sessions', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviewSessions'] });
    }
  });
}

export function useUpdateInterviewSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      id,
      status,
      workspace_data
    }: {
      id: string;
      status?: string;
      workspace_data?: any;
    }) => {
      return apiFetch(`/interview/sessions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, workspace_data })
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interviewSession', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['interviewSessions'] });
    }
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
      recommended_topics
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
        method: 'POST',
        body: JSON.stringify({
          to_user_id,
          overall_rating,
          communication_rating,
          problem_solving_rating,
          technical_knowledge_rating,
          feedback_text,
          recommended_topics
        })
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interviewSession', variables.sessionId] });
    }
  });
}

export function useAvailableInterviewers() {
  return useQuery({
    queryKey: ['availableInterviewers'],
    queryFn: async () => {
      const result = await apiFetch('/interview/available-interviewers');
      return result.data;
    }
  });
}

// Notes Hooks
export function useNotes() {
  return useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const result = await apiFetch('/notes');
      return result.data;
    }
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: ['note', id],
    queryFn: async () => {
      const result = await apiFetch(`/notes/${id}`);
      return result.data;
    },
    enabled: !!id
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: { title?: string; content_markdown?: string; is_private?: boolean; tags?: string[] }) => {
      return apiFetch('/notes', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  });
}

export function useUpdateNote(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: { title?: string; content_markdown?: string; is_private?: boolean; tags?: string[] }) => {
      return apiFetch(`/notes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', id] });
    }
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return apiFetch(`/notes/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  });
}
