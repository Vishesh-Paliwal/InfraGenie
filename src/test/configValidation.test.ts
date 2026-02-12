import * as assert from 'assert';
import * as vscode from 'vscode';
import { validateConfiguration, getValidatedConfiguration } from '../configValidation';
import { Logger } from '../logger';

suite('Configuration Validation Test Suite', () => {
  let outputChannel: vscode.OutputChannel;

  setup(() => {
    // Create output channel and initialize logger for tests
    outputChannel = vscode.window.createOutputChannel('Test Config Validation');
    Logger.initialize(outputChannel);
  });

  teardown(() => {
    outputChannel.dispose();
  });
  
  test('validateConfiguration should pass with valid default configuration', async () => {
    const result = validateConfiguration();
    
    // Should be valid with defaults
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.errors.length, 0);
  });

  test('validateConfiguration should detect invalid URL', async () => {
    const config = vscode.workspace.getConfiguration('infraGenie');
    const originalEndpoint = config.get('apiEndpoint');
    
    try {
      // Set invalid URL
      await config.update('apiEndpoint', 'not-a-valid-url', vscode.ConfigurationTarget.Global);
      
      const result = validateConfiguration();
      
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some(e => e.includes('valid URL')));
    } finally {
      // Restore original value
      await config.update('apiEndpoint', originalEndpoint, vscode.ConfigurationTarget.Global);
    }
  });

  test('validateConfiguration should warn about HTTP endpoint', async () => {
    const config = vscode.workspace.getConfiguration('infraGenie');
    const originalEndpoint = config.get('apiEndpoint');
    
    try {
      // Set HTTP URL (not HTTPS)
      await config.update('apiEndpoint', 'http://api.example.com', vscode.ConfigurationTarget.Global);
      
      const result = validateConfiguration();
      
      // Should be valid but have warning
      assert.strictEqual(result.isValid, true);
      assert.ok(result.warnings.some(w => w.includes('HTTPS')));
    } finally {
      // Restore original value
      await config.update('apiEndpoint', originalEndpoint, vscode.ConfigurationTarget.Global);
    }
  });

  test('validateConfiguration should detect timeout too low', async () => {
    const config = vscode.workspace.getConfiguration('infraGenie');
    const originalTimeout = config.get('apiTimeout');
    
    try {
      // Set timeout too low
      await config.update('apiTimeout', 500, vscode.ConfigurationTarget.Global);
      
      const result = validateConfiguration();
      
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some(e => e.includes('at least 1000ms')));
    } finally {
      // Restore original value
      await config.update('apiTimeout', originalTimeout, vscode.ConfigurationTarget.Global);
    }
  });

  test('validateConfiguration should warn about very low timeout', async () => {
    const config = vscode.workspace.getConfiguration('infraGenie');
    const originalTimeout = config.get('apiTimeout');
    
    try {
      // Set timeout low but valid
      await config.update('apiTimeout', 3000, vscode.ConfigurationTarget.Global);
      
      const result = validateConfiguration();
      
      assert.strictEqual(result.isValid, true);
      assert.ok(result.warnings.some(w => w.includes('very low')));
    } finally {
      // Restore original value
      await config.update('apiTimeout', originalTimeout, vscode.ConfigurationTarget.Global);
    }
  });

  test('validateConfiguration should warn about very high timeout', async () => {
    const config = vscode.workspace.getConfiguration('infraGenie');
    const originalTimeout = config.get('apiTimeout');
    
    try {
      // Set timeout very high
      await config.update('apiTimeout', 350000, vscode.ConfigurationTarget.Global);
      
      const result = validateConfiguration();
      
      assert.strictEqual(result.isValid, true);
      assert.ok(result.warnings.some(w => w.includes('very high')));
    } finally {
      // Restore original value
      await config.update('apiTimeout', originalTimeout, vscode.ConfigurationTarget.Global);
    }
  });

  test('getValidatedConfiguration should return defaults on invalid config', async () => {
    const config = vscode.workspace.getConfiguration('infraGenie');
    const originalEndpoint = config.get('apiEndpoint');
    
    try {
      // Set invalid URL
      await config.update('apiEndpoint', 'invalid', vscode.ConfigurationTarget.Global);
      
      const result = getValidatedConfiguration();
      
      // Should return defaults
      assert.strictEqual(result.apiEndpoint, 'https://api.infragenie.com');
      assert.strictEqual(result.apiTimeout, 30000);
    } finally {
      // Restore original value
      await config.update('apiEndpoint', originalEndpoint, vscode.ConfigurationTarget.Global);
    }
  });

  test('getValidatedConfiguration should return valid config values', async () => {
    const config = vscode.workspace.getConfiguration('infraGenie');
    const originalEndpoint = config.get('apiEndpoint');
    const originalTimeout = config.get('apiTimeout');
    
    try {
      // Set valid custom values
      await config.update('apiEndpoint', 'https://custom.api.com', vscode.ConfigurationTarget.Global);
      await config.update('apiTimeout', 45000, vscode.ConfigurationTarget.Global);
      
      const result = getValidatedConfiguration();
      
      assert.strictEqual(result.apiEndpoint, 'https://custom.api.com');
      assert.strictEqual(result.apiTimeout, 45000);
    } finally {
      // Restore original values
      await config.update('apiEndpoint', originalEndpoint, vscode.ConfigurationTarget.Global);
      await config.update('apiTimeout', originalTimeout, vscode.ConfigurationTarget.Global);
    }
  });
});
