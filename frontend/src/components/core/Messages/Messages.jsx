import React, { useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ThemeContext } from '../../../provider/themeContext';

const Messages = ({ messages }) => {
    const { user } = useSelector((state) => state.profile);
    const accountType = user.accountType;
    const userId = user._id;
    // Reference to the message container
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const { darkTheme } = useContext(ThemeContext);
    // Track whether the user is at the bottom of the chat
    const [isAtBottom, setIsAtBottom] = useState(true);

    // Function to check if the user is at the bottom of the messages container
    const checkIfAtBottom = () => {
        if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            const isAtBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
            setIsAtBottom(isAtBottom);
        }
    };

    // Scroll to the bottom of the chat container if the user is at the bottom
    const scrollToBottom = () => {
        if (messagesEndRef.current && isAtBottom) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        // Check if the user is at the bottom when the component mounts and on every update
        checkIfAtBottom();
    }, [messages]);

    useEffect(() => {
        // Attach a scroll event listener to detect when the user scrolls
        if (messagesContainerRef.current) {
            messagesContainerRef.current.addEventListener('scroll', checkIfAtBottom);
        }

        // Cleanup the scroll event listener
        return () => {
            if (messagesContainerRef.current) {
                messagesContainerRef.current.removeEventListener('scroll', checkIfAtBottom);
            }
        };
    }, []);

    useEffect(() => {
        // Scroll to the bottom if the user is at the bottom
        if (isAtBottom) {
            scrollToBottom();
        }
    }, [messages, isAtBottom]);

    return (
        <div
            ref={messagesContainerRef}
            className={`p-4 space-y-4 h-[70vh] overflow-y-auto `}
        >
            {messages.length > 0 ? (
                messages.map((message) => {
                    const isSentByUser = message.sentBy?._id === userId;
                    const accountTypeOfSender = message.sentBy?.accountType;
                    const isInstructor = (accountTypeOfSender === "Instructor");
                    return (
                        <div
                            key={message._id}
                            className={`p-3 rounded-lg shadow-md max-w-lg ${isSentByUser ? `${darkTheme ? "bg-richblack-700" : "bg-blue-25"} ml-auto` : ` ${darkTheme ? "bg-richblack-800 text-richblack-600" : "bg-blue-5 text-richblack-700"}`} ${darkTheme ? "text-white" : "text-richblack-700"}`}
                        >

                            <div className='flex items-center justify-between text-xs font-semibold'>

                                {
                                    !isSentByUser ? (
                                        <div >
                                            {
                                                isInstructor ? (
                                                    <div className=' text-orange'>{message.sentBy?.firstName}(Instructor)</div>
                                                ) : (
                                                    <div>{message.sentBy?.firstName || 'Unknown User'}</div>
                                                )
                                            }
                                        </div>
                                    ) : (
                                        <div className={`${darkTheme ? 'text-blue-25' : 'text-richblack-600'}`}>
                                            You
                                        </div>
                                    )
                                }
                                {/* <p className="text-sm">
                                    {message.sentBy?.firstName || 'Unknown User'}
                                </p> */}
                                <p className="text-xs opacity-75">
                                    {new Date(message.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <p className=" text-base">{message.content}</p>
                        </div>
                    );
                })
            ) : (
                <p className="flex items-center justify-center text-richblack-300 h-[50vh] text-xl">No messages available.</p>
            )}

            {/* This empty div is used to scroll to the bottom */}
            <div ref={messagesEndRef} />
        </div >
    );
};

export default Messages;
