

import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';

const ROOM_SESSION_KEY = import.meta.env.VITE_ROOM_SESSION_KEY;

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