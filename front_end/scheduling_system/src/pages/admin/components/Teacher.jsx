import React, { useState } from "react";
import { FaPlus, FaUserTimes } from "react-icons/fa";
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

const Teacher = ({ userDetails }) => {
	const [teacherModal, setTeacherModal] = useState(false);
	const [deleteModal, setDeleteModal] = useState(false);
	const [selectedStudent, setSelectedStudent] = useState(null);
	const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

	const [teacherData, setTeacherData] = useState({
		user_type: "teacher",
		first_name: "",
		last_name: "",
		email: "",
		password: "",
		re_password: "",
		is_teacher: true,
	});

	const [errorDetails, setErrorDetails] = useState({
		ErrorMessage: "",
	});

	// Open/close modals
	const toggleTeacherModal = () => {
		generatePassword();
		setTeacherModal(!teacherModal);
	};

	const toggleDeleteModal = () => {
		setDeleteModal(!deleteModal);
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setTeacherData({ ...teacherData, [name]: value });
	};

	// Password generation
	const generatePassword = () => {
		const newPassword = Math.random().toString(36).slice(-8);
		setTeacherData({
			...teacherData,
			password: newPassword,
			re_password: newPassword,
		});
	};

	// Handle Teacher Signup
	const handleSignup = async () => {
		const response = await fetch(`${API_URL}/auth/users/`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(teacherData),
		});

		if (response.ok) {
			setTeacherModal(false);
			window.location.reload();

			// Optionally: refresh user list after signup
		} else {
			const errorData = await response.json();
			setErrorDetails({
				ErrorMessage: errorData.detail || "Failed to add teacher",
			});
		}
	};

	// Open delete modal and set position dynamically
	const openDeleteModal = (teacher, e) => {
		setSelectedStudent(teacher);
		const buttonRect = e.target.getBoundingClientRect();
		setModalPosition({
			top: buttonRect.top + window.scrollY + 5,
			left: buttonRect.left + window.scrollX - 150,
		});
		setDeleteModal(true);
	};

	// Handle teacher deletion
	const handleDeleteTeacher = async () => {
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
			window.location.reload();
			// Optionally: refresh user list after deletion
		} else {
			// Handle error in deletion
			setErrorDetails({
				ErrorMessage: "Failed to remove teacher",
			});
		}
	};

	return (
		<Card className="cardtable">
			<CardBody>
				{/* Teacher Signup Modal */}
				<Modal isOpen={teacherModal} toggle={toggleTeacherModal} fullscreen>
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
										value={teacherData.first_name}
										onChange={handleInputChange}
									/>
								</FormGroup>
								<FormGroup>
									<Label for="LastName">Last Name</Label>
									<Input
										id="LastName"
										name="last_name"
										value={teacherData.last_name}
										onChange={handleInputChange}
									/>
								</FormGroup>
								<FormGroup>
									<Label for="Email">Email</Label>
									<Input
										id="Email"
										name="email"
										type="email"
										value={teacherData.email}
										onChange={handleInputChange}
									/>
								</FormGroup>
								<FormGroup>
									<Label for="Password">Password</Label>
									<Input
										id="Password"
										name="password"
										type="password"
										value={teacherData.password}
										onChange={handleInputChange}
									/>
								</FormGroup>
								<FormGroup>
									<Label for="RePassword">Re-enter Password</Label>
									<Input
										id="RePassword"
										name="re_password"
										type="password"
										value={teacherData.re_password}
										onChange={handleInputChange}
									/>
								</FormGroup>
								<div className="buttonGroup">
									<Button color="primary" onClick={handleSignup}>
										Submit
									</Button>
									<Button color="secondary" onClick={toggleTeacherModal}>
										Cancel
									</Button>
								</div>
							</Form>
						</div>
					</ModalBody>
				</Modal>

				{/* Teacher Delete Modal */}
				<Modal
					isOpen={deleteModal}
					backdrop={false}
					toggle={toggleDeleteModal}
					style={{ top: `${modalPosition.top}px` }} // Dynamic position
					className="updateModalparent"
				>
					<ModalBody className="updateModal">
						<div>
							<Form>
								<FormGroup>
									<Label>
										Delete Teacher: {selectedStudent?.first_name}{" "}
										{selectedStudent?.last_name}
									</Label>
								</FormGroup>
								<div className="buttonGroup">
									<Button color="danger" onClick={handleDeleteTeacher}>
										Remove
									</Button>
									<Button color="secondary" onClick={toggleDeleteModal}>
										Cancel
									</Button>
								</div>
							</Form>
						</div>
					</ModalBody>
				</Modal>

				{/* Teacher List Table */}
				<div className="scrollable-table-container">
					<table>
						<thead>
							<tr>
								<th colSpan={4} className="thbutton">
									<Button className="addbutton" onClick={toggleTeacherModal}>
										<FaPlus /> <span>Teacher</span>
									</Button>
								</th>
							</tr>
						</thead>
						<thead>
							<tr>
								<th>First Name</th>
								<th>Last Name</th>
								<th>Email</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{userDetails.length > 0 ? (
								userDetails.map(
									(user) =>
										user.is_teacher && (
											<tr key={user.id}>
												<td>{user.first_name}</td>
												<td>{user.last_name}</td>
												<td>{user.email}</td>
												<td>
													<Button
														color="danger"
														onClick={(e) => openDeleteModal(user, e)}
													>
														<FaUserTimes /> Remove
													</Button>
												</td>
											</tr>
										)
								)
							) : (
								<tr>
									<td colSpan={4}>No teachers found</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</CardBody>
		</Card>
	);
};

export default Teacher;
