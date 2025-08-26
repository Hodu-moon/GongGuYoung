import React from "react";
import { Route } from "react-router-dom";
const Page0 = React.lazy(() => import("@/pages/admin/dashboard/Page"));
const Page1 = React.lazy(() => import("@/pages/admin/login/Page"));
const Page2 = React.lazy(() => import("@/pages/admin/users/Page"));
const Page3 = React.lazy(() => import("@/pages/auth/login/Page"));
const Page4 = React.lazy(() => import("@/pages/auth/register/Page"));
const Page5 = React.lazy(() => import("@/pages/bnpl/Page"));
const Page6 = React.lazy(() => import("@/pages/campaigns/[id]/edit/Page"));
const Page7 = React.lazy(() => import("@/pages/campaigns/[id]/Page"));
const Page8 = React.lazy(() => import("@/pages/create-campaign/Page"));
const Page9 = React.lazy(() => import("@/pages/dashboard/Page"));
const Page10 = React.lazy(() => import("@/pages/my-page/Page"));
const Page11 = React.lazy(() => import("@/pages/notifications/Page"));
const Page12 = React.lazy(() => import("@/pages/notifications/settings/Page"));
const Page13 = React.lazy(() => import("@/pages/Page"));
const Page14 = React.lazy(() => import("@/pages/payment/Page"));
const Page15 = React.lazy(() => import("@/pages/payment/success/Page"));
export const AppRoutes = (
  <>
    <Route
      path="/admin/dashboard"
      element={React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(Page0)
      )}
    />
    <Route
      path="/admin/login"
      element={React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(Page1)
      )}
    />
    <Route
      path="/admin/users"
      element={React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(Page2)
      )}
    />
    <Route
      path="/auth/login"
      element={React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(Page3)
      )}
    />
    <Route
      path="/auth/register"
      element={React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(Page4)
      )}
    />
    <Route
      path="/bnpl"
      element={React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(Page5)
      )}
    />
    <Route
      path="/campaigns/:id/edit"
      element={React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(Page6)
      )}
    />
    <Route
      path="/campaigns/:id"
      element={React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(Page7)
      )}
    />
    <Route
      path="/create-campaign"
      element={React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(Page8)
      )}
    />
    <Route
      path="/dashboard"
      element={React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(Page9)
      )}
    />
    <Route
      path="/my-page"
      element={React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(Page10)
      )}
    />
    <Route
      path="/notifications"
      element={React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(Page11)
      )}
    />
    <Route
      path="/notifications/settings"
      element={React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(Page12)
      )}
    />
    <Route
      path="/"
      element={React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(Page13)
      )}
    />
    <Route
      path="/payment"
      element={React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(Page14)
      )}
    />
    <Route
      path="/payment/success"
      element={React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(Page15)
      )}
    />
  </>
);
