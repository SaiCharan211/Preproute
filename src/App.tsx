import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CreateTestPage from "./pages/CreateTestPage";
import AddQuestionsPage from "./pages/AddQuestionsPage";
import PreviewPublishPage from "./pages/PreviewPublishPage";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="create-test" element={<CreateTestPage />} />
          <Route path="edit-test/:id" element={<CreateTestPage />} />
          <Route path="add-questions/:testId" element={<AddQuestionsPage />} />
          <Route path="preview/:testId" element={<PreviewPublishPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}