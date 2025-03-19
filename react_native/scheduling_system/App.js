import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Teacher from "./pages/teacher/teacher";
import Student from "./pages/student/student";
import LoginScreen from "./pages/auth/LoginScreen";
import Forgotpassword from "./pages/auth/Fotgotpassword";
import Constants from "expo-constants";
import AttendanceModalScreen from "./pages/student/attendance";
import Activities from "./pages/student/activities";
import Home from "./pages/Home";
import PasswordReset from "./pages/auth/PasswordReset";

const API_URL = Constants.expoConfig.extra.VITE_apiUrl;
const Stack = createStackNavigator();

export default function App() {
	return (
		<NavigationContainer>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				<Stack.Screen name="Home" component={Home} />
				<Stack.Screen name="Login" component={LoginScreen} />
				<Stack.Screen name="Forgot_password" component={Forgotpassword} />

				<Stack.Screen
					name="AttendanceModal"
					component={AttendanceModalScreen}
					options={{ presentation: "modal" }} // Display as modal
				/>
				<Stack.Screen
					name="ActivitiesModal"
					component={Activities}
					options={{ presentation: "modal" }} // Display as modal
				/>
				<Stack.Screen
					name="ResetPasswordModal"
					component={PasswordReset}
					options={{ presentation: "modal" }} // Display as modal
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
}
