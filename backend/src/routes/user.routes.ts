// User routes - /users/*
import express from 'express';
import { listUsers, getUserHandler } from '../controllers/userController';

const router = express.Router();

router.get('/', listUsers);         // GET /api/users
router.get('/:id', getUserHandler); // GET /api/users/:id
// thêm route tạo/sửa/xóa nếu controller có
// router.post('/', createUserHandler);

export default router;