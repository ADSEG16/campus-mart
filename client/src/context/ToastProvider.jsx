import { createContext, useCallback, useMemo, useState } from "react";

export const ToastContext = createContext({
  toasts: [],
  showToast: () => {},
  dismissToast: () => {},
});

let toastCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info", durationMs = 3200) => {
    const id = `toast-${Date.now()}-${toastCounter++}`;
    const nextToast = { id, message, type };

    setToasts((prev) => [...prev, nextToast]);

    if (durationMs > 0) {
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, durationMs);
    }

    return id;
  }, []);

  const value = useMemo(() => ({ toasts, showToast, dismissToast }), [toasts, showToast, dismissToast]);

  const toastTypeClasses = {
    success: "border-green-200 bg-green-50 text-green-800",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed right-4 top-4 z-100 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border px-4 py-3 text-sm shadow-sm ${toastTypeClasses[toast.type] || toastTypeClasses.info}`}
          >
            <div className="flex items-start justify-between gap-2">
              <p>{toast.message}</p>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-xs font-semibold opacity-70 hover:opacity-100"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
