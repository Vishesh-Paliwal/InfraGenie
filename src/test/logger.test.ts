import * as assert from 'assert';
import * as vscode from 'vscode';
import { Logger, LogLevel } from '../logger';

suite('Logger Test Suite', () => {
  let outputChannel: vscode.OutputChannel;
  let logger: Logger;

  setup(() => {
    // Create a mock output channel for testing
    outputChannel = vscode.window.createOutputChannel('Test Logger');
    Logger.initialize(outputChannel);
    logger = Logger.getInstance();
  });

  teardown(() => {
    outputChannel.dispose();
  });

  test('Logger should be initialized', () => {
    assert.ok(logger, 'Logger should be initialized');
  });

  test('Logger should throw error if not initialized', () => {
    // Create a new instance without initialization
    const Logger2 = require('../logger').Logger;
    // Reset the singleton
    (Logger2 as any).instance = undefined;
    
    assert.throws(
      () => Logger2.getInstance(),
      /Logger not initialized/,
      'Should throw error when not initialized'
    );
    
    // Re-initialize for other tests
    Logger2.initialize(outputChannel);
  });

  test('Logger should log info messages', () => {
    // This test verifies the method exists and doesn't throw
    assert.doesNotThrow(() => {
      logger.info('Test info message');
    });
  });

  test('Logger should log info messages with context', () => {
    assert.doesNotThrow(() => {
      logger.info('Test info message', 'testContext');
    });
  });

  test('Logger should log warning messages', () => {
    assert.doesNotThrow(() => {
      logger.warning('Test warning message');
    });
  });

  test('Logger should log warning messages with context', () => {
    assert.doesNotThrow(() => {
      logger.warning('Test warning message', 'testContext');
    });
  });

  test('Logger should log error messages', () => {
    assert.doesNotThrow(() => {
      logger.error('Test error message');
    });
  });

  test('Logger should log error messages with error object', () => {
    const error = new Error('Test error');
    assert.doesNotThrow(() => {
      logger.error('Test error message', error);
    });
  });

  test('Logger should log error messages with error object and context', () => {
    const error = new Error('Test error');
    error.stack = 'Error: Test error\n    at test (file.ts:10:5)';
    assert.doesNotThrow(() => {
      logger.error('Test error message', error, 'testContext');
    });
  });

  test('Logger should log error with custom properties', () => {
    const error: any = new Error('Test error');
    error.code = 'TEST_CODE';
    error.statusCode = 500;
    assert.doesNotThrow(() => {
      logger.error('Test error message', error, 'testContext');
    });
  });

  test('Logger should log debug messages', () => {
    assert.doesNotThrow(() => {
      logger.debug('Test debug message');
    });
  });

  test('Logger should log debug messages with context', () => {
    assert.doesNotThrow(() => {
      logger.debug('Test debug message', 'testContext');
    });
  });

  test('Logger show method should not throw', () => {
    assert.doesNotThrow(() => {
      logger.show();
    });
  });
});
