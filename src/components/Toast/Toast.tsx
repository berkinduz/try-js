import { signal } from "@preact/signals";
import "./Toast.css";

interface ToastData {
  message: string;
  type: "success" | "warning" | "error";
  id: number;
  action?: { label: string; onClick: () => void };
}

let toastId = 0;
const toasts = signal<ToastData[]>([]);

export function showToast(
  message: string,
  type: ToastData["type"] = "success",
  duration = 2500,
  action?: ToastData["action"],
) {
  const id = ++toastId;
  toasts.value = [...toasts.value, { message, type, id, action }];
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, duration);
}

export function ToastContainer() {
  if (toasts.value.length === 0) return null;

  return (
    <div class="toast-container" role="status" aria-live="polite">
      {toasts.value.map((t) => (
        <div key={t.id} class={`toast toast--${t.type}`}>
          {t.message}
          {t.action && <button type="button" onClick={() => {
            toasts.value = toasts.value.filter(item => item.id !== t.id);
            t.action?.onClick();
          }}>{t.action.label}</button>}
        </div>
      ))}
    </div>
  );
}
