const { fetchRecentLogs } = require('./cloudwatch');
const { triageAlert } = require('./triage');
const { sendSlackAlert } = require('./slack');

exports.handler = async (event) => {
  // SNS delivers CloudWatch alarm as JSON string
  const alarm = JSON.parse(event.Records[0].Sns.Message);

  console.log('Received alarm:', alarm.AlarmName);

  // Pull last 50 log lines for context
  const recentLogs = await fetchRecentLogs(
    process.env.LOG_GROUP_NAME,
    alarm.StateChangeTime,
    50
  );

  // Ask AI to triage
  const triage = await triageAlert(alarm, recentLogs);

  console.log('Triage result:', triage.severity, '-', triage.summary);

  if (triage.severity === 'critical' || triage.severity === 'warning') {
    await sendSlackAlert(alarm, triage);
  }

  return { statusCode: 200, body: JSON.stringify(triage) };
};