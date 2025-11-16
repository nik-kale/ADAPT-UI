import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, LogLevel } from './logger';

describe('Logger', () => {
  let consoleDebugSpy: any;
  let consoleInfoSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleDebugSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('logs debug messages', () => {
    logger.setLevel(LogLevel.DEBUG);
    logger.debug('Test debug message');

    expect(consoleDebugSpy).toHaveBeenCalled();
    expect(consoleDebugSpy.mock.calls[0][0]).toContain('Test debug message');
  });

  it('logs info messages', () => {
    logger.setLevel(LogLevel.INFO);
    logger.info('Test info message');

    expect(consoleInfoSpy).toHaveBeenCalled();
    expect(consoleInfoSpy.mock.calls[0][0]).toContain('Test info message');
  });

  it('logs warning messages', () => {
    logger.warn('Test warning message');

    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(consoleWarnSpy.mock.calls[0][0]).toContain('Test warning message');
  });

  it('logs error messages', () => {
    const error = new Error('Test error');
    logger.error('Test error message', error);

    expect(consoleErrorSpy).toHaveBeenCalled();
    const logOutput = consoleErrorSpy.mock.calls[0][0];
    expect(logOutput).toContain('Test error message');
    expect(logOutput).toContain('Test error');
  });

  it('includes context in log messages', () => {
    logger.info('Test message', { component: 'TestComponent', action: 'test' });

    expect(consoleInfoSpy).toHaveBeenCalled();
    const logOutput = consoleInfoSpy.mock.calls[0][0];
    expect(logOutput).toContain('component');
    expect(logOutput).toContain('TestComponent');
  });

  it('respects log level settings', () => {
    logger.setLevel(LogLevel.WARN);

    logger.debug('This should not log');
    logger.info('This should not log');
    logger.warn('This should log');

    expect(consoleDebugSpy).not.toHaveBeenCalled();
    expect(consoleInfoSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalled();
  });
});
