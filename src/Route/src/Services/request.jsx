import axios from 'axios';
// import { notification } from 'antd';
import { toast } from 'react-toastify';
import { API_URL } from '../Config/AppConstant';

const service = axios.create({
  baseURL: API_URL,
  timeout: 16000,
});

// Config
const TOKEN_PAYLOAD_KEY = 'authorization';
const AUTH_TOKEN = 'token';
const AUTH_TOKEN_TYPE = 'Bearer';

// const dispatch =  useDispatch()

// API Request interceptor
service.interceptors.request.use(
  (config) => {
    const access_token = localStorage.getItem(AUTH_TOKEN);

    if (access_token) {
      config.headers[TOKEN_PAYLOAD_KEY] = AUTH_TOKEN_TYPE + ' ' + access_token;
    }
    if (config.method === 'get') {
      // config.params = { lang: i18n.language, ...config.params };
    }

    return config;
  },
  (error) => {
    // Do something with request error here
    // notification.error({
    //   message: 'Error',
    // }); 
    // alert('Error')
    // Promise.reject(error);
    
    return Promise.reject(error);
  }
);

// API respone interceptor
service.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    let notificationParam = {
      message:error.response?.data?.message,
    };
    // Remove token and redirect
    if (error.response?.status === 403 || error.response?.status === 401) {
      notificationParam.message = error.response?.data?.message;
      // console.log("axios-error1")
      localStorage.removeItem(AUTH_TOKEN);
      localStorage.removeItem('profileURL');
      localStorage.removeItem('auth0_profile');
      localStorage.removeItem('Name');
      localStorage.setItem('authenticated', false);
      // console.log("axios-error2")
      window.location.href = `${process.env.PUBLIC_URL}/login`;
    }

    if (error.response?.status === 508) {
      notificationParam.message = error.response?.data?.message;
    }

    if (error.response?.status === 500) {
      notificationParam.message =
        error.response?.data?.message || 'Internal server error';
    }

    if (error.response?.data?.params) {
      if (Object.values(error.response?.data?.params)[0]) {
        notificationParam.message = Object.values(
          error.response?.data?.params
        )[0].at(0);
      }
    }

    toast.error(notificationParam.message, {
      toastId: error.response?.status,
    });
    return Promise.reject(error);
  }
);

export default service;
