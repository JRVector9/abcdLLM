import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ApiKeys from "./pages/ApiKeys";
import Playground from "./pages/Playground";
import Usage from "./pages/Usage";
import Admin from "./pages/Admin";
import ApiApplication from "./pages/ApiApplication";
import Settings from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/api-keys",
    Component: ApiKeys,
  },
  {
    path: "/playground",
    Component: Playground,
  },
  {
    path: "/usage",
    Component: Usage,
  },
  {
    path: "/admin",
    Component: Admin,
  },
  {
    path: "/api-application",
    Component: ApiApplication,
  },
  {
    path: "/settings",
    Component: Settings,
  },
]);
