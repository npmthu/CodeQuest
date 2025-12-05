# AI Code Review Service

Hệ thống AI Code Review sử dụng Flask + Google Gemini API + Supabase

## 📋 Yêu cầu

- Python 3.8+
- Supabase account (hoặc dùng Supabase project hiện có)
- Google Gemini API key

## 🚀 Cài đặt

### 1. Cài đặt dependencies

```powershell
cd ai_review_service
pip install -r requirements.txt
```

### 2. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```powershell
copy .env.example .env
```

Điền thông tin vào `.env`:

```env
# Supabase configuration
SUPABASE_URL=https://zyzxwphxvbvhdqmjumah.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_supabase_settings

# Gemini API (lấy từ https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your_actual_gemini_api_key

# Flask
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_PORT=5001
```

**Lấy Supabase credentials:**
1. Vào Supabase Dashboard: https://supabase.com/dashboard
2. Chọn project `CodeQuest`
3. Vào `Settings` → `API`
4. Copy:
   - `URL` → `SUPABASE_URL`
   - `service_role` key (secret) → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Chạy server

```powershell
python app.py
```

Server sẽ chạy tại: `http://localhost:5001`

## 📡 API Endpoints

### 1. Tạo Code Review

**POST** `/api/ai/code-review`

**Request Body:**
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "submission_id": "223e4567-e89b-12d3-a456-426614174001",
  "language": "python",
  "code": "def hello():\n    print('Hello World')"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Code review completed successfully",
  "data": {
    "content_id": "323e4567-e89b-12d3-a456-426614174002",
    "review_id": "423e4567-e89b-12d3-a456-426614174003",
    "summary": "The code is simple and functional...",
    "issues": [
      "Missing docstring",
      "No type hints"
    ],
    "suggestions": [
      "Add function documentation",
      "Use type hints for better code clarity"
    ],
    "quality_rating": 3,
    "overall_score": 60,
    "processing_time_ms": 1234
  }
}
```

### 2. Lấy Review theo Submission ID

**GET** `/api/ai/code-review/<submission_id>`

**Response:**
```json
{
  "success": true,
  "message": "Review retrieved successfully",
  "data": {
    "review_id": "...",
    "summary": "...",
    "issues": [...],
    "suggestions": [...],
    "quality_rating": 4
  }
}

## 📁 Cấu trúc project

```
ai_review_service/
├── app.py                      # Flask app chính
├── requirements.txt            # Python dependencies (Flask, Supabase SDK, Gemini)
├── .env.example               # Environment template
├── .env                       # Environment variables (không commit)
│
├── routes/
│   └── code_review.py         # API routes
│
├── services/
│   └── code_review_service.py # Business logic
│
├── db/
│   ├── db.py                  # Supabase client setup
│   └── operations.py          # DB queries using Supabase SDK
│
├── ai/
│   └── gemini_client.py       # Gemini API integration
│
├── utils/
│   └── response.py            # API response helpers
│
└── models/
    └── (empty - có thể thêm data models)
```

## 🔌 Database Connection

Service này sử dụng **Supabase Python SDK** (KHÔNG dùng PostgreSQL trực tiếp):

```python
from supabase import create_client

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Query example
response = supabase.table('submissions').select('*').eq('id', submission_id).execute()
```

**Ưu điểm:**
- ✅ Không cần password database
- ✅ Tự động handle authentication
- ✅ Built-in connection pooling
- ✅ Type-safe với Python
- ✅ Real-time capabilities (nếu cần)

├── routes/
│   └── code_review.py         # API routes
│
├── services/
│   └── code_review_service.py # Business logic
│
├── db/
│   ├── db.py                  # Database connection
│   └── operations.py          # DB queries
│
├── ai/
│   └── gemini_client.py       # Gemini API integration
│
├── utils/
│   └── response.py            # API response helpers
│
└── models/
    └── (empty - có thể thêm data models)
```

## 🗄️ Database Schema

Service này sử dụng 2 bảng:

### `ai_generated_content`
Lưu raw AI response:
- `id` (UUID)
- `user_id` (UUID)
- `content_type` (text: 'code_review', 'mindmap', etc.)
- `source_type` (text: 'submission', 'lesson', etc.)
- `source_id` (UUID)
- `generated_data` (JSONB: raw AI response)
- `created_at` (timestamp)

### `ai_code_reviews`
Lưu structured review:
- `id` (UUID)
- `submission_id` (UUID)
- `status` (text: 'PROCESSING', 'COMPLETE', 'FAILED')
- `overall_score` (integer: 0-100)
- `summary` (text)
- `strengths` (JSONB: array of strings)
- `improvements` (JSONB: array of strings)
- `code_suggestions` (JSONB: optional)
- `dimensions` (JSONB: optional score breakdown)
- `processing_time_ms` (integer)
- `generated_at` (timestamp)
- `created_at` (timestamp)

## 🔍 Cách hoạt động

1. **Nhận request** → Validate submission tồn tại trong DB
2. **Gọi Gemini API** → AI phân tích code
3. **Parse response** → Extract summary, issues, suggestions
4. **Tính quality_rating** → Rating = 5 - số_lượng_issues (clamp 1-5)
5. **Lưu DB**:
   - Raw AI response → `ai_generated_content`
   - Structured review → `ai_code_reviews`
6. **Trả JSON response** → Client nhận kết quả

Luồng chạy toàn hệ thống
1. app.py load routes

↓

2. routes/code_review.py nhận HTTP POST

↓

3. route gọi review_service.create_code_review()

↓

4. service gọi gemini_client.review_code()

↓

5. AI trả JSON → parse → score

↓

6. service lưu vào DB thông qua db/operations.py

↓

7. response trả lại cho client

### Import errors
- Đảm bảo đã cài dependencies: `pip install -r requirements.txt`
- Chạy từ thư mục `ai_review_service/`

## 📝 TODO / Enhancements

- [ ] Add authentication/authorization
- [ ] Add rate limiting
- [ ] Implement caching for duplicate reviews
- [ ] Add more detailed code_suggestions with line numbers
- [ ] Add complexity analysis
- [ ] Add batch review support
- [ ] Add WebSocket for real-time updates
- [ ] Add metrics/logging

## 📄 License

MIT
