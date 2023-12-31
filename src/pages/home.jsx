import React from 'react';
import Chatbox from '../component/chatbox/chatbox.jsx';
import Dropbox from '../component/dropbox/dropbox.jsx';

const HomeDesign = () => {
  return (
    <div className="home-div">
      <Dropbox />
      <Chatbox />
    </div>
  );
};

export default HomeDesign;
