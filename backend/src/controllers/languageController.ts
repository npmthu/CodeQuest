import { Request, Response } from 'express';
import * as languageService from '../services/languageService';

export async function listLanguagesHandler(req: Request, res: Response) {
  try {
    const langs = await languageService.listLanguages();
    res.json(langs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}