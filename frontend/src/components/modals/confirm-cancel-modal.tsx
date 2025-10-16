import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, X, AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "confirm" | "cancel" | "warning";
  loading?: boolean;
}

export function ConfirmAndCancelModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "confirm",
  loading = false,
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "confirm":
        return {
          icon: <Check className="w-6 h-6 text-green-600" />,
          iconBg: "bg-green-100",
          buttonClass: "bg-green-600 hover:bg-green-700 text-white",
        };
      case "cancel":
        return {
          icon: <X className="w-6 h-6 text-red-600" />,
          iconBg: "bg-red-100",
          buttonClass: "bg-red-600 hover:bg-red-700 text-white",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
          iconBg: "bg-orange-100",
          buttonClass: "bg-orange-600 hover:bg-orange-700 text-white",
        };
      default:
        return {
          icon: <Check className="w-6 h-6 text-blue-600" />,
          iconBg: "bg-blue-100",
          buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${variantStyles.iconBg}`}>
              {variantStyles.icon}
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold">
                {title}
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-gray-600 mt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 sm:gap-2">
          <AlertDialogCancel 
            className="flex-1"
            disabled={loading}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={`flex-1 ${variantStyles.buttonClass}`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processando...
              </div>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}