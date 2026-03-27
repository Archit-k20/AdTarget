import { useState, useEffect, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

// ── Individual Toast ──────────────────────────────────────────────────────────

const ICONS = {
  success: <CheckCircle size={18} className="text-green-500 flex-shrink-0" />,
  error:   <AlertCircle  size={18} className="text-red-500   flex-shrink-0" />,
  info:    <Info         size={18} className="text-blue-500  flex-shrink-0" />,
};

const BG = {
  success: "bg-green-50 border-green-200",
  error:   "bg-red-50   border-red-200",
  info:    "bg-blue-50  border-blue-200",
};

const Toast = ({ id, type = "info", message, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-md
                  text-sm text-gray-800 max-w-sm w-full animate-fade-in
                  ${BG[type]}`}
    >
      {ICONS[type]}
      <span className="flex-1 leading-snug">{message}</span>
      <button
        onClick={() => onRemove(id)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};

// ── Toast Container ───────────────────────────────────────────────────────────

export const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onRemove={onRemove} />
      ))}
    </div>
  );
};

// ── useToast hook ─────────────────────────────────────────────────────────────

let _nextId = 1;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((message, type = "info") => {
    const id = _nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const toast = {
    success: (msg) => add(msg, "success"),
    error:   (msg) => add(msg, "error"),
    info:    (msg) => add(msg, "info"),
  };

  return { toasts, toast, remove };
};