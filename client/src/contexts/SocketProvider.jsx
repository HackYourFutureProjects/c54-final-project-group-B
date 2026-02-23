import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import { SocketContext } from "../hooks/useSocket";

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Connect socket
    const s = io(window.location.origin);
    socketRef.current = s;

    // Asynchronously setting state avoids cascading render lint errors
    Promise.resolve().then(() => {
      setSocket(s);
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
