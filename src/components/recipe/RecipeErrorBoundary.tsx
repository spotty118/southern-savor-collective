import React from 'react';
import { RecipeError, RecipeErrorCode } from '@/types/recipe';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
  hasError: boolean;
}

export class RecipeErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      error: null,
      hasError: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      error,
      hasError: true
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Recipe Error:', error, errorInfo);
  }

  private getErrorMessage(error: Error): { title: string; description: string } {
    if (error instanceof RecipeError) {
      switch (error.code) {
        case RecipeErrorCode.NOT_FOUND:
          return {
            title: 'Recipe Not Found',
            description: 'The recipe you are looking for could not be found.'
          };
        case RecipeErrorCode.UNAUTHORIZED:
          return {
            title: "Access Denied",
            description: "You do not have permission to view this recipe."
          };
        case RecipeErrorCode.VALIDATION_ERROR:
          return {
            title: 'Invalid Recipe Data',
            description: 'There was a problem with the recipe data.'
          };
        default:
          return {
            title: 'Error Loading Recipe',
            description: error.message
          };
      }
    }

    return {
      title: 'Unexpected Error',
      description: 'An unexpected error occurred while loading the recipe.'
    };
  }

  private handleRetry = () => {
    this.setState({
      error: null,
      hasError: false
    });
  };

  render() {
    if (this.state.hasError) {
      const { title, description } = this.getErrorMessage(this.state.error!);

      return (
        <div className="p-4">
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{description}</AlertDescription>
          </Alert>
          <Button 
            onClick={this.handleRetry}
            variant="outline"
            className="w-full"
          >
            <span className="mr-2">↻</span>
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}