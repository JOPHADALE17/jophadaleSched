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

const Subject = ({ subjectDetails, classesDetails }) => {
  const [subjectModal, setSubjectModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [subjectData, setSubjectData] = useState({ name: "" });
  const [subjectList, setSubjectList] = useState([]);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [selectedSubject, setSelectedSubject] = useState(null);

  const updateModalToggle = () => setUpdateModal(!updateModal);
  const deleteModalToggle = () => setDeleteModal(!deleteModal);

  const subjectModalToggle = () => {
    setSubjectModal(!subjectModal);
  };

  useEffect(() => {
      console.log(subjectDetails, "asdfasdfasdfasdf");
  }, [subjectDetails])

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSubjectData({ ...subjectData, [name]: value });
  };

  const handleAddSubject = async () => {
    const response = await fetch(`${API_URL}/classes/subjectCreate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify(subjectData),
    });

    if (response.ok) {
      const newSubject = await response.json();
      setSubjectList([...subjectList, newSubject]);
      setSubjectModal(false);
    }
  };

  // Open update modal with selected section data and position it relative to the button
  const openUpdateModal = (section, e) => {
    setSelectedSubject(section);
    setSubjectData({ name: section.name }); // Prefill input field with section name

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
    setSelectedSubject(section);

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
  const handleUpdateSubject = async () => {
    const response = await fetch(
      `${API_URL}/classes/${selectedSubject.id}/subjectUpdate`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(subjectData),
      }
    );

    if (response.ok) {
      setUpdateModal(false);
      // window.location.reload();
    }
  };

  const handleDeleteSubject = async () => {
    const isReferencedInClasses =
      classesDetails.Classes &&
      classesDetails.Classes.map((classes) => {
        return classes.subject === selectedSubject.id;
      });

    if (isReferencedInClasses[0]) {
      // If the course is referenced, show an error message and do not delete
      alert("Cannot delete this Subejct. It is referenced in class records.");
      return; // Stop the deletion process
    } else {
      const response = await fetch(
        `${API_URL}/classes/${selectedSubject.id}/subjectDelete`,
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
        <Modal isOpen={subjectModal} toggle={subjectModalToggle} fullscreen>
          <ModalBody>
            <div className="generalForm">
              <Form>
                <FormGroup>
                  <Label for="subjectName">Subject Name</Label>
                  <Input
                    id="subjectName"
                    name="name"
                    value={subjectData.name}
                    onChange={handleInputChange} // Added this line to capture typing events
                  />
                </FormGroup>
                <div className="buttonGroup">
                  <Button color="primary" onClick={handleAddSubject}>
                    Submit
                  </Button>
                  <Button color="secondary" onClick={subjectModalToggle}>
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
            // left: `${modalPosition.left}px`,
          }} // Use dynamic position
          className="updateModalparent"
        >
          <ModalBody className="updateModal">
            <div>
              <Form>
                <FormGroup>
                  <Label for="updateCourseName">Update Subject Name</Label>
                  <Input
                    id="updateCourseName"
                    name="name"
                    value={subjectData.name}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <div className="buttonGroup">
                  <Button color="primary" onClick={handleUpdateSubject}>
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
                  <Label for="updateCourseName">
                    Delete Course:
                    {selectedSubject && selectedSubject.name
                      ? selectedSubject.name
                      : "N/A"}
                  </Label>
                </FormGroup>
                <div className="buttonGroup">
                  <Button color="danger" onClick={handleDeleteSubject}>
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
              <th className="thbutton">
                <Button className="addbutton" onClick={subjectModalToggle}>
                  <FaPlus /> <span>Subject</span>
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
            {subjectDetails.Subjects ? (
              subjectDetails.Subjects.map((subject) => (
                <tr key={subject.id}>
                  <td>{subject.name}</td>
                  <td className="tdButton">
                    <Button
                      color="primary"
                      onClick={(e) => openUpdateModal(subject, e)} // Changed from course to section
                    >
                      <FaInfo className="updateButton" />
                    </Button>
                    <Button
                      color="danger"
                      onClick={(e) => openDeleteModal(subject, e)} // Changed from course to section
                    >
                      <FaTrash className="deleteButton" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td>No subjects found</td>
              </tr>
            )}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
};

export default Subject;
