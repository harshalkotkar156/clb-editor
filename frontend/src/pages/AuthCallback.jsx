import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';

import { loginSuccess } from '../features/auth/authSlice';

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
      try {
        // decode the JWT to get user info
        const user = jwtDecode(token);

        // store in Redux + localStorage
        dispatch(loginSuccess({ token, user }));

        // Check if there was an intended redirect (e.g. invited room)
        const postLoginRedirect = sessionStorage.getItem('post_login_redirect');
        if (postLoginRedirect) {
          sessionStorage.removeItem('post_login_redirect');
          navigate(postLoginRedirect, { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        console.error('Invalid token in auth callback:', err);
        navigate('/', { replace: true });
      }
    } else {
      navigate('/', { replace: true });
    }
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-gray-400 text-sm">
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
