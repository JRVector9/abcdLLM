import { createBrowserRouter } from "react-router";
import type { ComponentType } from "react";

type PageModule = { default: ComponentType };

const lazyPage = (importPage: () => Promise<PageModule>) => async () => {
  const page = await importPage();
  return { Component: page.default };
};

export const router = createBrowserRouter([
  {
    path: "/",
    lazy: lazyPage(() => import("./pages/Landing")),
  },
  {
    path: "/login",
    lazy: lazyPage(() => import("./pages/Login")),
  },
  {
    path: "/dashboard",
    lazy: lazyPage(() => import("./pages/Dashboard")),
  },
  {
    path: "/api-keys",
    lazy: lazyPage(() => import("./pages/ApiKeys")),
  },
  {
    path: "/playground",
    lazy: lazyPage(() => import("./pages/Playground")),
  },
  {
    path: "/usage",
    lazy: lazyPage(() => import("./pages/Usage")),
  },
  {
    path: "/admin",
    lazy: lazyPage(() => import("./pages/Admin")),
  },
  {
    path: "/api-application",
    lazy: lazyPage(() => import("./pages/ApiApplication")),
  },
  {
    path: "/settings",
    lazy: lazyPage(() => import("./pages/Settings")),
  },
]);
