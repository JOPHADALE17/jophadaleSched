import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Image,
	StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.VITE_apiUrl;

export default function LoginScreen({ navigation }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [errorEmail, setErrorEmail] = useState("");
	const [errorPassword, setErrorPassword] = useState("");

	const toggleShowPassword = () => {
		setShowPassword(!showPassword);
	};

	const handleLogin = async () => {
		const userData = {
			email: email.trim(),
			password: password.trim(),
		};

		try {
			const response = await fetch(`${API_URL}/auth/jwt/create/`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(userData),
			});

			if (response.ok) {
				const responseData = await response.json();
				const token = responseData.access;

				if (token) {
					// Save the token in AsyncStorage
					await AsyncStorage.setItem("accessToken", token);

					// Navigate to the Home screen after login
					navigation.reset({
						index: 0, // The index of the new route
						routes: [{ name: "Home" }], // The route you want to navigate to
					});
				}
			} else {
				const errorData = await response.json();
				setErrorMessage(errorData.detail || "Login failed. Please try again.");
				setErrorEmail(errorData.email || "");
				setErrorPassword(errorData.password || "");
			}
		} catch (error) {
			console.error("Error:", error);
			setErrorMessage(
				"An error occurred. Please check your network and try again."
			);
		}
	};

	return (
		<LinearGradient colors={["#027b94", "#027b94"]} style={styles.container}>
			<View style={styles.gradient}>
				<Image style={styles.logo} source={require("../../assets/logo.png")} />
				<Text style={[styles.logoText, styles.headerText]}>
					Scheduling System
				</Text>
			</View>
			<View style={styles.formContainer}>
				<Text style={styles.formTitle}>Login</Text>
				{errorMessage ? (
					<Text style={styles.errorMessage}>{errorMessage}</Text>
				) : null}
				<View style={styles.inputContainer}>
					<TextInput
						style={styles.input}
						placeholder="E-mail ..."
						onChangeText={(text) => setEmail(text)}
					/>
				</View>
				{errorEmail ? (
					<Text style={styles.errorMessage}>{errorEmail}</Text>
				) : null}

				<View style={styles.inputContainer}>
					<TextInput
						style={styles.input}
						placeholder="Password ..."
						secureTextEntry={!showPassword}
						value={password}
						onChangeText={setPassword}
					/>
					<TouchableOpacity
						style={styles.toggleButton}
						onPress={toggleShowPassword}
					>
						<Ionicons
							name={showPassword ? "eye-off" : "eye"}
							size={24}
							color="black"
						/>
					</TouchableOpacity>
				</View>
				{errorPassword ? (
					<Text style={styles.errorMessage}>{errorPassword}</Text>
				) : null}

				<TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
					<LinearGradient
						colors={["#027b94", "#027b94"]}
						style={styles.buttonGradient}
					>
						<Text style={styles.buttonText}>Login</Text>
					</LinearGradient>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={() => navigation.navigate("Forgot_password")}
					style={styles.loginText}
				>
					<Text style={[styles.loginText]}>Forgot Password</Text>
				</TouchableOpacity>
			</View>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	gradient: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	formContainer: {
		flex: 1,
		backgroundColor: "white",
		borderTopLeftRadius: 50,
		borderTopRightRadius: 50,
		paddingTop: 10,
		paddingHorizontal: 20,
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
	loginButton: {
		width: 200,
		height: 50,
		borderRadius: 20,
		overflow: "hidden",
		alignSelf: "center",
	},
	buttonGradient: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	buttonText: {
		fontSize: 30,
		color: "white",
	},
	socialText: {
		textAlign: "center",
		color: "black",
		fontSize: 15,
		marginTop: 10,
	},
	loginText: {
		color: "#027b94",
		textAlign: "center",
		justifyContent: "center",
		marginBottom: 15,
		letterSpacing: 2,
	},

	signupText: {
		color: "#027b94",
		textAlign: "center",
		justifyContent: "center",
		top: 15,
	},
	logo: {
		width: 150,
		height: 200,
		resizeMode: "contain",
		marginBottom: 20,
	},
	logoText: {
		color: "yellow",
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
	},
	errorMessage: {
		color: "red",
		fontSize: 10,
		marginBottom: 0.1,
		top: -5,
	},
});
