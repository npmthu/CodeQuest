# CodeQuest - Kiến trúc dự án

## Tổng quan luồng dữ liệu

```
Database (Supabase)
    ↓
models/        → Entities từ database
    ↓
services/      → Business logic
    ↓
mappers/       → Chuyển đổi Model → DTO
    ↓
controllers/   → Trả JSON response (DTO)
    ↓
dtos/          → Contract giữa backend-frontend
=====================================
    ↓ HTTP/JSON
=====================================
frontend/services/  → Gọi API backend
    ↓
interfaces/         → TypeScript types (mirror DTOs)
    ↓
components/         → UI components
```

## Backend Structure

### 📁 `src/models/`
**Vai trò**: Định nghĩa các entities tương ứng với database tables.

**Ví dụ**: `User.ts`, `Problem.ts`, `Lesson.ts`

**Quy tắc**:
- Field names phải match với database (snake_case)
- Chỉ chứa type definitions, không có logic
- Đại diện cho "cái gì được lưu trong DB"

### 📁 `src/services/`
**Vai trò**: Business logic và xử lý nghiệp vụ.

**Ví dụ**: `userService.ts`, `problemService.ts`

**Quy tắc**:
- Tương tác trực tiếp với database (qua Supabase client)
- Xử lý validation, authorization
- Trả về models (database objects)
- Không export ra ngoài API, chỉ controllers dùng

### 📁 `src/dtos/`
**Vai trò**: Định nghĩa "contract" giữa backend và frontend.

**Ví dụ**: `user.dto.ts`, `problem.dto.ts`

**Quy tắc**:
- Field names dùng camelCase (chuẩn JavaScript/TypeScript)
- Chỉ chứa data cần thiết cho frontend
- Che giấu thông tin nhạy cảm (password, secrets)
- Là "public API" của backend

### 📁 `src/mappers/`
**Vai trò**: Chuyển đổi Models (DB format) sang DTOs (API format).

**Ví dụ**: `user.mapper.ts`, `problem.mapper.ts`

**Quy tắc**:
- Pure functions: `mapModelToDTO(model: Model): DTO`
- Chuyển snake_case → camelCase
- Có thể combine nhiều models thành 1 DTO
- Không có side effects

### 📁 `src/controllers/`
**Vai trò**: Nhận HTTP requests, gọi services, trả DTOs.

**Quy tắc**:
- Luôn trả về DTO, không bao giờ trả raw model
- Sử dụng mappers để convert
- Handle errors và trả về consistent response format
- Thin layer: logic nằm ở services

**Response format chuẩn**:
```typescript
{
  success: boolean,
  data?: DTO,
  error?: string,
  message?: string
}
```

## Frontend Structure

### 📁 `src/interfaces/`
**Vai trò**: TypeScript types cho data từ backend.

**Ví dụ**: `user.interface.ts`, `problem.interface.ts`

**Quy tắc**:
- Mirror của backend DTOs
- Field names giống hệt backend DTOs (camelCase)
- Không import bất kỳ file nào từ backend
- Copy-paste và maintain manually (hoặc dùng tool generate sau này)

### 📁 `src/services/`
**Vai trò**: Gọi API backend, xử lý HTTP requests.

**Ví dụ**: `user.service.ts`, `problem.service.ts`

**Quy tắc**:
- Mỗi function tương ứng 1 API endpoint
- Sử dụng interfaces để type response
- Handle errors và throw với message rõ ràng
- Không chứa UI logic

**Pattern chuẩn**:
```typescript
async function getData(): Promise<DataInterface> {
  const response = await fetch(url, options);
  const result: ApiResponse<DataInterface> = await response.json();
  
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed');
  }
  
  return result.data;
}
```

### 📁 `src/components/`
**Vai trò**: UI components, sử dụng services để lấy data.

**Quy tắc**:
- Import từ `services/` và `interfaces/`
- Không gọi trực tiếp API, dùng services
- Focus vào rendering và user interaction

## Ví dụ End-to-End

### Backend Flow

```typescript
// 1. Model (models/User.ts)
export interface User {
  id: string;
  display_name?: string;  // snake_case từ DB
  avatar_url?: string;
}

// 2. Service (services/userService.ts)
export async function getUser(id: string): Promise<User> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  return data;
}

// 3. DTO (dtos/user.dto.ts)
export interface UserDTO {
  id: string;
  displayName?: string;  // camelCase cho API
  avatarUrl?: string;
}

// 4. Mapper (mappers/user.mapper.ts)
export function mapUserToDTO(user: User): UserDTO {
  return {
    id: user.id,
    displayName: user.display_name,
    avatarUrl: user.avatar_url
  };
}

// 5. Controller (controllers/userController.ts)
export async function getUserHandler(req: Request, res: Response) {
  const user = await userService.getUser(req.params.id);
  const userDTO = mapUserToDTO(user);  // ← Convert trước khi trả về
  res.json({ success: true, data: userDTO });
}
```

### Frontend Flow

```typescript
// 1. Interface (interfaces/user.interface.ts)
export interface User {
  id: string;
  displayName?: string;  // Giống backend DTO
  avatarUrl?: string;
}

// 2. Service (services/user.service.ts)
export const userService = {
  async getUserById(id: string): Promise<User> {
    const response = await fetch(`/api/users/${id}`);
    const result: ApiResponse<User> = await response.json();
    return result.data!;
  }
};

// 3. Component (components/UserProfile.tsx)
function UserProfile({ userId }: Props) {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    userService.getUserById(userId)
      .then(setUser)
      .catch(console.error);
  }, [userId]);
  
  return <div>{user?.displayName}</div>;
}
```

## Lợi ích của kiến trúc này

### ✅ Tách biệt rõ ràng
- Database layer (models)
- Business logic (services)
- API contract (DTOs)
- Presentation (controllers)

### ✅ Dễ bảo vệ đồ án
- Giải thích được từng layer
- Luồng dữ liệu rõ ràng
- Không bị hỏi "tại sao trộn lẫn?"

### ✅ Type safety
- Backend: Model → DTO (typed)
- Frontend: Interface (typed)
- Catch lỗi lúc compile, không runtime

### ✅ Maintainable
- Thay đổi DB → chỉ sửa model + mapper
- Thay đổi API → chỉ sửa DTO + mapper
- Frontend không bị ảnh hưởng nếu DTO không đổi

### ✅ Scalable
- Dễ thêm fields mới
- Dễ thêm endpoints mới
- Dễ migrate sang REST/GraphQL

## Quy tắc vàng

1. **Backend KHÔNG BAO GIỜ trả raw database models**
   - Luôn qua mapper → DTO

2. **Frontend KHÔNG BAO GIỜ import từ backend**
   - Chỉ dùng interfaces riêng

3. **DTOs là single source of truth cho API contract**
   - Thay đổi DTO = thay đổi API

4. **Mappers là pure functions**
   - Input model → Output DTO
   - Không side effects

5. **Services chứa logic, controllers chứa routing**
   - Controllers mỏng, services dày

## Naming conventions

### Backend
- Models: `User`, `Problem` (PascalCase)
- DTOs: `UserDTO`, `ProblemDTO` (PascalCase + DTO suffix)
- Services: `userService`, `problemService` (camelCase)
- Mappers: `mapUserToDTO`, `mapProblemToDTO` (camelCase)
- Controllers: `getUserHandler`, `listProblemsHandler` (camelCase)

### Frontend
- Interfaces: `User`, `Problem` (PascalCase, no DTO suffix)
- Services: `userService`, `problemService` (camelCase)
- Components: `UserProfile`, `ProblemList` (PascalCase)

## Checklist khi thêm feature mới

### Backend
- [ ] Tạo/update model trong `models/`
- [ ] Implement logic trong `services/`
- [ ] Tạo DTO trong `dtos/`
- [ ] Tạo mapper trong `mappers/`
- [ ] Update controller sử dụng mapper
- [ ] Test API trả đúng DTO format

### Frontend
- [ ] Tạo/update interface trong `interfaces/`
- [ ] Tạo/update service function trong `services/`
- [ ] Update component sử dụng service
- [ ] Test data flow từ API → UI

## Tools hỗ trợ (optional)

Nếu cần tự động hóa sau này:
- `openapi-generator`: Generate interfaces từ OpenAPI spec
- `ts-to-zod`: Generate Zod schemas từ types
- `quicktype`: Convert JSON → TypeScript types

Nhưng cho đồ án sinh viên, manual sync là đủ và dễ giải thích hơn.
