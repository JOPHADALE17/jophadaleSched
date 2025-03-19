import React, { useState, useEffect } from "react";
import { FaPlus, FaInfo, FaTrash } from "react-icons/fa";
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

const Classes = ({
	userDetails,
	courseDetails,
	sectionDetails,
	subjectDetails,
	classesDetails,
}) => {
	const [classModal, setClassModal] = useState(false);
	const [classDetailsList, setClassDetailsList] = useState([]);
	const [classDetails, setClassDetails] = useState({
		teacher_id: "",
		course_id: "",
		year_level: "",
		section_id: "",
		subject_id: "",
		start_time: "",
		end_time: "",
		is_monday: false,
		is_tuesday: false,
		is_wednesday: false,
		is_thursday: false,
		is_friday: false,
		is_saturday: false,
	});

	const [updateModal, setUpdateModal] = useState(false);
	const [deleteModal, setDeleteModal] = useState(false);
	const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
	const [selectedClasses, setSelectedClasses] = useState(null);
	const [message, setMessage] = useState(""); // Feedback message state

	useEffect(() => {
		if (classesDetails.Classes) {
			updateClassDetailsList();
		}
	}, [
		classesDetails,
		userDetails,
		courseDetails,
		sectionDetails,
		subjectDetails,
	]);

	const updateModalToggle = () => setUpdateModal(!updateModal);
	const deleteModalToggle = () => setDeleteModal(!deleteModal);

	const updateClassDetailsList = () => {
		const updatedClassDetails = classesDetails.Classes.map((classItem) => {
			const teacher = userDetails.find((user) => user.id === classItem.teacher);
			const course = courseDetails.Courses?.find(
				(course) => course.id === classItem.course
			);
			const section = sectionDetails.Sections?.find(
				(section) => section.id === classItem.section
			);
			const subject = subjectDetails.Subjects?.find(
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

	const handleInputChange = (e) => {
		const { name, type, checked, value } = e.target;
		setClassDetails((prevDetails) => ({
			...prevDetails,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleInputChangeUpdate = (e) => {
		const { name, type, checked, value } = e.target;
		setSelectedClasses((prevDetails) => ({
			...prevDetails,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const toggleClassModal = () => setClassModal((prev) => !prev);

	const handleAddClass = async () => {
		try {
			const response = await fetch(`${API_URL}/classes/classCreate`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `JWT ${localStorage.getItem("accessToken")}`,
				},
				body: JSON.stringify({
					teacher: classDetails.teacher_id,
					course: classDetails.course_id,
					section: classDetails.section_id,
					subject: classDetails.subject_id,
					yearLevel: classDetails.year_level,
					startTime: classDetails.start_time,
					endTime: classDetails.end_time,
					mon: classDetails.is_monday,
					tue: classDetails.is_tuesday,
					wed: classDetails.is_wednesday,
					thu: classDetails.is_thursday,
					fri: classDetails.is_friday,
					sat: classDetails.is_saturday,
				}),
			});

			if (!response.ok) throw new Error("Failed to add class");

			const data = await response.json();
			setClassDetailsList((prevList) => [...prevList, data]);
			toggleClassModal();
			setMessage("Class added successfully.");
		} catch (error) {
			setMessage("Error adding class.");
			console.error("Error adding class:", error);
		}
	};

	const openUpdateModal = (classses, e) => {
		setSelectedClasses(classses);

		const buttonRect = e.target.getBoundingClientRect();
		setModalPosition({
			top: buttonRect.top + window.scrollY + 5,
			left: buttonRect.left + window.scrollX - 100,
		});

		setUpdateModal(true);
	};

	const openDeleteModal = (classses, e) => {
		setSelectedClasses(classses);

		const buttonRect = e.target.getBoundingClientRect();
		setModalPosition({
			top: buttonRect.top + window.scrollY + 5,
			left: buttonRect.left + window.scrollX - 100,
		});

		setDeleteModal(true);
	};

	const handleDeleteSection = async () => {
		try {
			const response = await fetch(
				`${API_URL}/classes/${selectedClasses.id}/classDelete`,
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
				setClassDetailsList((prevList) =>
					prevList.filter((classItem) => classItem.id !== selectedClasses.id)
				);
				setMessage("Class deleted successfully.");
			} else {
				setMessage("Error deleting class.");
			}
		} catch (error) {
			console.error("Error deleting class:", error);
		}
	};

	const handleUpdateClasses = async () => {
		try {
			const response = await fetch(
				`${API_URL}/classes/${selectedClasses.id}/classUpdate`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `JWT ${localStorage.getItem("accessToken")}`,
					},
					body: JSON.stringify({
						teacher: selectedClasses.teacher_id,
						course: selectedClasses.course_id,
						section: selectedClasses.section_id,
						subject: selectedClasses.subject_id,
						year_level: selectedClasses.year_level,
						start_time: selectedClasses.start_time,
						end_time: selectedClasses.end_time,
						is_monday: selectedClasses.is_monday,
						is_tuesday: selectedClasses.is_tuesday,
						is_wednesday: selectedClasses.is_wednesday,
						is_thursday: selectedClasses.is_thursday,
						is_friday: selectedClasses.is_friday,
						is_saturday: selectedClasses.is_saturday,
					}),
				}
			);

			const data = await response.json();
			if (response.ok) {
				setUpdateModal(false);
				setMessage("Class updated successfully.");
			} else {
				setMessage("Error updating class.");
			}
		} catch (error) {
			setMessage("Error updating class.");
			console.error("Error updating class:", error);
		}
	};

	return (
		<Card className="cardtable">
			<CardBody>
				<Modal isOpen={classModal} toggle={toggleClassModal} fullscreen>
					<ModalBody>
						<div className="generalForm">
							<Form>
								<FormGroup>
									<Label for="teacher">Teacher</Label>
									<Input
										id="teacher"
										name="teacher_id"
										type="select"
										value={classDetails.teacher_id}
										onChange={handleInputChange}
									>
										<option value="">Select Teacher</option>
										{userDetails
											.filter((user) => user.is_teacher)
											.map((user) => (
												<option key={user.id} value={user.id}>
													{user.last_name}, {user.first_name}
												</option>
											))}
									</Input>
								</FormGroup>

								<FormGroup>
									<Label for="course">Course</Label>
									<Input
										id="course"
										name="course_id"
										type="select"
										value={classDetails.course_id}
										onChange={handleInputChange}
									>
										<option value="">Select Course</option>
										{courseDetails.Courses?.map((course) => (
											<option key={course.id} value={course.id}>
												{course.name}
											</option>
										))}
									</Input>
								</FormGroup>

								<FormGroup>
									<Label for="yearLevel">Year Level</Label>
									<Input
										id="yearLevel"
										name="year_level"
										type="select"
										value={classDetails.year_level}
										onChange={handleInputChange}
									>
										<option value="">Select Year Level</option>
										{[
											"First Year",
											"Second Year",
											"Third Year",
											"Fourth Year",
										].map((level, index) => (
											<option key={index} value={index + 1}>
												{level}
											</option>
										))}
									</Input>
								</FormGroup>

								<FormGroup>
									<Label for="section">Section</Label>
									<Input
										id="section"
										name="section_id"
										type="select"
										value={classDetails.section_id}
										onChange={handleInputChange}
									>
										<option value="">Select Section</option>
										{sectionDetails.Sections?.map((section) => (
											<option key={section.id} value={section.id}>
												{section.name}
											</option>
										))}
									</Input>
								</FormGroup>

								<FormGroup>
									<Label for="subject">Subject</Label>
									<Input
										id="subject"
										name="subject_id"
										type="select"
										value={classDetails.subject_id}
										onChange={handleInputChange}
									>
										<option value="">Select Subject</option>
										{subjectDetails.Subjects?.map((subject) => (
											<option key={subject.id} value={subject.id}>
												{subject.name}
											</option>
										))}
									</Input>
								</FormGroup>

								<FormGroup>
									<Label for="startTime">Start Time</Label>
									<Input
										id="startTime"
										name="start_time"
										type="time"
										value={classDetails.start_time}
										onChange={handleInputChange}
									/>
								</FormGroup>

								<FormGroup>
									<Label for="endTime">End Time</Label>
									<Input
										id="endTime"
										name="end_time"
										type="time"
										value={classDetails.end_time}
										onChange={handleInputChange}
									/>
								</FormGroup>

								<FormGroup>
									<Label for="days">Days</Label>
									<div className="days-checkboxes">
										{[
											{ name: "is_monday", label: "Monday" },
											{ name: "is_tuesday", label: "Tuesday" },
											{ name: "is_wednesday", label: "Wednesday" },
											{ name: "is_thursday", label: "Thursday" },
											{ name: "is_friday", label: "Friday" },
											{ name: "is_saturday", label: "Saturday" },
										].map((day) => (
											<FormGroup check inline key={day.name}>
												<Label check>
													<Input
														type="checkbox"
														name={day.name}
														checked={classDetails[day.name]}
														onChange={handleInputChange}
													/>
													{day.label}
												</Label>
											</FormGroup>
										))}
									</div>
								</FormGroup>

								<div className="buttonGroup">
									<Button color="primary" onClick={handleAddClass}>
										Submit
									</Button>
									<Button color="secondary" onClick={toggleClassModal}>
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
					className="updateModalparentClass"
				>
					<ModalBody className="updateModalClass">
						<div>
							<Form>
								<FormGroup>
									<Label for="teacher">Teacher</Label>
									<Input
										id="teacher"
										name="teacher_id"
										type="select"
										value={selectedClasses?.teacher_id}
										onChange={handleInputChangeUpdate}
									>
										<option value="">Select Teacher</option>
										{userDetails
											.filter((user) => user.is_teacher)
											.map((user) => (
												<option key={user.id} value={user.id}>
													{user.last_name}, {user.first_name}
												</option>
											))}
									</Input>
								</FormGroup>

								<FormGroup>
									<Label for="course">Course</Label>
									<Input
										id="course"
										name="course_id"
										type="select"
										value={selectedClasses?.course_id}
										onChange={handleInputChangeUpdate}
									>
										<option value="">Select Course</option>
										{courseDetails.Courses?.map((course) => (
											<option key={course.id} value={course.id}>
												{course.name}
											</option>
										))}
									</Input>
								</FormGroup>

								<FormGroup>
									<Label for="yearLevel">Year Level</Label>
									<Input
										id="yearLevel"
										name="year_level"
										type="select"
										value={selectedClasses?.year_level}
										onChange={handleInputChangeUpdate}
									>
										<option value="">Select Year Level</option>
										{[
											"First Year",
											"Second Year",
											"Third Year",
											"Fourth Year",
										].map((level, index) => (
											<option key={index} value={index + 1}>
												{level}
											</option>
										))}
									</Input>
								</FormGroup>

								<FormGroup>
									<Label for="section">Section</Label>
									<Input
										id="section"
										name="section_id"
										type="select"
										value={selectedClasses?.section_id}
										onChange={handleInputChangeUpdate}
									>
										<option value="">Select Section</option>
										{sectionDetails.Sections?.map((section) => (
											<option key={section.id} value={section.id}>
												{section.name}
											</option>
										))}
									</Input>
								</FormGroup>

								<FormGroup>
									<Label for="subject">Subject</Label>
									<Input
										id="subject"
										name="subject_id"
										type="select"
										value={selectedClasses?.subject_id}
										onChange={handleInputChangeUpdate}
									>
										<option value="">Select Subject</option>
										{subjectDetails.Subjects?.map((subject) => (
											<option key={subject.id} value={subject.id}>
												{subject.name}
											</option>
										))}
									</Input>
								</FormGroup>

								<FormGroup>
									<Label for="startTime">Start Time</Label>
									<Input
										id="startTime"
										name="start_time"
										type="time"
										value={selectedClasses?.start_time}
										onChange={handleInputChangeUpdate}
									/>
								</FormGroup>

								<FormGroup>
									<Label for="endTime">End Time</Label>
									<Input
										id="endTime"
										name="end_time"
										type="time"
										value={selectedClasses?.end_time}
										onChange={handleInputChangeUpdate}
									/>
								</FormGroup>

								<FormGroup>
									<Label for="days">Days</Label>
									<div className="days-checkboxes">
										{[
											{ name: "is_monday", label: "Monday" },
											{ name: "is_tuesday", label: "Tuesday" },
											{ name: "is_wednesday", label: "Wednesday" },
											{ name: "is_thursday", label: "Thursday" },
											{ name: "is_friday", label: "Friday" },
											{ name: "is_saturday", label: "Saturday" },
										].map((day) => (
											<FormGroup check inline key={day.name}>
												<Label check>
													<Input
														type="checkbox"
														name={day.name}
														checked={
															selectedClasses && selectedClasses[day.name]
														}
														onChange={handleInputChangeUpdate}
													/>
													{day.label}
												</Label>
											</FormGroup>
										))}
									</div>
								</FormGroup>
								<div className="buttonGroup">
									<Button color="primary" onClick={handleUpdateClasses}>
										Update
									</Button>
									<Button color="secondary" onClick={updateModalToggle}>
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
					}}
					className="updateModalparent"
				>
					<ModalBody className="updateModal">
						<Form>
							<FormGroup>
								<Label>
									Delete Class:
									{selectedClasses?.subject || "N/A"}
								</Label>
							</FormGroup>
							<div className="buttonGroup">
								<Button color="danger" onClick={handleDeleteSection}>
									Delete
								</Button>
								<Button color="secondary" onClick={deleteModalToggle}>
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
								<th className="thbutton" colSpan={7}>
									<Button className="addbutton" onClick={toggleClassModal}>
										<FaPlus /> Class
									</Button>
								</th>
							</tr>
							<tr>
								<th>Teacher</th>
								<th>Course</th>
								<th>Year Level</th>
								<th>Section</th>
								<th>Subject</th>
								<th>Time</th>
								<th>Days</th>
							</tr>
						</thead>
						<tbody>
							{classDetailsList.length ? (
								classDetailsList.map((classItem) => (
									<tr key={classItem.id}>
										<td>{classItem.teacher}</td>
										<td>{classItem.course}</td>
										<td>{classItem.year_level}</td>
										<td>{classItem.section}</td>
										<td>{classItem.subject}</td>
										<td>
											{classItem.start_time} - {classItem.end_time}
										</td>
										<td>
											{classItem.is_monday ? "Mon " : ""}
											{classItem.is_tuesday ? "Tue " : ""}
											{classItem.is_wednesday ? "Wed " : ""}
											{classItem.is_thursday ? "Thu " : ""}
											{classItem.is_friday ? "Fri " : ""}
											{classItem.is_saturday ? "Sat " : ""}
											{/* Render other days */}
										</td>
										<td className="tdButton">
											<Button
												color="primary"
												onClick={(e) => openUpdateModal(classItem, e)} // Changed from course to section
											>
												<FaInfo className="updateButton" />
											</Button>
											<Button
												color="danger"
												onClick={(e) => openDeleteModal(classItem, e)} // Changed from course to section
											>
												<FaTrash />
												{/* <FaTrash className="deleteButton" /> */}
											</Button>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={7}>No class details available.</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</CardBody>
		</Card>
	);
};

export default Classes;
