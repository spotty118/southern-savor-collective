import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
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
    <Router>
      <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-recipe" element={<CreateRecipe />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/recipe/:id/edit" element={<EditRecipe />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/data-deletion" element={<DataDeletion />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/create" element={<CreateBlogPost />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/blog/:id/edit" element={<EditBlogPost />} />
      </Routes>
    </Router>
  );
}

export default App;