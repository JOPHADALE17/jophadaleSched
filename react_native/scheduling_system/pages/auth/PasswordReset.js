import React, { useState } from "react";
import {
	View,
	Text,
	StatusBar,
	TextInput,
	TouchableOpacity,
	Image,
	StyleSheet,
	ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.VITE_apiUrl;

export default function PasswordReset() {
	const navigation = useNavigation();
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

	const toggleShowCurrentPassword = () => {
		setShowCurrentPassword(!showCurrentPassword);
	};

	const toggleShowPassword = () => {
		setShowPassword(!showPassword);
	};

	const toggleShowRePassword = () => {
		setShowRePassword(!showRePassword);
	};

	const handleResetPassword = async () => {
		// Clear previous errors
		setErrorCurrentPassword(null);
		setErrorPassword(null);
		setErrorRePassword(null);
		setErrorFieldError(null);

		const userData = {
			current_password: currentPassword,
			new_password: password,
			re_new_password: rePassword,
		};

		try {
			// Get the JWT token from AsyncStorage
			const token = await AsyncStorage.getItem("accessToken");

			// Perform the API call using fetch
			const response = await fetch(`${API_URL}/auth/users/set_password/`, {
				method: "POST",
				headers: {
					Authorization: `JWT ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(userData),
			});

			if (response.ok) {
				// If the response is OK, inform the user and navigate back
				alert(`Your password has been changed.`);
				navigation.goBack();
			} else {
				// If there are errors, parse the error data
				const errorData = await response.json();

				// Set errors based on the response (only if they exist in errorData)
				if (errorData.current_password) {
					setErrorCurrentPassword(errorData.current_password[0]);
				}
				if (errorData.new_password) {
					setErrorPassword(errorData.new_password[0]);
				}
				if (errorData.re_new_password) {
					setErrorRePassword(errorData.re_new_password[0]);
				}
				if (errorData.non_field_errors) {
					setErrorFieldError(errorData.non_field_errors[0]);
				}
			}
		} catch (error) {
			console.error("Error:", error);
			alert("An error occurred. Please try again.");
		}
	};

	return (
		<ScrollView contentContainerStyle={styles.scrollContainer}>
			<View style={styles.container}>
				<StatusBar barStyle="light-content" />

				{/* Logo and Title */}
				<Image style={styles.logo} source={require("../../assets/logo.png")} />
				<Text style={styles.logoText}>
				Scheduling System
				</Text>

				<View style={styles.formContainer}>
					<Text style={styles.formTitle}>RESET PASSWORD</Text>

					{/* Current Password */}
					{errorFieldError && (
						<Text style={styles.errorMessage}>{errorFieldError}</Text>
					)}

					{errorCurrentPassword && (
						<Text style={styles.errorMessage}>{errorCurrentPassword}</Text>
					)}
					<View style={styles.inputContainer}>
						<TextInput
							style={styles.input}
							placeholder="Current Password"
							secureTextEntry={!showCurrentPassword}
							value={currentPassword}
							onChangeText={setCurrentPassword}
						/>
						<TouchableOpacity onPress={toggleShowCurrentPassword}>
							<Ionicons
								name={showCurrentPassword ? "eye-off" : "eye"}
								size={24}
								color="black"
							/>
						</TouchableOpacity>
					</View>

					{/* New Password */}
					{errorPassword && (
						<Text style={styles.errorMessage}>{errorPassword}</Text>
					)}
					<View style={styles.inputContainer}>
						<TextInput
							style={styles.input}
							placeholder="New Password"
							secureTextEntry={!showPassword}
							value={password}
							onChangeText={setPassword}
						/>
						<TouchableOpacity onPress={toggleShowPassword}>
							<Ionicons
								name={showPassword ? "eye-off" : "eye"}
								size={24}
								color="black"
							/>
						</TouchableOpacity>
					</View>

					{/* Confirm Password */}
					{errorRePassword && (
						<Text style={styles.errorMessage}>{errorRePassword}</Text>
					)}
					<View style={styles.inputContainer}>
						<TextInput
							style={styles.input}
							placeholder="Confirm Password"
							secureTextEntry={!showRePassword}
							value={rePassword}
							onChangeText={setRePassword}
						/>
						<TouchableOpacity onPress={toggleShowRePassword}>
							<Ionicons
								name={showRePassword ? "eye-off" : "eye"}
								size={24}
								color="black"
							/>
						</TouchableOpacity>
					</View>

					{/* Reset Button */}
					<TouchableOpacity
						style={styles.buttonContainer}
						onPress={handleResetPassword}
					>
						<Text style={styles.buttonText}>Reset</Text>
					</TouchableOpacity>

					{/* Cancel Button */}
					<TouchableOpacity
						style={styles.closeButton}
						onPress={() => navigation.goBack()}
					>
						<Text style={styles.closeButtonText}>Cancel</Text>
					</TouchableOpacity>
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	scrollContainer: {
		flexGrow: 1,
		justifyContent: "center",
		backgroundColor: "#027b94",
	},
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		top: "4%",
	},
	formContainer: {
		width: "100%", // Make sure it takes up most of the screen's widths
		backgroundColor: "white",
		borderTopLeftRadius: 50,
		borderTopRightRadius: 50,
		paddingTop: 10,
		paddingHorizontal: 20, // You can adjust this for internal padding if needed
		paddingBottom: 40, // Ensure space at the bottom
	},
	formTitle: {
		fontSize: 35,
		color: "black",
		letterSpacing: 2,
		marginBottom: 20,
		alignSelf: "center",
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		height: 50,
		marginBottom: 20,
		borderWidth: 1,
		borderColor: "#027b94",
		borderRadius: 20,
		paddingHorizontal: 9,
	},
	input: {
		flex: 1,
		marginLeft: 10,
	},
	buttonContainer: {
		backgroundColor: "#027b94",
		height: 50,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 20,
	},
	buttonText: {
		color: "white",
		fontSize: 18,
	},
	closeButton: {
		marginBottom: 15,
		alignItems: "center",
	},
	closeButtonText: {
		color: "#027b94",
		fontSize: 18,
	},
	logo: {
		width: 150,
		height: 200,
		resizeMode: "contain",
		marginBottom: 20,
	},
	logoText: {
		color: "yellow",
		paddingBottom: 25,
		fontSize: 24,
		fontWeight: "bold",
		marginTop: "0%",
		textAlign: "center", // Center align the text
	},
	errorMessage: {
		color: "red",
		fontSize: 10,
		marginBottom: 0.1,
		top: -5,
	},
});
