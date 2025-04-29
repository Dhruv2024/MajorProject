import React, { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../../provider/socketContext';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeContext } from '../../../provider/themeContext';

const SendMessage = ({ setMessages, messages }) => {
    const { socket } = useContext(SocketContext);
    const [messageFromUser, setMessageFromUser] = useState("");
    const { roomId } = useParams();
    const { user } = useSelector((state) => state.profile);
    const { darkTheme } = useContext(ThemeContext);

    useEffect(() => {
        if (socket) {
            socket.emit("joinRoom", roomId);
        }
    }, []);

    useEffect(() => {
        if (socket) {
            const handleReceivedMessage = (data) => {
                setMessages((prevMessages) => {
                    const newMessages = [...prevMessages, data];
                    return newMessages.slice(-100); // Keep only the last 100 messages
                });
                setMessageFromUser('');
            };

            socket.on("received-message", handleReceivedMessage);

            return () => {
                socket.off("received-message", handleReceivedMessage);
            };
        }
    }, [socket]);

    const sendMessage = () => {
        if (!messageFromUser.trim()) {
            alert("Message cannot be empty!");
            return;
        }

        if (socket) {
            const data = {
                room: roomId,
                content: messageFromUser,
                sentBy: user._id,
            };
            socket.emit("new-message", data);
        } else {
            alert("Something went wrong");
        }
    };

    return (
        <div className="flex items-center space-x-4 mt-4">
            <input
                type="text"
                value={messageFromUser}
                onChange={(e) => setMessageFromUser(e.target.value)}
                className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                    ${darkTheme ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"}`}
                placeholder="Type a message..."
            />
            <button
                onClick={sendMessage}
                className={`px-6 py-3 rounded-lg focus:outline-none 
                    ${darkTheme
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-blue-500 text-white hover:bg-blue-600"}`}
            >
                Send
            </button>
        </div>
    );
};

export default SendMessage;
