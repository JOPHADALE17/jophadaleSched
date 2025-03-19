import { useState } from "react";
import "./css/auth.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useNavigate } from "react-router-dom";
import {
	Modal,
	ModalBody,
	Form,
	FormGroup,
	Label,
	Input,
	Button,
	Alert,
} from "reactstrap";

const API_URL = import.meta.env.VITE_apiUrl;

function Login() {
	const navigate = useNavigate();
	const [ForgotPasswordModal, setForgotPasswordModal] = useState(false);
	const [userData, setUserData] = useState({
		email: "",
		password: "",
	});
	const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
	const [errorDetails, setErrorMessage] = useState({
		ErrorMessage: "",
	});
	const [passwordResetMessage, setPasswordResetMessage] = useState("");
	const [passwordVisible, setPasswordVisible] = useState(false); // New state for password visibility

	// Toggles the Forgot Password Modal
	const forgotPasswordModalToggle = () => {
		setForgotPasswordModal(!ForgotPasswordModal);
		setPasswordResetMessage(""); // Clear previous messages when reopening the modal
	};

	// Handles changes in login form inputs
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setUserData({ ...userData, [name]: value });
	};

	// Handles changes in forgot password email input
	const handleForgotPasswordChange = (e) => {
		setForgotPasswordEmail(e.target.value);
	};

	// Toggle password visibility
	const togglePasswordVisibility = () => {
		setPasswordVisible(!passwordVisible);
	};

	// Handles login form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await fetch(`${API_URL}/auth/jwt/create/`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(userData),
			});

			if (response.ok) {
				const data = await response.json();
				localStorage.setItem("accessToken", data.access);
				navigate("/");
				window.location.reload();
			} else {
				const errorData = await response.json();
				setErrorMessage({
					ErrorMessage: errorData.detail || "An error occurred.",
					ErrorEmail: errorData.email || "",
					ErrorPassword: errorData.password || "",
				});
			}
		} catch (error) {
			console.error("Error:", error);
		}
	};

	// Handles forgot password form submission
	const handleForgotPassword = async () => {
		try {
			const response = await fetch(`${API_URL}/auth/users/reset_password/`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email: forgotPasswordEmail }), // send email as object
			});

			if (response.ok) {
				setForgotPasswordModal(false);
				setPasswordResetMessage(
					"If the email is valid, a password reset link has been sent."
				);
			} else {
				const errorData = await response.json();
				setPasswordResetMessage(errorData.detail || "An error occurred.");
			}
		} catch (error) {
			setPasswordResetMessage(
				"An error occurred while trying to reset your password."
			);
		}
	};

	return (
		<div>
			<div className="content">
				{/* Display any password reset message */}
				{passwordResetMessage && (
					<Alert color="primary">{passwordResetMessage}</Alert>
				)}


				<form className="form" onSubmit={handleSubmit}>
					<div className="formTitle">Login</div>
					<div className="errorMessage">
						{errorDetails.ErrorMessage && (
							<div>{errorDetails.ErrorMessage}</div>
						)}
						{errorDetails.ErrorEmail && <div>{errorDetails.ErrorEmail}</div>}
					</div>
					<div className="inputFields">
						<i className="fas fa-envelope icon"></i>
						<input
							type="email"
							name="email"
							placeholder="Email"
							value={userData.email}
							onChange={handleInputChange}
							required
						/>
					</div>
					<div className="errorMessage">
						{errorDetails.ErrorPassword && (
							<div>{errorDetails.ErrorPassword}</div>
						)}
					</div>
					<div className="inputFields">
						<i className="fas fa-lock icon"></i>
						<input
							type={passwordVisible ? "text" : "password"} // Toggle between text and password
							name="password"
							placeholder="Password"
							value={userData.password}
							onChange={handleInputChange}
							required
						/>
						<i
							className={passwordVisible ? "fas fa-eye-slash" : "fas fa-eye"}
							onClick={togglePasswordVisibility} // Add icon to toggle visibility
							style={{ cursor: "pointer", marginLeft: "10px" }} // Cursor pointer to indicate it's clickable
						></i>
					</div>
					<button type="submit" className="loginButton">
						Login
					</button>
					<a
						className="forgotPassword"
						href="#"
						onClick={forgotPasswordModalToggle}
					>
						Forgot password
					</a>
				</form>

				<Modal
					isOpen={ForgotPasswordModal}
					toggle={forgotPasswordModalToggle}
					fullscreen
				>
					<ModalBody>
						<div className="generalForm">
							<Form>
								<FormGroup>
									<Label for="Email">Email</Label>
									<Input
										id="Email"
										name="email"
										value={forgotPasswordEmail}
										onChange={handleForgotPasswordChange}
										type="email"
										required
									/>
								</FormGroup>
								<div className="buttonGroup">
									<Button color="primary" onClick={handleForgotPassword}>
										Submit
									</Button>
									<Button color="secondary" onClick={forgotPasswordModalToggle}>
										Cancel
									</Button>
								</div>
							</Form>
						</div>
					</ModalBody>
				</Modal>
			</div>
		</div>
	);
}

export default Login;
