import express from 'express';
import { listLanguagesHandler } from '../controllers/languageController';

const router = express.Router();

router.get('/', listLanguagesHandler); // GET /api/languages

export default router;