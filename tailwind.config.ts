import type { Config } from "tailwindcss";

// Tailwind is here for mechanics/utilities and shadcn primitives later.
// The Life Book visual language lives in CSS variables in app/globals.css —
// do NOT let a shadcn theme overwrite those tokens.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
export default config;
