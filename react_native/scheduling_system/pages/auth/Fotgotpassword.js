import React, { useState } from "react";
import {
	View,
	Text,
	StatusBar,
	TextInput,
	TouchableOpacity,
	Image,
	StyleSheet,
	ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
const API_URL = Constants.expoConfig.extra.VITE_apiUrl;

export default function Forgotpassword({ navigation }) {
	const [email, setEmail] = useState("");

	const handleResetPassword = async () => {
		const userData = {
			email: email,
		};

		try {
			const response = await fetch(`${API_URL}/auth/users/reset_password/`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(userData),
			});

			if (response.ok) {
				alert(`Your verification link has been sent.`);
				navigation.navigate("Login");
			} else {
				console.error("Wrong password and email:", response.statusText);
			}
		} catch (error) {
			console.error("Error:", error);
		}
	};

	return (
		<LinearGradient colors={["#027b94", "#027b94"]} style={styles.container}>
			<View style={styles.gradient}>
				<Image style={styles.logo} source={require("../../assets/logo.png")} />
				<Text style={[styles.logoText, styles.headerText]}>Scheduling System</Text>
			</View>
			<View style={styles.formContainer}>
				<Text style={styles.formTitle}>Forgot Password</Text>
				<View style={styles.inputContainer}>
					<TextInput
						style={styles.input}
						placeholder="Enter your email"
						onChangeText={(text) => setEmail(text)}
					/>
				</View>
				<TouchableOpacity
					onPress={handleResetPassword}
					style={styles.loginButton}
				>
					<LinearGradient
						colors={["#027b94", "#027b94"]}
						style={styles.buttonGradient}
					>
						<Text style={styles.buttonText}>Send email verification</Text>
					</LinearGradient>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => navigation.navigate("Login")}
					style={styles.loginText}
				>
					<Text style={styles.loginText}>Back to Login</Text>
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
		height: 70,
		marginBottom: 20,
		borderWidth: 1,
		borderColor: "#027b94",
		borderRadius: 20,
		paddingHorizontal: 15,
	},
	input: {
		flex: 1,
		marginLeft: 10,
	},
	loginButton: {
		width: 250,
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
		fontSize: 18,
		color: "white",
		textAlign: "center",
	},
	loginText: {
		color: "#027b94",
		textAlign: "center",
		justifyContent: "center",
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
	headerText: {
		fontSize: 24,
		fontWeight: "bold",
	},
});
