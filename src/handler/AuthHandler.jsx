import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../Redux/slices/auth';
import { useNavigate } from 'react-router-dom';

const AuthHandler = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sessionExpired } = useSelector((state) => state.auth);

  useEffect(() => {
    if (sessionExpired) {
      dispatch(logout());
      navigate(`${process.env.PUBLIC_URL}/login`);
    }
  }, [sessionExpired, dispatch, navigate]);

  return <>{children}</>;
};

export default AuthHandler;
