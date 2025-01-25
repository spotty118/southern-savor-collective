import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import CreateRecipe from "@/pages/CreateRecipe";
import RecipeDetail from "@/pages/RecipeDetail";
import EditRecipe from "@/pages/EditRecipe";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL || "/"}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/create-recipe" element={<CreateRecipe />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/recipe/:id/edit" element={<EditRecipe />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;