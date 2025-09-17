import '@testing-library/jest-dom';
const TextEncoder = require('util').TextEncoder;
const TextDecoder = require('util').TextDecoder;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Setup global browser APIs for Node environment
if (typeof window !== 'undefined') {
  global.window = {
    ...global.window,
    ReadableStream: class {},
    fetch: () => Promise.resolve({ ok: true }),
  };
  global.ReadableStream = window.ReadableStream;
  global.fetch = window.fetch;
} else {
  global.ReadableStream = class {};
  global.fetch = () => Promise.resolve({ ok: true });
  global.window = {
    ReadableStream: global.ReadableStream,
    fetch: global.fetch,
  };
}

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

jest.mock('axios');
jest.mock('lottie-react', () => ({
  __esModule: true,
  default: () => <div>Lottie Animation</div>,
}));

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

const Modal = ({ children }) => <div>{children}</div>;
Modal.setAppElement = jest.fn();

jest.mock('react-modal', () => ({
  __esModule: true,
  default: Modal,
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
  ToastContainer: () => <div>Toast Container</div>,
}));
