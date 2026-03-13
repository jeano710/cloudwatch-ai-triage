const { CloudWatchLogsClient, FilterLogEventsCommand } = require('@aws-sdk/client-cloudwatch-logs');

const client = new CloudWatchLogsClient({ region: process.env.AWS_REGION || 'us-east-1' });

async function fetchRecentLogs(logGroupName, alarmTime, limit = 50) {
  const endTime = new Date(alarmTime).getTime();
  const startTime = endTime - 5 * 60 * 1000; // 5 minutes before alarm

  const command = new FilterLogEventsCommand({
    logGroupName,
    startTime,
    endTime,
    limit,
    filterPattern: '?ERROR ?WARN ?Exception ?5xx',
  });

  try {
    const response = await client.send(command);
    return response.events
      .map(e => `[${new Date(e.timestamp).toISOString()}] ${e.message}`)
      .join('\n');
  } catch (err) {
    console.error('Failed to fetch logs:', err.message);
    return '(log fetch failed)';
  }
}

module.exports = { fetchRecentLogs };