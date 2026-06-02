
import { useEffect, useMemo, useRef, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import { io } from 'socket.io-client';
import { FiCopy } from 'react-icons/fi';

// ── constants ──────────────────────────────────────────────────────────────────
const COLOR_PALETTE = ['#F87171', '#34D399', '#60A5FA', '#FBBF24', '#A78BFA'];
const DEFAULT_LANGUAGE = 'javascript';
const LANGUAGES = [
  { id: 'cpp',        label: 'C++'        },
  { id: 'java',       label: 'Java'       },
  { id: 'python',     label: 'Python'     },
  { id: 'javascript', label: 'JavaScript' },
];
const MONACO_LANG_MAP = {
  cpp: 'cpp', java: 'java', python: 'python', javascript: 'javascript',
};

// ✅ outside component — never recreated on render
const WS_URL     = 'ws://localhost:3001/yjs';
const SOCKET_URL = 'http://localhost:3001';

// ── pure helpers ───────────────────────────────────────────────────────────────
const getColorForIndex = (i) => COLOR_PALETTE[i % COLOR_PALETTE.length];

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase();

const escapeCssContent = (v) =>
  String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ');

const upsertCursorStyle = (styleMap, clientId, color, name) => {
  const id = `collab-style-${clientId}`;
  let tag = styleMap.get(clientId);
  if (!tag) {
    tag = document.getElementById(id) || document.createElement('style');
    tag.id = id;
    document.head.appendChild(tag);
    styleMap.set(clientId, tag);
  }
  const safe = escapeCssContent(name || 'Guest');
  tag.textContent = `
    .collab-selection-${clientId} { background: ${color}33; }
    .collab-cursor-${clientId} {
      border-left: 2px solid ${color};
      margin-left: -1px;
    }
    .collab-cursor-${clientId}::after {
      content: "${safe}";
      position: relative;
      top: -1.4em;
      left: -1px;
      background: ${color};
      color: #0a0a0f;
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 8px;
      font-family: 'DM Sans', sans-serif;
      white-space: nowrap;
    }
  `;
};

const removeCursorStyle = (styleMap, clientId) => {
  styleMap.get(clientId)?.remove();
  styleMap.delete(clientId);
};

// ── component ──────────────────────────────────────────────────────────────────
export default function CollaborativeEditor({
  roomId,
  username,
  createIfMissing = false,
  onRoomError,
  onJoined,
}) {
  const [users,       setUsers]       = useState([]);
  const [language,    setLanguage]    = useState(DEFAULT_LANGUAGE);
  const [socketId,    setSocketId]    = useState('');
  const [copied,      setCopied]      = useState(false);
  const [status,      setStatus]      = useState('connecting');
  const [editorReady, setEditorReady] = useState(false);

  // refs — survive renders without causing re-renders
  const editorRef             = useRef(null);
  const monacoRef             = useRef(null);
  const socketRef             = useRef(null);
  const ydocRef               = useRef(null);
  const providerRef           = useRef(null);
  const bindingRef            = useRef(null);
  const selectionDisposable   = useRef(null);
  const awarenessListener     = useRef(null);
  const decorationsRef        = useRef(new Map());
  const styleRef              = useRef(new Map());
  const pendingInitRef        = useRef(false);
  const languageRef           = useRef(DEFAULT_LANGUAGE);
  const usersRef              = useRef([]);   // ✅ always up-to-date user list for callbacks

  // ── derived ──────────────────────────────────────────────────────────────────
  const localColor = useMemo(() => {
    const idx = users.findIndex((u) => u.socketId === socketId);
    return getColorForIndex(idx >= 0 ? idx : 0);
  }, [users, socketId]);

  const shareUrl = useMemo(
    () => (typeof window !== 'undefined' ? `${window.location.origin}/room/${roomId}` : ''),
    [roomId],
  );

  // ── keep refs in sync ────────────────────────────────────────────────────────
  useEffect(() => { usersRef.current    = users;    }, [users]);
  useEffect(() => { languageRef.current = language; }, [language]);

  // ── language → monaco model ──────────────────────────────────────────────────
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const model = editor.getModel();
    if (!model) return;
    monaco.editor.setModelLanguage(model, MONACO_LANG_MAP[language] || DEFAULT_LANGUAGE);
  }, [language]);

  // ── keep awareness user field fresh ─────────────────────────────────────────
  useEffect(() => {
    providerRef.current?.awareness?.setLocalStateField('user', {
      name: username, color: localColor,
    });
  }, [username, localColor]);

  // ── handlers ─────────────────────────────────────────────────────────────────
  const handleCopyLink = async () => {
    if (!shareUrl || !navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    languageRef.current = lang;
    socketRef.current?.emit('language-change', { roomId, language: lang });
  };

  // ── remote cursor decorations ────────────────────────────────────────────────
  const updateRemoteDecorations = () => {
    const provider = providerRef.current;
    const editor   = editorRef.current;
    const monaco   = monacoRef.current;
    if (!provider || !editor || !monaco) return;

    const awareness    = provider.awareness;
    const states       = awareness.getStates();
    const localId      = awareness.clientID;
    const nextDeco     = new Map();

    states.forEach((state, clientId) => {
      if (clientId === localId) return;
      const sel = state.selection;
      if (!sel?.start || !sel?.end) return;          // ✅ null-safe guard

      const { color = COLOR_PALETTE[0], name = 'Guest' } = state.user || {};
      upsertCursorStyle(styleRef.current, clientId, color, name);

      const selRange = new monaco.Range(
        sel.start.lineNumber, sel.start.column,
        sel.end.lineNumber,   sel.end.column,
      );
      const cursorRange = new monaco.Range(
        sel.end.lineNumber, sel.end.column,
        sel.end.lineNumber, sel.end.column,
      );

      const ids = editor.deltaDecorations(
        decorationsRef.current.get(clientId) || [],
        [
          { range: selRange,    options: { className: `collab-selection-${clientId}` } },
          { range: cursorRange, options: { beforeContentClassName: `collab-cursor-${clientId}` } },
        ],
      );
      nextDeco.set(clientId, ids);
    });

    // clean up clients who left
    decorationsRef.current.forEach((ids, clientId) => {
      if (!nextDeco.has(clientId)) {
        editor.deltaDecorations(ids, []);
        removeCursorStyle(styleRef.current, clientId);
      }
    });

    decorationsRef.current = nextDeco;
  };

  // ── Yjs init / destroy ───────────────────────────────────────────────────────
  const initYjs = () => {
    if (!editorRef.current || providerRef.current) return;

    const ydoc     = new Y.Doc();
    const provider = new WebsocketProvider(WS_URL, roomId, ydoc, { connect: true });
    const ytext    = ydoc.getText('monaco');
    const model    = editorRef.current.getModel();
    if (!model) { ydoc.destroy(); provider.destroy(); return; }

    const binding = new MonacoBinding(
      ytext, model, new Set([editorRef.current]), provider.awareness,
    );

    ydocRef.current     = ydoc;
    providerRef.current = provider;
    bindingRef.current  = binding;

    // ✅ fresh color from usersRef (no stale closure)
    const currentUsers = usersRef.current;
    const mySocketId   = socketRef.current?.id;
    const idx          = currentUsers.findIndex((u) => u.socketId === mySocketId);
    const color        = getColorForIndex(idx >= 0 ? idx : 0);
    provider.awareness.setLocalStateField('user', { name: username, color });

    const updateSelection = () => {
      const sel = editorRef.current?.getSelection();
      if (!sel) return;
      provider.awareness.setLocalStateField('selection', {
        start: { lineNumber: sel.startLineNumber, column: sel.startColumn },
        end:   { lineNumber: sel.endLineNumber,   column: sel.endColumn   },
      });
    };

    updateSelection();
    selectionDisposable.current = editorRef.current.onDidChangeCursorSelection(updateSelection);
    awarenessListener.current   = updateRemoteDecorations;
    provider.awareness.on('change', updateRemoteDecorations);

    console.log('Yjs initialized for room', roomId);
  };

  const destroyYjs = () => {
    if (providerRef.current?.awareness && awarenessListener.current) {
      providerRef.current.awareness.off('change', awarenessListener.current);
    }
    providerRef.current?.awareness?.setLocalState(null);

    selectionDisposable.current?.dispose();
    selectionDisposable.current = null;

    bindingRef.current?.destroy();  bindingRef.current  = null;
    providerRef.current?.destroy(); providerRef.current = null;
    ydocRef.current?.destroy();     ydocRef.current     = null;

    const editor = editorRef.current;
    if (editor) {
      decorationsRef.current.forEach((ids) => editor.deltaDecorations(ids, []));
    }
    decorationsRef.current.clear();
    styleRef.current.forEach((tag) => tag.remove());
    styleRef.current.clear();
  };

  // ── Socket.IO lifecycle ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId || !username) return;

    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'], // ✅ polling first → upgrade to ws
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket.IO connected:', socket.id);
      setSocketId(socket.id);
      setStatus('connected');
      socket.emit('join-room', {
        roomId,
        username,
        createIfMissing,
        language: languageRef.current,
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      setStatus('disconnected');
    });

    socket.on('room-joined', ({ users: nextUsers, language: roomLang }) => {
      setUsers(nextUsers);
      usersRef.current = nextUsers;
      if (roomLang) { languageRef.current = roomLang; setLanguage(roomLang); }
      onJoined?.();
      // init Yjs once editor is mounted
      if (editorRef.current) initYjs();
      else pendingInitRef.current = true;
    });

    socket.on('users-update', ({ users: nextUsers }) => {
      setUsers(nextUsers);
      usersRef.current = nextUsers;
    });

    socket.on('language-change', ({ language: lang }) => {
      if (!lang) return;
      languageRef.current = lang;
      setLanguage(lang);
    });

    socket.on('room-not-found', () => {
      onRoomError?.('Room does not exist or has ended.');
      socket.disconnect();
    });

    socket.on('room-full', () => {
      onRoomError?.('Room is full (maximum 5 users).');
      socket.disconnect();
    });

    socket.on('connect_error', (err) => {
      console.error('Socket.IO connect error:', err.message);
      setStatus('disconnected');
    });

    return () => {
      socket.emit('leave-room', { roomId });
      socket.disconnect();
      socketRef.current = null;
      destroyYjs();
    };
  }, [roomId, username, createIfMissing, onRoomError, onJoined]); // ✅ no socketUrl dep

  // ── init Yjs after editor mounts if socket connected first ───────────────────
  useEffect(() => {
    if (editorReady && pendingInitRef.current) {
      initYjs();
      pendingInitRef.current = false;
    }
  }, [editorReady]);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current  = editor;
    monacoRef.current  = monaco;
    setEditorReady(true);
  };

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f] text-gray-200">

      {/* toolbar */}
      <div className="flex items-center justify-between px-4 h-12 bg-[#0d0d14] border-b border-gray-800">

        {/* left — room id + copy + status */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-500 uppercase tracking-widest">Room</span>
          <span className="font-mono text-sm text-gray-100">{roomId}</span>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.06] text-xs text-gray-300 hover:text-white hover:bg-white/[0.12] transition-colors"
          >
            <FiCopy size={12} />
            {copied ? 'Copied' : 'Copy link'}
          </button>

          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-emerald-400' : 'bg-gray-600'}`} />
            {status}
          </div>
        </div>

        {/* right — users + language selector */}
        <div className="flex items-center gap-4">

          {/* user badges */}
          <div className="flex items-center gap-1">
            {users.map((user, i) => {
              const color = getColorForIndex(i);
              return (
                <div
                  key={user.socketId}
                  className="px-2 py-1 rounded-full text-[11px] font-semibold border"
                  style={{ backgroundColor: `${color}22`, borderColor: `${color}55`, color }}
                  title={user.username}
                >
                  {getInitials(user.username)}
                </div>
              );
            })}
            <span className="text-[11px] text-gray-500 ml-2">{users.length}/5</span>
          </div>

          {/* language selector */}
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-[#111118] border border-gray-700 text-xs text-gray-200 px-2 py-1 rounded-md"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>{lang.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* editor */}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%"
          theme="vs-dark"
          defaultLanguage={MONACO_LANG_MAP[DEFAULT_LANGUAGE]}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontFamily: 'JetBrains Mono, Fira Code, monospace',
            fontLigatures: true,
            padding: { top: 16 },
            lineNumbersMinChars: 3,
            renderLineHighlight: 'all',
          }}
          onMount={handleEditorMount}
        />
      </div>
    </div>
  );
}