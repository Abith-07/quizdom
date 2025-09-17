import { render, fireEvent } from '@testing-library/react';
import QuizAccess from './QuizAccess';

const quiz = {
  questions: [
    { question: 'What is 2+2?', options: ['3', '4'], answer: 'B' }
  ]
};

test('submits quiz and shows score modal', () => {
  const { getByText } = render(<QuizAccess location={{ state: { quiz } }} />);
  fireEvent.click(getByText('a) 3'));
  fireEvent.click(getByText('Submit Quiz'));
  expect(getByText(/Your Score:/)).toBeInTheDocument();
});