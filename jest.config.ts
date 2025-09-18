import type { Config } from "jest";

const runLive = !!process.env.OPENAI_API_KEY;

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  moduleNameMapper: {
    "^openai/helpers/(.*)$": "<rootDir>/node_modules/openai/helpers/$1",
    "^next/server$": "<rootDir>/test/__mocks__/next-server",
    "^pusher-js$": "<rootDir>/test/__mocks__/pusher-js",
    "^@/(.*)$": "<rootDir>/test/__mocks__/@/$1",
    "^uuid$": "<rootDir>/test/__mocks__/uuid",
    "^@pinecone-database/pinecone$": "<rootDir>/test/__mocks__/@pinecone-database/pinecone"
  },
  // Prefer running live OpenAI tests when an API key is present
  testPathIgnorePatterns: runLive ? ["/node_modules/"] : ["/node_modules/", "<rootDir>/openai/__tests__/"],
  testTimeout: 30000,
};

export default config;
