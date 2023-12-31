import React, { useState } from 'react';
import './dropbox.css';

const Dropbox = () => {
  const [file, setFile] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    const droppedFile = files[0];

    if (droppedFile) {
      if (
        droppedFile.type.startsWith('image/') ||
        droppedFile.type === 'application/pdf'
      ) {
        const reader = new FileReader();
        reader.onload = () => {
          setFile({
            dataURL: reader.result,
            type: droppedFile.type,
          });
        };
        reader.readAsDataURL(droppedFile);

        // Send the file to the backend using the /api/file endpoint
        const formData = new FormData();
        formData.append('file', droppedFile);
        formData.append('filename', droppedFile.name); // Add filename to the form data
        formData.append('type', droppedFile.type); // Add file type to the form data

        try {
          const response = await fetch('http://localhost:5000/api/file', {
            method: 'POST',
            body: formData,
          });
          if (!response.ok) {
            throw new Error('Failed to upload the file to the backend.');
          }
          // Handle the response if needed
        } catch (error) {
          console.error(error);
        }
      } else {
        alert('Please upload a valid image or PDF file.');
      }
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    handleFiles(files);
  };

  const handleCloseClick = () => {
    setFile(null);
  };

  const preventDefault = (e) => {
    e.preventDefault();
  };

  return (
    <div
      className="dropzone"
      onDrop={handleDrop}
      onDragOver={preventDefault}
      onDragEnter={preventDefault}
    >
      {file ? (
        <div className="dragzone-text">
          <div className="close-button" onClick={handleCloseClick}>
            &times;
          </div>
          {file.type.startsWith('image/') ? (
            <img src={file.dataURL} alt="Uploaded" className="image-holder" />
          ) : (
            <div className="pdf-holder">
              <iframe
                title="PDF Preview"
                src={file.dataURL}
                width="100%"
                height="100%"
              />
            </div>
          )}
        </div>
      ) : (
        <div
          className="dragzone-text"
          onClick={() =>
            document.querySelector('input[type="file"]').click()
          }
        >
          <p>Drag an image or PDF here</p>
          <p>Click to select one</p>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleInputChange}
            style={{ display: 'none' }}
          />
          <button>&#43;</button>
        </div>
      )}
    </div>
  );
};

export default Dropbox;
