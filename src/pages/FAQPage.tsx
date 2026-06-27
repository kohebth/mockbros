import { EmptyState } from "../components/EmptyState";

export function FAQPage() {
  return (
    <div className="container">
      <div className="page-header">
        <h1>FAQ</h1>
        <p>Câu hỏi thường gặp</p>
      </div>
      <EmptyState
        title="FAQ đang được cập nhật"
        message="Chúng tôi đang tổng hợp các câu hỏi thường gặp. Hãy quay lại sau để xem nội dung mới nhất!"
        actionLabel="Về trang chủ"
        actionPath="/"
      />
    </div>
  );
}
