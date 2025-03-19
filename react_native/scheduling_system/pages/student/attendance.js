import React, { useEffect, useState, useRef } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ActivityIndicator,
	StyleSheet,
} from "react-native";
import { Calendar } from "react-native-calendars"; // Import Calendar component

const AttendanceModalScreen = ({ route, navigation }) => {
	const { classId, studentId, WS_URL } = route.params;
	const [attendanceList, setAttendanceList] = useState({});
	const [loading, setLoading] = useState(true);
	const attendanceWSRef = useRef(null);

	useEffect(() => {
		// WebSocket connection for the selected class
		const attendanceWS = new WebSocket(
			`${WS_URL}/ws/attendance/${classId}/${studentId}/`
		);
		attendanceWSRef.current = attendanceWS;

		attendanceWS.onopen = () => {
			console.log(`WebSocket connection established for class ${classId}`);
		};

		attendanceWS.onmessage = (event) => {
			const data = JSON.parse(event.data);
			const formattedAttendance = formatAttendanceData(data.Attendances || []);
			setAttendanceList(formattedAttendance);
			setLoading(false);
		};

		attendanceWS.onclose = () => {
			console.log(
				`WebSocket connection closed for class ${classId} and student ${studentId}`
			);
		};

		// Cleanup WebSocket on component unmount
		return () => {
			if (attendanceWSRef.current) {
				attendanceWSRef.current.close();
			}
		};
	}, [classId, WS_URL]);

	// Function to format attendance data to mark specific dates
	const formatAttendanceData = (attendances) => {
		const markedDates = {};
		attendances.forEach((attendance) => {
			const { date, absent, present, late } = attendance;
			let backgroundColor = "";
			let textColor = "white"; // Default text color inside the circle

			// Set background color based on attendance status
			if (present) {
				backgroundColor = "green"; // Present
			} else if (absent) {
				backgroundColor = "red"; // Absent
			} else if (late) {
				backgroundColor = "orange"; // Late
			}

			// Mark the date on the calendar with the corresponding background color and circle style
			markedDates[date] = {
				customStyles: {
					container: {
						backgroundColor, // Circle color
						borderRadius: 20, // Fully round the date
					},
					text: {
						color: textColor, // Text color inside the circle
					},
				},
			};
		});
		return markedDates;
	};

	return (
		<View style={styles.modalOverlay}>
			<View style={styles.modalContent}>
				<Text style={styles.modalTitle}>Attendance for Class {classId}</Text>
				{loading ? (
					<ActivityIndicator size="large" color="#000" />
				) : (
					<Calendar
						// Pass the formatted attendance data to the calendar
						markedDates={attendanceList}
						markingType={"custom"}
						onDayPress={(day) => {
							// Optional: Display attendance details on day press
							alert(`Attendance details for ${day.dateString}`);
						}}
						theme={{
							selectedDayBackgroundColor: "#027b94",
						}}
					/>
				)}
				<TouchableOpacity
					style={styles.closeButton}
					onPress={() => navigation.goBack()}
				>
					<Text style={styles.buttonText}>Close</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContent: {
		backgroundColor: "#fff",
		padding: 20,
		borderRadius: 10,
		width: "90%",
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 10,
	},
	closeButton: {
		marginTop: 20,
		backgroundColor: "#027b94",
		padding: 10,
		borderRadius: 5,
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontWeight: "bold",
	},
});

export default AttendanceModalScreen;
