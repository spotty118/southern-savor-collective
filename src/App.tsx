import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import CreateRecipe from "./pages/CreateRecipe";
import RecipeDetail from "./pages/RecipeDetail";
import EditRecipe from "./pages/EditRecipe";
import Admin from "./pages/Admin";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import DataDeletion from "./pages/DataDeletion";
import BlogPost from "./pages/BlogPost";
import CreateBlogPost from "./pages/CreateBlogPost";
import EditBlogPost from "./pages/EditBlogPost";
import Blog from "./pages/Blog";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Toaster />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<ErrorBoundary><Index /></ErrorBoundary>} />
          <Route path="/auth" element={<ErrorBoundary><Auth /></ErrorBoundary>} />
          <Route path="/privacy" element={<ErrorBoundary><Privacy /></ErrorBoundary>} />
          <Route path="/terms" element={<ErrorBoundary><Terms /></ErrorBoundary>} />
          <Route path="/data-deletion" element={<ErrorBoundary><DataDeletion /></ErrorBoundary>} />
          <Route path="/blog" element={<ErrorBoundary><Blog /></ErrorBoundary>} />
          <Route path="/blog/:id" element={<ErrorBoundary><BlogPost /></ErrorBoundary>} />
          <Route path="/recipe/:id" element={<ErrorBoundary><RecipeDetail /></ErrorBoundary>} />

          {/* Protected routes */}
          <Route
            path="/profile"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="/create-recipe"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <CreateRecipe />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="/recipe/:id/edit"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <EditRecipe />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="/blog/create"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <CreateBlogPost />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="/blog/:id/edit"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <EditBlogPost />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ErrorBoundary>
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;