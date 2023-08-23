import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import packageVersion from "../package.json"
test('App Name rendered', () => {
  render(<App />);
  const linkElement = screen.getByText(/React excel sheet/i);
  expect(linkElement).toBeInTheDocument();
});

test('App version match check', () => {
    render(<App />);
    const linkElement = screen.getByText(new RegExp(packageVersion.version, "i"));
    expect(linkElement).toBeInTheDocument();
});
test('Get Updated data option', () => {
    render(<App />);
    const linkElement = screen.getByText(/Get Updated data/i);
    expect(linkElement).toBeInTheDocument();
});


