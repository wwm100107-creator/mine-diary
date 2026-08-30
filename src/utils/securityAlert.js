/**
 * src/utils/securityAlert.js
 * Telegram Bot Emergency Security Dispatcher ($0 Cost)
 * Ponytail style: zero dependencies, fast fetch API, non-blocking notification delivery.
 */

// 💡 Bạn có thể điền Token bot và Chat ID của bạn vào đây (hoặc để trống nếu chưa dùng)
const TELEGRAM_BOT_TOKEN = '' // e.g. '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ'
const TELEGRAM_CHAT_ID = ''   // e.g. '987654321'

/**
 * Send emergency alert message to Admin's personal Telegram
 * @param {string} text - Alert message text
 */
export async function sendTelegramSecurityAlert(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    // Not configured yet
    return false
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `🚨 [MINE DIARY SECURITY ALERT] 🚨\n\n${text}\n\n⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`,
        parse_mode: 'HTML',
      }),
    })
    return true
  } catch (err) {
    console.warn('[Security Alert] Telegram dispatch failed:', err)
    return false
  }
}
