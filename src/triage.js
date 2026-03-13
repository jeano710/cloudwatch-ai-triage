const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function triageAlert(alarm, recentLogs) {
  const prompt = `
You are an on-call SRE triaging a CloudWatch alarm. Analyze the alert and recent logs.

## Alarm Details
- Name: ${alarm.AlarmName}
- State: ${alarm.NewStateValue} (was: ${alarm.OldStateValue})
- Reason: ${alarm.NewStateReason}
- Time: ${alarm.StateChangeTime}

## Recent Log Excerpt (last 50 lines)
\`\`\`
${recentLogs}
\`\`\`

Respond in JSON only:
{
  "severity": "critical" | "warning" | "noise",
  "summary": "one sentence plain-English description",
  "likely_cause": "your best guess at root cause",
  "recommended_action": "what the on-call engineer should do",
  "confidence": 0.0–1.0
}
`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text;
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

module.exports = { triageAlert };
