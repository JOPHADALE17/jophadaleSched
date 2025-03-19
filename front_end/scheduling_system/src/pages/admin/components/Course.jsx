import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaInfo, FaInfoCircle } from "react-icons/fa";
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

const Course = ({ courseDetails, classesDetails, studentDetails }) => {
	const [courseModal, setCourseModal] = useState(false);
	const [updateModal, setUpdateModal] = useState(false);
	const [DeleteModal, setDeleteModal] = useState(false);
	const [courseData, setCourseData] = useState({ name: "" });
	const [courseList, setCourseList] = useState([]);
	const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
	const [selectedCourse, setSelectedCourse] = useState(null);

	const courseModalToggle = () => {
		setCourseModal(!courseModal);
	};
	const updateModalToggle = () => setUpdateModal(!updateModal);
	const deleteModalToggle = () => setDeleteModal(!DeleteModal);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setCourseData({ ...courseData, [name]: value });
	};

	// Open update modal with selected course data and position it relative to the button
	const openUpdateModal = (course, e) => {
		setSelectedCourse(course);
		setCourseData({ name: course.name }); // Prefill input field with course name

		// Get button position and size
		const buttonRect = e.target.getBoundingClientRect();

		// Calculate modal position based on button's position
		setModalPosition({
			top: buttonRect.top + window.scrollY + 5, // Adjust offset here
			left: buttonRect.left + window.scrollX - 100, // Adjust offset here
		});

		setUpdateModal(true);
	};

	const openDeleteModal = (course, e) => {
		setSelectedCourse(course);
		setCourseData({ name: course.name }); // Prefill input field with course name

		// Get button position and size
		const buttonRect = e.target.getBoundingClientRect();

		// Calculate modal position based on button's position
		setModalPosition({
			top: buttonRect.top + window.scrollY + 5, // Adjust offset here
			left: buttonRect.left + window.scrollX - 150, // Adjust offset here
		});

		setDeleteModal(true);
	};

	const handleAddCourse = async () => {
		// Change to use courseData instead of subjectData
		const response = await fetch(`${API_URL}/classes/courseCreate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `JWT ${localStorage.getItem("accessToken")}`,
			},
			body: JSON.stringify(courseData), // Send courseData instead of subjectData
		});

		if (response.ok) {
			const newCourse = await response.json();
			setCourseList([...courseList, newCourse]);
			setCourseModal(false);
		}
	};

	// Handle updating a course
	const handleUpdateCourse = async () => {
		const response = await fetch(
			`${API_URL}/classes/${selectedCourse.id}/courseUpdate`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `JWT ${localStorage.getItem("accessToken")}`,
				},
				body: JSON.stringify(courseData),
			}
		);

		if (response.ok) {
			setUpdateModal(false);
		}
	};

	const handleDeleteCourse = async () => {
		// Check if the selected course is referenced in studentDetails or classesDetails
		const isReferencedInStudents =
			studentDetails.Student &&
			studentDetails.Student.map((student) => {
				return student.course === selectedCourse.id;
			});
		const isReferencedInClasses =
			classesDetails.Classes &&
			classesDetails.Classes.map((classes) => {
				return classes.course === selectedCourse.id;
			});

		if (isReferencedInStudents[0] || isReferencedInClasses[0]) {
			// If the course is referenced, show an error message and do not delete
			alert(
				"Cannot delete this course. It is referenced in student or class records."
			);
			return; // Stop the deletion process
		} else {
			const response = await fetch(
				`${API_URL}/classes/${selectedCourse.id}/courseDelete`,
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
			// console.log("can delete");
		}
	};

	// If no references found, proceed with deletion

	return (
		<Card className="cardtable">
			<CardBody>
				<Modal isOpen={courseModal} toggle={courseModalToggle} fullscreen>
					<ModalBody>
						<div className="generalForm">
							<Form>
								<FormGroup>
									<Label for="courseName">Course Name</Label>
									<Input
										id="courseName"
										name="name"
										value={courseData.name}
										onChange={handleInputChange}
									/>
								</FormGroup>
								<div className="buttonGroup">
									<Button color="primary" onClick={handleAddCourse}>
										Submit
									</Button>
									<Button color="secondary" onClick={courseModalToggle}>
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
					className="updateModalparent"
				>
					<ModalBody className="updateModal">
						<div>
							<Form>
								<FormGroup>
									<Label for="updateCourseName">Update Course Name</Label>
									<Input
										id="updateCourseName"
										name="name"
										value={courseData.name}
										onChange={handleInputChange}
									/>
								</FormGroup>
								<div className="buttonGroup">
									<Button color="primary" onClick={handleUpdateCourse}>
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
					isOpen={DeleteModal}
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
									<Label for="updateCourseName">
										Delete Course:
										{selectedCourse && selectedCourse.name
											? selectedCourse.name
											: "N/A"}
									</Label>
								</FormGroup>
								<div className="buttonGroup">
									<Button color="danger" onClick={handleDeleteCourse}>
										Delete
									</Button>
									<Button color="secondary" onClick={deleteModalToggle}>
										Cancel
									</Button>
								</div>
							</Form>
						</div>
					</ModalBody>
				</Modal>

				<div className="scrollable-table-container">
					<table>
						<thead>
							<tr>
								<th colSpan={3} className="thbutton">
									<Button className="addbutton" onClick={courseModalToggle}>
										<FaPlus /> <span>Course</span>
									</Button>
								</th>
							</tr>
						</thead>
						<thead>
							<tr>
								<th>Course Name</th>
								{/* <th>action</th> */}
							</tr>
						</thead>
						<tbody>
							{courseDetails.Courses ? (
								courseDetails.Courses.map((course) => (
									<tr key={course.id}>
										<td>{course.name}</td>
										<td className="tdButton">
											<Button
												color="primary"
												// className="buttonAction"
												onClick={(e) => openUpdateModal(course, e)}
											>
												<FaInfo className="updateButton" />
											</Button>
											<Button
												color="danger"
												// className="buttonAction"
												onClick={(e) => openDeleteModal(course, e)}
											>
												<FaTrash className="deleteButton" />
											</Button>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={3}>No courses found</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</CardBody>
		</Card>
	);
};

export default Course;
