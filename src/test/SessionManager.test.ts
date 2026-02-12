import * as assert from 'assert';
import { SessionManager } from '../SessionManager';
import { UserInputData, ChatMessage } from '../types';

suite('SessionManager Test Suite', () => {
  let sessionManager: SessionManager;

  setup(() => {
    sessionManager = new SessionManager();
  });

  test('initializeSession stores user input data', () => {
    const userInput: UserInputData = {
      appType: 'SaaS',
      expectedUsers: '1000-10000',
      trafficPattern: 'steady',
      processingType: 'real-time',
      dataSensitivity: 'confidential',
      regions: ['us-east-1', 'eu-west-1'],
      availabilityRequirement: '99.9%',
      detailedDescription: 'A test application'
    };

    sessionManager.initializeSession(userInput);
    const retrieved = sessionManager.getUserInput();

    assert.strictEqual(retrieved, userInput);
  });

  test('getUserInput returns null before initialization', () => {
    const result = sessionManager.getUserInput();
    assert.strictEqual(result, null);
  });

  test('addMessage appends messages to history', () => {
    const message1: ChatMessage = {
      role: 'user',
      content: 'Hello',
      timestamp: Date.now()
    };

    const message2: ChatMessage = {
      role: 'assistant',
      content: 'Hi there!',
      timestamp: Date.now()
    };

    sessionManager.addMessage(message1);
    sessionManager.addMessage(message2);

    const history = sessionManager.getHistory();
    assert.strictEqual(history.length, 2);
    assert.strictEqual(history[0].content, 'Hello');
    assert.strictEqual(history[1].content, 'Hi there!');
  });

  test('getHistory returns a copy of the history', () => {
    const message: ChatMessage = {
      role: 'user',
      content: 'Test',
      timestamp: Date.now()
    };

    sessionManager.addMessage(message);
    const history1 = sessionManager.getHistory();
    const history2 = sessionManager.getHistory();

    // Modifying the returned array should not affect the internal state
    history1.push({
      role: 'assistant',
      content: 'Modified',
      timestamp: Date.now()
    });

    assert.strictEqual(history2.length, 1);
    assert.strictEqual(sessionManager.getHistory().length, 1);
  });

  test('clearSession resets all session data', () => {
    const userInput: UserInputData = {
      appType: 'SaaS',
      expectedUsers: '1000-10000',
      trafficPattern: 'steady',
      processingType: 'real-time',
      dataSensitivity: 'confidential',
      regions: ['us-east-1'],
      availabilityRequirement: '99.9%',
      detailedDescription: 'Test'
    };

    const message: ChatMessage = {
      role: 'user',
      content: 'Test message',
      timestamp: Date.now()
    };

    sessionManager.initializeSession(userInput);
    sessionManager.addMessage(message);

    sessionManager.clearSession();

    assert.strictEqual(sessionManager.getUserInput(), null);
    assert.strictEqual(sessionManager.getHistory().length, 0);
  });

  test('initializeSession clears previous history', () => {
    const userInput1: UserInputData = {
      appType: 'SaaS',
      expectedUsers: '1000-10000',
      trafficPattern: 'steady',
      processingType: 'real-time',
      dataSensitivity: 'confidential',
      regions: ['us-east-1'],
      availabilityRequirement: '99.9%',
      detailedDescription: 'First session'
    };

    const userInput2: UserInputData = {
      appType: 'AI app',
      expectedUsers: '10000+',
      trafficPattern: 'spiky',
      processingType: 'batch',
      dataSensitivity: 'public',
      regions: ['eu-west-1'],
      availabilityRequirement: '99.99%',
      detailedDescription: 'Second session'
    };

    sessionManager.initializeSession(userInput1);
    sessionManager.addMessage({
      role: 'user',
      content: 'First message',
      timestamp: Date.now()
    });

    sessionManager.initializeSession(userInput2);

    assert.strictEqual(sessionManager.getHistory().length, 0);
    assert.strictEqual(sessionManager.getUserInput()?.detailedDescription, 'Second session');
  });
});
