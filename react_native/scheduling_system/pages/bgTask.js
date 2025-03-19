import { AppRegistry } from "react-native";
import messaging from "@react-native-firebase/messaging";
import { Alert } from "react-native";

export const checkTimeAndNotify = async (classDetailsList) => {
	const formatTimeToAMPM = (time) => {
		const [hour, minute] = time.split(":");
		let formattedHour = hour % 12 || 12;
		const ampm = hour >= 12 ? "PM" : "AM";
		return `${formattedHour}:${minute} ${ampm}`;
	};

	const currentTime = new Date();
	const formattedCurrentTime = `${
		currentTime.getHours() % 12 || 12
	}:${currentTime.getMinutes()} ${currentTime.getHours() >= 12 ? "PM" : "AM"}`;

	classDetailsList.forEach((classDetail) => {
		const classStartTime = formatTimeToAMPM(classDetail?.classes?.start_time);
		if (formattedCurrentTime === classStartTime) {
			// Send notification using React Native Firebase Messaging
			messaging()
				.getToken()
				.then((token) => {
					console.log(token);
					Alert.alert(
						"Class Reminder",
						`It's time for your ${classDetail?.subject} class!`
					);
				});
		}
	});
};

// Register Headless Task
AppRegistry.registerHeadlessTask("BackgroundTask", () => checkTimeAndNotify);
