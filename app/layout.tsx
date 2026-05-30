import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import QueryProvider from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: "Super Admin — Restoran Tizimi",
  description: "Super Admin boshqaruv paneli",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body>
        <QueryProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#16161f",
                color: "#f1f1f5",
                border: "1px solid #252535",
                borderRadius: "10px",
                fontSize: "14px",
                fontFamily: "Space Grotesk, sans-serif",
              },
              success: {
                iconTheme: { primary: "#22c55e", secondary: "#16161f" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#16161f" },
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
