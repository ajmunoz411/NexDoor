import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { IconButton } from '@material-ui/core';
import SendTwoToneIcon from '@material-ui/icons/SendTwoTone';
import { DateTime } from 'luxon';
import Message from './Message';

const socket = io('http://localhost:3200');

const Chat = () => {
  const selectedTask = useSelector((store) => store.selectedTaskReducer.task);
  const taskId = selectedTask.task_id;
  if (taskId === undefined) {
    return <></>;
  }

  const user = useSelector((store) => store.currentUserReducer.userData);
  const userId = user.user_id;

  const url = 'http://localhost:3500';
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentTask, setCurrentTask] = useState(taskId);
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [messages, setMessages] = useState([]);

  const [currentUser, setCurrentUser] = useState(userId);

  const handleChange = (e) => {
    setCurrentMessage(e.target.value);
  };

  const resetInput = () => {
    setCurrentMessage('');
  };

  const formatTime = (time) => {
    let trail = 'AM';
    let hour = Number(time.substring(0, 2));
    const minutes = time.slice(2);

    if (hour >= 12) {
      hour -= 12;
      trail = 'PM';
    }

    return hour + minutes + ' ' + trail;
  };

  const handleSend = () => {
    const d = new Date();
    const dStr = d.toString();
    const currentDayOfMonth = d.getDate();
    const currentMonth = d.getMonth();
    const currentYear = d.getFullYear();
    const timeString = formatTime(dStr.slice(16, 21));
    const dateString = (currentMonth + 1) + "/" + currentDayOfMonth + "/" + currentYear;

    const message = {
      userId,
      firstname: firstName,
      lastname: lastName,
      message_body: currentMessage,
      date: dateString,
      time: timeString,
    };
    socket.emit('send-message', { task: currentTask, message });

    setMessages((prev) => [...prev, message]);

    const resetElements = document.getElementsByClassName('messageInput');
    for (let i = 0; i < resetElements.length; i++) {
      resetElements[i].value = '';
      resetElements[i].src = '';
    }
  };

  useEffect(() => {
    setFirstName();
    setLastName();
    setCurrentUser(userId);
    setCurrentTask(taskId);
    axios.get(`${url}/api/messages/${taskId}`)
      .then((data) => {
        setMessages(data.data);
      });
  }, [taskId, userId]);

  useEffect(() => {
    socket.on(currentTask, (data) => {
      setMessages((prev) => [...prev, data]);
    });
  }, [currentTask]);

  useEffect(() => {
    const elem = document.getElementById('allMessages');
    elem.scrollTop = elem.scrollHeight;
  }, [messages]);

  const chatStyle = {
    position: 'relative',
    minWidth: '40%',
    height: '75vh',
    padding: '5px',
    borderRadius: '20px',
  };

  const messageContaierStyle = {
    margin: '10px',
    height: '89%',
    overflow: 'auto',
  };

  const handleMessage = () => {
    const now = DateTime.local();
    const dateFormatted = DateTime.fromISO(now).toFormat('yyyy-MM-dd');
    const timeFormatted = DateTime.fromISO(now).toFormat('HH:mm:ss');

    const message = {
      messageBody: currentMessage,
      date: dateFormatted,
      time: timeFormatted,
    };

    axios.post(`${url}/api/messages/${taskId}/${userId}`, message)
      .then((res) => console.log(res))
      .then(() => resetInput())
      .catch((err) => console.log(err));
  };

  const getMessages = () => {
    axios.get(`${url}/api/messages/${taskId}`)
      .then((data) => {
        setMessages(data.data);
      });
  };

  const [currentInterval, setCurrentInterval] = useState();

  useEffect(() => {
    getMessages();
    if (currentInterval) {
      clearInterval(currentInterval);
    }

    const getTimer = setInterval(getMessages, 100);
    setCurrentInterval(getTimer);
  }, [userId]);

  return (
    <div style={chatStyle}>
      <div style={messageContaierStyle} id="allMessages">
        {messages.map((message, idx) => {
          const user_1 = userId;
          let isUser;
          if (message.user_id === userId) {
            isUser = true;
          } else {
            isUser = false;
          }
          return (<Message key={idx} message={message} user={user} isUser={isUser} />);
        })}
      </div>
      <div style={{ position: 'relative', bottom: '0', right: '0', margin: '5px' }}>
        <input
          style={{ width: '45vw', borderRadius: '25px', height: '6vh', borderColor: 'grey' }}
          className="messageInput" placeholder="Write message here..." onChange={handleChange} />
        <IconButton onClick={() => {
          handleMessage();
        }} > <SendTwoToneIcon /></IconButton>
      </div>
    </div>
  );
};

export default Chat;

