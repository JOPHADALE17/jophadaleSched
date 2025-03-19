import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaTimes } from "react-icons/fa";
import { Button } from "reactstrap";

const Attendance = ({
	closeModal,
	studentList,
	classItem,
	userList,
	attendanceList,
}) => {
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [attendanceData, setAttendanceData] = useState({});
	const [filteredUser, setFilteredUser] = useState([]);
	const API_URL = import.meta.env.VITE_apiUrl;

	// Close the modal
	const handleModalClose = () => closeModal();

	// Disable future dates
	const disableFutureDates = (date) => date > new Date();

	// Normalize date to UTC
	const normalizeDateToUTC = (date) => {
		return new Date(
			Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
		);
	};

	// Handle date change and trigger filtering by selected date
	const onDateChange = (date) => {
		const normalizedDate = normalizeDateToUTC(date); // Normalize date
		setSelectedDate(normalizedDate); // Update selected date
	};

	// Mark dates with attendance data
	const tileContent = ({ date, view }) => {
		if (view === "month") {
			const dateKey = normalizeDateToUTC(date).toISOString().split("T")[0]; // Normalize date for comparison

			const hasAttendance = attendanceList.some((attendance) => {
				const isMatching = attendance.date === dateKey;
				console.log(
					`Checking date: ${dateKey}, Attendance date: ${attendance.date}, Match: ${isMatching}`
				);
				return isMatching;
			});

			if (hasAttendance) {
				console.log("Attendance found for date:", dateKey);
				return <div className="calendar-circle"></div>;
			} else {
				console.log("No attendance for date:", dateKey);
			}
		}
		return null;
	};

	// Filter users based on student list and attendance for the selected date
	useEffect(() => {
		const filterStudents = () => {
			const dateKey = normalizeDateToUTC(selectedDate)
				.toISOString()
				.split("T")[0]; // Normalize selected date

			const updatedUserDetails = userList
				.filter((user) =>
					studentList?.some((student) => student.user === user.id)
				)
				.map((user) => {
					const studentInfo = studentList.find(
						(student) => student.user === user.id
					);

					// Find the corresponding attendance record for this student on the selected date
					const attendanceInfo = attendanceList.find(
						(attendance) =>
							attendance.student === studentInfo.id &&
							attendance.date === dateKey
					);

					// Merge user details with student and attendance information
					return {
						...user,
						...studentInfo,
						attendance: attendanceInfo || {}, // Default to empty object if no attendance found
					};
				});

			setFilteredUser(updatedUserDetails); // Update the filtered user list
		};

		// Trigger filter on date change
		filterStudents();
	}, [studentList, userList, attendanceList, selectedDate]);

	// Handle attendance change: Create or update attendance
	const handleAttendanceChange = async (student, status) => {
		const dateKey = normalizeDateToUTC(selectedDate)
			.toISOString()
			.split("T")[0]; // Normalize selected date

		// Check if there's an existing attendance record for this student on the selected date
		const existingAttendance = attendanceList.find(
			(attendance) =>
				attendance.student === student.id && attendance.date === dateKey
		);

		if (existingAttendance) {
			// If attendance exists, update it
			await updateAttendance(existingAttendance, status);
		} else {
			// If no attendance exists, create a new one
			await createAttendance(student, status, dateKey);
		}

		// Update local attendance state
		setAttendanceData((prevData) => ({
			...prevData,
			[dateKey]: { ...prevData[dateKey], [student.id]: status },
		}));
	};

	// Function to update existing attendance
	const updateAttendance = async (existingAttendance, status) => {
		try {
			const response = await fetch(
				`${API_URL}/classes/${existingAttendance.id}/${classItem.id}/attendanceUpdate`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `JWT ${localStorage.getItem("accessToken")}`,
					},
					body: JSON.stringify({
						student: existingAttendance.student,
						classes: existingAttendance.classes,
						date: existingAttendance.date,
						present: status === "Present",
						absent: status === "Absent",
						late: status === "Late",
					}),
				}
			);

			if (!response.ok) {
				const data = await response.json();
				console.error("Failed to update attendance:", data);
			} else {
				console.log("Attendance updated successfully");
			}
		} catch (error) {
			console.error("Error updating attendance:", error);
		}
	};

	// Function to create new attendance
	const createAttendance = async (student, status, dateKey) => {
		try {
			const response = await fetch(
				`${API_URL}/classes/${classItem.id}/attendanceCreate`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `JWT ${localStorage.getItem("accessToken")}`,
					},
					body: JSON.stringify({
						student: student.id,
						classes: classItem.id,
						date: dateKey,
						present: status === "Present",
						absent: status === "Absent",
						late: status === "Late",
					}),
				}
			);

			if (!response.ok) {
				const data = await response.json();
				console.error("Failed to create attendance", data);
			} else {
				console.log("Attendance created successfully");
			}
		} catch (error) {
			console.error("Error creating attendance", error);
		}
	};

	// Render attendance sheet for the selected date
	const renderAttendanceSheet = () => {
		const dateKey = normalizeDateToUTC(selectedDate)
			.toISOString()
			.split("T")[0]; // Normalize selected date

		return (
			<div className="teacher-sheet">
				<h3>Attendance for {selectedDate.toDateString()}</h3>
				<table>
					<thead>
						<tr>
							<th>Student</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{filteredUser.map((student) => (
							<tr key={student.id}>
								<td
									className={`scrollable ${
										student.attendance?.late
											? "late"
											: student.attendance?.absent
											? "absent"
											: student.attendance?.present
											? "present"
											: ""
									}`}
								>
									{student.first_name} {student.last_name}
								</td>
								<td>
									<select
										value={attendanceData[dateKey]?.[student.id] || ""}
										onChange={(e) =>
											handleAttendanceChange(student, e.target.value)
										}
									>
										<option value="">Select</option>
										<option value="Present">Present</option>
										<option value="Absent">Absent</option>
										<option value="Late">Late</option>
									</select>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	};

	return (
		<div className="teacher-container">
			<div className="modal-header-teacher">
				<h2>
					{classItem?.course}-{classItem?.subject}-{classItem?.section}-{" "}
					{
						["1st year", "2nd year", "3rd year", "4th year"][
							(classItem?.year_level || 1) - 1
						]
					}
				</h2>
				<Button color="danger" onClick={handleModalClose}>
					<FaTimes />
				</Button>
			</div>

			<div className="calendar-list">
				<div className="calendar">
					<Calendar
						onChange={onDateChange}
						value={selectedDate}
						tileDisabled={({ date }) => disableFutureDates(date)}
						tileContent={tileContent}
					/>
					<h2>Color Presentation</h2>
					<div className="color-presentation">
						<div className="pair">
							<div className="present square"></div>
							<div>Present</div>
						</div>
						<div className="pair">
							<div className="late square"></div>
							<div>Late</div>
						</div>
						<div className="pair">
							<div className="absent square"></div>
							<div>Absent</div>
						</div>
					</div>
				</div>
				{renderAttendanceSheet()}
			</div>
		</div>
	);
};

export default Attendance;
