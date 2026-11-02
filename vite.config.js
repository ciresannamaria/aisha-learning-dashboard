import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/aisha-learning-dashboard/",
  plugins: [react()],
});
