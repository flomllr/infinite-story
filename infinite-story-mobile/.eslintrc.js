// TypeScript core team recommends ESLint over TSLint: https://github.com/Microsoft/TypeScript/issues/29288#developer-productivity-tools-and-integration
module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  extends: [
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    "prettier/@typescript-eslint", // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    "plugin:react/recommended",
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  rules: {
    "jsx-no-lambda": 0,
    "jsx-no-multiline-js": 0,
    "jsx-boolean-value": 0,
    "interface-name": 0,
    "no-console": 0,
    "ordered-imports": 0,
    "member-ordering": 0,
    "object-literal-sort-keys": 0,
    "member-access": 0,
    "max-classes-per-file": 0,
    "no-shadowed-variable": 0,
    "@typescript-eslint/explicit-function-return-type": "off",
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
  },
  settings: {
    react: {
      version: "detect", // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
};
