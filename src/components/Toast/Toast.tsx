import { signal } from "@preact/signals";
import "./Toast.css";

interface ToastData {
  message: string;
  type: "success" | "warning" | "error";
  id: number;
}

let toastId = 0;
const toasts = signal<ToastData[]>([]);

export function showToast(
  message: string,
  type: ToastData["type"] = "success",
  duration = 2500
) {
  const id = ++toastId;
  toasts.value = [...toasts.value, { message, type, id }];
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, duration);
}

export function ToastContainer() {
  if (toasts.value.length === 0) return null;

  return (
    <div class="toast-container">
      {toasts.value.map((t) => (
        <div key={t.id} class={`toast toast--${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
