# Instructor Features - CodeQuest Platform

## Tổng quan
Hệ thống Instructor Dashboard cho phép giảng viên quản lý khóa học, theo dõi học viên và phân tích hiệu suất giảng dạy của mình trên nền tảng CodeQuest.

## Các trang đã triển khai

### 1. Instructor Dashboard (`InstructorDashboard.tsx`)
**Mục đích**: Trang tổng quan chính cho giảng viên

**Tính năng**:
- 📊 Thống kê tổng quan (tổng số khóa học, học viên, doanh thu, rating trung bình)
- 📈 Biểu đồ doanh thu theo tháng
- 👥 Biểu đồ số lượng học viên đăng ký
- 📚 Danh sách khóa học với thông tin chi tiết
- 🔔 Hoạt động gần đây (reviews, enrollments, câu hỏi)
- ➕ Nút tạo khóa học mới

**Components sử dụng**:
- Card, Button, Badge từ shadcn/ui
- LineChart, BarChart từ recharts
- DropdownMenu cho menu actions

### 2. Course Manager (`InstructorCourseManager.tsx`)
**Mục đích**: Quản lý chi tiết nội dung khóa học

**Tính năng**:
- 📋 4 tabs chính:
  - **Curriculum**: Quản lý sections và lessons (drag & drop)
  - **Students**: Danh sách học viên với progress tracking
  - **Q&A**: Quản lý câu hỏi từ học viên
  - **Settings**: Cài đặt khóa học (title, description, price, visibility)
  
- 📊 Stats nhanh: số lessons, published, duration, students, rating, completion rate
- ✏️ CRUD operations cho sections và lessons
- 🎓 Theo dõi tiến độ từng học viên
- 💬 Trả lời câu hỏi của học viên
- ⚙️ Toggle settings (Q&A, Reviews, Certificate)

**Components sử dụng**:
- Tabs, Dialog, Select từ shadcn/ui
- Switch, Input, Textarea cho forms
- Badge để hiển thị status

### 3. Analytics (`InstructorAnalytics.tsx`)
**Mục đích**: Phân tích chi tiết hiệu suất khóa học

**Tính năng**:
- 📈 Overview stats với trend indicators
- 💰 Revenue & Enrollments trend (dual-axis chart)
- 📊 Course performance comparison
- 🌐 Traffic sources (Pie chart)
- ⏰ Weekly student engagement
- 🏆 Top performing lessons
- 🗺️ Student geography distribution
- 📥 Export report functionality

**Visualizations**:
- AreaChart cho revenue trends
- BarChart cho engagement metrics
- PieChart cho traffic sources
- Completion rate progress bars

### 4. Create Course (`InstructorCreateCourse.tsx`)
**Mục đích**: Wizard để tạo khóa học mới

**Tính năng**:
- 📝 4 bước tạo khóa học:
  - **Step 1 - Basic Info**: Title, description, category, level, language, price
  - **Step 2 - Media**: Upload thumbnail và promotional video
  - **Step 3 - Objectives**: Learning outcomes, prerequisites, target audience
  - **Step 4 - Settings**: Publish settings, Q&A, reviews, certificate
  
- 📊 Progress bar tracking
- 💾 Save as draft functionality
- ✅ Course summary trước khi publish
- 🎯 Dynamic form với add/remove fields

**Components sử dụng**:
- Multi-step form với Progress component
- Dialog cho confirmations
- Dynamic lists với add/remove buttons
- Switch cho boolean settings

## Chuyển đổi giữa Student và Instructor Mode

### Cách sử dụng:
1. Đăng nhập vào hệ thống
2. Nhìn vào sidebar, bạn sẽ thấy badge "Student Mode" hoặc "Instructor Mode"
3. Click nút "Switch to Instructor" ở sidebar để chuyển sang Instructor mode
4. Menu sẽ thay đổi để hiển thị các tùy chọn dành cho giảng viên:
   - Dashboard (Instructor)
   - My Courses
   - Analytics
   - Forum
   - Profile
   - Settings

### Menu Instructor:
- 🏠 **Dashboard**: Tổng quan về tất cả khóa học
- 📹 **My Courses**: Quản lý nội dung chi tiết từng khóa học
- 📊 **Analytics**: Phân tích hiệu suất và insights
- 💬 **Forum**: Tương tác với cộng đồng
- 👤 **Profile**: Thông tin cá nhân
- ⚙️ **Settings**: Cài đặt tài khoản

## Design System

### Colors:
- Primary: Blue #2563EB
- Success: Green #10B981
- Warning: Orange/Yellow
- Danger: Red
- Purple: #8B5CF6 (for instructor-specific elements)

### Typography:
- Font: Inter/Poppins
- Không sử dụng custom text-* classes (theo globals.css)

### Layout:
- Border radius: 12px (rounded-xl)
- Cards với subtle shadows
- Hover states với transitions
- Responsive grid layouts

### Icons:
- Sử dụng lucide-react
- Outline style icons
- Consistent sizing (w-4 h-4 cho small, w-5 h-5 cho medium)

## Data Flow

### Navigation:
```
App.tsx (state management)
  ↓
DashboardLayout.tsx (layout + role switching)
  ↓
InstructorDashboard.tsx / InstructorCourseManager.tsx / InstructorAnalytics.tsx
  ↓
onNavigate callback để điều hướng giữa các trang
```

### Role Management:
```typescript
const [userRole, setUserRole] = useState<"student" | "instructor">("student");

const toggleRole = () => {
  setUserRole(prev => prev === "student" ? "instructor" : "student");
  setCurrentPage(userRole === "student" ? "instructor-dashboard" : "dashboard");
};
```

## Tính năng nổi bật

### 1. Real-time Stats
- Tracking các metrics quan trọng
- Trend indicators (+/- percentage)
- Color-coded status badges

### 2. Interactive Charts
- Sử dụng recharts library
- Responsive và interactive
- Tooltips với detailed information
- Multiple chart types (Line, Bar, Pie, Area)

### 3. Course Management
- Drag & drop curriculum organization
- Inline editing
- Status tracking (Published/Draft)
- Bulk actions

### 4. Student Insights
- Progress tracking per student
- Engagement metrics
- Geographic distribution
- Completion rates

### 5. Q&A System
- Question status (Answered/Pending)
- Reply functionality
- Filter by course/lesson
- Recent activity feed

## Best Practices

### Performance:
- Lazy load components khi cần
- Sử dụng React.memo cho complex components
- Optimize chart rendering với shouldUpdateChart
- Virtual scrolling cho long lists

### Accessibility:
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader friendly

### UX:
- Loading states
- Empty states với helpful messages
- Confirmation dialogs cho destructive actions
- Toast notifications cho feedback
- Progress indicators cho multi-step processes

## Future Enhancements

### Planned Features:
- [ ] Bulk operations (publish multiple courses)
- [ ] Advanced filtering và sorting
- [ ] Video upload integration
- [ ] Live course previews
- [ ] Student messaging system
- [ ] Automated certificate generation
- [ ] Course duplication
- [ ] Import/export curriculum
- [ ] Revenue payout system
- [ ] Advanced analytics (A/B testing)
- [ ] Course templates
- [ ] Collaborative course editing

### Technical Improvements:
- [ ] Add TypeScript interfaces cho data models
- [ ] Implement proper error handling
- [ ] Add form validation
- [ ] State management với Zustand/Redux
- [ ] Real-time updates với WebSockets
- [ ] Backend integration
- [ ] File upload với progress tracking
- [ ] Internationalization (i18n)

## Testing Scenarios

### Instructor Dashboard:
1. View overview stats
2. Check revenue chart data
3. Browse course cards
4. Click "Create New Course"
5. View recent activities

### Course Manager:
1. Select a course from dropdown
2. Add new section
3. Add lesson to section
4. Reorder lessons (drag & drop)
5. View student progress
6. Answer Q&A questions
7. Update course settings

### Analytics:
1. Change date range filter
2. View revenue trends
3. Compare course performance
4. Check traffic sources
5. Export report

### Create Course:
1. Fill basic information
2. Upload media
3. Add learning objectives
4. Configure settings
5. Preview and publish

---

**Note**: Đây là prototype version. Trong production, cần thêm:
- Backend API integration
- Authentication & authorization
- Data persistence
- File upload handling
- Real-time notifications
- Payment processing
- Email notifications
