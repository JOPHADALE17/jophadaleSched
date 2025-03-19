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

const Recital = ({ closeModal, classItem, userList, recitalList }) => {
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
	const [recitalToUpdate, setRecitalToUpdate] = useState(null);
	const [newRecital, setNewRecital] = useState("");
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
		setSelectedDate(normalizedDate); // Update selected date
	};

	// Open the update modal with recital details
	const openUpdateModal = (recital) => {
		setRecitalToUpdate(recital);
		setUpdateModalOpen(true);
	};

	// Handle recital creation or updating
	const handleRecitalChange = async (recital, about) => {
		const dateKey = selectedDate.toISOString().split("T")[0];

		const existingRecital = recitalList.find(
			(r) => r.id === recital.id && r.date === dateKey
		);

		if (existingRecital) {
			await updateRecital(existingRecital, about);
		} else {
			await createRecital(recital, about, dateKey);
		}
	};

	// Update recital data
	const updateRecital = async (existingRecital, about) => {
		try {
			const response = await fetch(
				`${API_URL}/classes/${existingRecital.id}/${classItem.id}/recitalUpdate`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `JWT ${localStorage.getItem("accessToken")}`,
					},
					body: JSON.stringify({
						student: existingRecital.student,
						classes: existingRecital.classes,
						date: existingRecital.date,
						about,
					}),
				}
			);

			if (!response.ok) {
				const data = await response.json();
				console.error("Failed to update recital:", data);
			}
		} catch (error) {
			console.error("Error updating recital", error);
		}
	};

	// Create new recital
	const createRecital = async (student, about, dateKey) => {
		try {
			const response = await fetch(
				`${API_URL}/classes/${classItem.id}/recital`,
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
				console.error("Failed to create recital", data);
			} else {
				const newRecital = await response.json();
				console.log("Recital created successfully", newRecital);
			}
		} catch (error) {
			console.error("Error creating recital", error);
		}
	};

	// Delete recital data
	const deleteRecital = async (recital) => {
		try {
			const response = await fetch(
				`${API_URL}/classes/${recital.id}/${classItem.id}/recitalDelete`,
				{
					method: "DELETE",
					headers: {
						Authorization: `JWT ${localStorage.getItem("accessToken")}`,
					},
				}
			);

			if (!response.ok) {
				const data = await response.json();
				console.error("Failed to delete recital:", data);
			} else {
				console.log("Recital deleted successfully");
			}
		} catch (error) {
			console.error("Error deleting recital", error);
		}
	};

	// Render recital list for the selected date
	const renderRecitalSheet = () => {
		const dateKey = selectedDate.toISOString().split("T")[0];

		// Filter recitals for the selected date
		const filteredRecitals = recitalList.filter(
			(recital) => recital.date === dateKey
		);

		return (
			<div className="teacher-sheet">
				<h3>Recital for {selectedDate.toDateString()}</h3>
				<table>
					<thead>
						<tr>
							<th>Recital Id</th>
							<th>About</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredRecitals.map((recital) => (
							<tr key={recital.id}>
								<td>{recital.id}</td>
								<td className="scrollable">{recital.about}</td>
								<td>
									<Button color="info" onClick={() => openUpdateModal(recital)}>
										<FaInfo />
									</Button>
									<Button color="danger" onClick={() => deleteRecital(recital)}>
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

	// Modal for updating recital
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
						handleRecitalChange(recitalToUpdate, recitalToUpdate.about);
						setUpdateModalOpen(false); // Close the modal after saving
					}}
				>
					<FormGroup>
						<Label for="recitalAbout">Recital About</Label>
						<Input
							type="text"
							id="recitalAbout"
							value={recitalToUpdate?.about || ""}
							onChange={(e) =>
								setRecitalToUpdate({
									...recitalToUpdate,
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

	// Create recital form below calendar
	const renderCreateRecitalForm = () => (
		<div className="create-recital-form">
			<h4>Create a New Recital</h4>
			<Form
				onSubmit={(e) => {
					e.preventDefault();
					createRecital(
						{ student: userList[0], about: newRecital },
						newRecital,
						selectedDate.toISOString().split("T")[0]
					);
				}}
			>
				<FormGroup>
					<Label for="newRecitalAbout">Recital About</Label>
					<Input
						type="text"
						id="newRecitalAbout"
						value={newRecital}
						onChange={(e) => setNewRecital(e.target.value)}
						placeholder="Enter recital topic"
					/>
				</FormGroup>
				<Button type="submit" color="success">
					Create Recital
				</Button>
			</Form>
		</div>
	);

	// Mark dates with recital data in the calendar
	const tileContent = ({ date, view }) => {
		if (view === "month") {
			const dateKey = normalizeDateToUTC(date).toISOString().split("T")[0]; // Normalize date for comparison

			const hasRecital = recitalList.some(
				(recital) => recital.date === dateKey
			);

			if (hasRecital) {
				return <div className="calendar-circle"></div>; // Custom styling for marking recital dates
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
					{renderCreateRecitalForm()}
				</div>
				{renderRecitalSheet()}
			</div>

			{renderUpdateModal()}
		</div>
	);
};

export default Recital;
