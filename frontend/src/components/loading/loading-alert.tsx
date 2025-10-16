import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { type ReactNode } from "react";

interface LoadingAndAlertWrapperProps {
  loading: boolean;
  error: string | null;
  loadingMessage?: string;
  errorDetails?: string;
  children: ReactNode;
  className?: string;
}

export function LoadingAndAlertWrapper({
  loading,
  error,
  loadingMessage = "Carregando...",
  errorDetails,
  children,
  className = "",
}: LoadingAndAlertWrapperProps) {
  return (
    <div className={className}>
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            {error}
            {errorDetails && (
              <>
                <br />
                <small>{errorDetails}</small>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">{loadingMessage}</span>
        </div>
      ) : (
        children
      )}
    </div>
  );
}