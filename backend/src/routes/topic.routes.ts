import express from 'express';
import { listTopicsHandler, getTopicHandler } from '../controllers/topicController';

const router = express.Router();

router.get('/', listTopicsHandler);
router.get('/:id', getTopicHandler);

export default router;
