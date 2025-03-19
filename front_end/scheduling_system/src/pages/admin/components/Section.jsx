import React, { useState, useEffect } from "react";
import { FaPlus, FaInfo, FaTrash } from "react-icons/fa";
import {
	Button,
	Modal,
	ModalBody,
	Form,
	FormGroup,
	Label,
	Input,
	Card,
	CardBody,
} from "reactstrap";
const API_URL = import.meta.env.VITE_apiUrl;

const Section = ({ sectionDetails, studentDetails, classesDetails }) => {
	const [sectionModal, setSectionModal] = useState(false);
	const [updateModal, setUpdateModal] = useState(false);
	const [deleteModal, setDeleteModal] = useState(false);
	const [sectionData, setSectionData] = useState({ name: "" });
	const [sectionList, setSectionList] = useState([]);
	const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
	const [selectedSection, setSelectedSection] = useState(null);

	const updateModalToggle = () => setUpdateModal(!updateModal);
	const deleteModalToggle = () => setDeleteModal(!deleteModal);

	const sectionModelToggle = () => {
		setSectionModal(!sectionModal);
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setSectionData({ ...sectionData, [name]: value });
	};

	const handleAddSection = async () => {
		const response = await fetch(`${API_URL}/classes/sectionCreate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `JWT ${localStorage.getItem("accessToken")}`,
			},
			body: JSON.stringify(sectionData),
		});

		if (response.ok) {
			const newSection = await response.json();
			setSectionList([...sectionList, newSection]);
			setSectionModal(false);
		}
	};

	// Open update modal with selected section data and position it relative to the button
	const openUpdateModal = (section, e) => {
		setSelectedSection(section);
		setSectionData({ name: section.name }); // Prefill input field with section name

		// Get button position and size
		const buttonRect = e.target.getBoundingClientRect();

		// Calculate modal position based on button's position
		setModalPosition({
			top: buttonRect.top + window.scrollY + 5, // Adjust offset here
			left: buttonRect.left + window.scrollX - 100, // Adjust offset here
		});

		setUpdateModal(true);
	};

	const openDeleteModal = (section, e) => {
		setSelectedSection(section);

		// Get button position and size
		const buttonRect = e.target.getBoundingClientRect();

		// Calculate modal position based on button's position
		setModalPosition({
			top: buttonRect.top + window.scrollY + 5, // Adjust offset here
			left: buttonRect.left + window.scrollX - 150, // Adjust offset here
		});

		setDeleteModal(true);
	};

	// Handle updating a section
	const handleUpdateSection = async () => {
		const response = await fetch(
			`${API_URL}/classes/${selectedSection.id}/sectionUpdate`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `JWT ${localStorage.getItem("accessToken")}`,
				},
				body: JSON.stringify(sectionData),
			}
		);

		if (response.ok) {
			setUpdateModal(false);
			// window.location.reload();
		}
	};

	const handleDeleteSection = async () => {
		const isReferencedInStudents =
			studentDetails.Student &&
			studentDetails.Student.map((student) => {
				return student.section === selectedSection.id;
			});
		const isReferencedInClasses =
			classesDetails.Classes &&
			classesDetails.Classes.map((classes) => {
				return classes.section === selectedSection.id;
			});

		if (isReferencedInStudents[0] || isReferencedInClasses[0]) {
			// If the course is referenced, show an error message and do not delete
			alert(
				"Cannot delete this section. It is referenced in student or class records."
			);
			return; // Stop the deletion process
		} else {
			const response = await fetch(
				`${API_URL}/classes/${selectedSection.id}/sectionDelete`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
						Authorization: `JWT ${localStorage.getItem("accessToken")}`,
					},
				}
			);
			if (response.ok) {
				setDeleteModal(false);
				// window.location.reload();
			}
		}
	};

	return (
		<Card className="cardtable">
			<CardBody>
				<Modal isOpen={sectionModal} toggle={sectionModelToggle} fullscreen>
					<ModalBody>
						<div className="generalForm">
							<Form>
								<FormGroup>
									<Label for="SectionName">Section Name</Label>
									<Input
										id="SectionName"
										name="name"
										value={sectionData.name}
										onChange={handleInputChange} // Added onChange
									/>
								</FormGroup>
								<div className="buttonGroup">
									<Button color="primary" onClick={handleAddSection}>
										Submit
									</Button>
									<Button color="secondary" onClick={sectionModelToggle}>
										Cancel
									</Button>
								</div>
							</Form>
						</div>
					</ModalBody>
				</Modal>

				<Modal
					isOpen={updateModal}
					backdrop={false}
					toggle={updateModalToggle}
					style={{
						position: "relative",
						top: `${modalPosition.top}px`,
					}} // Use dynamic position
					className="updateModalparent"
				>
					<ModalBody className="updateModal">
						<div>
							<Form>
								<FormGroup>
									<Label for="updateSectionName">Update Section Name</Label>
									<Input
										id="updateSectionName"
										name="name"
										value={sectionData.name}
										onChange={handleInputChange}
									/>
								</FormGroup>
								<div className="buttonGroup">
									<Button color="primary" onClick={handleUpdateSection}>
										Update
									</Button>
									<Button color="secondary" onClick={updateModalToggle}>
										Cancel
									</Button>
								</div>
							</Form>
						</div>
					</ModalBody>
				</Modal>

				<Modal
					isOpen={deleteModal}
					backdrop={false}
					toggle={deleteModalToggle}
					style={{
						position: "relative",
						top: `${modalPosition.top}px`,
					}} // Use dynamic position
					className="updateModalparent"
				>
					<ModalBody className="updateModal">
						<div>
							<Form>
								<FormGroup>
									<Label for="deleteSectionName">
										Delete Section:
										{selectedSection && selectedSection.name
											? selectedSection.name
											: "N/A"}
									</Label>
								</FormGroup>
								<div className="buttonGroup">
									<Button color="danger" onClick={handleDeleteSection}>
										Delete
									</Button>
									<Button color="secondary" onClick={deleteModalToggle}>
										Cancel
									</Button>
								</div>
							</Form>
						</div>
					</ModalBody>
				</Modal>

				<table>
					<thead>
						<tr>
							<th className="thbutton" colSpan={2}>
								<Button className="addbutton" onClick={sectionModelToggle}>
									<FaPlus /> <span>Section</span>
								</Button>
							</th>
						</tr>
					</thead>
					<thead>
						<tr>
							<th>Name</th>
						</tr>
					</thead>
					<tbody>
						{sectionDetails.Sections ? (
							sectionDetails.Sections.map((section) => (
								<tr key={section.id}>
									<td>{section.name}</td>
									<td className="tdButton">
										<Button
											color="primary"
											onClick={(e) => openUpdateModal(section, e)} // Changed from course to section
										>
											<FaInfo className="updateButton" />
										</Button>
										<Button
											color="danger"
											onClick={(e) => openDeleteModal(section, e)} // Changed from course to section
										>
											<FaTrash className="deleteButton" />
										</Button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={2}>No sections found</td>
							</tr>
						)}
					</tbody>
				</table>
			</CardBody>
		</Card>
	);
};

export default Section;
