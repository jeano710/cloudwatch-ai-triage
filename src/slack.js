const https = require('https');

async function sendSlackAlert(alarm, triage) {
  const emoji = triage.severity === 'critical' ? '🚨' : '⚠️';
  const color = triage.severity === 'critical' ? '#FF0000' : '#FFA500';

  const payload = {
    attachments: [{
      color,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${emoji} *${alarm.AlarmName}*\n${triage.summary}`
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Likely Cause*\n${triage.likely_cause}` },
            { type: 'mrkdwn', text: `*Action*\n${triage.recommended_action}` },
            { type: 'mrkdwn', text: `*Severity*\n${triage.severity.toUpperCase()}` },
            { type: 'mrkdwn', text: `*AI Confidence*\n${Math.round(triage.confidence * 100)}%` },
          ]
        }
      ]
    }]
  };

  // POST to Slack webhook
  return new Promise((resolve, reject) => {
    const url = new URL(process.env.SLACK_WEBHOOK_URL);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, resolve);
    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

module.exports = { sendSlackAlert };