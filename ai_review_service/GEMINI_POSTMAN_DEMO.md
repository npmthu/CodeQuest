# Hướng dẫn tạo Gemini API key, cấu hình Postman và demo AI Code Review

Tệp này hướng dẫn nhanh cách lấy API key của Google Gemini (Generative AI), cấu hình microservice `ai_review_service` và dùng Postman để gửi request demo. 
> Lưu ý bảo mật: KHÔNG đưa `SUPABASE_SERVICE_ROLE_KEY` hoặc `GEMINI_API_KEY` lên public repo. Thêm các key này vào file `.env` (không commit file `.env`).

---

## 1) Tạo Google Gemini API key

1. Vào Makersuite hoặc Google Cloud Generative AI Console:
   - Makersuite: https://makersuite.google.com/
   - Hoặc Console: https://console.cloud.google.com/generative-ai
2. Đăng nhập bằng tài khoản Google có quyền tạo API key.
3. Trong Makersuite: vào phần `API keys` (hoặc `Create API key`) → tạo API key mới.
4. Sao chép key (giữ bí mật!).

### Ghi vào `.env`
Mở `ai_review_service/.env` (tạo từ `.env.example` nếu chưa có) và thêm:

```env
GEMINI_API_KEY=eyJ... (giá trị bạn copy)
```

---

## 2) Chạy microservice AI (local)

1. Cài dependencies (chạy 1 lần):

```powershell
cd ai_review_service
pip install -r requirements.txt
```

2. Tạo file `.env` từ template và điền thông tin Supabase + Gemini key:

```powershell
copy .env.example .env
# rồi chỉnh .env bằng editor, dán SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY và GEMINI_API_KEY
```

3. Khởi động service:

```powershell
python app.py
```

Mặc định app lắng nghe `http://localhost:5001`.

---

## 3) Kiểm tra model Gemini (khuyến nghị khi gặp lỗi 404 model)

Nếu service báo lỗi model không tồn tại, hãy liệt kê model khả dụng bằng script sau (PowerShell):

```powershell
python - <<'PY'
import os, json
import google.generativeai as genai
key = os.getenv('GEMINI_API_KEY')
if not key:
    raise SystemExit('GEMINI_API_KEY not set in env')
genai.configure(api_key=key)
try:
    models = genai.list_models()
    print(json.dumps(models, indent=2, default=str))
except Exception as e:
    print('ListModels error:', e)
PY
```

Tìm model phù hợp (có `supportedMethods` hỗ trợ generate/generateContent/generate_text). Gán tên model vào biến `GEMINI_MODEL` trong `.env` nếu cần.

---

## 4) Cấu hình Postman cho demo

1. Mở Postman → tạo một `Collection` mới (ví dụ `AI Code Review Demo`).
2. Tạo `Request` mới trong Collection:
   - Method: `POST`
   - URL: `http://localhost:5001/api/ai/code-review`
3. Tab `Headers`: thêm
   - `Content-Type: application/json`
4. Tab `Body` → chọn `raw` + `JSON` → paste JSON mẫu:

```json
{
  "user_id": "5235de5e-be77-4e66-a70a-da586d30f7d3",
  "submission_id": "11111111-1111-1111-1111-111111111111",
  "language": "python",
  "code": "print('Hello World')"
}
```

5. Nhấn `Send` → xem `Response` bên dưới. Nếu service chạy đúng và Supabase + Gemini config hợp lệ, bạn sẽ nhận được JSON chứa `review_id`, `summary`, `issues`, `suggestions`.

6. Nếu response báo lỗi liên quan tới Gemin i model not found, làm theo phần **3)** để liệt kê model khả dụng và update `GEMINI_MODEL` trong `.env`, restart service và thử lại.

---

## 5) Lưu kết quả request trong Postman

- Bạn có thể `Save` request vào collection để tái sử dụng.
- Dùng `Collection Runner` để chạy hàng loạt ví dụ (nếu muốn test nhiều code submissions).

---

## 6) Tài liệu tham khảo

- Supabase Python SDK: https://supabase.com/docs/reference/python
- Google Generative AI (Makersuite): https://makersuite.google.com/
- Google Generative AI Python SDK docs: https://developers.generativeai.google/

---

CHI TIẾT TẠI REAME.md