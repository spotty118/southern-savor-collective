import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Link } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

interface RecipeImageUploadProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MIN_WIDTH = 200;
const MIN_HEIGHT = 200;
const MAX_WIDTH = 4096;
const MAX_HEIGHT = 4096;

const imageUrlSchema = z.string().url().refine(
  (url) => url.match(/\.(jpg|jpeg|png|webp)$/i),
  "URL must point to a valid image file (jpg, jpeg, png, or webp)"
);

export const RecipeImageUpload = ({ imageUrl, setImageUrl }: RecipeImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [useUrl, setUseUrl] = useState(true);

  const validateImageDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const isValid = 
          img.width >= MIN_WIDTH &&
          img.width <= MAX_WIDTH &&
          img.height >= MIN_HEIGHT &&
          img.height <= MAX_HEIGHT;
        
        if (!isValid) {
          toast({
            title: "Invalid image dimensions",
            description: `Image must be between ${MIN_WIDTH}x${MIN_HEIGHT} and ${MAX_WIDTH}x${MAX_HEIGHT} pixels`,
            variant: "destructive",
          });
        }
        resolve(isValid);
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        toast({
          title: "Error",
          description: "Failed to load image for validation",
          variant: "destructive",
        });
        resolve(false);
      };
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or WebP image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: `Please upload an image smaller than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        variant: "destructive",
      });
      return;
    }

    // Validate image dimensions
    const isValidDimensions = await validateImageDimensions(file);
    if (!isValidDimensions) return;

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('recipe-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

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
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    try {
      imageUrlSchema.parse(url);
      setImageUrl(url);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid URL",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    }
  };

  const handleImageError = () => {
    toast({
      title: "Error",
      description: "Failed to load image from URL",
      variant: "destructive",
    });
    setImageUrl("");
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
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="Enter image URL (jpg, png, or webp)"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="imageUpload">Upload Image</Label>
          <Input
            id="imageUpload"
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Recipe preview"
              className="mt-2 rounded-md max-h-48 object-cover"
              onError={handleImageError}
            />
          )}
        </div>
      )}
    </div>
  );
};