import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Link } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface RecipeImageUploadProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
}

export const RecipeImageUpload = ({ imageUrl, setImageUrl }: RecipeImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [useUrl, setUseUrl] = useState(true);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('recipe-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant={useUrl ? "default" : "outline"}
          onClick={() => setUseUrl(true)}
        >
          <Link className="mr-2 h-4 w-4" />
          URL
        </Button>
        <Button
          type="button"
          variant={!useUrl ? "default" : "outline"}
          onClick={() => setUseUrl(false)}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>

      {useUrl ? (
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter image URL"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="imageUpload">Upload Image</Label>
          <Input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Recipe preview"
              className="mt-2 rounded-md max-h-48 object-cover"
            />
          )}
        </div>
      )}
    </div>
  );
};