import React, { useState, useEffect } from "react";
import { Nav, NavItem, NavLink, Collapse } from "reactstrap";
import Teacher from "./components/Teacher";
import Student from "./components/Student";
import Section from "./components/Section";
import Subject from "./components/Subject";
import Course from "./components/Course";
import Classes from "./components/Classes";
import "./css/admin.css";
import Settings from "./components/settings";

export default function AdminHome() {
	const [activeSection, setActiveSection] = useState(
		localStorage.getItem("activeSection") || "teacher" // Default to "teacher"
	);
	const [userList, setUserList] = useState([]);
	const [courseList, setCourseList] = useState([]);
	const [sectionList, setSectionList] = useState([]);
	const [subjectList, setSubjectList] = useState([]);
	const [classesList, setClassesList] = useState([]);
	const [studentList, setStudentList] = useState([]);
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
			}
		} catch (error) {
			console.error("An error occurred:", error);
		}
	};

	useEffect(() => {
		fetchGetAllUser();

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
			setClassesList(data);
			console.log("Classes: ", data);
		};

		classWS.onclose = () => {
			console.log("WebSocket connection closed for classes");
		};

		studentWS.onopen = () => {
			console.log("WebSocket connection established for students");
		};

		studentWS.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setStudentList(data);
		};

		studentWS.onclose = () => {
			console.log("WebSocket connection closed for students");
		};

		courseWS.onopen = () => {
			console.log("WebSocket connection established for courses");
		};

		courseWS.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setCourseList(data);
			console.log(data);
		};

		courseWS.onclose = () => {
			console.log("WebSocket connection closed for courses");
		};

		sectionWS.onopen = () => {
			console.log("WebSocket connection established for sections");
		};

		sectionWS.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setSectionList(data);
			console.log(data);
		};

		sectionWS.onclose = () => {
			console.log("WebSocket connection closed for sections");
		};

		subjectWS.onopen = () => {
			console.log("WebSocket connection established for subjects");
		};

		subjectWS.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setSubjectList(data);
			console.log(data);
		};

		subjectWS.onclose = () => {
			console.log("WebSocket connection closed for subjects");
		};

		// Cleanup function to close WebSocket connections when the component unmounts
		return () => {
			classWS.close();
			studentWS.close();
			courseWS.close();
			sectionWS.close();
			subjectWS.close();
		};
	}, [WS_URL]);

	const toggleSection = (section) => {
		setActiveSection(section);
		localStorage.setItem("activeSection", section);
	};

	return (
		<div className="homePageContent">
			<Nav fill pills>
				<NavItem>
					<NavLink onClick={() => toggleSection("teacher")}>Teacher</NavLink>
				</NavItem>
				<NavItem>
					<NavLink onClick={() => toggleSection("student")}>Student</NavLink>
				</NavItem>
				<NavItem>
					<NavLink onClick={() => toggleSection("course")}>Course</NavLink>
				</NavItem>
				<NavItem>
					<NavLink onClick={() => toggleSection("section")}>Section</NavLink>
				</NavItem>
				<NavItem>
					<NavLink onClick={() => toggleSection("subject")}>Subject</NavLink>
				</NavItem>
				<NavItem>
					<NavLink onClick={() => toggleSection("Classes")}>Classes</NavLink>
				</NavItem>
				<Settings API_URL={API_URL} />
			</Nav>

			<Collapse isOpen={activeSection === "teacher"}>
				<Teacher userDetails={userList} />
			</Collapse>

			<Collapse isOpen={activeSection === "student"}>
				<Student
					userDetails={userList}
					courseDetails={courseList}
					sectionDetails={sectionList}
					studentDetails={studentList}
				/>
			</Collapse>

			<Collapse isOpen={activeSection === "course"}>
				<Course
					courseDetails={courseList}
					classesDetails={classesList}
					studentDetails={studentList}
				/>
			</Collapse>

			<Collapse isOpen={activeSection === "section"}>
				<Section
					sectionDetails={sectionList}
					classesDetails={classesList}
					studentDetails={studentList}
				/>
			</Collapse>

			<Collapse isOpen={activeSection === "subject"}>
				<Subject subjectDetails={subjectList} classesDetails={classesList} />
			</Collapse>

			<Collapse isOpen={activeSection === "Classes"}>
				<Classes
					userDetails={userList}
					courseDetails={courseList}
					sectionDetails={sectionList}
					studentDetails={studentList}
					subjectDetails={subjectList}
					classesDetails={classesList}
				/>
			</Collapse>
		</div>
	);
}
