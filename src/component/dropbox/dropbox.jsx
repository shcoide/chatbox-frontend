import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

import './dropbox.css';

const Dropbox = () => {
  const [file, setFile] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const cropperRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    const droppedFile = files[0];

    if (droppedFile) {
      if (droppedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          console.log('File data URL:', reader.result);
          // Reset cropper state when a new file is selected
          setFile({
            dataURL: reader.result,
            type: droppedFile.type,
          });
          setCroppedImage(null);
        };
        reader.readAsDataURL(droppedFile);
      } else {
        alert('Please upload a valid image or PDF file.');
      }
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    handleFiles(files);
    
  };

  const handleCloseClick =async () => {
    setFile(null);
    setCroppedImage(null);
    try {
      const response = await fetch('http://localhost:5000/api/clearData', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear data on the backend.');
      }

      const responseData = await response.json();
      console.log('Data cleared successfully:', responseData);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  const handleCropButtonClick = () => {
    if (cropperRef.current) {
      const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas();
  
      // Convert the cropped canvas data to a data URL
      const croppedImageDataURL = croppedCanvas.toDataURL('image/jpeg');
  
      // Update the state with the data URL of the cropped image
      setCroppedImage(croppedImageDataURL);
  
      // Now, send the cropped image to the backend
      sendCroppedImageToBackend(croppedImageDataURL);
    }
  };
  
  const sendCroppedImageToBackend = async (croppedImageDataURL) => {
    // Create a FormData object and append the data URL as a Blob
    const formData = new FormData();
    const blob = await fetch(croppedImageDataURL).then((res) => res.blob());
    formData.append('file', blob, 'croppedImage.jpg');
  
    // Send the formData to the backend
    try {
      const response = await fetch('http://localhost:5000/api/file', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Failed to send the cropped image to the backend.');
      }
  
      const responseData = await response.json();
      console.log('Cropped image sent successfully:', responseData);
    } catch (error) {
      console.error('Error sending cropped image:', error);
    }
  };
  
  
  const preventDefault = (e) => {
    e.preventDefault();
  };

  return (
    <div className="container">
      <div className="dropzone" onDrop={handleDrop} onDragOver={preventDefault} onDragEnter={preventDefault}>
        {file && !croppedImage && file.type.startsWith('image/') ? (
          <div className="crop-section">
            <div className="close-button" onClick={handleCloseClick}>
              &times;
            </div>
            <Cropper
              ref={cropperRef}
              src={file.dataURL}
              style={{ height: '90%', margin: 0, boxSizing: 'border-box' }}
              cropperOptions={{
                viewMode: 1,
              }}
            />

            <button onClick={handleCropButtonClick} className='dropbox-btn'>Crop Image</button>
          </div>
        ) : croppedImage ? (
          <div className='after-crop'>
            <div className="close-button" onClick={handleCloseClick}>
              &times;
            </div>
            <div className="cropped-box">
              <img src={croppedImage} alt="Cropped" />
            </div>
          </div>
        ) : (
          <div
            className="dragzone-text"
            onClick={() => document.querySelector('input[type="file"]').click()}
          >
            <p>Drag an image here</p>
            <p>Click to select one</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              style={{ display: 'none' }}
            />
            <button>&#43;</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropbox;
