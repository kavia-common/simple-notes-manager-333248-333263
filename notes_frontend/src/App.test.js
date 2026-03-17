import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the fetch API for tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ data: [] }),
  })
);

test('renders the notes manager app', () => {
  render(<App />);
  // The app title "Notes" should be visible in the left panel header
  const titleElement = screen.getByText(/Notes/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders New button', () => {
  render(<App />);
  const newButton = screen.getByRole('button', { name: /create new note/i });
  expect(newButton).toBeInTheDocument();
});
