import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaInfo, FaTimes, FaTrash } from "react-icons/fa";
import {
	Button,
	Modal,
	ModalBody,
	Form,
	FormGroup,
	Input,
	Label,
} from "reactstrap";

const Report = ({ closeModal, classItem, userList, reportList }) => {
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
	const [reportToUpdate, setReportToUpdate] = useState(null);
	const [newReport, setNewReport] = useState("");
	const API_URL = import.meta.env.VITE_apiUrl;

	// Close the main modal
	const handleModalClose = () => closeModal();

	// Normalize date to UTC to avoid date being off by a day
	const normalizeDateToUTC = (date) => {
		return new Date(
			Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
		);
	};

	// Handle date change
	const onDateChange = (date) => {
		const normalizedDate = normalizeDateToUTC(date); // Normalize date
		setSelectedDate(normalizedDate);
	};

	// Open the update modal with report details
	const openUpdateModal = (report) => {
		setReportToUpdate(report);
		setUpdateModalOpen(true);
	};

	// Handle report creation or updating
	const handleReportChange = async (report, about) => {
		const dateKey = selectedDate.toISOString().split("T")[0];

		const existingReport = reportList.find(
			(r) => r.id === report.id && r.date === dateKey
		);

		if (existingReport) {
			await updateReport(existingReport, about);
		} else {
			await createReport(report, about, dateKey);
		}
	};

	// Update report data
	const updateReport = async (existingReport, about) => {
		try {
			const response = await fetch(
				`${API_URL}/classes/${existingReport.id}/${classItem.id}/reportUpdate`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `JWT ${localStorage.getItem("accessToken")}`,
					},
					body: JSON.stringify({
						student: existingReport.student,
						classes: existingReport.classes,
						date: existingReport.date,
						about,
					}),
				}
			);

			if (!response.ok) {
				const data = await response.json();
				console.error("Failed to update report:", data);
			}
		} catch (error) {
			console.error("Error updating report", error);
		}
	};

	// Create new report
	const createReport = async (student, about, dateKey) => {
		try {
			const response = await fetch(
				`${API_URL}/classes/${classItem.id}/report`,
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
						about,
					}),
				}
			);

			if (!response.ok) {
				const data = await response.json();
				console.error("Failed to create report", data);
			} else {
				const newReport = await response.json();
				console.log("Report created successfully", newReport);
			}
		} catch (error) {
			console.error("Error creating report", error);
		}
	};

	// Delete report data
	const deleteReport = async (report) => {
		try {
			const response = await fetch(
				`${API_URL}/classes/${report.id}/${classItem.id}/reportDelete`,
				{
					method: "DELETE",
					headers: {
						Authorization: `JWT ${localStorage.getItem("accessToken")}`,
					},
				}
			);

			if (!response.ok) {
				const data = await response.json();
				console.error("Failed to delete report:", data);
			} else {
				console.log("Report deleted successfully");
			}
		} catch (error) {
			console.error("Error deleting report", error);
		}
	};

	// Render report list for the selected date
	const renderReportSheet = () => {
		const dateKey = selectedDate.toISOString().split("T")[0];

		// Filter reports for the selected date
		const filteredReports = reportList.filter(
			(report) => report.date === dateKey
		);

		return (
			<div className="teacher-sheet">
				<h3>Report for {selectedDate.toDateString()}</h3>
				<table>
					<thead>
						<tr>
							<th>Report Id</th>
							<th>About</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredReports.map((report) => (
							<tr key={report.id}>
								<td>{report.id}</td>
								<td className="scrollable">{report.about}</td>
								<td>
									<Button color="info" onClick={() => openUpdateModal(report)}>
										<FaInfo />
									</Button>
									<Button color="danger" onClick={() => deleteReport(report)}>
										<FaTrash />
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	};

	// Modal for updating report
	const renderUpdateModal = () => (
		<Modal
			isOpen={isUpdateModalOpen}
			toggle={() => setUpdateModalOpen(!isUpdateModalOpen)}
			centered
			className="updateModalparent"
		>
			<ModalBody className="updateModal">
				<Form
					onSubmit={(e) => {
						e.preventDefault();
						handleReportChange(reportToUpdate, reportToUpdate.about);
						setUpdateModalOpen(false); // Close the modal after saving
					}}
				>
					<FormGroup>
						<Label for="reportAbout">Report About</Label>
						<Input
							type="text"
							id="reportAbout"
							value={reportToUpdate?.about || ""}
							onChange={(e) =>
								setReportToUpdate({
									...reportToUpdate,
									about: e.target.value,
								})
							}
						/>
					</FormGroup>
					<Button type="submit" color="primary">
						Save
					</Button>
				</Form>
			</ModalBody>
		</Modal>
	);

	// Create report form below calendar
	const renderCreateReportForm = () => (
		<div className="create-report-form">
			<h4>Create a New Report</h4>
			<Form
				onSubmit={(e) => {
					e.preventDefault();
					createReport(
						{ student: userList[0], about: newReport },
						newReport,
						selectedDate.toISOString().split("T")[0]
					);
				}}
			>
				<FormGroup>
					<Label for="newReportAbout">Report About</Label>
					<Input
						type="text"
						id="newReportAbout"
						value={newReport}
						onChange={(e) => setNewReport(e.target.value)}
						placeholder="Enter report topic"
					/>
				</FormGroup>
				<Button type="submit" color="success">
					Create Report
				</Button>
			</Form>
		</div>
	);

	// Mark dates with report data in the calendar
	const tileContent = ({ date, view }) => {
		if (view === "month") {
			const dateKey = normalizeDateToUTC(date).toISOString().split("T")[0]; // Normalize date for comparison

			const hasReport = reportList.some((report) => report.date === dateKey);

			if (hasReport) {
				return <div className="calendar-circle"></div>; // Custom styling for marking report dates
			}
		}
		return null;
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
						tileContent={tileContent}
					/>
					{renderCreateReportForm()}
				</div>
				{renderReportSheet()}
			</div>

			{renderUpdateModal()}
		</div>
	);
};

export default Report;
