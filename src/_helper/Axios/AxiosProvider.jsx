import React, { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";

// Create the context
const AxiosContext = createContext();

// Provide the context to the app
export const AxiosProvider = ({ children }) => {
  const navigate = useNavigate();

  // Function to handle unauthorized errors
  const handleUnauthorized = () => {
    navigate(`${process.env.PUBLIC_URL}/login`); // Redirect to login
  };

  return (
    <AxiosContext.Provider value={{ handleUnauthorized }}>
      {children}
    </AxiosContext.Provider>
  );
};

// Custom hook to access the Axios context
export const useAxiosContext = () => useContext(AxiosContext);
