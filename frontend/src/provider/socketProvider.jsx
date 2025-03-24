import React, { useEffect, useReducer, useRef, useState } from 'react';
import { SocketContext } from './socketContext';

const SocketProvider = ({ children }) => {
    const [socket, setsocket] = useState(null);
    const setSocket = (socket) => {
        setsocket(socket);
    }
    return (
        <SocketContext.Provider value={{ socket, setSocket }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;
