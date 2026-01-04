import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'vi';

interface Translations {
  [key: string]: {
    en: string;
    vi: string;
  };
}

// Common translations used across the app
const translations: Translations = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', vi: 'Bảng điều khiển' },
  'nav.courses': { en: 'Courses', vi: 'Khóa học' },
  'nav.analytics': { en: 'Analytics', vi: 'Thống kê' },
  'nav.interviews': { en: 'Interviews', vi: 'Phỏng vấn' },
  'nav.settings': { en: 'Settings', vi: 'Cài đặt' },
  'nav.profile': { en: 'Profile', vi: 'Hồ sơ' },
  'nav.logout': { en: 'Logout', vi: 'Đăng xuất' },
  
  // Common Actions
  'action.save': { en: 'Save', vi: 'Lưu' },
  'action.cancel': { en: 'Cancel', vi: 'Hủy' },
  'action.delete': { en: 'Delete', vi: 'Xóa' },
  'action.edit': { en: 'Edit', vi: 'Chỉnh sửa' },
  'action.add': { en: 'Add', vi: 'Thêm' },
  'action.search': { en: 'Search', vi: 'Tìm kiếm' },
  'action.filter': { en: 'Filter', vi: 'Lọc' },
  'action.export': { en: 'Export', vi: 'Xuất' },
  'action.preview': { en: 'Preview', vi: 'Xem trước' },
  'action.publish': { en: 'Publish', vi: 'Xuất bản' },
  'action.view': { en: 'View', vi: 'Xem' },
  'action.viewAll': { en: 'View All', vi: 'Xem tất cả' },
  'action.reply': { en: 'Reply', vi: 'Trả lời' },
  
  // Analytics Page
  'analytics.title': { en: 'Analytics & Insights', vi: 'Phân tích & Thống kê' },
  'analytics.subtitle': { en: 'Track your course performance and student engagement', vi: 'Theo dõi hiệu suất khóa học và tương tác học viên' },
  'analytics.totalViews': { en: 'Total Views', vi: 'Tổng lượt xem' },
  'analytics.newEnrollments': { en: 'New Enrollments', vi: 'Đăng ký mới' },
  'analytics.revenue': { en: 'Revenue', vi: 'Doanh thu' },
  'analytics.avgCompletion': { en: 'Avg. Completion', vi: 'Hoàn thành TB' },
  'analytics.revenueTrend': { en: 'Revenue & Enrollments Trend', vi: 'Xu hướng Doanh thu & Đăng ký' },
  'analytics.coursePerformance': { en: 'Course Performance', vi: 'Hiệu suất Khóa học' },
  'analytics.trafficSources': { en: 'Traffic Sources', vi: 'Nguồn truy cập' },
  'analytics.studentEngagement': { en: 'Weekly Student Engagement', vi: 'Tương tác học viên hàng tuần' },
  'analytics.topLessons': { en: 'Top Performing Lessons', vi: 'Bài học nổi bật' },
  'analytics.studentGeography': { en: 'Student Geography', vi: 'Phân bố học viên' },
  'analytics.exportReport': { en: 'Export Report', vi: 'Xuất báo cáo' },
  'analytics.last7days': { en: 'Last 7 days', vi: '7 ngày qua' },
  'analytics.last30days': { en: 'Last 30 days', vi: '30 ngày qua' },
  'analytics.last90days': { en: 'Last 90 days', vi: '90 ngày qua' },
  'analytics.lastYear': { en: 'Last year', vi: 'Năm qua' },
  'analytics.students': { en: 'students', vi: 'học viên' },
  'analytics.vsLastPeriod': { en: 'vs last period', vi: 'so với kỳ trước' },
  
  // Course Manager
  'courses.title': { en: 'Course Management', vi: 'Quản lý Khóa học' },
  'courses.subtitle': { en: 'Manage your course content and students', vi: 'Quản lý nội dung khóa học và học viên' },
  'courses.curriculum': { en: 'Curriculum', vi: 'Chương trình' },
  'courses.students': { en: 'Students', vi: 'Học viên' },
  'courses.questions': { en: 'Q&A', vi: 'Hỏi & Đáp' },
  'courses.settings': { en: 'Settings', vi: 'Cài đặt' },
  'courses.addSection': { en: 'Add Section', vi: 'Thêm Phần' },
  'courses.addLesson': { en: 'Add Lesson', vi: 'Thêm Bài' },
  'courses.lessons': { en: 'Lessons', vi: 'Bài học' },
  'courses.published': { en: 'Published', vi: 'Đã xuất bản' },
  'courses.draft': { en: 'Draft', vi: 'Bản nháp' },
  'courses.duration': { en: 'Duration', vi: 'Thời lượng' },
  'courses.avgRating': { en: 'Avg Rating', vi: 'Đánh giá TB' },
  'courses.completion': { en: 'Completion', vi: 'Hoàn thành' },
  'courses.enrolled': { en: 'Enrolled', vi: 'Đã đăng ký' },
  'courses.lastActive': { en: 'Last active', vi: 'Hoạt động lần cuối' },
  'courses.progress': { en: 'Progress', vi: 'Tiến độ' },
  'courses.viewProfile': { en: 'View Profile', vi: 'Xem hồ sơ' },
  'courses.answered': { en: 'answered', vi: 'đã trả lời' },
  'courses.pending': { en: 'pending', vi: 'chờ trả lời' },
  'courses.askedIn': { en: 'Asked in', vi: 'Hỏi trong' },
  'courses.courseTitle': { en: 'Course Title', vi: 'Tên khóa học' },
  'courses.shortDescription': { en: 'Short Description', vi: 'Mô tả ngắn' },
  'courses.coursePrice': { en: 'Course Price', vi: 'Giá khóa học' },
  'courses.category': { en: 'Course Category', vi: 'Danh mục' },
  'courses.level': { en: 'Course Level', vi: 'Cấp độ' },
  'courses.visibility': { en: 'Course Visibility', vi: 'Hiển thị khóa học' },
  'courses.makePublic': { en: 'Make this course public', vi: 'Công khai khóa học này' },
  'courses.enableQA': { en: 'Enable Q&A', vi: 'Bật Hỏi & Đáp' },
  'courses.allowQuestions': { en: 'Allow students to ask questions', vi: 'Cho phép học viên đặt câu hỏi' },
  'courses.enableReviews': { en: 'Course Reviews', vi: 'Đánh giá khóa học' },
  'courses.allowReviews': { en: 'Allow students to leave reviews', vi: 'Cho phép học viên để lại đánh giá' },
  'courses.saveChanges': { en: 'Save Changes', vi: 'Lưu thay đổi' },
  'courses.enrolledStudents': { en: 'Enrolled Students', vi: 'Học viên đã đăng ký' },
  'courses.studentQuestions': { en: 'Student Questions', vi: 'Câu hỏi của học viên' },
  
  // Common Labels
  'label.beginner': { en: 'Beginner', vi: 'Cơ bản' },
  'label.intermediate': { en: 'Intermediate', vi: 'Trung cấp' },
  'label.advanced': { en: 'Advanced', vi: 'Nâng cao' },
  'label.programming': { en: 'Programming', vi: 'Lập trình' },
  'label.webDev': { en: 'Web Development', vi: 'Phát triển Web' },
  'label.dataScience': { en: 'Data Science', vi: 'Khoa học dữ liệu' },
  'label.mobileDev': { en: 'Mobile Development', vi: 'Phát triển Mobile' },
  'label.loading': { en: 'Loading...', vi: 'Đang tải...' },
  'label.noData': { en: 'No data available', vi: 'Không có dữ liệu' },
  'label.error': { en: 'Error', vi: 'Lỗi' },
  
  // Time
  'time.hoursAgo': { en: 'hours ago', vi: 'giờ trước' },
  'time.daysAgo': { en: 'days ago', vi: 'ngày trước' },
  'time.weeksAgo': { en: 'weeks ago', vi: 'tuần trước' },
  'time.monthsAgo': { en: 'months ago', vi: 'tháng trước' },
  
  // Days of week
  'day.mon': { en: 'Mon', vi: 'T2' },
  'day.tue': { en: 'Tue', vi: 'T3' },
  'day.wed': { en: 'Wed', vi: 'T4' },
  'day.thu': { en: 'Thu', vi: 'T5' },
  'day.fri': { en: 'Fri', vi: 'T6' },
  'day.sat': { en: 'Sat', vi: 'T7' },
  'day.sun': { en: 'Sun', vi: 'CN' },
  
  // Settings Page
  'settings.title': { en: 'Settings', vi: 'Cài đặt' },
  'settings.subtitle': { en: 'Manage your account and preferences', vi: 'Quản lý tài khoản và tùy chọn' },
  'settings.profile': { en: 'Profile', vi: 'Hồ sơ' },
  'settings.notifications': { en: 'Notifications', vi: 'Thông báo' },
  'settings.security': { en: 'Security', vi: 'Bảo mật' },
  'settings.preferences': { en: 'Preferences', vi: 'Tùy chọn' },
  'settings.personalInfo': { en: 'Personal Information', vi: 'Thông tin cá nhân' },
  'settings.displayName': { en: 'Display Name', vi: 'Tên hiển thị' },
  'settings.email': { en: 'Email', vi: 'Email' },
  'settings.bio': { en: 'Bio', vi: 'Tiểu sử' },
  'settings.location': { en: 'Location', vi: 'Địa điểm' },
  'settings.saveChanges': { en: 'Save Changes', vi: 'Lưu thay đổi' },
  'settings.saving': { en: 'Saving...', vi: 'Đang lưu...' },
  'settings.socialLinks': { en: 'Social Links', vi: 'Liên kết mạng xã hội' },
  'settings.github': { en: 'GitHub', vi: 'GitHub' },
  'settings.linkedin': { en: 'LinkedIn', vi: 'LinkedIn' },
  'settings.website': { en: 'Website', vi: 'Trang web' },
  'settings.saveLinks': { en: 'Save Links', vi: 'Lưu liên kết' },
  'settings.emailNotifications': { en: 'Email Notifications', vi: 'Thông báo Email' },
  'settings.newLesson': { en: 'New lesson available', vi: 'Bài học mới' },
  'settings.newLessonDesc': { en: 'Get notified when new lessons are published', vi: 'Nhận thông báo khi bài học mới được xuất bản' },
  'settings.forumReplies': { en: 'Forum replies', vi: 'Trả lời diễn đàn' },
  'settings.forumRepliesDesc': { en: 'Receive notifications for forum activity', vi: 'Nhận thông báo về hoạt động diễn đàn' },
  'settings.achievements': { en: 'Achievement unlocked', vi: 'Thành tựu mở khóa' },
  'settings.achievementsDesc': { en: 'Get notified when you earn badges', vi: 'Nhận thông báo khi bạn nhận huy hiệu' },
  'settings.weeklyReport': { en: 'Weekly progress summary', vi: 'Báo cáo tiến độ hàng tuần' },
  'settings.weeklyReportDesc': { en: 'Receive a weekly email with your progress', vi: 'Nhận email hàng tuần về tiến độ của bạn' },
  'settings.marketing': { en: 'Marketing emails', vi: 'Email quảng cáo' },
  'settings.marketingDesc': { en: 'Receive updates about new features and promotions', vi: 'Nhận thông tin về tính năng mới và khuyến mãi' },
  'settings.pushNotifications': { en: 'Push Notifications', vi: 'Thông báo đẩy' },
  'settings.dailyReminder': { en: 'Daily reminder', vi: 'Nhắc nhở hàng ngày' },
  'settings.dailyReminderDesc': { en: 'Remind me to practice coding daily', vi: 'Nhắc tôi luyện tập code hàng ngày' },
  'settings.streakAlerts': { en: 'Streak alerts', vi: 'Cảnh báo chuỗi ngày' },
  'settings.streakAlertsDesc': { en: 'Alert when my streak is about to break', vi: 'Cảnh báo khi chuỗi ngày sắp bị phá vỡ' },
  'settings.changePassword': { en: 'Change Password', vi: 'Đổi mật khẩu' },
  'settings.currentPassword': { en: 'Current Password', vi: 'Mật khẩu hiện tại' },
  'settings.newPassword': { en: 'New Password', vi: 'Mật khẩu mới' },
  'settings.confirmPassword': { en: 'Confirm New Password', vi: 'Xác nhận mật khẩu mới' },
  'settings.updatePassword': { en: 'Update Password', vi: 'Cập nhật mật khẩu' },
  'settings.twoFactor': { en: 'Two-Factor Authentication', vi: 'Xác thực hai yếu tố' },
  'settings.enable2FA': { en: 'Enable 2FA', vi: 'Bật 2FA' },
  'settings.enable2FADesc': { en: 'Add an extra layer of security to your account', vi: 'Thêm lớp bảo mật cho tài khoản của bạn' },
  'settings.activeSessions': { en: 'Active Sessions', vi: 'Phiên hoạt động' },
  'settings.currentSession': { en: 'Current session', vi: 'Phiên hiện tại' },
  'settings.revoke': { en: 'Revoke', vi: 'Thu hồi' },
  'settings.active': { en: 'Active', vi: 'Hoạt động' },
  'settings.appearance': { en: 'Appearance', vi: 'Giao diện' },
  'settings.darkMode': { en: 'Dark Mode', vi: 'Chế độ tối' },
  'settings.darkModeDesc': { en: 'Switch to dark theme', vi: 'Chuyển sang giao diện tối' },
  'settings.darkModeActive': { en: 'Dark Mode Active', vi: 'Chế độ tối đang bật' },
  'settings.codeTheme': { en: 'Code Editor Theme', vi: 'Giao diện trình soạn thảo' },
  'settings.languageRegion': { en: 'Language & Region', vi: 'Ngôn ngữ & Khu vực' },
  'settings.language': { en: 'Language', vi: 'Ngôn ngữ' },
  'settings.timezone': { en: 'Timezone', vi: 'Múi giờ' },
  'settings.dangerZone': { en: 'Danger Zone', vi: 'Vùng nguy hiểm' },
  'settings.deleteAccount': { en: 'Delete Account', vi: 'Xóa tài khoản' },
  'settings.deleteAccountDesc': { en: 'Permanently delete your account and all data', vi: 'Xóa vĩnh viễn tài khoản và dữ liệu' },
  
  // Navigation Items
  'nav.home': { en: 'Home', vi: 'Trang chủ' },
  'nav.forum': { en: 'Forum', vi: 'Diễn đàn' },
  'nav.notebook': { en: 'Notebook', vi: 'Sổ tay' },
  'nav.interview': { en: 'Interview', vi: 'Phỏng vấn' },
  'nav.quizzes': { en: 'Quizzes', vi: 'Bài kiểm tra' },
  'nav.myCourses': { en: 'My Courses', vi: 'Khóa học của tôi' },
  'nav.mockInterviews': { en: 'Mock Interviews', vi: 'Phỏng vấn thử' },
  'nav.accountMgmt': { en: 'Account Mgmt', vi: 'Quản lý tài khoản' },
  'nav.instructors': { en: 'Instructors', vi: 'Giảng viên' },
  'nav.performance': { en: 'Performance', vi: 'Hiệu suất' },
  'nav.notifications': { en: 'Notifications', vi: 'Thông báo' },
  'nav.upgradeToPro': { en: 'Upgrade to Pro', vi: 'Nâng cấp Pro' },
  
  // User Roles
  'role.student': { en: 'Student Mode', vi: 'Chế độ học viên' },
  'role.instructor': { en: 'Instructor Mode', vi: 'Chế độ giảng viên' },
  'role.business': { en: 'Business Partner', vi: 'Đối tác doanh nghiệp' },
  
  // Language Options
  'lang.english': { en: 'English', vi: 'Tiếng Anh' },
  'lang.vietnamese': { en: 'Vietnamese', vi: 'Tiếng Việt' },
  'lang.spanish': { en: 'Spanish', vi: 'Tiếng Tây Ban Nha' },
  'lang.french': { en: 'French', vi: 'Tiếng Pháp' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get from localStorage or default to Vietnamese
    const saved = localStorage.getItem('preferred_language');
    return (saved === 'en' || saved === 'vi') ? saved : 'vi';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferred_language', lang);
  };

  // Translation function
  const t = (key: string, fallback?: string): string => {
    const translation = translations[key];
    if (translation) {
      return translation[language];
    }
    return fallback || key;
  };

  useEffect(() => {
    // Update document language attribute
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Export translations for direct use if needed
export { translations };
export type { Language, Translations };
