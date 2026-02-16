import { createBrowserRouter } from "react-router";
import type { ComponentType } from "react";

type PageModule = { default: ComponentType };
const CHUNK_RELOAD_KEY = "__chunk_reload_once__";

const shouldRecoverByReload = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Cannot read properties of undefined \(reading 'default'\)|Route module missing default export/i.test(
    message
  );
};

const lazyPage = (importPage: () => Promise<PageModule>) => async () => {
  try {
    const page = await importPage();
    if (!page || !page.default) {
      throw new Error("Route module missing default export");
    }
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    return { Component: page.default };
  } catch (error) {
    if (typeof window !== "undefined" && shouldRecoverByReload(error)) {
      const hasReloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY) === "1";
      if (!hasReloaded) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
        window.location.reload();
        return new Promise<never>(() => {});
      }
      sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    }
    throw error;
  }
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
