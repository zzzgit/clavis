export default [
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
      // 最佳实践
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-console": "off",
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "no-undef": "error",
      
      // 代码风格
      "semi": ["error", "never"],
      "quotes": ["error", "single", { "avoidEscape": true }],
      "indent": ["error", "tab"],
      "comma-dangle": ["error", "never"],
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
      "space-before-blocks": ["error", "always"],
      "keyword-spacing": ["error", { "before": true, "after": true }],
      "space-infix-ops": "error",
      "arrow-spacing": ["error", { "before": true, "after": true }],
      "block-spacing": "error",
      
      // 空白和格式
      "no-multiple-empty-lines": ["error", { "max": 1 }],
      "eol-last": ["error", "always"],
      "no-trailing-spaces": "error",
      "padded-blocks": ["error", "never"],
      
      // 其他
      "prefer-const": "warn",
      "no-var": "error",
      "prefer-arrow-callback": "warn",
      "arrow-body-style": ["warn", "as-needed"]
    }
  }
];