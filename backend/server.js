const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const demoUserInput = {
  appType: 'AI app',
  expectedUsers: '10,000-100,000',
  trafficPattern: 'spiky',
  processingType: 'real-time',
  dataSensitivity: 'confidential',
  regions: ['us-east-1', 'eu-west-1'],
  availabilityRequirement: '99.9%',
  detailedDescription:
    'We are building an AI FinOps copilot for mid-market SaaS companies. It analyzes cloud bills, ' +
    'identifies waste (idle resources, oversized instances), and recommends right-sizing and ' +
    'commitments. Users want near-real-time anomaly alerts and weekly savings reports.'
};

const demoPRD = `# Product Requirements Document (PRD): CloudSpend Copilot

## 1. Summary
CloudSpend Copilot is an AI-driven FinOps assistant that helps mid-market SaaS teams reduce cloud costs. It ingests billing and usage data, detects waste, surfaces anomalies, and recommends optimizations with estimated savings. The MVP focuses on AWS first, with a clear path to multi-cloud.

## 2. Goals
- Reduce monthly cloud spend by 10-20% within 60 days of onboarding.
- Provide near-real-time anomaly alerts within 15 minutes of detection.
- Deliver weekly savings reports with prioritized actions and ROI estimates.

## 3. Non-Goals
- Full infrastructure provisioning or auto-remediation in MVP.
- On-prem cost optimization.
- Support for every cloud provider (start with AWS only).

## 4. Target Users and Personas
- **FinOps Lead (Primary):** owns cloud cost optimization, wants quick wins and reporting.
- **Engineering Manager (Secondary):** needs safe recommendations, minimal risk to performance.
- **Finance Partner (Secondary):** needs clear ROI and predictable monthly savings.

## 5. User Stories
- As a FinOps lead, I want a weekly summary of top savings opportunities so I can prioritize actions.
- As an engineering manager, I want impact analysis so I can approve changes safely.
- As a finance partner, I want a monthly savings forecast for budgeting.

## 6. Functional Requirements
1. **Data Ingestion**
   - Connect to AWS Cost Explorer and CUR (Cost and Usage Report).
   - Pull usage data on an hourly cadence; billing data daily.
2. **Cost Anomaly Detection**
   - Detect spend spikes by service, region, and account.
   - Alert within 15 minutes via email and Slack.
3. **Optimization Recommendations**
   - Identify idle resources (EC2, EBS, RDS).
   - Recommend right-sizing and reserved instances with savings estimate.
4. **Savings Reporting**
   - Weekly report with top 10 opportunities and estimated impact.
   - Historical trend charts and cumulative savings.
5. **PRD Export**
   - Generate a markdown PRD for stakeholder review (copy/save).

## 7. Non-Functional Requirements
- **Availability:** 99.9% uptime.
- **Latency:** API responses < 2 seconds for common queries.
- **Security:** Read-only access to billing and usage APIs, SOC2-ready logging.
- **Compliance:** Support for GDPR-ready data handling.

## 8. Data and Integrations
- **Sources:** AWS Cost Explorer, CUR in S3, CloudWatch usage metrics.
- **Storage:** Postgres for metadata, S3 for raw reports.
- **Processing:** Batch ETL daily, near-real-time anomaly detection hourly.

## 9. UX and Flow
1. User connects AWS account (read-only).
2. System runs baseline analysis (24 hours).
3. User sees dashboard with savings opportunities and alerts.
4. User exports PRD for internal review.

## 10. Success Metrics
- 60-day savings rate >= 10%.
- Weekly active users >= 40% of onboarded accounts.
- Alert precision >= 80% (reduce false positives).

## 11. Risks and Mitigations
- **Risk:** Recommendation impacts performance.  
  **Mitigation:** Add confidence score and require human approval.
- **Risk:** Incomplete data from billing APIs.  
  **Mitigation:** Fallback to CUR and prompt for missing permissions.

## 12. Open Questions
- Do we support multi-account organizations in MVP?
- What is the acceptable alert noise threshold for early users?
- When do we introduce auto-remediation?`;

const buildDemoInitMessage = (message, userInput) => {
  const input = userInput || demoUserInput;
  return [
    `Demo mode: using a realistic example to showcase the Spec flow.`,
    ``,
    `Initial request: "${message}".`,
    ``,
    `Example inputs:`,
    `- App Type: ${input.appType}`,
    `- Expected Users: ${input.expectedUsers}`,
    `- Traffic Pattern: ${input.trafficPattern}`,
    `- Processing Type: ${input.processingType}`,
    `- Data Sensitivity: ${input.dataSensitivity}`,
    `- Regions: ${input.regions.join(', ')}`,
    `- Availability Requirement: ${input.availabilityRequirement}`,
    `- Detailed Description: ${input.detailedDescription}`,
    ``,
    `Send any follow-up message to receive a full PRD.`
  ].join('\n');
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Initial spec request - matches extension's /spec/init endpoint
app.post('/spec/init', (req, res) => {
  const { userInput, message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const response = {
    message: buildDemoInitMessage(message, userInput),
    isPRD: false
  };

  res.json(response);
});

// Chat message endpoint - matches extension's /spec/chat endpoint
app.post('/spec/chat', (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const response = {
    message: demoPRD,
    isPRD: true
  };

  res.json(response);
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Test it: curl -X POST http://localhost:${PORT}/api/chat -H "Content-Type: application/json" -d '{"message":"hello"}'`);
});
