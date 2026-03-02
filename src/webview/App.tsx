import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { ExtensionMessage, WebviewMessage, ChatMessage, UserInputData } from '../types';
import { vscode } from './index';
import MainMenu from './MainMenu';
import UserInputForm from './UserInputForm';
import ChatInterface from './ChatInterface';
import ErrorNotification from './ErrorNotification';
import './styles.css';

// Context for managing application state
interface AppState {
  currentView: 'mainMenu' | 'userInputForm' | 'chatInterface';
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  canRetry: boolean;
  setCurrentView: (view: 'mainMenu' | 'userInputForm' | 'chatInterface') => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null, canRetry?: boolean) => void;
  sendMessage: (message: WebviewMessage) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

function App() {
  const [currentView, setCurrentView] = useState<'mainMenu' | 'userInputForm' | 'chatInterface'>('mainMenu');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const demoTimeoutsRef = useRef<number[]>([]);

  const demoPRD = `# Product Requirements Document (PRD): CloudSpend Copilot

## 1. Summary
CloudSpend Copilot is an AI-driven FinOps assistant that helps mid-market SaaS teams reduce cloud costs. It ingests billing and usage data, detects waste, surfaces anomalies, and recommends optimizations with estimated savings. The MVP focuses on AWS first, with a clear path to multi-cloud.

## 2. Problem Statement
Cloud spend is rising faster than revenue for many mid-market SaaS businesses. Teams lack visibility into real-time usage anomalies, and optimization work is manual, inconsistent, and delayed. The goal is to provide a guided, explainable system that surfaces waste quickly and quantifies ROI.

## 3. Goals
- Reduce monthly cloud spend by 10-20% within 60 days of onboarding.
- Provide near-real-time anomaly alerts within 15 minutes of detection.
- Deliver weekly savings reports with prioritized actions and ROI estimates.

## 4. Non-Goals
- Full infrastructure provisioning or auto-remediation in MVP.
- On-prem cost optimization.
- Support for every cloud provider (start with AWS only).

## 5. Target Users and Personas
- **FinOps Lead (Primary):** owns cloud cost optimization, wants quick wins and reporting.
- **Engineering Manager (Secondary):** needs safe recommendations, minimal risk to performance.
- **Finance Partner (Secondary):** needs clear ROI and predictable monthly savings.
- **SRE (Secondary):** wants alerts to be actionable and low-noise.

## 6. User Stories
- As a FinOps lead, I want a weekly summary of top savings opportunities so I can prioritize actions.
- As an engineering manager, I want impact analysis so I can approve changes safely.
- As a finance partner, I want a monthly savings forecast for budgeting.
- As an SRE, I want alerts grouped by root cause so I can triage quickly.

## 7. Functional Requirements
1. **Data Ingestion**
   - Connect to AWS Cost Explorer and CUR (Cost and Usage Report).
   - Pull usage data on an hourly cadence; billing data daily.
   - Support multi-account ingestion for AWS Organizations.
2. **Cost Anomaly Detection**
   - Detect spend spikes by service, region, and account.
   - Alert within 15 minutes via email and Slack.
   - Provide anomaly explanations (top drivers).
3. **Optimization Recommendations**
   - Identify idle resources (EC2, EBS, RDS).
   - Recommend right-sizing and reserved instances with savings estimate.
   - Provide confidence score and blast radius estimate.
4. **Savings Reporting**
   - Weekly report with top 10 opportunities and estimated impact.
   - Historical trend charts and cumulative savings.
   - Exportable CSV for finance reconciliation.
5. **PRD Export**
   - Generate a markdown PRD for stakeholder review (copy/save).

## 8. Non-Functional Requirements
- **Availability:** 99.9% uptime.
- **Latency:** API responses < 2 seconds for common queries.
- **Security:** Read-only access to billing and usage APIs, SOC2-ready logging.
- **Compliance:** Support for GDPR-ready data handling.

## 9. Data and Integrations
- **Sources:** AWS Cost Explorer, CUR in S3, CloudWatch usage metrics.
- **Storage:** Postgres for metadata, S3 for raw reports.
- **Processing:** Batch ETL daily, near-real-time anomaly detection hourly.
- **Integrations:** Slack, email, Jira (roadmap).

## 10. UX and Flow
1. User connects AWS account (read-only).
2. System runs baseline analysis (24 hours).
3. User sees dashboard with savings opportunities and alerts.
4. User exports PRD for internal review.

## 11. Success Metrics
- 60-day savings rate >= 10%.
- Weekly active users >= 40% of onboarded accounts.
- Alert precision >= 80% (reduce false positives).
- Time to first value <= 24 hours.

## 12. Risks and Mitigations
- **Risk:** Recommendation impacts performance.  
  **Mitigation:** Add confidence score and require human approval.
- **Risk:** Incomplete data from billing APIs.  
  **Mitigation:** Fallback to CUR and prompt for missing permissions.
- **Risk:** Alert fatigue.  
  **Mitigation:** Rate limit alerts and group by root cause.

## 13. Analytics and Telemetry
- Track savings accepted vs rejected by users.
- Monitor alert response time and resolution status.
- Measure feature adoption by role and account size.

## 14. Milestones
- **MVP (4 weeks):** AWS ingestion, anomaly alerts, weekly report.
- **M1 (8 weeks):** Recommendations with confidence scoring, Slack integration.
- **M2 (12 weeks):** Multi-account org support, exportable reports.

## 15. Open Questions
- Do we support multi-account organizations in MVP?
- What is the acceptable alert noise threshold for early users?
- When do we introduce auto-remediation?`;

  const clearDemoTimeouts = () => {
    demoTimeoutsRef.current.forEach(timeoutId => window.clearTimeout(timeoutId));
    demoTimeoutsRef.current = [];
  };

  const scheduleDemoPRD = (data: UserInputData) => {
    clearDemoTimeouts();
    setIsLoading(true);
    setMessages([]);

    const steps = [
      `Thinking: parsing your requirements and constraints...`,
      `Thinking: mapping traffic patterns to scaling and storage needs...`,
      `Thinking: selecting baseline architecture and availability targets...`,
      `Thinking: estimating cost drivers and optimization levers...`,
      `Thinking: drafting PRD sections and success metrics...`
    ];

    const stepDelayMs = 1400;
    const initialDelayMs = 1200;

    steps.forEach((step, index) => {
      const timeoutId = window.setTimeout(() => {
        addMessage({
          role: 'assistant',
          content: step,
          timestamp: Date.now()
        });
      }, initialDelayMs + index * stepDelayMs);
      demoTimeoutsRef.current.push(timeoutId);
    });

    const finalTimeoutId = window.setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: demoPRD,
        timestamp: Date.now(),
        isPRD: true
      });
      setIsLoading(false);
      handleSetError(null);
    }, initialDelayMs + steps.length * stepDelayMs + 1600);
    demoTimeoutsRef.current.push(finalTimeoutId);
  };

  // Function to send messages to extension host
  const sendMessage = (message: WebviewMessage) => {
    vscode.postMessage(message);
  };

  // Function to add a message to the chat
  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  // Function to set error with optional retry flag
  const handleSetError = (errorMessage: string | null, retry: boolean = false) => {
    setError(errorMessage);
    setCanRetry(retry);
  };

  // Set up message listener for extension messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent<ExtensionMessage>) => {
      const message = event.data;

      switch (message.type) {
        case 'chatResponse':
          // Add assistant message to chat
          addMessage({
            role: 'assistant',
            content: message.data.message,
            timestamp: Date.now(),
            isPRD: message.data.isPRD
          });
          setIsLoading(false);
          handleSetError(null); // Clear errors on successful operation
          break;

        case 'error':
          // Display error message with retry option if available
          handleSetError(message.data.message, message.data.canRetry || false);
          setIsLoading(false);
          break;

        case 'loading':
          // Update loading state
          setIsLoading(message.data.isLoading);
          break;

        case 'sessionCleared':
          // Clear session and return to main menu
          clearDemoTimeouts();
          setMessages([]);
          setCurrentView('mainMenu');
          handleSetError(null); // Clear errors
          setIsLoading(false);
          setLastMessage(null);
          break;
      }
    };

    // Add event listener for messages from extension
    window.addEventListener('message', handleMessage);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Context value
  const contextValue: AppState = {
    currentView,
    messages,
    isLoading,
    error,
    canRetry,
    setCurrentView,
    setMessages,
    addMessage,
    setIsLoading,
    setError: handleSetError,
    sendMessage
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="app">
        {/* Error notification displayed across all views */}
        {error && (
          <ErrorNotification
            message={error}
            canRetry={canRetry}
            onRetry={() => {
              // Clear error and retry last message
              handleSetError(null);
              if (lastMessage && currentView === 'chatInterface') {
                setIsLoading(true);
                sendMessage({ type: 'sendChatMessage', data: { message: lastMessage } });
              }
            }}
            onDismiss={() => handleSetError(null)}
          />
        )}

        {currentView === 'mainMenu' && (
          <MainMenu onSelectFeature={(feature) => {
            if (feature === 'spec') {
              setCurrentView('userInputForm');
            }
          }} />
        )}

        {currentView === 'userInputForm' && (
          <UserInputForm onSubmit={(data: UserInputData) => {
            // Send user input to extension
            sendMessage({ type: 'submitUserInput', data });
            // Transition to chat interface
            setCurrentView('chatInterface');
            // Demo mode: simulate thinking steps then deliver PRD
            scheduleDemoPRD(data);
          }} />
        )}

        {currentView === 'chatInterface' && (
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={(message) => {
              // Store last message for retry
              setLastMessage(message);
              // Add user message to local state
              addMessage({
                role: 'user',
                content: message,
                timestamp: Date.now()
              });
              // Send message to extension
              sendMessage({ type: 'sendChatMessage', data: { message } });
              // Set loading state
              setIsLoading(true);
            }}
            onNewSession={() => {
              // Send new session message to extension
              sendMessage({ type: 'newSession' });
            }}
            onSavePRD={(content, filename) => {
              // Send save PRD message to extension
              sendMessage({ type: 'savePRD', data: { content, filename } });
            }}
          />
        )}
      </div>
    </AppContext.Provider>
  );
}

export default App;
