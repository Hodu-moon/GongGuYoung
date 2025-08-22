// src/layouts/RootLayout.tsx
import React from "react";

import { ThemeProvider } from "@/compat/theme";

/* ⬇️ 프로젝트에 있는 컨텍스트 Provider 들을 가져옵니다 */
import { AuthProvider } from "@/lib/auth-context"; // ← 반드시 존재해야 함
import { NotificationProvider } from "@/lib/notification-context";
import { AdminProvider } from "@/lib/admin-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AdminProvider>{children}</AdminProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
