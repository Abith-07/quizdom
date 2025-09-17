import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import App from './App';

// Mock Firebase
jest.mock('./firebase', () => ({
  db: {},
  auth: jest.fn()
}));

// Mock face-api.js
jest.mock('face-api.js', () => ({
  detectSingleFace: jest.fn().mockResolvedValue({}),
  loadTinyFaceDetectorModel: jest.fn().mockResolvedValue({}),
  loadFaceLandmarkModel: jest.fn().mockResolvedValue({}),
  loadFaceRecognitionModel: jest.fn().mockResolvedValue({})
}));

// Mock AuthContext with a default value
const mockAuthValue = {
  currentUser: null,
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
  resetPassword: jest.fn()
};

jest.mock('./AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => mockAuthValue
}));

test('renders without crashing', () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
  expect(screen.getByTestId('app-root')).toBeInTheDocument();
});
