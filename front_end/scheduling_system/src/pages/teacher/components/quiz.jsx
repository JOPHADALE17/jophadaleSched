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

const Quiz = ({ closeModal, classItem, userList, quizList }) => {
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
	const [quizToUpdate, setQuizToUpdate] = useState(null);
	const [newQuiz, setNewQuiz] = useState("");
	const API_URL = import.meta.env.VITE_apiUrl;

	// Close the main modal
	const handleModalClose = () => closeModal();

	// Normalize date to UTC
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

	// Open the update modal with quiz details
	const openUpdateModal = (quiz) => {
		setQuizToUpdate(quiz);
		setUpdateModalOpen(true);
	};

	// Handle quiz creation or updating
	const handleQuizChange = async (quiz, about) => {
		const dateKey = selectedDate.toISOString().split("T")[0];

		const existingQuiz = quizList.find(
			(q) => q.id === quiz.id && q.date === dateKey
		);

		if (existingQuiz) {
			await updateQuiz(existingQuiz, about);
		} else {
			await createQuiz(quiz, about, dateKey);
		}
	};

	// Update quiz data
	const updateQuiz = async (existingQuiz, about) => {
		try {
			const response = await fetch(
				`${API_URL}/classes/${existingQuiz.id}/${classItem.id}/quizUpdate`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `JWT ${localStorage.getItem("accessToken")}`,
					},
					body: JSON.stringify({
						student: existingQuiz.student,
						classes: existingQuiz.classes,
						date: existingQuiz.date,
						about,
					}),
				}
			);

			if (!response.ok) {
				const data = await response.json();
				console.error("Failed to update quiz:", data);
			}
		} catch (error) {
			console.error("Error updating quiz", error);
		}
	};

	// Create new quiz
	const createQuiz = async (student, about, dateKey) => {
		try {
			const response = await fetch(`${API_URL}/classes/${classItem.id}/quiz`, {
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
			});

			if (!response.ok) {
				const data = await response.json();
				console.error("Failed to create quiz", data);
			} else {
				const newQuiz = await response.json();
				console.log("Quiz created successfully", newQuiz);
			}
		} catch (error) {
			console.error("Error creating quiz", error);
		}
	};

	// Delete quiz data
	const deleteQuiz = async (quiz) => {
		try {
			const response = await fetch(
				`${API_URL}/classes/${quiz.id}/${classItem.id}/quizDelete`,
				{
					method: "DELETE",
					headers: {
						Authorization: `JWT ${localStorage.getItem("accessToken")}`,
					},
				}
			);

			if (!response.ok) {
				const data = await response.json();
				console.error("Failed to delete quiz:", data);
			} else {
				console.log("Quiz deleted successfully");
			}
		} catch (error) {
			console.error("Error deleting quiz", error);
		}
	};

	// Render quiz list for the selected date
	const renderQuizSheet = () => {
		const dateKey = selectedDate.toISOString().split("T")[0];

		// Filter quizzes for the selected date
		const filteredQuizzes = quizList.filter((quiz) => quiz.date === dateKey);

		return (
			<div className="teacher-sheet">
				<h3>Quiz for {selectedDate.toDateString()}</h3>
				<table>
					<thead>
						<tr>
							<th>Quiz Id</th>
							<th>About</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredQuizzes.map((quiz) => (
							<tr key={quiz.id}>
								<td>{quiz.id}</td>

								<td className="scrollable">{quiz.about}</td>
								<td>
									<Button color="info" onClick={() => openUpdateModal(quiz)}>
										<FaInfo />
									</Button>
									<Button color="danger" onClick={() => deleteQuiz(quiz)}>
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

	// Modal for updating quiz
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
						handleQuizChange(quizToUpdate, quizToUpdate.about);
						setUpdateModalOpen(false); // Close the modal after saving
					}}
				>
					<FormGroup>
						<Label for="quizAbout">Quiz About</Label>
						<Input
							type="text"
							id="quizAbout"
							value={quizToUpdate?.about || ""}
							onChange={(e) =>
								setQuizToUpdate({ ...quizToUpdate, about: e.target.value })
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

	// Create quiz form below calendar
	const renderCreateQuizForm = () => (
		<div className="create-quiz-form">
			<h4>Create a New Quiz</h4>
			<Form
				onSubmit={(e) => {
					e.preventDefault();
					createQuiz(
						{ student: userList[0], about: newQuiz },
						newQuiz,
						selectedDate.toISOString().split("T")[0]
					);
				}}
			>
				<FormGroup>
					<Label for="newQuizAbout">Quiz About</Label>
					<Input
						type="text"
						id="newQuizAbout"
						value={newQuiz}
						onChange={(e) => setNewQuiz(e.target.value)}
						placeholder="Enter quiz topic"
					/>
				</FormGroup>
				<Button type="submit" color="success">
					Create Quiz
				</Button>
			</Form>
		</div>
	);

	// Mark dates with quiz data in the calendar
	const tileContent = ({ date, view }) => {
		if (view === "month") {
			const dateKey = normalizeDateToUTC(date).toISOString().split("T")[0]; // Normalize date for comparison

			const hasQuiz = quizList.some((quiz) => quiz.date === dateKey);

			if (hasQuiz) {
				return <div className="calendar-circle"></div>; // Custom styling for marking quiz dates
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
						tileContent={tileContent} // Mark quiz dates
					/>
					{renderCreateQuizForm()}
				</div>
				{renderQuizSheet()}
			</div>

			{renderUpdateModal()}
		</div>
	);
};

export default Quiz;
