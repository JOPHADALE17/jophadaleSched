import { useEffect, useState } from "react";
import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
} from "react-router-dom";
import Login from "./pages/auth/login";
import TeacherHome from "./pages/teacher/TeacherHome";
import AdminHome from "./pages/admin/AdminHome";
import axios from "axios";


const API_URL = import.meta.env.VITE_apiUrl;

function App() {
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(true);
	const token = localStorage.getItem("accessToken");

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				if (token) {
					const userInfoUrl = `${API_URL}/auth/users/me/`;
					const headers = { Authorization: `JWT ${token}` };
					const userResponse = await axios.get(userInfoUrl, { headers });
					if (userResponse.status === 200) {
						setUserData(userResponse.data);
					} else {
						console.error("Error fetching user data:", userResponse.statusText);
						localStorage.removeItem("accessToken");
					}
				}
			} catch (error) {
				console.error("Error:", error);
				localStorage.removeItem("accessToken");
			} finally {
				setLoading(false);
			}
		};

		fetchUserData();
		// requestPermission();
	}, [token]);

	// onMessage(messaging, (payload) => {
	// 	toast(<Message notification={payload.notification} />);
	// });

	if (loading) return <div>Loading...</div>; // Handle loading state

	return (
		<Router>
			{/* <ToastContainer /> */}
			<Routes>
				{token ? (
					userData?.is_superuser ? (
						<Route path="/" element={<AdminHome />} />
					) : userData?.is_teacher ? (
						<Route path="/" element={<TeacherHome />} />
					) : (
						<Route path="*" element={<Navigate to="/" />} />
					)
				) : (
					<>
						<Route path="/" element={<Login />} />
						<Route path="*" element={<Navigate to="/" />} />
					</>
				)}
			</Routes>
		</Router>
	);
}

export default App;
