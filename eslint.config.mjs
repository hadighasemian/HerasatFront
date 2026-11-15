import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // The MaterialM template code uses `any` widely; keep it visible but non-blocking.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "out/**", ".flowbite-react/**", "next-env.d.ts"],
  },
];

export default config;
