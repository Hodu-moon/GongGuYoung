import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import { AppRoutes } from "./routes";
import { PageTransition } from "@/components/page-transition";
export default function App() {
  return (
    <RootLayout>
      {/* <Routes>
        {AppRoutes}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes> */}
      <PageTransition>
        <Routes>
          {AppRoutes}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageTransition>
    </RootLayout>
  );
}
