// jest.config.js
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  setupFilesAfterEnv: ["./jest.setup.js"],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/fileMock.js",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy", // Mock CSS imports
  },
  transformIgnorePatterns: [
    "node_modules/(?!(your-library|other-library)/)", // Add libraries that need transforming
  ],
};

