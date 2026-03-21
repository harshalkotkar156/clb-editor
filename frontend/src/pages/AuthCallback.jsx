import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {jwtDecode} from 'jwt-decode'; 

import { loginSuccess } from '../store/slices/authSlice';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const dispatch       = useDispatch();
  const navigate       = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      // OAuth failed — go back to home
      navigate('/', { replace: true });
      return;
    }

    if (token) {
      // decode the JWT to get user info (no need for API call)
      const user = jwtDecode(token);

      // store in Redux + localStorage
      dispatch(loginSuccess({ token, user }));

      // clean the token from URL and stay on dashboard
      navigate('/dashboard', { replace: true });
    }
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <p>Logging you in...</p>
    </div>
  );
};

export default AuthCallback;


// import React from 'react'

// const AuthCallback = () => {
//   return (
//     <div>AuthCallback</div>
//   )
// }

// export default AuthCallback