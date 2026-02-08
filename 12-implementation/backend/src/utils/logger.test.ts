/**
 * Logger Tests
 *
 * Tests for logger functionality.
 */

import { logger } from './logger';

describe('Logger', () => {
  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have info level', () => {
    expect(logger.info).toBeDefined();
    expect(typeof logger.info).toBe('function');
  });

  it('should have error level', () => {
    expect(logger.error).toBeDefined();
    expect(typeof logger.error).toBe('function');
  });

  it('should have warn level', () => {
    expect(logger.warn).toBeDefined();
    expect(typeof logger.warn).toBe('function');
  });

  it('should have debug level', () => {
    expect(logger.debug).toBeDefined();
    expect(typeof logger.debug).toBe('function');
  });

  it('should log info message', () => {
    // This test just ensures the method doesn't throw
    expect(() => {
      logger.info('Test info message');
    }).not.toThrow();
  });

  it('should log error message', () => {
    expect(() => {
      logger.error('Test error message');
    }).not.toThrow();
  });

  it('should log warn message', () => {
    expect(() => {
      logger.warn('Test warn message');
    }).not.toThrow();
  });

  it('should log debug message', () => {
    expect(() => {
      logger.debug('Test debug message');
    }).not.toThrow();
  });
});
