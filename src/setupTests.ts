// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { vi } from "vitest";
import { defaultFallbackInView } from "react-intersection-observer";
import {
  setupIntersectionMocking,
  resetIntersectionMocking,
} from "react-intersection-observer/test-utils";

// Wrap vi.fn so that implementations are wrapped in a regular function
// (not arrow function), making them usable as constructors with `new`.
const constructableFn: typeof vi.fn = (impl?: any) => {
  if (impl) {
    // Wrap arrow function impl in a regular function so it can be used as constructor
    const wrapped = function (this: any, ...args: any[]) {
      return impl.apply(this, args);
    };
    return vi.fn(wrapped) as any;
  }
  return vi.fn() as any;
};

beforeEach(() => {
  setupIntersectionMocking(constructableFn as any);
});

afterEach(() => {
  resetIntersectionMocking();
});

defaultFallbackInView(true);

// Made with Bob
