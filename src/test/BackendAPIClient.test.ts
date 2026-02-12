import * as assert from 'assert';
import { BackendAPIClient, NetworkError, TimeoutError, APIError } from '../BackendAPIClient';

suite('BackendAPIClient Test Suite', () => {
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
});
