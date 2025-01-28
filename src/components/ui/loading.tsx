import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  text?: string;
}

const sizeMap = {
  small: 'h-4 w-4',
  medium: 'h-8 w-8',
  large: 'h-12 w-12'
};

export function Loading({ size = 'medium', fullScreen = false, text }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className={`animate-spin ${sizeMap[size]}`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}