
// import { useEffect, useMemo, useState } from 'react';
// import { useLocation, useNavigate, useParams } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { selectUser, selectIsAuthenticated } from '../features/auth/authSlice';
// import CollaborativeEditor from '../components/CollaborativeEditor.jsx';

// const normalizeRoomId = (value) => (value || '').toUpperCase();

// export default function RoomPage() {
//   const { roomId: rawRoomId } = useParams();
//   const roomId                = useMemo(() => normalizeRoomId(rawRoomId), [rawRoomId]);
//   const location              = useNavigate();
//   const navigate              = useNavigate();

//   // ✅ get real auth user from Redux
//   const user            = useSelector(selectUser);
//   const isAuthenticated = useSelector(selectIsAuthenticated);

//   const isHost      = Boolean(useLocation().state?.isHost);
//   const [roomError, setRoomError] = useState('');
//   const [allowCreate, setAllowCreate] = useState(() => {
//     const lastRoom = localStorage.getItem('collab_last_room') || '';
//     return isHost || lastRoom === roomId;
//   });

//   // ✅ redirect to login if not authenticated
//   // store the room URL so we redirect back after login
//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate('/', {
//         state: { redirectAfterLogin: `/room/${roomId}` },
//         replace: true,
//       });
//     }
//   }, [isAuthenticated, roomId, navigate]);

//   useEffect(() => {
//     const lastRoom = localStorage.getItem('collab_last_room') || '';
//     setAllowCreate(isHost || lastRoom === roomId);
//   }, [isHost, roomId]);

//   const handleJoined = () => {
//     localStorage.setItem('collab_last_room', roomId);
//     setAllowCreate(true);
//   };

//   // not authenticated — show nothing while redirecting
//   if (!isAuthenticated) return null;

//   if (!roomId) {
//     return (
//       <div className="min-h-screen bg-[#0a0a0f] text-gray-200 flex items-center justify-center">
//         <div className="max-w-md w-full rounded-2xl border border-gray-800 bg-[#0f1117] p-6 text-center">
//           <h1 className="text-lg font-semibold">Invalid room</h1>
//           <p className="text-sm text-gray-400 mt-2">The room ID in the URL is missing or invalid.</p>
//           <button
//             onClick={() => navigate('/dashboard')}
//             className="mt-4 px-4 py-2 rounded-lg bg-cyan-400 text-black text-sm font-semibold"
//           >
//             Back to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (roomError) {
//     return (
//       <div className="min-h-screen bg-[#0a0a0f] text-gray-200 flex items-center justify-center">
//         <div className="max-w-md w-full rounded-2xl border border-gray-800 bg-[#0f1117] p-6 text-center">
//           <h1 className="text-lg font-semibold">Unable to join room</h1>
//           <p className="text-sm text-gray-400 mt-2">{roomError}</p>
//           <div className="mt-5 flex items-center justify-center gap-3">
//             <button
//               onClick={() => navigate('/dashboard')}
//               className="px-4 py-2 rounded-lg bg-gray-800 text-gray-200 text-sm font-semibold"
//             >
//               Back to Dashboard
//             </button>
//             <button
//               onClick={() => setRoomError('')}
//               className="px-4 py-2 rounded-lg bg-cyan-400 text-black text-sm font-semibold"
//             >
//               Try Again
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
//       <CollaborativeEditor
//         roomId={roomId}
//         username={user?.name || user?.email || 'User'} // ✅ real name from auth
//         createIfMissing={allowCreate}
//         onRoomError={setRoomError}
//         onJoined={handleJoined}
//       />
//     </div>
//   );
// }

// the aboce code is correct below is experimentation


import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';

// RoomPage just sets up sessionStorage for the joiner
// then redirects to /editor/collab/:roomId
// The Editor component handles everything

const ROOM_SESSION_KEY = 'collab_session';

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate   = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      // not logged in → go to home, preserve room link
      navigate('/', { state: { redirectAfterLogin: `/room/${roomId}` } });
      return;
    }

    if (!roomId) {
      navigate('/dashboard');
      return;
    }

    // ✅ store joiner session in sessionStorage
    // Editor will read this on mount and auto-join
    sessionStorage.setItem(ROOM_SESSION_KEY, JSON.stringify({
      roomId:   roomId.toUpperCase(),
      isHost:   false,
      fileId:   null,
      language: null,  // will be received from server
      fileName: null,  // will be received from server
    }));

    // redirect to editor — editor reads sessionStorage and joins
    navigate(`/editor/collab-${roomId.toUpperCase()}`, { replace: true });
  }, [isAuthenticated, roomId]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-gray-400 text-sm">Joining room...</div>
    </div>
  );
}