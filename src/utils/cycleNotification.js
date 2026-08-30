/**
 * src/utils/cycleNotification.js
 * Automatic 1-Day Before Period Prediction Notification Service
 * Sends notifications to Female users and their linked Male partners (if cycle sharing is enabled).
 * Ponytail style: zero dependencies, idempotent local storage tracking, clean math.
 */

import { loadMarkedDates, loadAllUserSymptoms, loadAllDayIcons, predictAdvancedCycle, toDateStr } from './cycle'
import { displayOsNotification, sendPushNotification } from '../lib/push'

/**
 * Check if tomorrow is predicted period start and trigger notifications
 * @param {Object} params
 * @param {Object} params.user - Logged in user object
 * @param {Object} [params.partnerUser] - Partner user object if available
 * @param {boolean} [params.hasSharedCycleAccess] - Whether cycle sharing is active
 * @param {Object} [params.partnerCycleData] - Partner's cycle data from Firestore if available
 */
export async function checkAndNotifyPeriodPrediction({
  user,
  partnerUser = null,
  hasSharedCycleAccess = false,
  partnerCycleData = null,
}) {
  if (!user?.id) return

  const isFemale = user.gender === 'female' || !user.gender
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = toDateStr(today)

  // ── 1. For Female User: Check own cycle prediction ───────────────────────────
  if (isFemale) {
    try {
      const markedDates = loadMarkedDates(user.id)
      if (markedDates && markedDates.length > 0) {
        const symptoms = loadAllUserSymptoms(user.id)
        const dayIconMap = loadAllDayIcons(user.id)
        const prediction = predictAdvancedCycle(markedDates, symptoms, user.id, dayIconMap)

        if (prediction?.predictedStart) {
          const predDate = new Date(prediction.predictedStart)
          predDate.setHours(0, 0, 0, 0)
          const diffDays = Math.round((predDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

          // If tomorrow is the predicted start of the period (diffDays === 1)
          if (diffDays === 1) {
            const predDateStr = toDateStr(predDate)
            const notifKey = `minediary:period_notif:${user.id}:${predDateStr}`

            // Deduplicate: send only once per predicted period date
            if (!localStorage.getItem(notifKey)) {
              localStorage.setItem(notifKey, todayStr)

              // Display OS notification for Female user
              await displayOsNotification({
                title: 'Nhắc nhở chu kỳ 🌸',
                body: 'Dự báo ngày mai là ngày bắt đầu kỳ kinh nguyệt (dâu) của bạn. Hãy chuẩn bị sẵn sàng và giữ ấm cơ thể nhé! 💖',
                icon: '/icon-192.png',
                data: {
                  url: '/#health',
                  tag: `period_reminder_${user.id}_${predDateStr}`,
                },
              }).catch(console.warn)

              // If she has an accepted partner with cycle sharing, notify the male partner
              if (hasSharedCycleAccess && partnerUser?.id) {
                const partnerNotifKey = `minediary:partner_period_push:${partnerUser.id}:${predDateStr}`
                if (!localStorage.getItem(partnerNotifKey)) {
                  localStorage.setItem(partnerNotifKey, todayStr)
                  const femaleName = user.displayName || user.name || user.username || 'người ấy'

                  await sendPushNotification({
                    recipientUserId: partnerUser.id,
                    title: 'Nhắc nhở yêu thương 🌸',
                    body: `Dự báo ngày mai là ngày dâu của ${femaleName} 🍓. Hãy chuẩn bị nước ấm, đồ ngọt và quan tâm người ấy nhiều hơn nhé! 💖`,
                    icon: '/icon-192.png',
                    data: {
                      url: '/#partner-cycle',
                      partnerId: user.id,
                      tag: `partner_period_reminder_${partnerUser.id}_${predDateStr}`,
                    },
                  }).catch(console.warn)
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('[cycleNotification] Error checking female period prediction:', err)
    }
  }

  // ── 2. For Male Partner: Check shared female partner's cycle prediction ──────
  if (!isFemale && hasSharedCycleAccess && partnerUser?.id && partnerCycleData) {
    try {
      const markedDates = partnerCycleData.markedDates || []
      if (markedDates.length > 0) {
        const symptoms = partnerCycleData.symptoms || {}
        const dayIconMap = partnerCycleData.dayIconMap || {}
        const prediction = predictAdvancedCycle(markedDates, symptoms, partnerUser.id, dayIconMap)

        if (prediction?.predictedStart) {
          const predDate = new Date(prediction.predictedStart)
          predDate.setHours(0, 0, 0, 0)
          const diffDays = Math.round((predDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

          if (diffDays === 1) {
            const predDateStr = toDateStr(predDate)
            const maleNotifKey = `minediary:partner_period_notif:${user.id}:${partnerUser.id}:${predDateStr}`

            if (!localStorage.getItem(maleNotifKey)) {
              localStorage.setItem(maleNotifKey, todayStr)
              const femaleName = partnerUser.displayName || partnerUser.name || partnerUser.username || 'người ấy'

              await displayOsNotification({
                title: 'Nhắc nhở yêu thương 🌸',
                body: `Dự báo ngày mai là ngày dâu của ${femaleName} 🍓. Hãy chuẩn bị nước ấm, đồ ngọt và quan tâm người ấy nhiều hơn nhé! 💖`,
                icon: '/icon-192.png',
                data: {
                  url: '/#partner-cycle',
                  partnerId: partnerUser.id,
                  tag: `partner_period_reminder_${user.id}_${predDateStr}`,
                },
              }).catch(console.warn)
            }
          }
        }
      }
    } catch (err) {
      console.warn('[cycleNotification] Error checking partner period prediction for male user:', err)
    }
  }
}
