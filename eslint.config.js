import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "*.config.js",
      "*.config.ts",
      "*.log",
      ".vscode/**",
      ".idea/**",
      "tmp/**",
      "temp/**"
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        Buffer: "readonly",
        setImmediate: "readonly",
        clearImmediate: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly"
      }
    },
    rules: {
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-console": "off",
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      
      "semi": ["error", "never"],
      "quotes": ["error", "single", { "avoidEscape": true }],
      "indent": ["error", "tab"],
      
      "prefer-arrow-callback": "warn",
      "arrow-body-style": ["warn", "as-needed"]
    }
  }
];
