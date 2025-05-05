/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.[jt]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    // mapeia "@/algo"  → src/algo
    '^@/(.*)$': '<rootDir>/src/$1',
    // mapeia "@lib/xyz" → src/lib/xyz
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
  },
  moduleDirectories: ['node_modules', 'src'],
};
