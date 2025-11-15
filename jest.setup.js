// Jest setup file for configuring the test environment

// Mock Expo modules
jest.mock('expo-font');
jest.mock('expo-asset');
jest.mock('expo-haptics');
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {},
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Set a reasonable timeout for tests
jest.setTimeout(10000);
