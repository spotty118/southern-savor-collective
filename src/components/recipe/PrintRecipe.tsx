import React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintRecipeProps {
  title: string;
  description: string;
  cookTime: string;
  difficulty: string;
  ingredients: Array<{ amount: string; unit: string; item: string }>;
  instructions: string[];
}

export const PrintRecipe = ({
  title,
  description,
  cookTime,
  difficulty,
  ingredients,
  instructions,
}: PrintRecipeProps) => {
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>${title} - Recipe</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 { 
              color: #333;
              border-bottom: 2px solid #FEC6A1;
              padding-bottom: 10px;
            }
            .recipe-info {
              color: #666;
              margin-bottom: 20px;
            }
            .ingredients {
              background: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .instructions {
              line-height: 1.6;
            }
            .instructions ol {
              padding-left: 20px;
            }
            @media print {
              body {
                padding: 0;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="recipe-info">
            <p>${description}</p>
            <p><strong>Cooking Time:</strong> ${cookTime}</p>
            <p><strong>Difficulty:</strong> ${difficulty}</p>
          </div>
          <div class="ingredients">
            <h2>Ingredients</h2>
            <ul>
              ${ingredients
                .map(
                  (ing) =>
                    `<li>${ing.amount} ${ing.unit} ${ing.item}</li>`
                )
                .join("")}
            </ul>
          </div>
          <div class="instructions">
            <h2>Instructions</h2>
            <ol>
              ${instructions
                .map((instruction) => `<li>${instruction}</li>`)
                .join("")}
            </ol>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  return (
    <Button
      onClick={handlePrint}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Printer className="h-4 w-4" />
      Print Recipe
    </Button>
  );
};