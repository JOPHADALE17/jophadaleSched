import React, { useState, useRef } from "react";
import {
	NavItem,
	NavLink,
	Button,
	Modal,
	ModalBody,
	Form,
	FormGroup,
	Label,
	Input,
	InputGroup,
	InputGroupText,
} from "reactstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Settings = ({ API_URL }) => {
	const navigate = useNavigate();

	const [modalOpen, setModalOpen] = useState(false);
	const [formModalOpen, setFormModalOpen] = useState(false);
	const modalRef = useRef(null);

	const [currentPassword, setCurrentPassword] = useState("");
	const [password, setPassword] = useState("");
	const [rePassword, setRePassword] = useState("");
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showRePassword, setShowRePassword] = useState(false);
	const [errorCurrentPassword, setErrorCurrentPassword] = useState("");
	const [errorPassword, setErrorPassword] = useState("");
	const [errorRePassword, setErrorRePassword] = useState("");
	const [errorFieldError, setErrorFieldError] = useState("");

	const toggleModal = () => setModalOpen(!modalOpen);
	const toggleFormModal = () => setFormModalOpen(!formModalOpen);

	// Toggle visibility of password inputs
	const toggleShowPassword = (setter) => setter((prev) => !prev);

	const handleLogout = () => {
		localStorage.removeItem("accessToken");
		navigate("/");
		window.location.reload();
	};

	const handleResetPassword = async (e) => {
		e.preventDefault();
		const userData = {
			current_password: currentPassword,
			new_password: password,
			re_new_password: rePassword,
		};

		const token = localStorage.getItem("accessToken");

		try {
			const response = await fetch(`${API_URL}/auth/users/set_password/`, {
				method: "POST",
				headers: {
					Authorization: `JWT ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(userData),
			});

			if (response.ok) {
				alert("Your password has been changed.");
				setModalOpen(false);
				setFormModalOpen(false);
			} else {
				const errorData = await response.json();
				setErrorCurrentPassword(errorData.current_password || "");
				setErrorPassword(errorData.new_password || "");
				setErrorRePassword(errorData.re_new_password || "");
				setErrorFieldError(errorData.non_field_errors || "");
			}
		} catch (error) {
			console.error("Error:", error);
		}
	};

	// Prevent modal from closing when clicking outside
	const handleClickOutside = (event) => {
		if (
			modalRef.current &&
			!modalRef.current.contains(event.target) &&
			modalOpen
		) {
			setModalOpen(false);
		}
	};

	React.useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [modalOpen]);

	return (
		<>
			<NavItem>
				<NavLink onClick={toggleModal}>Settings</NavLink>
			</NavItem>

			{/* Settings Modal */}
			<Modal isOpen={modalOpen} toggle={toggleModal} className="settings-modal">
				<ModalBody ref={modalRef}>
					<Button onClick={toggleFormModal} className="mb-2">
						Reset Password
					</Button>

					<Button onClick={handleLogout} className="mt-2">
						Log Out
					</Button>
				</ModalBody>
			</Modal>

			{/* Password Reset Modal */}
			<Modal
				isOpen={formModalOpen}
				toggle={toggleFormModal}
				backdrop={false}
				className="form-modal"
			>
				<ModalBody>
					<Form onSubmit={handleResetPassword}>
						{errorFieldError && <p className="error">{errorFieldError}</p>}

						{/* Current Password Input */}
						<FormGroup>
							<Label for="currentpassword">Current Password</Label>
							{errorCurrentPassword && (
								<p className="error">{errorCurrentPassword}</p>
							)}
							<InputGroup>
								<Input
									id="currentpassword"
									name="currentpassword"
									type={showCurrentPassword ? "text" : "password"}
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
								/>
								<InputGroupText
									onClick={() => toggleShowPassword(setShowCurrentPassword)}
								>
									{showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
								</InputGroupText>
							</InputGroup>
						</FormGroup>

						{/* New Password Input */}
						<FormGroup>
							<Label for="newPassword">New Password</Label>
							{errorPassword && <p className="error">{errorPassword}</p>}
							<InputGroup>
								<Input
									id="newPassword"
									name="newPassword"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
								<InputGroupText
									onClick={() => toggleShowPassword(setShowPassword)}
								>
									{showPassword ? <FaEyeSlash /> : <FaEye />}
								</InputGroupText>
							</InputGroup>
						</FormGroup>

						{/* Confirm Password Input */}
						<FormGroup>
							<Label for="re_newPassword">Confirm Password</Label>
							{errorRePassword && <p className="error">{errorRePassword}</p>}
							<InputGroup>
								<Input
									id="re_newPassword"
									name="re_newPassword"
									type={showRePassword ? "text" : "password"}
									value={rePassword}
									onChange={(e) => setRePassword(e.target.value)}
								/>
								<InputGroupText
									onClick={() => toggleShowPassword(setShowRePassword)}
								>
									{showRePassword ? <FaEyeSlash /> : <FaEye />}
								</InputGroupText>
							</InputGroup>
						</FormGroup>

						<Button type="submit">Submit</Button>
						<Button type="button" onClick={toggleFormModal}>
							Cancel
						</Button>
					</Form>
				</ModalBody>
			</Modal>
		</>
	);
};

export default Settings;
