// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { defaultFallbackInView } from "react-intersection-observer";
import { setupIntersectionMocking, resetIntersectionMocking } from "react-intersection-observer/test-utils";

// Mock IntersectionObserver
class IntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

Object.defineProperty(global, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

beforeEach(() => {
  setupIntersectionMocking(jest.fn);
});

afterEach(() => {
  resetIntersectionMocking();
});

defaultFallbackInView(true);
