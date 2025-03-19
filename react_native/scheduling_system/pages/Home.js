import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Teacher from "./teacher/teacher";
import Student from "./student/student"; // Import Student component
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.VITE_apiUrl;
const WS_URL = Constants.expoConfig.extra.VITE_wsUrl;

function Home({ navigation }) {
	const [userList, setUserList] = useState([]);
	const [currentUser, setCurrentUser] = useState(null);
	const [courseList, setCourseList] = useState([]);
	const [sectionList, setSectionList] = useState([]);
	const [subjectList, setSubjectList] = useState([]);
	const [classesList, setClassesList] = useState([]);
	const [studentList, setStudentList] = useState([]);
	const [classDetailsList, setClassDetailsList] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchAccessToken = async () => {
		try {
			const token = await AsyncStorage.getItem("accessToken");
			return token;
		} catch (error) {
			console.error("Error fetching access token:", error);
		}
	};

	// Fetch all users
	const fetchGetAllUser = async () => {
		const token = await fetchAccessToken();
		if (!token) return;

		try {
			const response = await fetch(`${API_URL}/classes/usersList`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `JWT ${token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setUserList(data);
			} else {
				console.error("Failed to fetch users:", response.statusText);
			}
		} catch (error) {
			console.error("An error occurred:", error);
		}
	};

	// Fetch current user
	const fetchCurrentUser = async () => {
		const token = await fetchAccessToken();
		if (!token) return;

		try {
			const response = await fetch(`${API_URL}/auth/users/me/`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `JWT ${token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setCurrentUser(data);
				setLoading(false);
			} else {
				console.error(
					"Error fetching user data:",
					response.status,
					response.statusText
				);
			}
		} catch (error) {
			console.error("Fetch error:", error);
		}
	};

	// Handle logout
	const Logout = async () => {
		try {
			await AsyncStorage.removeItem("accessToken"); // Clear the token
			await AsyncStorage.removeItem("userData"); // Clear any saved user data if you store it separately
			setCurrentUser(null); // Reset the current user
			navigation.reset({
				index: 0, // The index of the new route
				routes: [{ name: "Login" }], // The route you want to navigate to
			});
		} catch (error) {
			console.error("Error logging out:", error);
		}
	};

	// WebSocket and fetch logic
	useEffect(() => {
		fetchGetAllUser();
		fetchCurrentUser();

		const classWS = new WebSocket(`${WS_URL}/ws/class/`);
		const courseWS = new WebSocket(`${WS_URL}/ws/course/`);
		const sectionWS = new WebSocket(`${WS_URL}/ws/section/`);
		const subjectWS = new WebSocket(`${WS_URL}/ws/subject/`);
		const studentWS = new WebSocket(`${WS_URL}/ws/students/`);

		classWS.onopen = () =>
			console.log("WebSocket connection established for classes");

		classWS.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setClassesList(data.Classes || []);
		};

		classWS.onclose = () =>
			console.log("WebSocket connection closed for classes");

		courseWS.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setCourseList(data.Courses || []);
		};

		sectionWS.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setSectionList(data.Sections || []);
		};

		subjectWS.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setSubjectList(data.Subjects || []);
		};

		studentWS.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setStudentList(data.Student || []);
		};

		return () => {
			classWS.close();
			courseWS.close();
			sectionWS.close();
			subjectWS.close();
			studentWS.close();
		};
	}, []);

	useEffect(() => {
		if (
			userList?.length &&
			courseList?.length &&
			sectionList?.length &&
			subjectList?.length &&
			classesList?.length &&
			studentList?.length
		) {
			updateClassDetailsList();
		}

		// if (loading) {
		// 	Logout();
		// }
	}, [
		userList,
		courseList,
		sectionList,
		subjectList,
		classesList,
		studentList,
	]);

	const updateClassDetailsList = () => {
		if (!currentUser || !currentUser?.id) {
			console.error("Current user not found or invalid");
			Logout();
			return;
		}

		if (currentUser.is_teacher) {
			// Update class details for teachers
			const updatedClassDetails = classesList
				.filter((classItem) => classItem.teacher === currentUser?.id)
				.map((classItem) => {
					const teacher = userList.find(
						(user) => user.id === classItem.teacher
					);
					const course = courseList.find(
						(course) => course.id === classItem.course
					);
					const section = sectionList.find(
						(section) => section.id === classItem.section
					);
					const subject = subjectList.find(
						(subject) => subject.id === classItem.subject
					);

					return {
						...classItem,
						teacher: teacher
							? `${teacher.last_name}, ${teacher.first_name}`
							: "",
						course: course?.name || "",
						section: section?.name || "",
						subject: subject?.name || "",
					};
				});

			setClassDetailsList(updatedClassDetails);
		} else {
			// Update class details for students
			const updatedClassDetails = classesList
				.filter((classItem) => {
					// Check if the current user's section and course match the class
					const studentInClass = studentList.find(
						(student) =>
							student.user === currentUser.id &&
							student.section === classItem.section &&
							student.course === classItem.course &&
							student.year_level === classItem.year_level
					);
					return studentInClass;
				})
				.map((classItem) => {
					const student = studentList.find(
						(student) => student.user === currentUser.id
					);
					const course = courseList.find(
						(course) => course.id === classItem.course
					);
					const section = sectionList.find(
						(section) => section.id === classItem.section
					);
					const subject = subjectList.find(
						(subject) => subject.id === classItem.subject
					);

					return {
						...classItem,
						student: student?.id || "",
						course: course?.name || "",
						section: section?.name || "",
						subject: subject?.name || "",
					};
				});

			setClassDetailsList(updatedClassDetails);
		}
	};

	return currentUser?.is_teacher ? (
		<Teacher
			currentUser={currentUser}
			classDetailsList={classDetailsList}
			Logout={Logout}
		/>
	) : (
		<Student
			currentUser={currentUser}
			classDetailsList={classDetailsList}
			Logout={Logout}
			// navigation={navigation} // Pass navigation if needed
		/>
	);
}

export default Home;
