import { Router } from 'express';
import { supabaseAuth } from '../middleware/auth';
import {
  listForumPosts,
  getForumPost,
  createForumPost,
  createReply,
  voteForumItem,
  getUserVotes,
  deleteForumPost,
  deleteReply
} from '../controllers/forumController';

const router = Router();

router.get('/posts', listForumPosts);
router.get('/posts/:id', getForumPost);
router.get('/posts/:id/votes', supabaseAuth, getUserVotes);
router.post('/posts', supabaseAuth, createForumPost);
router.post('/posts/:id/replies', supabaseAuth, createReply);
router.post('/vote', supabaseAuth, voteForumItem);
router.delete('/posts/:id', supabaseAuth, deleteForumPost);
router.delete('/replies/:id', supabaseAuth, deleteReply);

export default router;
