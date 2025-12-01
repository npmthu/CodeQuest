import { Router } from 'express';
import { supabaseAuth } from '../middleware/auth';
import {
  listForumPosts,
  getForumPost,
  createForumPost,
  createReply,
  voteForumItem
} from '../controllers/forumController';

const router = Router();

router.get('/posts', listForumPosts);
router.get('/posts/:id', getForumPost);
router.post('/posts', supabaseAuth, createForumPost);
router.post('/posts/:id/replies', supabaseAuth, createReply);
router.post('/vote', supabaseAuth, voteForumItem);

export default router;
