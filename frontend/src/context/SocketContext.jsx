import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // En producción el proxy de Nginx maneja /socket.io/ y en local Vite proxy
        // Pero Vite necesita configuración si usamos la misma URL.
        // Asumiendo que la API está expuesta, nos conectamos a la URL actual
        const newSocket = io({
            path: '/socket.io/',
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
