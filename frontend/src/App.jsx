
// import { Routes, Route } from 'react-router-dom';
// import { Provider } from 'react-redux';
// // import { store } from './store/index.js';
// import {store} from "./app/store.js";
// import Home from './pages/Home.jsx';
// import Dashboard from './pages/Dashboard.jsx';
// import AuthCallback from "./pages/AuthCallback.jsx";
// import Error from './pages/Error.jsx'
// import Editor from './pages/Editor.jsx';
// import ProtectedRoute from './components/ProtectedRoute.jsx';
// import RoomPage from './pages/RoomPage.jsx';

// const App = () => {
//   return (
//     <Provider store={store}>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="*" element={<Error />} />
//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/editor/:fileId"
//           element={
//             <ProtectedRoute>
//               <Editor />
//             </ProtectedRoute>
//           }
//         />

//         <Route path="/editor/new" element={
//           <ProtectedRoute><Editor /></  ProtectedRoute>
//         } />
//          <Route path='/room/:roomId' element={<RoomPage/>}></Route>
//         {/* OAuth callback route — processes token then navigates to dashboard */}
//         <Route path="/auth/callback" element={<AuthCallback />} />

//       </Routes>



//     </Provider>
//   );
// };

// export default App;


import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store.js';
import Home        from './pages/Home.jsx';
import Dashboard   from './pages/Dashboard.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import Error       from './pages/Error.jsx';
import Editor      from './pages/Editor.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RoomPage    from './pages/RoomPage.jsx';

const App = () => (
  <Provider store={store}>
    <Routes>
      <Route path="/"               element={<Home />} />
      <Route path="*"               element={<Error />} />
      <Route path="/auth/callback"  element={<AuthCallback />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />

      <Route path="/editor/:fileId" element={
        <ProtectedRoute><Editor /></ProtectedRoute>
      } />

      <Route path="/editor/new" element={
        <ProtectedRoute><Editor /></ProtectedRoute>
      } />

      {/* ✅ room page now protected — must be logged in */}
      <Route path="/room/:roomId" element={
        <ProtectedRoute><RoomPage /></ProtectedRoute>
      } />
    </Routes>
  </Provider>
);

export default App;