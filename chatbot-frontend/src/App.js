import React, { useState, useEffect } from 'react';
import './App.css';
import io from 'socket.io-client';
import sendbtn from './logos/send64.png'
import historybtn from './logos/history.png'
import axios from 'axios';

const socket = io('http://localhost:3001'); 

function App() {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    socket.on('chat message', (message) => {
      setMessages((prevMessages) => [...prevMessages, { content: message, type: 'bot' }]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (showHistory) {
      showChats()
    }
  }, [showHistory])

  const [chats, setChats] = useState([])

  const showChats = async () => {
    try {
      const response = await axios.get('http://localhost:3001/history');
      setChats(response.data);

      console.log(chats);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (inputMessage.trim() !== '') {
      socket.emit('chat message', inputMessage);

      setMessages((prevMessages) => [...prevMessages, { content: inputMessage, type: 'user' }]);

      try {
        const response = await axios.post('http://localhost:3001/openai', {
          message: inputMessage,
        });

       
        setMessages((prevMessages) => [...prevMessages, { content: response.data.reply, type: 'bot' }]);
      } catch (error) {
        console.error('Error sending message to OpenAI:', error);
      }

      // Clear the input field
      setInputMessage('');
    }
  };

  const handleHistory = () => {
    setShowHistory(true)
  }
  const handlebot=()=>{
    setShowHistory(false)
  }

  return (
    <>
      {showHistory ? (
        <>
        <div className='header'>
          <h1>My Chat History</h1>
          
          {chats.map((data, index) => (
        <div key={index} className={data.type}>
          <p>{data.content}</p>
        </div>
      ))}
      <button className='history' onClick={handlebot}>Back to chatbot</button>
      </div>
        </>
      )
        :
        (
          <>
            <div className="container">
              <div className="header">
                <div className="logo">
                  <img className='logo' src="https://play-lh.googleusercontent.com/YMHtw-09m9fIbYe07H7TllqIwvj8LgL0ijY2VYAfUj72Elte7yAidVDlRdCSbNeNpw=w240-h480-rw"></img>
                </div>
                <div className="text">
                  <h3>How can I help you today?</h3>
                </div>
                <div className=''>
                  <ul>
                    {messages.map((msg, index) => (

                      <li key={index} className={msg.type}>

                        <p className='content'>{msg.type}</p>
                        {msg.content}
                      </li>
                    ))}
                  </ul>
                  <div className='App1'>
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      className='input'
                      placeholder='Message Goodspace Bot'
                    />
                    <img className='btn' src={sendbtn} onClick={sendMessage}></img>
                    <img className='btn' src={historybtn} onClick={handleHistory}></img>
                      
                  </div>
                  
                </div>
                
              </div>
              
            </div>
          </>

        )
      }

    </>

  );
}

export default App;
