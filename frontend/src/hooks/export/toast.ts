import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

const toastState: ToastState = {
  toasts: []
};

const listeners: Array<(state: ToastState) => void> = [];

function dispatch(state: ToastState) {
  listeners.forEach((listener) => listener(state));
}

function addToast(toast: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast: Toast = {
    ...toast,
    id,
    duration: toast.duration || 5000
  };

  toastState.toasts = [...toastState.toasts, newToast];
  dispatch(toastState);

  setTimeout(() => {
    removeToast(id);
  }, newToast.duration);
}

function removeToast(id: string) {
  toastState.toasts = toastState.toasts.filter((toast) => toast.id !== id);
  dispatch(toastState);
}

export function useToast() {
  const [state, setState] = useState<ToastState>(toastState);

  useState(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  });

  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    addToast(props);
  }, []);

  const dismiss = useCallback((id: string) => {
    removeToast(id);
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss
  };
}