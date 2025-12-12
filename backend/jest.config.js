/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    // transform files with ts-jest
    '^.+\\.tsx?$': ['ts-jest', {
      // disable type checking for faster tests
      isolatedModules: true,
    }],
  },
};

