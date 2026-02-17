import { DealAlert, formatAlert } from './check';

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';

export async function sendDiscordAlert(alerts: DealAlert[]): Promise<void> {
  if (!DISCORD_WEBHOOK_URL) {
    console.log('⚠️  No DISCORD_WEBHOOK_URL set - skipping Discord alert');
    return;
  }
  
  for (const alert of alerts) {
    const message = formatAlert(alert);
    
    try {
      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });
      
      if (response.ok) {
        console.log(`✅ Sent Discord alert for ${alert.card}`);
      } else {
        console.log(`❌ Failed to send Discord alert: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error sending Discord alert:`, error);
    }
  }
}

export async function testDiscordConnection(): Promise<boolean> {
  if (!DISCORD_WEBHOOK_URL) {
    console.log('⚠️  DISCORD_WEBHOOK_URL not configured');
    return false;
  }
  
  try {
    const testMessage = { content: '🧪 YGO Price Tracker test message!' };
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testMessage),
    });
    
    if (response.ok) {
      console.log('✅ Discord connection successful!');
      return true;
    } else {
      console.log(`❌ Discord connection failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Discord connection error:`, error);
    return false;
  }
}
