import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  watch: false,
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "node",
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with ts-jest
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with ts-jest
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "./tests/tsconfig.json",
      },
    ],
  },
};

export default config;
