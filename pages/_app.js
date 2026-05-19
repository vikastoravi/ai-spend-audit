import "@/styles/globals.css";
import { ToastProvider } from "@/lib/ToastContext";

export default function App({ Component, pageProps }) {
  return (
    <ToastProvider>
      <Component {...pageProps} />
    </ToastProvider>
  );
}
