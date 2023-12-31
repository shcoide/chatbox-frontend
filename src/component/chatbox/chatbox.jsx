import React, { useState, useEffect, useRef } from 'react';
import './chatbox.css';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const messageIdRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [initialQuestionsFetched, setInitialQuestionsFetched] = useState(false);

  const fetchInitialQuestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/questions');
      const initialQuestions = await response.json();
      setMessages(initialQuestions.map((question) => ({ ...question, sender: 'user' })));
      setInitialQuestionsFetched(true); // Set the state to true after fetching initial questions
    } catch (error) {
      console.error('Error fetching initial questions:', error);
    }
  };

  useEffect(() => {
    fetchInitialQuestions();
  }, []);
  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/files');
      const fetchedFiles = await response.json();
      setFiles(fetchedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  useEffect(() => {
    // Fetch files only after the initial questions have been fetched
    if (initialQuestionsFetched) {
      fetchFiles();
    }
  }, [initialQuestionsFetched]);
  const handleInputChange = (e) => {
    setCurrentMessage(e.target.value);
  };

  const cleanupOnUnload = async () => {
    try {
      await fetch('http://localhost:5000/api/clearData', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: '123' }),
      });
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  useEffect(() => {
    window.addEventListener('unload', cleanupOnUnload);

    return () => {
      window.removeEventListener('unload', cleanupOnUnload);
    };
  }, []);

  const handleSendMessage = async () => {
    if (currentMessage.trim() !== '') {
      setLoading(true);

      try {
        const response = await fetch('http://localhost:5000/api/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: currentMessage }),
        });

        if (!response.ok) {
          throw new Error('Failed to send the question to the backend.');
        }

        await response.json();
        fetchInitialQuestions();
        fetchFiles();
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setLoading(false);
        setCurrentMessage('');
      }
    }
  };
  const renderFile = (file) => {
    // Determine the file type based on the MIME type
    const fileType = file.type.split('/')[0];

    if (fileType === 'image') {
      // Render image
      return <img key={file._id} src={file.dataURL} alt={file.filename} />;
    } else if (fileType === 'text') {
      // Render text file
      return (
        <div key={file._id}>
          <h3>{file.filename}</h3>
          <pre>{file.dataURL}</pre>
        </div>
      );
    } else if (fileType === 'application' && file.type === 'application/pdf') {
      // Render PDF file
      return (
        <div key={file._id}>
          <h3>{file.filename}</h3>
          <iframe
            src={file.dataURL}
            title={file.filename}
            width="100%"
            height="500px"
            style={{ border: 'none' }}
          />
        </div>
      );
    } else {
      // Handle other file types as needed
      return <p key={file._id}>Unsupported file type: {file.filename}</p>;
    }
  };
  const handleEditMessage = (index) => {
    setCurrentMessage(messages[index].text);
    setEditingIndex(index);
    const messageId = messages[index]._id;
    console.log(messageId);
    messageIdRef.current = messageId;
    setEditMode(true); // Set edit mode to true
  };

  const handleUpdateMessage = async () => {
    if (currentMessage.trim() !== '') {
      setLoading(true);

      try {
        const response = await fetch(`http://localhost:5000/api/questions/update/${messageIdRef.current}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: currentMessage }),
        });

        if (!response.ok) {
          throw new Error('Failed to update the question in the backend.');
        }

        await response.json();
        fetchInitialQuestions();
      } catch (error) {
        console.error('Error updating message:', error);
      } finally {
        setLoading(false);
        setCurrentMessage('');
        messageIdRef.current = null;
        setEditingIndex(null); // Reset editingIndex
        setEditMode(false); // Set edit mode to false after updating
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (editMode) {
        handleUpdateMessage();
      } else {
        handleSendMessage();
      }
    }
  };

  const messageStyles = (sender) => (sender === 'user' ? 'user-message' : 'bot-message');

  return (
    <div className="chat-box">
      <div className="message-list">
        
        {files.map((file) => renderFile(file))}
        <br />
        {messages.map((message, index) => (
          <div key={index} className={messageStyles(message.sender)}>
            {message.text}
            {message.sender === 'user' && (
              <div>
                <button onClick={() => handleEditMessage(index)} className="button-styles">
                  Edit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          placeholder="Type a question..."
          value={currentMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="input-styles"
        />
        {editMode ? ( // Use editMode state to determine button label
          <button onClick={handleUpdateMessage} className={`button-styles update ${loading ? 'loading-indicator' : ''}`}>
            {loading ? 'Updating...' : 'Update'}

          </button>
        ) : (
          <button onClick={handleSendMessage} className={`button-styles ${loading ? 'loading-indicator' : ''}`}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
