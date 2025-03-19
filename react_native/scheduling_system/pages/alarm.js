import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";
import { Audio } from "expo-av";
import { Alert } from "react-native";

// Function to handle playing the alarm sound
export const playAlarmSound = async () => {
	const { sound } = await Audio.Sound.createAsync(
		require("../assets/ringtone/ringtone.mp3") // path to your sound file
	);
	await sound.playAsync();
	return sound;
};

// Function to trigger a local notification (alarm)
export const setAlarm = async (classDetail) => {
	const hasPermission = await checkNotificationPermission();
	if (!hasPermission) return;

	// Schedule a notification (alarm) for a specific time
	const notificationId = await Notifications.scheduleNotificationAsync({
		content: {
			title: "Class Reminder",
			body: `Reminder for your class: ${classDetail?.subject} (${classDetail.start_time} - ${classDetail.end_time})`,
			sound: "default",
		},
		trigger: {
			seconds: 5, // Trigger alarm after 5 seconds for testing (adjust this accordingly)
		},
	});

	Alert.alert("Alarm Set", "Class reminder alarm has been set!");
};

// Check notification permission
const checkNotificationPermission = async () => {
	const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
	if (status !== "granted") {
		const { status: newStatus } = await Permissions.askAsync(
			Permissions.NOTIFICATIONS
		);
		if (newStatus !== "granted") {
			Alert.alert(
				"Permission Required",
				"Notification permissions are required to set alarms."
			);
			return false;
		}
	}
	return true;
};
