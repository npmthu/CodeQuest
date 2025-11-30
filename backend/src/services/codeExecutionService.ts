// Code execution service - Docker sandbox, run code, capture output
export const executeCode = async (code: string, language: string, problemId: string) => {
  // Gửi code vào Docker sandbox, chạy test case
  // (Giả lập, thực tế cần tích hợp với worker hoặc hệ thống thực thi)
  // Trả về output, lỗi, thời gian, bộ nhớ...
  return {
    output: "Test case passed!",
    error: null,
    time: "0.05s",
    memory: "14MB"
  };
};