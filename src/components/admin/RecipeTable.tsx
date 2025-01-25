import { RecipeActionButtons } from "./RecipeActionButtons";

interface Recipe {
  id: string;
  title: string;
  author: { 
    id: string;
    username: string | null;
    full_name: string | null;
  };
  created_at: string;
}

interface RecipeTableProps {
  recipes: Recipe[];
  currentUserId: string;
  isAdmin: boolean;
  onShare: (recipeId: string) => void;
  onView: (recipeId: string) => void;
  onEdit: (recipeId: string) => void;
  onChangeOwner: (recipeId: string) => void;
  onDelete: (recipeId: string) => void;
}

export const RecipeTable = ({
  recipes,
  currentUserId,
  isAdmin,
  onShare,
  onView,
  onEdit,
  onChangeOwner,
  onDelete,
}: RecipeTableProps) => {
  return (
    <div className="rounded-md border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Recipe
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Author
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {recipes.map((recipe) => (
            <tr key={recipe.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {recipe.title}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {recipe.author?.username || recipe.author?.full_name || "User not found"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(recipe.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <RecipeActionButtons
                  recipeId={recipe.id}
                  authorId={recipe.author?.id}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  onShare={onShare}
                  onView={onView}
                  onEdit={onEdit}
                  onChangeOwner={onChangeOwner}
                  onDelete={onDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};