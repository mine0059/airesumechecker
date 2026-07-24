import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Landing from "@/pages/Landing";
import { Placeholder } from "@/pages/Placeholder";
import Resumes from "@/pages/Resumes";
import ResumeDetail from "@/pages/ResumeDetail";
import ExportPage from "@/pages/Export";
import Insights from "@/pages/Insights";
import Versions from "@/pages/Versions";
import History from "@/pages/History";
import Settings from "@/pages/Settings";
import { useAuth } from "@/context/AuthContext";

import { Loader2 } from "lucide-react";
import { ColdStartNotice } from "@/components/ui/ColdStartNotice";

function ProtectedShell() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--ink-muted)] text-sm p-4">
        <div className="flex items-center gap-2 mb-2 font-medium text-[var(--ink)]">
          <Loader2 size={18} className="animate-spin text-[var(--accent)]" />
          <span>Authenticating...</span>
        </div>
        <ColdStartNotice loading={loading} delayMs={2000} className="max-w-md mt-3" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell />;
}

export const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    path: "/",
    element: <ProtectedShell />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "resumes", element: <Resumes /> },
      { path: "resumes/:id", element: <ResumeDetail /> },
      { path: "resumes/:id/export", element: <ExportPage /> },
      { path: "insights", element: <Insights /> },
      { path: "versions", element: <Versions /> },
      { path: "history", element: <History /> },
      { path: "settings", element: <Settings /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
