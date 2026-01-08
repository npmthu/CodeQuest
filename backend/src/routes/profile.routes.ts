import { Router } from 'express';
import { ProfileController } from '../controllers/profileController';
import { supabaseAuth } from '../middleware/auth';
import multer from 'multer';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const router = Router();
const profileController = new ProfileController();

// GET /api/profile - Get current user's profile
router.get('/', supabaseAuth, profileController.getProfile.bind(profileController));

// PUT /api/profile - Update current user's profile
router.put('/', supabaseAuth, profileController.updateProfile.bind(profileController));

// POST /api/profile/avatar - Upload avatar
router.post('/avatar', 
  supabaseAuth, 
  upload.single('avatar'), 
  profileController.uploadAvatar.bind(profileController)
);

// GET /api/profile/:userId - Get public profile (for other users)
router.get('/:userId', profileController.getPublicProfile.bind(profileController));

// GET /api/profile/search - Search users
router.get('/search', profileController.searchUsers.bind(profileController));

export default router;
