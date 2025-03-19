import React, { useState, useEffect, useRef } from "react";
import {
	StyleSheet,
	View,
	Text,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import PagerView from "react-native-pager-view";
import { Calendar } from "react-native-calendars";
import { useRoute, useNavigation } from "@react-navigation/native";

const Activities = () => {
	const route = useRoute();
	const navigation = useNavigation();
	const { classId, WS_URL } = route.params; // Get the parameters passed from Student

	const [selectedDate, setSelectedDate] = useState(null);
	const [quizList, setQuizList] = useState([]);
	const [reportList, setReportList] = useState([]);
	const [recitalList, setRecitalList] = useState([]);
	const [markedDates, setMarkedDates] = useState({});

	const quizSRef = useRef(null);
	const recitalsSRef = useRef(null);
	const reportsSRef = useRef(null);

	const connectQuizWS = () => {
		if (quizSRef.current) quizSRef.current.close();
		const quizWS = new WebSocket(`${WS_URL}/ws/quiz/${classId}/`);
		quizSRef.current = quizWS;

		quizWS.onopen = () => console.log("Quiz WebSocket connected");
		quizWS.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setQuizList(data.Quizes || []);
		};
		quizWS.onclose = () => console.log("Quiz WebSocket closed");
	};

	const connectReportWS = () => {
		if (reportsSRef.current) reportsSRef.current.close();
		const reportWS = new WebSocket(`${WS_URL}/ws/report/${classId}/`);
		reportsSRef.current = reportWS;

		reportWS.onopen = () => console.log("Report WebSocket connected");
		reportWS.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setReportList(data.Reports || []);
		};
		reportWS.onclose = () => console.log("Report WebSocket closed");
	};

	const connectRecitalWS = () => {
		if (recitalsSRef.current) recitalsSRef.current.close();
		const recitalWS = new WebSocket(`${WS_URL}/ws/recital/${classId}/`);
		recitalsSRef.current = recitalWS;

		recitalWS.onopen = () => console.log("Recital WebSocket connected");
		recitalWS.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setRecitalList(data.Recitals || []);
		};
		recitalWS.onclose = () => console.log("Recital WebSocket closed");
	};

	useEffect(() => {
		if (classId) {
			connectQuizWS();
			connectReportWS();
			connectRecitalWS();
		}

		return () => {
			if (quizSRef.current) quizSRef.current.close();
			if (reportsSRef.current) reportsSRef.current.close();
			if (recitalsSRef.current) recitalsSRef.current.close();
		};
	}, [classId]);

	// Highlight dates that have events
	useEffect(() => {
		const allEvents = [...quizList, ...reportList, ...recitalList];
		const datesWithEvents = {};
		allEvents.forEach((event) => {
			const date = event.date;
			datesWithEvents[date] = {
				marked: true,
				dotColor: "orange",
				selected: date === selectedDate,
				selectedColor: "orange",
			};
		});
		setMarkedDates(datesWithEvents);
	}, [quizList, reportList, recitalList, selectedDate]);

	const handleDateSelect = (date) => {
		setSelectedDate(date);

		// Filter events for the selected date
		connectQuizWS();
		connectReportWS();
		connectRecitalWS();
	};

	// Filter the lists by the selected date
	const filteredQuizzes = quizList.filter((quiz) => quiz.date === selectedDate);
	const filteredReports = reportList.filter(
		(report) => report.date === selectedDate
	);
	const filteredRecitals = recitalList.filter(
		(recital) => recital.date === selectedDate
	);

	return (
		<View style={styles.container}>
			<Calendar
				onDayPress={(day) => handleDateSelect(day.dateString)}
				markedDates={markedDates}
			/>
			<PagerView style={styles.pagerView} initialPage={0}>
				<View key="1" style={styles.page}>
					<Text style={styles.sectionTitle}>Quizzes</Text>
					<ScrollView>
						{filteredQuizzes.length ? (
							filteredQuizzes.map((quiz, index) => (
								<View key={index} style={styles.itemCard}>
									<Text>{quiz.about}</Text>
								</View>
							))
						) : (
							<Text>No quizzes available for this date</Text>
						)}
					</ScrollView>
				</View>
				<View key="2" style={styles.page}>
					<Text style={styles.sectionTitle}>Reports</Text>
					<ScrollView>
						{filteredReports.length ? (
							filteredReports.map((report, index) => (
								<View key={index} style={styles.itemCard}>
									<Text>{report.about}</Text>
								</View>
							))
						) : (
							<Text>No reports available for this date</Text>
						)}
					</ScrollView>
				</View>
				<View key="3" style={styles.page}>
					<Text style={styles.sectionTitle}>Recitals</Text>
					<ScrollView>
						{filteredRecitals.length ? (
							filteredRecitals.map((recital, index) => (
								<View key={index} style={styles.itemCard}>
									<Text>{recital.about}</Text>
								</View>
							))
						) : (
							<Text>No recitals available for this date</Text>
						)}
					</ScrollView>
				</View>
			</PagerView>

			<TouchableOpacity
				style={styles.closeButton}
				onPress={() => navigation.goBack()}
			>
				<Text style={styles.buttonText}>Close</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, padding: 20 },
	pagerView: { flex: 1, height: "50%" },
	page: { padding: 20 },
	sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
	itemCard: {
		backgroundColor: "#fff",
		padding: 10,
		marginBottom: 10,
		borderRadius: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5,
	},
	closeButton: {
		position: "absolute",
		bottom: 30,
		left: 20,
		right: 20,
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

export default Activities;
