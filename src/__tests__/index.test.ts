import { greet } from '../index';

describe('greet', () => {
  it('should return greeting with name', () => {
    expect(greet('World')).toBe('Hello, World!');
  });

  it('should handle empty string', () => {
    expect(greet('')).toBe('Hello, !');
  });
});