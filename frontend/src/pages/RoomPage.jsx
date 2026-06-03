// import { useEffect, useMemo, useState } from 'react';
// import { useLocation, useNavigate, useParams } from 'react-router-dom';
// import CollaborativeEditor from '../components/CollaborativeEditor.jsx';

// const normalizeRoomId = (value) => (value || '').toUpperCase();

// export default function RoomPage() {
//   const { roomId: rawRoomId } = useParams();
//   const roomId = useMemo(() => normalizeRoomId(rawRoomId), [rawRoomId]);
//   const location = useLocation();
//   const navigate = useNavigate();

//   const isHost = Boolean(location.state?.isHost);

//   const [username, setUsername] = useState(() => localStorage.getItem('collab_username') || '');
//   const [nameInput, setNameInput] = useState(username);
//   const [roomError, setRoomError] = useState('');
//   const [allowCreate, setAllowCreate] = useState(() => {
//     const lastRoom = localStorage.getItem('collab_last_room') || '';
//     return isHost || lastRoom === roomId;
//   });

//   useEffect(() => {
//     const lastRoom = localStorage.getItem('collab_last_room') || '';
//     setAllowCreate(isHost || lastRoom === roomId);
//   }, [isHost, roomId]);

//   const handleNameSubmit = (e) => {
//     e.preventDefault();
//     const trimmed = nameInput.trim();
//     if (!trimmed) return;
//     localStorage.setItem('collab_username', trimmed);
//     setUsername(trimmed);
//   };

//   const handleJoined = () => {
//     localStorage.setItem('collab_last_room', roomId);
//     setAllowCreate(true);
//   };

//   if (!roomId) {
//     return (
//       <div className="min-h-screen bg-[#0a0a0f] text-gray-200 flex items-center justify-center">
//         <div className="max-w-md w-full rounded-2xl border border-gray-800 bg-[#0f1117] p-6 text-center">
//           <h1 className="text-lg font-semibold">Invalid room</h1>
//           <p className="text-sm text-gray-400 mt-2">The room ID in the URL is missing or invalid.</p>
//           <button
//             onClick={() => navigate('/')}
//             className="mt-4 px-4 py-2 rounded-lg bg-cyan-400 text-black text-sm font-semibold"
//           >
//             Back to Home
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
//               onClick={() => navigate('/')}
//               className="px-4 py-2 rounded-lg bg-gray-800 text-gray-200 text-sm font-semibold"
//             >
//               Back to Home
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
//         username={username}
//         createIfMissing={allowCreate}
//         onRoomError={setRoomError}
//         onJoined={handleJoined}
//       />

//       {!username && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
//           <form
//             onSubmit={handleNameSubmit}
//             className="w-full max-w-sm rounded-2xl border border-gray-800 bg-[#0f1117] p-6"
//           >
//             <h2 className="text-lg font-semibold">Join room {roomId}</h2>
//             <p className="text-sm text-gray-400 mt-1">Pick a name so others can see you.</p>
//             <input
//               autoFocus
//               value={nameInput}
//               onChange={(e) => setNameInput(e.target.value)}
//               placeholder="Your name"
//               className="mt-4 w-full rounded-lg bg-[#0a0a0f] border border-gray-700 px-3 py-2 text-sm text-gray-200 outline-none"
//             />
//             <button
//               type="submit"
//               className="mt-4 w-full px-4 py-2 rounded-lg bg-cyan-400 text-black text-sm font-semibold"
//             >
//               Enter Room
//             </button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// }


import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '../features/auth/authSlice';
import CollaborativeEditor from '../components/CollaborativeEditor.jsx';

const normalizeRoomId = (value) => (value || '').toUpperCase();

export default function RoomPage() {
  const { roomId: rawRoomId } = useParams();
  const roomId                = useMemo(() => normalizeRoomId(rawRoomId), [rawRoomId]);
  const location              = useNavigate();
  const navigate              = useNavigate();

  // ✅ get real auth user from Redux
  const user            = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const isHost      = Boolean(useLocation().state?.isHost);
  const [roomError, setRoomError] = useState('');
  const [allowCreate, setAllowCreate] = useState(() => {
    const lastRoom = localStorage.getItem('collab_last_room') || '';
    return isHost || lastRoom === roomId;
  });

  // ✅ redirect to login if not authenticated
  // store the room URL so we redirect back after login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', {
        state: { redirectAfterLogin: `/room/${roomId}` },
        replace: true,
      });
    }
  }, [isAuthenticated, roomId, navigate]);

  useEffect(() => {
    const lastRoom = localStorage.getItem('collab_last_room') || '';
    setAllowCreate(isHost || lastRoom === roomId);
  }, [isHost, roomId]);

  const handleJoined = () => {
    localStorage.setItem('collab_last_room', roomId);
    setAllowCreate(true);
  };

  // not authenticated — show nothing while redirecting
  if (!isAuthenticated) return null;

  if (!roomId) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-gray-200 flex items-center justify-center">
        <div className="max-w-md w-full rounded-2xl border border-gray-800 bg-[#0f1117] p-6 text-center">
          <h1 className="text-lg font-semibold">Invalid room</h1>
          <p className="text-sm text-gray-400 mt-2">The room ID in the URL is missing or invalid.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 rounded-lg bg-cyan-400 text-black text-sm font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (roomError) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-gray-200 flex items-center justify-center">
        <div className="max-w-md w-full rounded-2xl border border-gray-800 bg-[#0f1117] p-6 text-center">
          <h1 className="text-lg font-semibold">Unable to join room</h1>
          <p className="text-sm text-gray-400 mt-2">{roomError}</p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-200 text-sm font-semibold"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => setRoomError('')}
              className="px-4 py-2 rounded-lg bg-cyan-400 text-black text-sm font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
      <CollaborativeEditor
        roomId={roomId}
        username={user?.name || user?.email || 'User'} // ✅ real name from auth
        createIfMissing={allowCreate}
        onRoomError={setRoomError}
        onJoined={handleJoined}
      />
    </div>
  );
}