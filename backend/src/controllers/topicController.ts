import { Request, Response } from 'express';
import * as topicService from '../services/topicService';

export async function listTopicsHandler(req: Request, res: Response) {
  try {
    const { published } = req.query;
    const publishedOnly = published !== 'false';

    const topics = await topicService.listTopics(publishedOnly);
    return res.json({ success: true, data: topics });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getTopicHandler(req: Request, res: Response) {
  try {
    const topic = await topicService.getTopic(req.params.id);

    if (!topic) {
      return res.status(404).json({ success: false, error: 'Topic not found' });
    }

    return res.json({ success: true, data: topic });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
