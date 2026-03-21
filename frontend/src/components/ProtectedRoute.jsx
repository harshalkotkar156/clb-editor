// // ProtectedRoute.jsx — updated
// import { useSelector } from 'react-redux';
// import { Navigate, useSearchParams } from 'react-router-dom';

// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   const [searchParams]      = useSearchParams();
//   const tokenInUrl          = searchParams.get('token');

//   // allow through if token in URL (OAuth callback) OR already authenticated
//   if (!isAuthenticated && !tokenInUrl) {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;


import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectIsAuthenticated } from '../features/auth/authSlice';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? children : <Navigate to="/" replace />;
}