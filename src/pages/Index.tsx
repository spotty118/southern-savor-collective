import { useState } from "react";
import { RecipeCard } from "@/components/RecipeCard";

// Temporary mock data
const MOCK_RECIPES = [
  {
    id: 1,
    title: "Southern Buttermilk Biscuits",
    description: "Light, fluffy, and perfectly golden brown biscuits made with real buttermilk. A true Southern classic that's perfect for breakfast or dinner.",
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
    author: "Sarah Johnson",
    cookTime: "30 mins",
    difficulty: "Medium",
    isLoved: false,
  },
  {
    id: 2,
    title: "Classic Shrimp and Grits",
    description: "Creamy stone-ground grits topped with succulent shrimp in a rich, flavorful sauce. A coastal Southern favorite.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    author: "Michael Smith",
    cookTime: "45 mins",
    difficulty: "Easy",
    isLoved: true,
  },
  {
    id: 3,
    title: "Peach Cobbler",
    description: "Sweet, juicy peaches topped with a buttery, crisp crust. The perfect summer dessert.",
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
    author: "Emily Brown",
    cookTime: "1 hour",
    difficulty: "Easy",
    isLoved: false,
  },
];

const Index = () => {
  const [recipes, setRecipes] = useState(MOCK_RECIPES);

  const handleLoveClick = (recipeId: number) => {
    setRecipes(recipes.map(recipe => 
      recipe.id === recipeId 
        ? { ...recipe, isLoved: !recipe.isLoved }
        : recipe
    ));
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="container mx-auto">
        <header className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-accent md:text-5xl lg:text-6xl">
            Southern Comfort Recipes
          </h1>
          <p className="text-lg text-gray-600">
            Discover authentic Southern recipes passed down through generations
          </p>
        </header>

        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              {...recipe}
              onLoveClick={() => handleLoveClick(recipe.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;