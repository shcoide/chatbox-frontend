// HomeDesign.jsx
import React, { useState } from 'react';
import Chatbox from '../component/chatbox/chatbox.jsx';
import Dropbox from '../component/dropbox/dropbox.jsx';
import './home.css';

const HomeDesign = () => {
  return (
    <div className="home-div">
      <Dropbox  />
      <Chatbox  />
    </div>
  );
};

export default HomeDesign;
