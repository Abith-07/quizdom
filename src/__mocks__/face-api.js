const faceapi = {
  nets: {
    tinyFaceDetector: {
      loadFromUri: jest.fn(() => Promise.resolve())
    },
    faceLandmark68Net: {
      loadFromUri: jest.fn(() => Promise.resolve())
    },
    faceRecognitionNet: {
      loadFromUri: jest.fn(() => Promise.resolve())
    }
  },
  detectAllFaces: jest.fn(() => ({
    withFaceLandmarks: jest.fn(() => ({
      withFaceDescriptors: jest.fn(() => Promise.resolve([]))
    }))
  }))
};

module.exports = faceapi;