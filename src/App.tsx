import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HeaderNav } from "./components/HeaderNav";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { DictionaryPage } from "./pages/DictionaryPage";
import { RoleDetailPage } from "./pages/RoleDetailPage";
import { MockInterviewPage } from "./pages/MockInterviewPage";
import { EntryTestPage } from "./pages/EntryTestPage";
import { ProfessionalTestPage } from "./pages/ProfessionalTestPage";
import { AIInterviewPage } from "./pages/AIInterviewPage";
import { FAQPage } from "./pages/FAQPage";
import { CVAnalyzerPage } from "./pages/CVAnalyzerPage";
import { LoginRolePage } from "./pages/LoginRolePage";

export function App() {
  return (
    <BrowserRouter>
      <HeaderNav />
      <main style={{ minHeight: "calc(100vh - 152px)" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dictionary" element={<DictionaryPage />} />
          <Route path="/dictionary/:roleSlug" element={<RoleDetailPage />} />
          <Route path="/mock-interview" element={<MockInterviewPage />} />
          <Route path="/mock-interview/entry-test" element={<EntryTestPage />} />
          <Route path="/mock-interview/professional-test" element={<ProfessionalTestPage />} />
          <Route path="/mock-interview/ai" element={<AIInterviewPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/cv" element={<CVAnalyzerPage />} />
          <Route path="/login" element={<LoginRolePage />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
