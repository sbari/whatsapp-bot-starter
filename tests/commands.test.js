const hello = require('../src/commands/hello');

describe('Hello Command', () => {
  test('should have correct properties', () => {
    expect(hello.name).toBe('hello');
    expect(hello.description).toBeTruthy();
    expect(typeof hello.execute).toBe('function');
  });

  test('should have usage defined', () => {
    expect(hello.usage).toBeTruthy();
    expect(hello.usage).toContain('!hello');
  });
});

describe('Command Structure', () => {
  test('should follow command pattern', () => {
    const requiredProps = ['name', 'description', 'usage', 'execute'];
    requiredProps.forEach(prop => {
      expect(hello).toHaveProperty(prop);
    });
  });
});