import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal } from "reactstrap";
import NavBar from "./components/nav";
import Attendance from "./components/attendance";
import "./css/teacher.css";
import Quiz from "./components/quiz";
import Recital from "./components/recital";
import Report from "./components/report";

function TeacherHome() {
	const navigate = useNavigate();

	const [activeSection, setActiveSection] = useState(
		localStorage.getItem("activeTeacherSection") || ""
	);
	const [userList, setUserList] = useState([]);
	const [currentUser, setCurrentUser] = useState(null);
	const [courseList, setCourseList] = useState([]);
	const [sectionList, setSectionList] = useState([]);
	const [subjectList, setSubjectList] = useState([]);
	const [classesList, setClassesList] = useState([]);
	const [studentList, setStudentList] = useState([]);
	const [attendanceList, setAttdenanceList] = useState([]);
	const [quizList, setQuizList] = useState([]);
	const [recitalList, setRecitalList] = useState([]);
	const [reportList, setReportList] = useState([]);
	const [classDetailsList, setClassDetailsList] = useState([]);
	const [filteredStudents, setFilteredStudents] = useState([]);
	const [selectedClass, setSelectedClass] = useState(
		JSON.parse(localStorage.getItem("selectedClass")) || null
	); // Class for attendance

	const attendanceWSRef = useRef(null);
	const quizSRef = useRef(null);
	const recitalsSRef = useRef(null);
	const reportsSRef = useRef(null);

	const API_URL = import.meta.env.VITE_apiUrl;
	const WS_URL = import.meta.env.VITE_wsUrl;

	const fetchGetAllUser = async () => {
		try {
			const response = await fetch(`${API_URL}/classes/usersList`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `JWT ${localStorage.getItem("accessToken")}`,
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

	const fetchCurrentUser = async () => {
		try {
			const response = await fetch(`${API_URL}/auth/users/me/`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `JWT ${localStorage.getItem("accessToken")}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setCurrentUser(data);
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

	const updateClassDetailsList = () => {
		if (!currentUser || !currentUser.id) {
			console.error("Current user not found or invalid");
			return;
		}

		const updatedClassDetails = classesList
			.filter((classItem) => classItem.teacher === currentUser.id)
			.map((classItem) => {
				const teacher = userList.find((user) => user.id === classItem.teacher);
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
					teacher: teacher ? `${teacher.last_name}, ${teacher.first_name}` : "",
					course: course?.name || "",
					section: section?.name || "",
					subject: subject?.name || "",
					teacher_id: teacher?.id || "",
					course_id: course?.id || "",
					section_id: section?.id || "",
					subject_id: subject?.id || "",
				};
			});

		setClassDetailsList(updatedClassDetails);
	};

	// Filter students by selected class
	const filterStudentsByClass = (classItem) => {
		console.log("Class Item:", classItem); // Check the structure and values in classItem
		console.log("Student List:", studentList); // Check the structure and values in studentList

		const filtered =
			studentList &&
			studentList.filter((student) => {
				console.log("Comparing:", {
					studentCourse: student.course,
					classCourse: classItem.course_id,
					studentSection: student.section,
					classSection: classItem.section_id,
					studentYearLevel: student.year_level,
					classYearLevel: classItem.year_level,
				});

				return (
					String(student.course) === String(classItem.course_id) &&
					String(student.section) === String(classItem.section_id) &&
					String(student.year_level) === String(classItem.year_level)
				);
			});

		console.log("Filtered Students:", filtered);
		setFilteredStudents(filtered);
	};

	const connectAttendanceWS = (classItemId) => {
		// Close existing WebSocket if any
		if (attendanceWSRef.current) {
			attendanceWSRef.current.close();
		}

		// Create a new WebSocket connection for attendance
		const attednacetWS = new WebSocket(
			`${WS_URL}/ws/allattendance/${classItemId}/`
		);

		attendanceWSRef.current = attednacetWS; // Save WebSocket to ref

		attednacetWS.onopen = () => {
			console.log(
				`WebSocket connection established for attendance class ${classItemId}`
			);
		};

		attednacetWS.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setAttdenanceList(data.Attendances || []);
		};

		attednacetWS.onclose = () => {
			console.log(
				`WebSocket connection closed for attendance class ${classItemId}`
			);
		};
	};

	const connectQuizWS = (classItemId) => {
		if (quizSRef.current) {
			quizSRef.current.close();
		}

		const quizWS = new WebSocket(`${WS_URL}/ws/quiz/${classItemId}/`);
		quizSRef.current = quizWS;

		quizWS.onopen = () => {
			console.log(`Quiz WebSocket for class ${classItemId} connected`);
		};

		quizWS.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setQuizList(data.Quizes || []);
			console.log(data);
		};

		quizWS.onclose = () => {
			console.log(`Quiz WebSocket for class ${classItemId} closed`);
		};
	};

	const connectRecitalWS = (classItemId) => {
		if (recitalsSRef.current) {
			recitalsSRef.current.close();
		}

		const recitalws = new WebSocket(`${WS_URL}/ws/recital/${classItemId}/`);
		recitalsSRef.current = recitalws;

		recitalws.onopen = () => {
			console.log(`Recital WebSocket for class ${classItemId} connected`);
		};

		recitalws.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setRecitalList(data.Recitals || []);
			console.log(data);
		};

		recitalws.onclose = () => {
			console.log(`Recital WebSocket for class ${classItemId} closed`);
		};
	};

	const connectReportWS = (classItemId) => {
		if (reportsSRef.current) {
			reportsSRef.current.close();
		}

		const reportws = new WebSocket(`${WS_URL}/ws/report/${classItemId}/`);
		reportsSRef.current = reportws;

		reportws.onopen = () => {
			console.log(`Report WebSocket for class ${classItemId} connected`);
		};

		reportws.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setReportList(data.Reports || []);
			console.log(data);
		};

		reportws.onclose = () => {
			console.log(`Report WebSocket for class ${classItemId} closed`);
		};
	};

	useEffect(() => {
		fetchGetAllUser();
		fetchCurrentUser();

		// console.log("asdfadsfa", studentList && studentList);

		const classWS = new WebSocket(`${WS_URL}/ws/class/`);
		const studentWS = new WebSocket(`${WS_URL}/ws/students/`);
		const courseWS = new WebSocket(`${WS_URL}/ws/course/`);
		const sectionWS = new WebSocket(`${WS_URL}/ws/section/`);
		const subjectWS = new WebSocket(`${WS_URL}/ws/subject/`);

		classWS.onopen = () => {
			console.log("WebSocket connection established for classes");
		};

		classWS.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setClassesList(data.Classes || []);
		};

		classWS.onclose = () => {
			console.log("WebSocket connection closed for classes");
		};

		studentWS.onopen = () => {
			console.log("WebSocket connection established for students");
		};

		studentWS.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setStudentList(data.Student || []);
		};

		studentWS.onclose = () => {
			console.log("WebSocket connection closed for students");
		};

		courseWS.onopen = () => {
			console.log("WebSocket connection established for courses");
		};

		courseWS.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setCourseList(data.Courses || []);
		};

		courseWS.onclose = () => {
			console.log("WebSocket connection closed for courses");
		};

		sectionWS.onopen = () => {
			console.log("WebSocket connection established for sections");
		};

		sectionWS.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setSectionList(data.Sections || []);
		};

		sectionWS.onclose = () => {
			console.log("WebSocket connection closed for sections");
		};

		subjectWS.onopen = () => {
			console.log("WebSocket connection established for subjects");
		};

		subjectWS.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setSubjectList(data.Subjects || []);
		};

		subjectWS.onclose = () => {
			console.log("WebSocket connection closed for subjects");
		};

		if (selectedClass) {
			connectAttendanceWS(selectedClass.id); // Reconnect WebSocket when the page is refreshed
		}

		return () => {
			classWS.close();
			studentWS.close();
			courseWS.close();
			sectionWS.close();
			subjectWS.close();
			if (attendanceWSRef.current) {
				attendanceWSRef.current.close(); // Close the attendance WebSocket when component unmounts
			}
		};
	}, [WS_URL, selectedClass]);

	useEffect(() => {
		if (
			userList.length &&
			courseList.length &&
			sectionList.length &&
			subjectList.length &&
			classesList.length
		) {
			updateClassDetailsList();
		}
	}, [userList, courseList, sectionList, subjectList, classesList]);

	const openAttendanceModal = (classItem) => {
		filterStudentsByClass(classItem);
		setSelectedClass(classItem);
		connectAttendanceWS(classItem.id); // Open WebSocket when a class is selected
		toggleSection("Attendance");
	};

	const openQuizModal = (classItem) => {
		setSelectedClass(classItem);
		connectQuizWS(classItem.id);
		toggleSection("Quiz");
		console.log(quizList);
	};

	const openRecitalModal = (classItem) => {
		setSelectedClass(classItem);
		connectRecitalWS(classItem.id);
		toggleSection("Recital");
		console.log(recitalList);
	};

	const openReportModal = (classItem) => {
		setSelectedClass(classItem);
		connectReportWS(classItem.id);
		toggleSection("Report");
		console.log(reportList);
	};

	const toggleSection = (section) => {
		setActiveSection(section);
		localStorage.setItem("activeTeacherSection", section);
	};

	return (
		<div className="teacherPageContent">
			<NavBar currentUser={currentUser} API_URL={API_URL} />
			<div className="teacherCard">
				{classDetailsList.length ? (
					classDetailsList.map((classItem) => (
						<div key={classItem.id} className="teacherCard-content">
							<h3>
								{classItem.course} - {classItem.subject}
							</h3>
							<div className="class-info">
								<p>
									<strong>{classItem.teacher}</strong>
								</p>
								<p>
									<strong>{classItem.section}</strong>
								</p>
								<p>
									<strong>
										{classItem.start_time} - {classItem.end_time}
									</strong>
								</p>
								<p>
									<strong>
										{classItem.year_level == 1
											? "1st year "
											: classItem.year_level == 2
											? "2nd year "
											: classItem.year_level == 3
											? "3rd year"
											: "4th year"}
									</strong>
								</p>
								<p>
									<strong>
										{classItem.is_monday ? "M " : ""}
										{classItem.is_tuesday ? "T " : ""}
										{classItem.is_wednesday ? "W " : ""}
										{classItem.is_thursday ? "T " : ""}
										{classItem.is_friday ? "F " : ""}
										{classItem.is_saturday ? "S " : ""}
									</strong>
								</p>
							</div>
							<div className="button-group">
								<Button
									className="buttons"
									onClick={() => openQuizModal(classItem)}
								>
									Quiz
								</Button>
								<Button
									className="buttons"
									onClick={() => openRecitalModal(classItem)}
								>
									Recital
								</Button>
								<Button
									className="buttons"
									onClick={() => openReportModal(classItem)}
								>
									Report
								</Button>
								<Button
									className="buttons"
									onClick={() => openAttendanceModal(classItem)}
								>
									Attendance
								</Button>
							</div>
						</div>
					))
				) : (
					<div>No class details available</div>
				)}
			</div>

			<div className="modalTeacherSection">
				<Modal
					isOpen={activeSection === "Attendance"}
					fullscreen
					className="teacher-modal"
				>
					<Attendance
						closeModal={() => toggleSection(null)}
						studentList={filteredStudents}
						classItem={selectedClass}
						userList={userList}
						attendanceList={attendanceList}
					/>
				</Modal>

				<Modal
					isOpen={activeSection === "Quiz"}
					fullscreen
					className="teacher-modal"
				>
					<Quiz
						closeModal={() => toggleSection(null)}
						quizList={quizList}
						classItem={selectedClass}
						userList={userList}
					/>
				</Modal>

				<Modal
					isOpen={activeSection === "Recital"}
					fullscreen
					className="teacher-modal"
				>
					<Recital
						closeModal={() => toggleSection(null)}
						recitalList={recitalList}
						classItem={selectedClass}
						userList={userList}
					/>
				</Modal>

				<Modal
					isOpen={activeSection === "Report"}
					fullscreen
					className="teacher-modal"
				>
					<Report
						closeModal={() => toggleSection(null)}
						reportList={reportList}
						classItem={selectedClass}
						userList={userList}
					/>
				</Modal>
			</div>
		</div>
	);
}

export default TeacherHome;
