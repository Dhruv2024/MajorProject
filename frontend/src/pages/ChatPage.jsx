import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchMessages, fetchRoomDetailsForRoom, validateUser } from '../services/operations/messagesAPI';
import { SocketContext } from '../provider/socketContext';
import { useSelector } from 'react-redux';
import Messages from '../components/core/Messages/Messages';
import SendMessage from '../components/core/Messages/SendMessage';



const ChatPage = () => {
    const { roomId } = useParams();
    const { socket } = useContext(SocketContext);
    const { token } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [validated, setValidated] = useState("processing");
    const [messages, setMessages] = useState([]);
    const heading = useRef(null);
    async function validateUserForRoom() {
        const response = await validateUser(roomId, token, navigate);
        console.log(response);
        if (!response) {
            navigate("/dashboard/my-profile");
        }
        // const roomMessages = await fetchMessages(roomId, token, setMessages, navigate);
        const result = await fetchRoomDetailsForRoom(roomId, token, navigate);
        // console.log(result);
        heading.current = result[0];
        setMessages(result[1]);
        setValidated(response);
    }
    // console.log(roomId);
    useEffect(() => {
        validateUserForRoom();
    }, []);
    const { course } = useSelector((state) => state.course);
    return (
        <div className='text-white'>
            {
                validated === "processing" ? (
                    <div>Loading...</div>
                ) : (
                    <div>
                        {heading.current && <h1 className='text-2xl h-[7vh] flex items-center justify-center text-brown-25'>{heading.current}</h1>}
                        <Messages messages={messages} />
                        <SendMessage setMessages={setMessages} messages={messages} />
                    </div>
                )
            }
        </div>
    )
}

export default ChatPage