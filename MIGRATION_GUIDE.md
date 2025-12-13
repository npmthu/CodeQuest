# Migration Guide - Refactoring hoàn tất

## ✅ Đã hoàn thành

### Backend Changes

#### 1. Cấu trúc mới
```
backend/src/
├── dtos/          ✅ MỚI - DTOs (API contract)
├── mappers/       ✅ MỚI - Model → DTO converters
├── models/        ✅ CẬP NHẬT - Database entities
├── services/      ✅ GIỮ NGUYÊN - Business logic
└── controllers/   ✅ CẬP NHẬT - Sử dụng mappers
```

#### 2. DTOs đã tạo
- ✅ `user.dto.ts` - User, UserProfile, UserLearningProfile
- ✅ `problem.dto.ts` - Problem, ProblemDetail, ProblemListItem, TestCase
- ✅ `lesson.dto.ts` - Lesson, LessonWithProgress, LessonCompletion
- ✅ `submission.dto.ts` - Submission, SubmissionResult, ExecutionSummary
- ✅ `quiz.dto.ts` - Quiz, QuizDetail, QuizQuestion, QuizAttempt
- ✅ `topic.dto.ts` - Topic, TopicWithLessons
- ✅ `forum.dto.ts` - ForumPost, ForumReply, Author
- ✅ `course.dto.ts` - Course, CourseWithTopics

#### 3. Mappers đã tạo
- ✅ `user.mapper.ts` - mapUserToDTO, mapUserToProfileDTO
- ✅ `problem.mapper.ts` - mapProblemToDTO, mapProblemToDetailDTO
- ✅ `lesson.mapper.ts` - mapLessonToDTO, mapLessonWithProgressToDTO
- ✅ `submission.mapper.ts` - mapSubmissionToDTO, mapSubmissionToResultDTO
- ✅ `quiz.mapper.ts` - mapQuizToDTO, mapQuizToDetailDTO
- ✅ `topic.mapper.ts` - mapTopicToDTO, mapTopicWithLessonsToDTO
- ✅ `forum.mapper.ts` - mapForumPostToDTO, mapForumReplyToDTO
- ✅ `course.mapper.ts` - mapCourseToDTO, mapCourseWithTopicsToDTO

#### 4. Controllers đã cập nhật (ví dụ)
- ✅ `userController.ts` - Sử dụng mappers, trả DTOs
- ✅ `problemController.ts` - Sử dụng mappers, trả DTOs
- ✅ `lessonController.ts` - Sử dụng mappers, trả DTOs

### Frontend Changes

#### 1. Cấu trúc mới
```
frontend/src/
├── interfaces/    ✅ MỚI - TypeScript types (mirror DTOs)
├── services/      ✅ MỚI - API clients
└── components/    ✅ GIỮ NGUYÊN - UI components
```

#### 2. Interfaces đã tạo
- ✅ `api.interface.ts` - ApiResponse, PaginatedResponse
- ✅ `user.interface.ts` - User, UserProfile
- ✅ `problem.interface.ts` - Problem, ProblemDetail, ProblemListItem
- ✅ `lesson.interface.ts` - Lesson, LessonWithProgress
- ✅ `submission.interface.ts` - Submission, SubmissionResult
- ✅ `quiz.interface.ts` - Quiz, QuizDetail, QuizAttempt
- ✅ `topic.interface.ts` - Topic, TopicWithLessons
- ✅ `forum.interface.ts` - ForumPost, ForumReply

#### 3. Services đã tạo
- ✅ `user.service.ts` - getUsers(), getUserById(), updateProfile()
- ✅ `problem.service.ts` - getProblems(), getProblemById()
- ✅ `lesson.service.ts` - getLessons(), getLessonById(), updateProgress()
- ✅ `submission.service.ts` - createSubmission(), getUserSubmissions()
- ✅ `quiz.service.ts` - getQuizzes(), getQuizById(), submitQuiz()
- ✅ `topic.service.ts` - getTopics(), getTopicById()
- ✅ `forum.service.ts` - getPosts(), createPost(), createReply()

#### 4. Index exports
- ✅ `interfaces/index.ts` - Export tất cả interfaces
- ✅ `services/index.ts` - Export tất cả services

## 📋 Các bước tiếp theo

### 1. Update các controllers còn lại

Cần cập nhật các controllers sau để sử dụng mappers:

```typescript
// Pattern chuẩn
import { mapXXXToDTO } from '../mappers/xxx.mapper';

export async function handler(req, res) {
  const data = await service.getData();
  const dto = mapXXXToDTO(data);  // ← Thêm dòng này
  res.json({ success: true, data: dto });
}
```

Controllers cần update:
- [ ] `submissionController.ts`
- [ ] `quizController.ts`
- [ ] `quizSubmissionController.ts`
- [ ] `topicController.ts`
- [ ] `courseController.ts`
- [ ] `forumController.ts`
- [ ] `interviewController.ts`
- [ ] `notesController.ts`
- [ ] `authController.ts`

### 2. Update frontend components

Thay vì gọi API trực tiếp, sử dụng services:

**Trước:**
```typescript
// ❌ KHÔNG NÊN
const response = await fetch('/api/problems');
const data = await response.json();
```

**Sau:**
```typescript
// ✅ NÊN
import { problemService } from '../services';

const problems = await problemService.getProblems();
```

Components cần update:
- [ ] `Dashboard.tsx`
- [ ] `CoursesPage.tsx`
- [ ] `LessonPage.tsx`
- [ ] `ForumPage.tsx`
- [ ] `QuizzesPage.tsx`
- [ ] `ProfilePage.tsx`

### 3. Xóa code cũ không cần thiết

Sau khi migration xong:
- [ ] Xóa hoặc deprecate các type definitions cũ trong `frontend/src/types/`
- [ ] Review và cleanup unused imports
- [ ] Update documentation

### 4. Testing

- [ ] Test tất cả API endpoints trả đúng DTO format
- [ ] Test frontend nhận đúng data structure
- [ ] Verify không có field nào bị thiếu/sai tên

## 🎯 Cách sử dụng kiến trúc mới

### Backend - Thêm entity mới

1. **Tạo Model** (`models/Entity.ts`)
```typescript
export interface Entity {
  id: string;
  field_name: string;  // snake_case
}
```

2. **Tạo Service** (`services/entityService.ts`)
```typescript
export async function getEntity(id: string): Promise<Entity> {
  // Logic lấy từ DB
}
```

3. **Tạo DTO** (`dtos/entity.dto.ts`)
```typescript
export interface EntityDTO {
  id: string;
  fieldName: string;  // camelCase
}
```

4. **Tạo Mapper** (`mappers/entity.mapper.ts`)
```typescript
export function mapEntityToDTO(entity: Entity): EntityDTO {
  return {
    id: entity.id,
    fieldName: entity.field_name
  };
}
```

5. **Update Controller** (`controllers/entityController.ts`)
```typescript
const entity = await entityService.getEntity(id);
const dto = mapEntityToDTO(entity);
res.json({ success: true, data: dto });
```

### Frontend - Sử dụng data mới

1. **Tạo Interface** (`interfaces/entity.interface.ts`)
```typescript
// Copy từ backend DTO
export interface Entity {
  id: string;
  fieldName: string;
}
```

2. **Tạo Service** (`services/entity.service.ts`)
```typescript
export const entityService = {
  async getEntity(id: string): Promise<Entity> {
    const response = await fetch(`${API_BASE_URL}/entities/${id}`);
    const result: ApiResponse<Entity> = await response.json();
    return result.data!;
  }
};
```

3. **Sử dụng trong Component**
```typescript
import { entityService } from '../services';
import { Entity } from '../interfaces';

const [entity, setEntity] = useState<Entity | null>(null);

useEffect(() => {
  entityService.getEntity(id)
    .then(setEntity)
    .catch(console.error);
}, [id]);
```

## 🔍 Kiểm tra nhanh

### Backend Response Format
```json
{
  "success": true,
  "data": {
    "id": "123",
    "fieldName": "value",  // ← camelCase
    "createdAt": "2024-01-01"
  }
}
```

### Frontend Interface
```typescript
interface Entity {
  id: string;
  fieldName: string;  // ← Giống DTO
  createdAt: string;
}
```

## 📚 Tài liệu tham khảo

- `ARCHITECTURE.md` - Chi tiết kiến trúc và best practices
- `backend/src/dtos/` - DTOs mẫu
- `backend/src/mappers/` - Mappers mẫu
- `frontend/src/interfaces/` - Interfaces mẫu
- `frontend/src/services/` - Services mẫu

## ⚠️ Lưu ý quan trọng

1. **KHÔNG import backend code vào frontend**
   - Frontend chỉ dùng interfaces riêng của nó

2. **Backend LUÔN trả DTO, không trả raw model**
   - Dùng mappers để convert

3. **DTO và Interface phải match 100%**
   - Field names phải giống hệt nhau
   - Types phải tương thích

4. **Consistent response format**
   - Luôn wrap trong `{ success, data, error }`

5. **Error handling**
   - Backend: throw Error với message rõ ràng
   - Frontend: catch và hiển thị user-friendly message
