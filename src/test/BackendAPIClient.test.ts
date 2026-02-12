import * as assert from 'assert';
import * as vscode from 'vscode';
import { BackendAPIClient, NetworkError, TimeoutError, APIError } from '../BackendAPIClient';
import { Logger } from '../logger';

suite('BackendAPIClient Test Suite', () => {
  let outputChannel: vscode.OutputChannel;

  setup(() => {
    // Create output channel and initialize logger for tests
    outputChannel = vscode.window.createOutputChannel('Test Backend API Client');
    Logger.initialize(outputChannel);
  });

  teardown(() => {
    outputChannel.dispose();
  });

  test('BackendAPIClient should instantiate with default configuration', () => {
    const client = new BackendAPIClient();
    assert.ok(client, 'Client should be instantiated');
  });

  test('Custom error classes should have correct names', () => {
    const networkError = new NetworkError('Network error');
    assert.strictEqual(networkError.name, 'NetworkError');
    assert.strictEqual(networkError.message, 'Network error');

    const timeoutError = new TimeoutError('Timeout error');
    assert.strictEqual(timeoutError.name, 'TimeoutError');
    assert.strictEqual(timeoutError.message, 'Timeout error');

    const apiError = new APIError('API error', 500);
    assert.strictEqual(apiError.name, 'APIError');
    assert.strictEqual(apiError.message, 'API error');
    assert.strictEqual(apiError.statusCode, 500);
  });

  test('reloadConfiguration should not throw errors', () => {
    const client = new BackendAPIClient();
    assert.doesNotThrow(() => {
      client.reloadConfiguration();
    }, 'reloadConfiguration should execute without errors');
  });
});
