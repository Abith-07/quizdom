module.exports = {
  // ...existing config...
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/__mocks__/fileMock.js',
    '^firebase/auth$': '<rootDir>/src/__mocks__/firebase/auth.js'
  },
  // ...rest of config...
};