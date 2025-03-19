import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	ActivityIndicator,
	ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";

function Teacher({ currentUser, classDetailsList, Logout, resetPassword }) {
	const navigation = useNavigation();

	const [isSettingsOpen, setIsSettingsOpen] = useState(false); // State to handle collapse

	useEffect(() => {
		Notifications.setNotificationHandler({
			handleNotification: async () => ({
				shouldShowAlert: true,
				shouldPlaySound: true,
				shouldSetBadge: false,
			}),
		});
		createChannels();
	}, []);

	// Function to create a notification channel (for Android)
	const createChannels = async () => {
		await Notifications.setNotificationChannelAsync("class-reminder", {
			name: "Class Reminder",
			importance: Notifications.AndroidImportance.HIGH,
			sound: "default",
			vibrationPattern: [0, 250, 250, 250],
		});
		console.log("Notification channel created");
	};

	// Function to check if the class is on the same day as the current day
	const isClassDay = (classDetail) => {
		const currentDay = new Date().getDay(); // 0 is Sunday, 6 is Saturday
		switch (currentDay) {
			case 1:
				return classDetail?.is_monday;
			case 2:
				return classDetail?.is_tuesday;
			case 3:
				return classDetail?.is_wednesday;
			case 4:
				return classDetail?.is_thursday;
			case 5:
				return classDetail?.is_friday;
			case 6:
				return classDetail?.is_saturday;
			default:
				return false;
		}
	};

	// Function to schedule alarm notifications for class reminders
	const scheduleAlarms = async (startTime, classDetail) => {
		const currentDate = new Date();
		const startDateTime = new Date(currentDate);

		// Parse the start time (e.g., "09:30")
		const [hours, minutes] = startTime.split(":").map(Number);
		startDateTime.setHours(hours);
		startDateTime.setMinutes(minutes);
		startDateTime.setSeconds(0);

		// Notification messages for class reminders
		const notificationTimes = [
			{
				minutesBefore: 15,
				message: `15 minutes before your ${classDetail.subject}`,
			},
			{
				minutesBefore: 10,
				message: `10 minutes before your ${classDetail.subject}`,
			},
			{
				minutesBefore: 5,
				message: `5 minutes before your ${classDetail.subject}`,
			},
			{
				minutesBefore: 0,
				message: `Your ${classDetail.subject} is starting now`,
			},
		];

		// Only schedule notifications if today is a class day
		if (isClassDay(classDetail)) {
			for (const notification of notificationTimes) {
				const notificationTime = new Date(startDateTime);
				notificationTime.setMinutes(
					notificationTime.getMinutes() - notification.minutesBefore
				);

				// Make sure we're only scheduling notifications in the future
				if (notificationTime >= currentDate) {
					console.log(`Scheduling alarm for: ${notificationTime}`); // Debugging log

					await Notifications.scheduleNotificationAsync({
						content: {
							title: "Class Reminder",
							body: notification.message,
							sound: "default",
							vibrationPattern: [0, 250, 250, 250],
						},
						trigger: {
							date: notificationTime,
						},
					});
					console.log(`Notification scheduled for ${notificationTime}`);
				} else {
					console.log(`Notification time is in the past: ${notificationTime}`);
				}
			}
		} else {
			console.log("Today is not a class day.");
		}
	};

	const toggleSettings = () => {
		setIsSettingsOpen(!isSettingsOpen); // Toggle collapse
	};

	const showResetPasswordModal = () => {
		navigation.navigate("ResetPasswordModal");
	};

	// Render class details and schedule alarm for each class
	const renderClassDetails = () => {
		return classDetailsList.map((classDetail, index) => {
			// Schedule an alarm 5 minutes before the start time
			scheduleAlarms(classDetail?.start_time, classDetail);

			return (
				<View key={index} style={styles.classCard}>
					<View style={styles.classDetailRow}>
						<Text style={styles.timeText}>
							{classDetail?.start_time} - {classDetail?.end_time}
						</Text>
						<Text style={styles.subjectText}>{classDetail?.subject}</Text>
					</View>
					<View style={styles.classExtraDetails}>
						<Text style={styles.sectionText}>
							{classDetail?.year_level === "1"
								? "1st year"
								: classDetail?.year_level === "2"
								? "2nd year"
								: classDetail?.year_level === "3"
								? "3rd year"
								: "4th year"}{" "}
							- {classDetail?.section}
						</Text>
						<Text style={styles.dayText}>
							{classDetail?.is_monday ? "M " : ""}
							{classDetail?.is_tuesday ? "T " : ""}
							{classDetail?.is_wednesday ? "W " : ""}
							{classDetail?.is_thursday ? "T " : ""}
							{classDetail?.is_friday ? "F " : ""}
							{classDetail?.is_saturday ? "S " : ""}
						</Text>
					</View>
				</View>
			);
		});
	};

	return (
		<View style={styles.wrapper}>
			<ImageBackground
				style={styles.background}
				source={require("../../assets/homepage2.png")}
			>
				<View style={styles.overlay}>
					<View style={styles.header}>
						<Text style={styles.title}>
							{currentUser?.first_name} {currentUser?.last_name}
						</Text>
						<TouchableOpacity onPress={toggleSettings}>
							<Text style={styles.title}>Settings</Text>
						</TouchableOpacity>
					</View>

					{/* Collapsible Settings */}
					{isSettingsOpen && (
						<View style={styles.settingsMenu}>
							<TouchableOpacity
								style={styles.settingsOption}
								onPress={showResetPasswordModal}
							>
								<Text style={styles.settingsText}>Reset Password</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.settingsOption} onPress={Logout}>
								<Text style={styles.settingsText}>Logout</Text>
							</TouchableOpacity>
						</View>
					)}

					<ScrollView contentContainerStyle={styles.container}>
						{classDetailsList.length > 0 ? (
							renderClassDetails()
						) : (
							<ActivityIndicator size="large" color="#fff" />
						)}
					</ScrollView>
				</View>
			</ImageBackground>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
	},
	background: {
		flex: 1,
		resizeMode: "cover",
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.4)",
	},
	header: {
		top: "5%",
		flexDirection: "row",
		justifyContent: "space-between",
		marginHorizontal: "5%",
	},
	container: {
		flexGrow: 1,
		padding: 20,
		alignItems: "center",
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 20,
	},
	classCard: {
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 15,
		marginBottom: 15,
		width: "100%",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5,
	},
	classDetailRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 5,
	},
	classExtraDetails: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	timeText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#027b94",
	},
	subjectText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#027b94",
	},
	sectionText: {
		fontSize: 14,
		color: "#666",
	},
	dayText: {
		fontSize: 14,
		color: "#666",
	},
	// Styles for the collapse menu
	settingsMenu: {
		backgroundColor: "#fff",
		borderRadius: 10,
		margin: 10,
		padding: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5,
	},
	settingsOption: {
		paddingVertical: 10,
		borderBottomColor: "#ccc",
		borderBottomWidth: 1,
	},
	settingsText: {
		color: "#027b94",
		fontSize: 18,
		fontWeight: "bold",
		textAlign: "center",
	},
});

export default Teacher;
