import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/theme-provider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "non.geist";
import "./index.css";
import App from "./app";

const router = createBrowserRouter([
  {
    path: "/:id?",
    element: <App />,
  },
], {
  future: {
    v7_relativeSplatPath: true,
  },
});
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);
