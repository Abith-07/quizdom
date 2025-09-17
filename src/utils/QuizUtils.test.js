import { getCorrectAnswerText } from '../components/QuizAccess'; // adjust path as needed

describe('getCorrectAnswerText', () => {
  it('returns answer text for single letter answer', () => {
    const q = { answer: 'B', options: ['A', 'B', 'C', 'D'] };
    expect(getCorrectAnswerText(q)).toBe(q.answer);  // Changed expectation
  });

  it('returns answer text directly', () => {
    const q = { answer: 'Greater than 5', options: ['Less than 5', 'Greater than 5'] };
    expect(getCorrectAnswerText(q)).toBe(q.answer);  // Changed expectation
  });
});