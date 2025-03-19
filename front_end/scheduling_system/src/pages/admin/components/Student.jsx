import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaInfo, FaTrash, FaUserTimes } from "react-icons/fa";
import {
	Button,
	Modal,
	ModalBody,
	Form,
	FormGroup,
	Label,
	Input,
	Card,
	CardBody,
} from "reactstrap";

const API_URL = import.meta.env.VITE_apiUrl;
const WS_URL = import.meta.env.VITE_wsUrl;

const Student = ({
	userDetails,
	courseDetails,
	sectionDetails,
	studentDetails,
}) => {
	const [updateModal, setUpdateModal] = useState(false);
	const [deleteModal, setDeleteModal] = useState(false);
	const [StudentModal, setStudentModal] = useState(false);
	const [StudentDetailModal, setStudentDetailModal] = useState(false);
	const [studentData, setStudentData] = useState({ name: "" });
	const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
	const [selectedStudent, setSelectedStudent] = useState([]);

	const updateModalToggle = () => setUpdateModal(!updateModal);
	const deleteModalToggle = () => setDeleteModal(!deleteModal);

	const [StudentInfo, setStudentInfo] = useState({
		first_name: "",
		last_name: "",
		email: "",
		password: "",
		re_password: "",
		is_teacher: false,
	});

	const [StudentDetailsData, setStudentDetailsData] = useState({
		user_id: "",
		course_id: "",
		year_level: "",
		section_id: "",
	});

	const addStudentWS = `${WS_URL}/ws/students/`;
	const [errorDetails, setErrorDetails] = useState({
		ErrorMessage: "",
		ErrorFirst_name: "",
		ErrorLast_name: "",
		ErrorEmail: "",
		ErrorPassword: "",
		ErrorRePassword: "",
		ErrorField: "",
	});

	const [userList, setUserList] = useState([]);
	const [userDetailList, setUserDetailList] = useState([]);
	const socketRef = useRef(null);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setStudentInfo({ ...StudentInfo, [name]: value });
	};

	const handleInputChangeDetails = (e) => {
		const { name, value } = e.target;
		setStudentDetailsData({ ...StudentDetailsData, [name]: value });
	};

	const handleInputChangeData = (e) => {
		const { name, value } = e.target;
		setSelectedStudent((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const StudentModalToggle = () => {
		generatePassword();
		setStudentModal(!StudentModal);
	};

	const StudentDetailModalToggle = () => {
		setStudentDetailModal(!StudentDetailModal);
	};

	const generatePassword = () => {
		const characters =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		const newPassword = Array(10)
			.fill("")
			.map(() =>
				characters.charAt(Math.floor(Math.random() * characters.length))
			)
			.join("");
		setStudentInfo({
			...StudentInfo,
			password: newPassword,
			re_password: newPassword,
		});
	};

	const handleSignup = async () => {
		const response = await fetch(`${API_URL}/auth/users/`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(StudentInfo),
		});

		if (response.ok) {
			setStudentModal(false);
			window.location.reload();
		} else {
			const errorData = await response.json();
			setErrorDetails({
				ErrorMessage: errorData.detail || "",
			});
		}
	};

	const handleAddStudent = async () => {
		const studentInfo = {
			course: StudentDetailsData.course_id,
			yearLevel: StudentDetailsData.year_level, // Match field names to backend
			section: StudentDetailsData.section_id,
		};

		try {
			const response = await fetch(
				`${API_URL}/classes/${StudentDetailsData.user_id}/studentCreate`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `JWT ${localStorage.getItem("accessToken")}`,
					},
					body: JSON.stringify(studentInfo),
				}
			);
			if (response.ok) {
				const newStudent = await response.json();
				setUserDetailList((prev) => [...prev, newStudent]); // Update the UI with new student data
				setStudentDetailModal(false); // Close modal
				window.location.reload();
			} else {
				const errorData = await response.json();
				setErrorDetails({
					ErrorMessage: errorData.error || "Failed to create student.",
				});
			}
		} catch (error) {
			setErrorDetails({
				ErrorMessage: "An error occurred while adding the student.",
			});
		}
		window.location.reload();
	};

	const openUpdateModal = (student, e) => {
		setSelectedStudent(student);
		console.log("student: ", student);
		// Get button position and size
		const buttonRect = e.target.getBoundingClientRect();

		// Calculate modal position based on button's position
		setModalPosition({
			top: buttonRect.top + window.scrollY + 5, // Adjust offset here
			left: buttonRect.left + window.scrollX - 100, // Adjust offset here
		});

		setUpdateModal(true);
	};

	const openDeleteModal = (student, e) => {
		setSelectedStudent(student);

		// Get button position and size
		const buttonRect = e.target.getBoundingClientRect();

		// Calculate modal position based on button's position
		setModalPosition({
			top: buttonRect.top + window.scrollY + 5, // Adjust offset here
			left: buttonRect.left + window.scrollX - 150, // Adjust offset here
		});

		setDeleteModal(true);
	};

	// Handle updating a section
	const handleUpdateStudent = async () => {
		const response = await fetch(
			`${API_URL}/classes/${selectedStudent?.id}/studentUpdate`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `JWT ${localStorage.getItem("accessToken")}`,
				},
				body: JSON.stringify({
					user: selectedStudent.user.id,
					course: selectedStudent.course_id,
					year_level: selectedStudent.year_level,
					section: selectedStudent.section_id,
				}),
			}
		);

		const data = await response.json();
		console.log("API Response:", data);
		console.log("selected student:", selectedStudent);

		if (response.ok) {
			setUpdateModal(false);
			console.log("response: ", data);
			// window.location.reload();
		}
	};

	const handleDeleteStudent = async () => {
		const response = await fetch(
			`${API_URL}/classes/${selectedStudent.id}/usersDelete`,
			{
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `JWT ${localStorage.getItem("accessToken")}`,
				},
			}
		);
		if (response.ok) {
			setDeleteModal(false);
		}
	};

	useEffect(() => {
		if (
			studentDetails.Student &&
			userDetails.length > 0 &&
			courseDetails.Courses &&
			sectionDetails.Sections
		) {
			const updatedStudentDetails = studentDetails.Student.map((student) => {
				const matchingUser = userDetails.find(
					(user) => user.id === student.user
				);

				const matchingCourse = courseDetails.Courses.find(
					(course) => course.id === student.course
				);

				const matchingSection = sectionDetails.Sections.find(
					(section) => section.id === student.section
				);

				return {
					...student,
					user: matchingUser ? matchingUser : "",
					course: matchingCourse ? matchingCourse.name : "",
					section: matchingSection ? matchingSection.name : "",

					course_id: matchingCourse ? matchingCourse.id : "",
					section_id: matchingSection ? matchingSection.id : "",
				};
			});
			// console.log("students: ", updatedStudentDetails);
			setUserDetailList(updatedStudentDetails);
		}
	}, [studentDetails, userDetails, courseDetails, sectionDetails]);

	return (
		<Card className="cardtable">
			<CardBody>
				<Modal isOpen={StudentModal} toggle={StudentModalToggle} fullscreen>
					<ModalBody>
						<div className="generalForm">
							<Form>
								<div className="errormessage">
									{errorDetails.ErrorMessage && (
										<div>{errorDetails.ErrorMessage}</div>
									)}
								</div>
								<FormGroup>
									<Label for="FirstName">First Name</Label>
									<Input
										id="FirstName"
										name="first_name"
										value={StudentInfo.first_name}
										onChange={handleInputChange}
									/>
								</FormGroup>
								<FormGroup>
									<Label for="LastName">Last Name</Label>
									<Input
										id="LastName"
										name="last_name"
										value={StudentInfo.last_name}
										onChange={handleInputChange}
									/>
								</FormGroup>
								<FormGroup>
									<Label for="Email">Email</Label>
									<Input
										id="Email"
										name="email"
										type="email"
										value={StudentInfo.email}
										onChange={handleInputChange}
									/>
								</FormGroup>
								<FormGroup>
									<Label for="Password">Password</Label>
									<Input
										id="Password"
										name="password"
										type="password"
										value={StudentInfo.password}
										onChange={handleInputChange}
									/>
								</FormGroup>
								<FormGroup>
									<Label for="RePassword">Re-enter Password</Label>
									<Input
										id="RePassword"
										name="re_password"
										type="password"
										value={StudentInfo.re_password}
										onChange={handleInputChange}
									/>
								</FormGroup>
								<div className="buttonGroup">
									<Button color="primary" onClick={handleSignup}>
										Submit
									</Button>
									<Button color="secondary" onClick={StudentModalToggle}>
										Cancel
									</Button>
								</div>
							</Form>
						</div>
					</ModalBody>
				</Modal>

				<Modal
					isOpen={StudentDetailModal}
					toggle={StudentDetailModalToggle}
					fullscreen
				>
					<ModalBody>
						<div className="generalForm">
							<Form>
								<div className="errormessage">
									{errorDetails.ErrorMessage && (
										<div>{errorDetails.ErrorMessage}</div>
									)}
								</div>
								<div>
									{StudentInfo.first_name} {StudentInfo.last_name}
								</div>
								<FormGroup>
									<Label for="Course">Course</Label>
									<Input
										id="Course"
										name="course_id"
										type="select"
										value={StudentDetailsData.course_id}
										onChange={handleInputChangeDetails}
									>
										<option value="">Select Course</option>
										{courseDetails.Courses &&
											courseDetails.Courses.map((course) => (
												<option key={course.id} value={course.id}>
													{course.name}
												</option>
											))}
									</Input>
								</FormGroup>

								<FormGroup>
									<Label for="YearLevel">Year Level</Label>
									<Input
										id="YearLevel"
										name="year_level"
										type="select"
										value={StudentDetailsData.year_level}
										onChange={handleInputChangeDetails}
									>
										<option value="">Select Year Level</option>
										<option value="1">First Year</option>
										<option value="2">Second Year</option>
										<option value="3">Third Year</option>
										<option value="4">Fourth Year</option>
									</Input>
								</FormGroup>

								<FormGroup>
									<Label for="Section">Section</Label>
									<Input
										id="Section"
										name="section_id"
										type="select"
										value={StudentDetailsData.section_id}
										onChange={handleInputChangeDetails}
									>
										<option value="">Select Section</option>
										{sectionDetails.Sections &&
											sectionDetails.Sections.map((section) => (
												<option key={section.id} value={section.id}>
													{section.name}
												</option>
											))}
									</Input>
								</FormGroup>

								<div className="buttonGroup">
									<Button color="primary" onClick={handleAddStudent}>
										Submit
									</Button>
									<Button color="secondary" onClick={StudentDetailModalToggle}>
										Cancel
									</Button>
								</div>
							</Form>
						</div>
					</ModalBody>
				</Modal>

				<Modal
					isOpen={deleteModal}
					backdrop={false}
					toggle={deleteModalToggle}
					style={{
						position: "relative",
						top: `${modalPosition.top}px`,
					}} // Use dynamic position
					className="updateModalparent"
				>
					<ModalBody className="updateModal">
						<div>
							<Form>
								<FormGroup>
									<Label for="deleteSectionName">
										Delete student:
										{selectedStudent?.first_name} {selectedStudent?.last_name}
									</Label>
								</FormGroup>
								<div className="buttonGroup">
									<Button color="danger" onClick={handleDeleteStudent}>
										unenroll
									</Button>
									<Button color="secondary" onClick={deleteModalToggle}>
										Cancel
									</Button>
								</div>
							</Form>
						</div>
					</ModalBody>
				</Modal>

				<Modal
					isOpen={updateModal}
					backdrop={false}
					toggle={updateModalToggle}
					style={{
						position: "relative",
						top: `${modalPosition.top}px`,
						// left: `${modalPosition.left}px`,
					}} // Use dynamic position
					className="updateModalparentStudent"
				>
					<ModalBody className="updateModalStudent">
						<Form>
							<div className="errormessage">
								{errorDetails.ErrorMessage && (
									<div>{errorDetails.ErrorMessage}</div>
								)}
							</div>
							<div className="modalText">
								Student Name: {selectedStudent.user?.first_name}{" "}
								{selectedStudent.user?.last_name}
							</div>
							<br />
							<div className="modalText">
								email: {selectedStudent.user?.email}
							</div>
							<br />

							<FormGroup>
								<Label for="Course">Course</Label>
								<Input
									id="Course"
									name="course_id"
									type="select"
									value={selectedStudent?.course_id}
									onChange={handleInputChangeData}
								>
									<option value="">Select Course</option>
									{courseDetails.Courses &&
										courseDetails.Courses.map((course) => (
											<option key={course.id} value={course.id}>
												{course.name}
											</option>
										))}
								</Input>
							</FormGroup>

							<FormGroup>
								<Label for="YearLevel">Year Level</Label>
								<Input
									id="YearLevel"
									name="year_level"
									type="select"
									value={selectedStudent?.year_level}
									onChange={handleInputChangeData}
								>
									<option value="">Select Year Level</option>
									<option value="1">First Year</option>
									<option value="2">Second Year</option>
									<option value="3">Third Year</option>
									<option value="4">Fourth Year</option>
								</Input>
							</FormGroup>

							<FormGroup>
								<Label for="Section">Section</Label>
								<Input
									id="Section"
									name="section_id"
									type="select"
									value={selectedStudent?.section_id}
									onChange={handleInputChangeData}
								>
									<option value="">Select Section</option>
									{sectionDetails.Sections &&
										sectionDetails.Sections.map((section) => (
											<option key={section.id} value={section.id}>
												{section.name}
											</option>
										))}
								</Input>
							</FormGroup>
							<div className="buttonGroup">
								<Button color="primary" onClick={handleUpdateStudent}>
									Update
								</Button>
								<Button color="secondary" onClick={updateModalToggle}>
									Cancel
								</Button>
							</div>
						</Form>
					</ModalBody>
				</Modal>

				<div className="scrollable-table-container">
					<table>
						<thead>
							<tr>
								<th className="thbutton" colSpan={6}>
									<Button className="addbutton" onClick={StudentModalToggle}>
										<FaPlus /> <span>Student</span>
									</Button>
								</th>
							</tr>
							<tr>
								<th>Student First Name</th>
								<th>Student Last Name</th>
								<th>Student Email</th>
								<th>Course</th>
								<th>Year</th>
								<th>Section</th>
								<th>action</th>
							</tr>
						</thead>
						<tbody>
							{userDetails.length > 0 ? (
								userDetails
									.filter((user) => !user.is_teacher && !user.is_superuser) // Filter out non-students
									.map((user) => {
										// Check if user exists in userDetailList
										const userDetail = userDetailList.find(
											(detail) => detail.user.id === user.id
										);

										return (
											<tr key={user.id}>
												<td>{user.first_name}</td>
												<td>{user.last_name}</td>
												<td>{user.email}</td>
												{userDetail ? (
													<>
														<td>{userDetail.course}</td>
														<td>
															{userDetail.year_level === "1"
																? "First Year"
																: userDetail.year_level === "2"
																? "Second Year"
																: userDetail.year_level === "3"
																? "Third Year"
																: "Fourth Year"}
														</td>
														<td>{userDetail.section}</td>
														<td className="tdButton">
															<Button
																color="primary"
																onClick={(e) => openUpdateModal(userDetail, e)} // Changed from course to section
															>
																<FaInfo className="updateButton" />
															</Button>
															<Button
																color="danger"
																onClick={(e) => openDeleteModal(user, e)}
															>
																<FaUserTimes /> Unenroll
															</Button>
														</td>
													</>
												) : (
													<>
														<td colSpan={3}>
															<Button
																className="addbuttondetail"
																onClick={() => {
																	setStudentDetailsData({
																		...StudentDetailsData,
																		user_id: user.id,
																	});
																	StudentDetailModalToggle();
																}}
															>
																<FaPlus /> <span>Add student info</span>
															</Button>
														</td>
														<td colSpan={2}>
															<Button
																className="addbuttondetail"
																color="danger"
																onClick={(e) => openDeleteModal(user, e)}
															>
																<FaUserTimes /> Unenroll
															</Button>
														</td>
													</>
												)}
											</tr>
										);
									})
							) : (
								<tr>
									<td colSpan={7}>No students found</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</CardBody>
		</Card>
	);
};

export default Student;
