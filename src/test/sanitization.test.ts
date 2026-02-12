import * as assert from 'assert';
import {
  sanitizeUserInput,
  sanitizeChatMessage,
  sanitizeAPIResponse,
  sanitizeFilename,
} from '../sanitization';
import { UserInputData } from '../types';
import { APIResponse } from '../BackendAPIClient';

suite('Sanitization Test Suite', () => {
  suite('sanitizeUserInput', () => {
    test('should sanitize basic user input', () => {
      const input: UserInputData = {
        appType: 'SaaS',
        expectedUsers: '1000-10000',
        trafficPattern: 'steady',
        processingType: 'real-time',
        dataSensitivity: 'internal',
        regions: ['us-east-1', 'eu-west-1'],
        availabilityRequirement: '99.9%',
        detailedDescription: 'A simple web application',
      };

      const sanitized = sanitizeUserInput(input);
      assert.strictEqual(sanitized.appType, 'SaaS');
      assert.strictEqual(sanitized.expectedUsers, '1000-10000');
      assert.strictEqual(sanitized.processingType, 'real-time');
    });

    test('should remove HTML tags from user input', () => {
      const input: UserInputData = {
        appType: '<script>alert("xss")</script>SaaS',
        expectedUsers: '<b>1000</b>',
        trafficPattern: 'steady<img src=x onerror=alert(1)>',
        processingType: 'real-time',
        dataSensitivity: 'internal',
        regions: ['<script>bad</script>us-east-1'],
        availabilityRequirement: '99.9%',
        detailedDescription: '<iframe>bad</iframe>Description',
      };

      const sanitized = sanitizeUserInput(input);
      assert.strictEqual(sanitized.appType, 'SaaS');
      assert.strictEqual(sanitized.expectedUsers, '1000');
      assert.strictEqual(sanitized.trafficPattern, 'steady');
      assert.strictEqual(sanitized.regions[0], 'us-east-1');
      assert.strictEqual(sanitized.detailedDescription, 'Description');
    });

    test('should handle invalid processingType', () => {
      const input: UserInputData = {
        appType: 'SaaS',
        expectedUsers: '1000',
        trafficPattern: 'steady',
        processingType: 'invalid' as any,
        dataSensitivity: 'internal',
        regions: ['us-east-1'],
        availabilityRequirement: '99.9%',
        detailedDescription: 'Description',
      };

      const sanitized = sanitizeUserInput(input);
      assert.strictEqual(sanitized.processingType, 'real-time');
    });

    test('should filter out empty strings from regions array', () => {
      const input: UserInputData = {
        appType: 'SaaS',
        expectedUsers: '1000',
        trafficPattern: 'steady',
        processingType: 'real-time',
        dataSensitivity: 'internal',
        regions: ['us-east-1', '<script></script>', 'eu-west-1'],
        availabilityRequirement: '99.9%',
        detailedDescription: 'Description',
      };

      const sanitized = sanitizeUserInput(input);
      assert.strictEqual(sanitized.regions.length, 2);
      assert.strictEqual(sanitized.regions[0], 'us-east-1');
      assert.strictEqual(sanitized.regions[1], 'eu-west-1');
    });
  });

  suite('sanitizeChatMessage', () => {
    test('should sanitize basic message', () => {
      const message = 'Hello, how are you?';
      const sanitized = sanitizeChatMessage(message);
      assert.strictEqual(sanitized, 'Hello, how are you?');
    });

    test('should remove HTML tags from message', () => {
      const message = '<script>alert("xss")</script>Hello';
      const sanitized = sanitizeChatMessage(message);
      assert.strictEqual(sanitized, 'Hello');
    });

    test('should remove dangerous attributes', () => {
      const message = '<a href="javascript:alert(1)">Click</a>';
      const sanitized = sanitizeChatMessage(message);
      assert.strictEqual(sanitized, 'Click');
    });
  });

  suite('sanitizeAPIResponse', () => {
    test('should sanitize basic API response', () => {
      const response: APIResponse = {
        message: 'This is a response',
        isPRD: false,
      };

      const sanitized = sanitizeAPIResponse(response);
      assert.strictEqual(sanitized.message, 'This is a response');
      assert.strictEqual(sanitized.isPRD, false);
    });

    test('should allow safe HTML tags in API response', () => {
      const response: APIResponse = {
        message: '<p>This is a <strong>formatted</strong> response</p>',
        isPRD: false,
      };

      const sanitized = sanitizeAPIResponse(response);
      assert.ok(sanitized.message.includes('<p>'));
      assert.ok(sanitized.message.includes('<strong>'));
    });

    test('should remove dangerous tags from API response', () => {
      const response: APIResponse = {
        message: '<script>alert("xss")</script><p>Safe content</p>',
        isPRD: false,
      };

      const sanitized = sanitizeAPIResponse(response);
      assert.ok(!sanitized.message.includes('<script>'));
      assert.ok(sanitized.message.includes('<p>'));
    });

    test('should sanitize error field', () => {
      const response: APIResponse = {
        message: 'Response',
        isPRD: false,
        error: '<script>bad</script>Error message',
      };

      const sanitized = sanitizeAPIResponse(response);
      assert.strictEqual(sanitized.error, 'Error message');
    });
  });

  suite('sanitizeFilename', () => {
    test('should sanitize basic filename', () => {
      const filename = 'my-prd.md';
      const sanitized = sanitizeFilename(filename);
      assert.strictEqual(sanitized, 'my-prd.md');
    });

    test('should remove path separators', () => {
      const filename = '../../../etc/passwd';
      const sanitized = sanitizeFilename(filename);
      assert.strictEqual(sanitized, 'etcpasswd.md');
    });

    test('should remove dangerous characters', () => {
      const filename = 'file<>:"|?*.md';
      const sanitized = sanitizeFilename(filename);
      assert.strictEqual(sanitized, 'file.md');
    });

    test('should add .md extension if missing', () => {
      const filename = 'myfile';
      const sanitized = sanitizeFilename(filename);
      assert.strictEqual(sanitized, 'myfile.md');
    });

    test('should return default filename for empty input', () => {
      const filename = '';
      const sanitized = sanitizeFilename(filename);
      assert.strictEqual(sanitized, 'untitled.md');
    });

    test('should return default filename for only dangerous characters', () => {
      const filename = '///:::';
      const sanitized = sanitizeFilename(filename);
      assert.strictEqual(sanitized, 'untitled.md');
    });
  });
});
