/**
 * NotificationService - Handles scheduling and managing push notifications
 * for period reminders and other app notifications.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { DateRangeList } from '@/features/DateRangeList';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Notification identifier for period reminders
const PERIOD_REMINDER_ID_PREFIX = 'period-reminder-';

/**
 * Request notification permissions from the user.
 * @returns {Promise<boolean>} Whether permission was granted.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }

  // Required for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('period-reminders', {
      name: 'Period Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF5C8A',
    });
  }

  return true;
}

/**
 * Check if notification permissions are granted.
 * @returns {Promise<boolean>} Whether notifications are enabled.
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Cancel all scheduled period reminder notifications.
 */
export async function cancelAllPeriodReminders(): Promise<void> {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  
  for (const notification of scheduledNotifications) {
    if (notification.identifier.startsWith(PERIOD_REMINDER_ID_PREFIX)) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

/**
 * Schedule a notification for a specific date.
 * @param id Unique identifier for the notification.
 * @param title Notification title.
 * @param body Notification body text.
 * @param triggerDate Date when the notification should fire.
 */
async function scheduleNotification(
  id: string,
  title: string,
  body: string,
  triggerDate: Date
): Promise<void> {
  // Don't schedule if the date is in the past
  if (triggerDate <= new Date()) {
    console.log(`Skipping notification ${id} - date is in the past`);
    return;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: Platform.OS === 'android' ? 'period-reminders' : undefined,
    },
  });

  console.log(`Scheduled notification ${id} for ${triggerDate.toDateString()}`);
}

/**
 * Schedule period reminder notifications based on predicted periods.
 * Schedules a notification 7 days before each predicted period.
 * @param predictedPeriods The list of predicted period date ranges.
 * @param daysInAdvance Number of days before the period to send the reminder (default: 7).
 */
export async function schedulePeriodReminders(
  predictedPeriods: DateRangeList,
  daysInAdvance: number = 7
): Promise<void> {
  // First, cancel any existing period reminders
  await cancelAllPeriodReminders();

  // Check if we have permission
  const hasPermission = await areNotificationsEnabled();
  if (!hasPermission) {
    console.log('Cannot schedule notifications - permission not granted');
    return;
  }

  if (!predictedPeriods?.ranges?.length) {
    console.log('No predicted periods to schedule reminders for');
    return;
  }

  const now = new Date();
  let scheduledCount = 0;

  // Schedule reminders for each predicted period (limit to next 3 to avoid too many)
  for (let i = 0; i < Math.min(predictedPeriods.ranges.length, 3); i++) {
    const period = predictedPeriods.ranges[i];
    if (!period.start) continue;

    // Calculate reminder date (7 days before period start)
    const reminderDate = new Date(period.start);
    reminderDate.setDate(reminderDate.getDate() - daysInAdvance);
    reminderDate.setHours(9, 0, 0, 0); // Set to 9 AM

    // Only schedule if the reminder date is in the future
    if (reminderDate > now) {
      const periodStartFormatted = period.start.toLocaleDateString('default', {
        month: 'long',
        day: 'numeric',
      });

      await scheduleNotification(
        `${PERIOD_REMINDER_ID_PREFIX}${i}`,
        'Period Reminder 🩸',
        `Your period is expected to start in ${daysInAdvance} days (${periodStartFormatted}). Time to prepare!`,
        reminderDate
      );
      scheduledCount++;
    }
  }

  console.log(`Scheduled ${scheduledCount} period reminder(s)`);
}

/**
 * Get all currently scheduled notifications (for debugging).
 * @returns {Promise<Notifications.NotificationRequest[]>} List of scheduled notifications.
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}
