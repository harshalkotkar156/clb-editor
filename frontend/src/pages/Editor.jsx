// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useParams, useNavigate } from 'react-router-dom';
// import MonacoEditor from '@monaco-editor/react';
// import { getFile, updateFile, executeCode } from '../services/api';
// import {
//     openFile, setCode, setLanguage, setStdin,
//     toggleSidebar, markSaved,
//     selectCode, selectLanguage, selectStdin,
//     selectIsSidebarOpen, selectIsSaved, selectCurrentFile
// } from '../features/editor/editorSlice';
// import {
//     submitJob, resetExecution,
//     selectExecution, selectIsPolling
// } from '../features/execution/executionSlice';
// import { selectFiles } from '../features/files/filesSlice';
// import { usePolling } from '../hooks/usePolling.js';

// import Sidebar from '../components/Sidebar';
// import OutputPanel from '../components/OutputPanel';

// import { FiSave, FiPlay, FiLayout, FiChevronDown } from 'react-icons/fi';
// import { IoArrowBackOutline } from 'react-icons/io5';
// import { VscTerminal } from 'react-icons/vsc';


// const DEFAULT_CODE = {
//     cpp: `#include<iostream>
// using namespace std;

// int main() {
//     cout << "Hello, World!" << endl;
//     return 0;
// }`,
//     java: `public class Main {
//     public static void main(String[] args) {
//         System.out.println("Hello, World!");
//     }
// }`,
//     python: `# Python
// print("Hello, World!")`,
//     javascript: `// JavaScript
// console.log("Hello, World!");`,
// };

// const MONACO_LANG_MAP = {
//     cpp: 'cpp',
//     java: 'java',
//     python: 'python',
//     javascript: 'javascript',
// };

// const LANG_META = {
//     cpp:        { label: 'C++',        color: 'text-blue-400',   dot: 'bg-blue-400' },
//     java:       { label: 'Java',       color: 'text-red-400',    dot: 'bg-red-400' },
//     python:     { label: 'Python',     color: 'text-green-400',  dot: 'bg-green-400' },
//     javascript: { label: 'JavaScript', color: 'text-yellow-400', dot: 'bg-yellow-400' },
// };

// const LANGUAGES = ['cpp', 'java', 'python', 'javascript'];

// export default function Editor() {
//     const { fileId } = useParams();
//     const dispatch   = useDispatch();
//     const navigate   = useNavigate();

//     const code          = useSelector(selectCode);
//     const language      = useSelector(selectLanguage);
//     const stdin         = useSelector(selectStdin);
//     const isSidebarOpen = useSelector(selectIsSidebarOpen);
//     const isSaved       = useSelector(selectIsSaved);
//     const execution     = useSelector(selectExecution);
//     const isPolling     = useSelector(selectIsPolling);
//     const files         = useSelector(selectFiles);

//     const [isRunning,   setIsRunning]   = useState(false);
//     const [isSaving,    setIsSaving]    = useState(false);
//     const [fileName,    setFileName]    = useState('Untitled');
//     const [editingName, setEditingName] = useState(false);
//     const [langOpen,    setLangOpen]    = useState(false);

//     usePolling(execution.jobId, isPolling);

//     // load file on mount
//     useEffect(() => {
//         if (fileId && fileId !== 'new') {
//             loadFile(fileId);
//         } else {
//             // new file — load default code for current language
//             dispatch(setCode(DEFAULT_CODE[language] || ''));
//         }
//     }, [fileId]);

//     // when language changes → load default template
//     // but only if the editor is empty or still has the previous default
//     function handleLanguageChange(newLang) {
//         dispatch(setLanguage(newLang));
//         dispatch(setCode(DEFAULT_CODE[newLang] || ''));
//         setLangOpen(false);
//     }

//     async function loadFile(id) {
//         try {
//             const { data } = await getFile(id);
//             dispatch(openFile(data));
//             setFileName(data.name);
//         } catch (err) {
//             console.error(err);
//             navigate('/dashboard');
//         }
//     }

//     async function handleRun() {
//         dispatch(resetExecution());
//         setIsRunning(true);
//         try {
//             const { data } = await executeCode({
//                 language,
//                 code,
//                 stdin,
//                 fileId: fileId !== 'new' ? fileId : undefined,
//             });
//             dispatch(submitJob(data.jobId));
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setIsRunning(false);
//         }
//     }

//     async function handleSave() {
//         if (!fileId || fileId === 'new') return;
//         setIsSaving(true);
//         try {
//             await updateFile(fileId, { code, name: fileName });
//             dispatch(markSaved());
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setIsSaving(false);
//         }
//     }

//     async function handleRename(newName) {
//         const trimmed = newName.trim() || 'Untitled';
//         setFileName(trimmed);
//         setEditingName(false);
//         if (fileId && fileId !== 'new') {
//             await updateFile(fileId, { name: trimmed }).catch(console.error);
//         }
//     }

//     // Ctrl+S / Cmd+S → save
//     useEffect(() => {
//         const handler = (e) => {
//             if ((e.ctrlKey || e.metaKey) && e.key === 's') {
//                 e.preventDefault();
//                 handleSave();
//             }
//         };
//         window.addEventListener('keydown', handler);
//         return () => window.removeEventListener('keydown', handler);
//     }, [code, fileName]);

//     const meta = LANG_META[language] || LANG_META.cpp;

//     return (
//         <div className="flex h-screen bg-[#0a0a0f] text-gray-200 overflow-hidden font-mono">

//             {/* ── Sidebar ── */}
//             <Sidebar
//                 isOpen={isSidebarOpen}
//                 files={files}
//                 currentFileId={fileId}
//                 onFileSelect={(id) => navigate(`/editor/${id}`)}
//                 onClose={() => dispatch(toggleSidebar())}
//             />

//             {/* ── Main ── */}
//             <div className="flex flex-col flex-1 min-w-0">

//                 {/* ── Top Bar ── */}
//                 <div className="flex items-center justify-between px-4 h-12 bg-[#0d0d14] border-b border-gray-800 shrink-0">

//                     {/* Left side */}
//                     <div className="flex items-center gap-3">

//                         {/* Sidebar toggle */}
//                         <button
//                             onClick={() => dispatch(toggleSidebar())}
//                             className="p-1.5 rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
//                             title="Toggle sidebar"
//                         >
//                             <FiLayout size={17} />
//                         </button>

//                         {/* Back to dashboard */}
//                         <button
//                             onClick={() => navigate('/dashboard')}
//                             className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all text-xs font-semibold"
//                             title="Back to dashboard"
//                         >
//                             <IoArrowBackOutline size={15} />
//                             Dashboard
//                         </button>

//                         <div className="w-px h-5 bg-gray-700" />

//                         {/* File name — click to rename */}
//                         {editingName ? (
//                             <input
//                                 autoFocus
//                                 defaultValue={fileName}
//                                 onBlur={e => handleRename(e.target.value)}
//                                 onKeyDown={e => e.key === 'Enter' && handleRename(e.target.value)}
//                                 className="bg-gray-800 border border-gray-600 rounded-md text-gray-100 px-2 py-0.5 text-sm outline-none w-40"
//                             />
//                         ) : (
//                             <span
//                                 onClick={() => setEditingName(true)}
//                                 className="flex items-center gap-1.5 text-sm text-gray-100 cursor-pointer hover:text-white transition-colors px-1 rounded"
//                                 title="Click to rename"
//                             >
//                                 {fileName}
//                                 {!isSaved && (
//                                     <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" title="Unsaved changes" />
//                                 )}
//                             </span>
//                         )}

//                         {/* Language selector — custom dropdown */}
//                         <div className="relative">
//                             <button
//                                 onClick={() => setLangOpen(v => !v)}
//                                 className="flex items-center gap-2 px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-xs hover:border-gray-500 transition-colors"
//                             >
//                                 <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
//                                 <span className={`font-semibold ${meta.color}`}>{meta.label}</span>
//                                 <FiChevronDown size={12} className="text-gray-500" />
//                             </button>

//                             {langOpen && (
//                                 <div className="absolute top-9 left-0 z-50 bg-[#111118] border border-gray-700 rounded-lg shadow-xl py-1 w-40">
//                                     {LANGUAGES.map(lang => {
//                                         const m = LANG_META[lang];
//                                         return (
//                                             <button
//                                                 key={lang}
//                                                 onClick={() => handleLanguageChange(lang)}
//                                                 className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-gray-800 transition-colors ${language === lang ? 'bg-gray-800' : ''}`}
//                                             >
//                                                 <span className={`w-2 h-2 rounded-full ${m.dot}`} />
//                                                 <span className={`font-semibold ${m.color}`}>{m.label}</span>
//                                                 {language === lang && (
//                                                     <span className="ml-auto text-gray-500">✓</span>
//                                                 )}
//                                             </button>
//                                         );
//                                     })}
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Right side */}
//                     <div className="flex items-center gap-2">

//                         {/* Save button */}
//                         <button
//                             onClick={handleSave}
//                             disabled={isSaving || isSaved}
//                             className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-700 text-gray-400 text-xs font-semibold hover:border-gray-500 hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
//                         >
//                             <FiSave size={14} />
//                             {isSaving ? 'Saving...' : 'Save'}
//                         </button>

//                         {/* Run button */}
//                         <button
//                             onClick={handleRun}
//                             disabled={isRunning || isPolling}
//                             className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-green-600 hover:bg-green-500 active:bg-green-700 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-900/30"
//                         >
//                             <FiPlay size={13} fill="white" />
//                             {isRunning || isPolling ? 'Running...' : 'Run'}
//                         </button>
//                     </div>
//                 </div>

//                 {/* ── Body: Editor + IO ── */}
//                 <div className="flex flex-1 overflow-hidden">

//                     {/* Monaco editor */}
//                     <div className="flex-1 overflow-hidden">
//                         <MonacoEditor
//                             height="100%"
//                             language={MONACO_LANG_MAP[language]}
//                             value={code}
//                             onChange={(val) => dispatch(setCode(val || ''))}
//                             theme="vs-dark"
//                             options={{
//                                 fontSize:             14,
//                                 minimap:              { enabled: false },
//                                 scrollBeyondLastLine: false,
//                                 fontFamily:           'JetBrains Mono, Fira Code, monospace',
//                                 fontLigatures:        true,
//                                 padding:              { top: 16 },
//                                 lineNumbersMinChars:  3,
//                                 renderLineHighlight:  'all',
//                             }}
//                         />
//                     </div>

//                     {/* Right pane: stdin + output */}
//                     <div className="w-80 flex flex-col border-l border-gray-800 shrink-0">

//                         {/* stdin */}
//                         <div className="flex flex-col border-b border-gray-800" style={{ height: '35%' }}>
//                             <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0d0d14] border-b border-gray-800 shrink-0">
//                                 <VscTerminal size={13} className="text-gray-500" />
//                                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">stdin</span>
//                             </div>
//                             <textarea
//                                 className="flex-1 bg-[#0a0a0f] text-gray-300 text-sm p-3 resize-none outline-none placeholder-gray-700 font-mono"
//                                 placeholder="Enter input here..."
//                                 value={stdin}
//                                 onChange={e => dispatch(setStdin(e.target.value))}
//                                 spellCheck={false}
//                             />
//                         </div>

//                         {/* output */}
//                         <OutputPanel execution={execution} isPolling={isPolling} />
//                     </div>
//                 </div>
//             </div>

//             {/* close lang dropdown on outside click */}
//             {langOpen && (
//                 <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
//             )}
//         </div>
//     );
// }


import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import { io } from 'socket.io-client';
import { getFile, updateFile, executeCode, createFile } from '../services/api';
import {
  openFile, setCode, setLanguage, setStdin,
  toggleSidebar, markSaved,
  selectCode, selectLanguage, selectStdin,
  selectIsSidebarOpen, selectIsSaved,
} from '../features/editor/editorSlice';
import {
  submitJob, resetExecution,
  selectExecution, selectIsPolling,
} from '../features/execution/executionSlice';
import { selectFiles } from '../features/files/filesSlice';
import { selectUser, selectIsAuthenticated } from '../features/auth/authSlice';
import { usePolling } from '../hooks/usePolling.js';
import Sidebar from '../components/Sidebar';
import OutputPanel from '../components/OutputPanel';
import { FiSave, FiPlay, FiLayout, FiChevronDown, FiCopy, FiX, FiUsers } from 'react-icons/fi';
import { IoArrowBackOutline } from 'react-icons/io5';
import { VscTerminal } from 'react-icons/vsc';
import { RiVipCrownLine } from 'react-icons/ri';

// ── constants ────────────────────────────────────────────────────────────────
const WS_URL     = 'ws://localhost:3001/yjs';
const SOCKET_URL = 'http://localhost:3001';

const COLOR_PALETTE = ['#F87171', '#34D399', '#60A5FA', '#FBBF24', '#A78BFA'];

const DEFAULT_CODE = {
  cpp: `#include<iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
  python: `# Python\nprint("Hello, World!")`,
  javascript: `// JavaScript\nconsole.log("Hello, World!");`,
};

const MONACO_LANG_MAP = {
  cpp: 'cpp', java: 'java', python: 'python', javascript: 'javascript',
};

const LANG_META = {
  cpp:        { label: 'C++',        color: 'text-blue-400',   dot: 'bg-blue-400'   },
  java:       { label: 'Java',       color: 'text-red-400',    dot: 'bg-red-400'    },
  python:     { label: 'Python',     color: 'text-green-400',  dot: 'bg-green-400'  },
  javascript: { label: 'JavaScript', color: 'text-yellow-400', dot: 'bg-yellow-400' },
};

const LANGUAGES = ['cpp', 'java', 'python', 'javascript'];

const getColorForIndex = (i) => COLOR_PALETTE[i % COLOR_PALETTE.length];
const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase();

function generateRoomId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// ── cursor style helpers ─────────────────────────────────────────────────────
const escapeCss = (v) =>
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
  const safe = escapeCss(name || 'Guest');
  tag.textContent = `
    .collab-sel-${clientId}  { background: ${color}33; }
    .collab-cur-${clientId}  { border-left: 2px solid ${color}; margin-left: -1px; }
    .collab-cur-${clientId}::after {
      content: "${safe}";
      position: relative; top: -1.4em; left: -1px;
      background: ${color}; color: #0a0a0f;
      font-size: 10px; padding: 1px 6px;
      border-radius: 8px; font-family: sans-serif; white-space: nowrap;
    }
  `;
};

const removeCursorStyle = (styleMap, clientId) => {
  styleMap.get(clientId)?.remove();
  styleMap.delete(clientId);
};

// ── main component ───────────────────────────────────────────────────────────
export default function Editor() {
  const { fileId } = useParams();
  const dispatch   = useDispatch();
  const navigate   = useNavigate();

  // redux state
  const code          = useSelector(selectCode);
  const language      = useSelector(selectLanguage);
  const stdin         = useSelector(selectStdin);
  const isSidebarOpen = useSelector(selectIsSidebarOpen);
  const isSaved       = useSelector(selectIsSaved);
  const execution     = useSelector(selectExecution);
  const isPolling     = useSelector(selectIsPolling);
  const files         = useSelector(selectFiles);
  const user          = useSelector(selectUser);          // ✅ real user
  const isAuthenticated = useSelector(selectIsAuthenticated); // ✅ auth check

  // editor UI state
  const [isRunning,   setIsRunning]   = useState(false);
  const [isSaving,    setIsSaving]    = useState(false);
  const [fileName,    setFileName]    = useState('Untitled');
  const [editingName, setEditingName] = useState(false);
  const [langOpen,    setLangOpen]    = useState(false);

  // ── collab state ────────────────────────────────────────────────────────────
  const [isCollabMode,   setIsCollabMode]   = useState(false);
  const [roomId,         setRoomId]         = useState(null);
  const [isHost,         setIsHost]         = useState(false);
  const [collabUsers,    setCollabUsers]    = useState([]);
  const [collabStatus,   setCollabStatus]   = useState('connecting');
  const [copied,         setCopied]         = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [roomClosedMsg,  setRoomClosedMsg]  = useState('');
  const [collabLang,     setCollabLang]     = useState(language);

  // ── refs ────────────────────────────────────────────────────────────────────
  const editorRef           = useRef(null);
  const monacoRef           = useRef(null);
  const socketRef           = useRef(null);
  const ydocRef             = useRef(null);
  const providerRef         = useRef(null);
  const bindingRef          = useRef(null);
  const selectionDisposable = useRef(null);
  const awarenessListener   = useRef(null);
  const decorationsRef      = useRef(new Map());
  const styleMapRef         = useRef(new Map());
  const socketIdRef         = useRef('');
  const usersRef            = useRef([]);
  const languageRef         = useRef(language);

  usePolling(execution.jobId, isPolling);

  // ── load file ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (fileId && fileId !== 'new') {
      loadFile(fileId);
    } else {
      dispatch(setCode(DEFAULT_CODE[language] || ''));
    }
  }, [fileId]);

  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => { usersRef.current = collabUsers; }, [collabUsers]);

  async function loadFile(id) {
    try {
      const { data } = await getFile(id);
      dispatch(openFile(data));
      setFileName(data.name);
    } catch {
      navigate('/dashboard');
    }
  }

  // ── language change ─────────────────────────────────────────────────────────
  function handleLanguageChange(newLang) {
    dispatch(setLanguage(newLang));
    languageRef.current = newLang;
    if (!isCollabMode) {
      dispatch(setCode(DEFAULT_CODE[newLang] || ''));
    } else {
      // broadcast language change to room
      socketRef.current?.emit('language-change', { roomId, language: newLang });
    }
    setLangOpen(false);
  }

  // ── run ─────────────────────────────────────────────────────────────────────
  async function handleRun() {
    dispatch(resetExecution());
    setIsRunning(true);
    try {
      const currentCode = editorRef.current?.getValue() || code;
      const { data } = await executeCode({
        language: isCollabMode ? collabLang : language,
        code: currentCode,
        stdin,
        fileId: fileId !== 'new' ? fileId : undefined,
      });
      dispatch(submitJob(data.jobId));
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  }

  // ── save ─────────────────────────────────────────────────────────────────────
  async function handleSave() {
    const currentCode = editorRef.current?.getValue() || code;

    if (isCollabMode && !isHost) {
      // ✅ joiner save → create NEW file in their account
      setIsSaving(true);
      try {
        const { data } = await createFile({
          name:     `${fileName}-collab-copy`,
          language: collabLang,
          code:     currentCode,
        });
        // navigate to their new file
        navigate(`/editor/${data._id}`);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // host save or individual save → update existing file
    if (!fileId || fileId === 'new') return;
    setIsSaving(true);
    try {
      await updateFile(fileId, { code: currentCode, name: fileName });
      dispatch(markSaved());
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRename(newName) {
    const trimmed = newName.trim() || 'Untitled';
    setFileName(trimmed);
    setEditingName(false);
    if (fileId && fileId !== 'new') {
      await updateFile(fileId, { name: trimmed }).catch(console.error);
    }
  }

  // Ctrl+S
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [code, fileName, isCollabMode, collabLang]);

  // ── collab: start room ───────────────────────────────────────────────────────
  function handleStartCollab() {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setIsHost(true);
    setIsCollabMode(true);
    setCollabLang(language);
  }

  // ── collab: copy link ────────────────────────────────────────────────────────
  async function handleCopyLink() {
    const link = `${window.location.origin}/room/${roomId}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  // ── collab: host close room ──────────────────────────────────────────────────
  function handleCloseRoom() {
    socketRef.current?.emit('close-room', { roomId });
    setShowCloseConfirm(false);
    destroyCollab();
    setIsCollabMode(false);
    setRoomId(null);
    setIsHost(false);
    setCollabUsers([]);
  }

  // ── collab: leave room (non-host) ────────────────────────────────────────────
  function handleLeaveRoom() {
    socketRef.current?.emit('leave-room', { roomId });
    destroyCollab();
    setIsCollabMode(false);
    setRoomId(null);
    setIsHost(false);
    setCollabUsers([]);
  }

  // ── Yjs init ─────────────────────────────────────────────────────────────────
  const initYjs = (currentRoomId, currentLang) => {
    if (!editorRef.current || providerRef.current) return;

    const ydoc     = new Y.Doc();
    const provider = new WebsocketProvider(WS_URL, currentRoomId, ydoc, { connect: true });
    const ytext    = ydoc.getText('monaco');
    const model    = editorRef.current.getModel();
    if (!model) { ydoc.destroy(); provider.destroy(); return; }

    const binding = new MonacoBinding(
      ytext, model, new Set([editorRef.current]), provider.awareness,
    );

    ydocRef.current     = ydoc;
    providerRef.current = provider;
    bindingRef.current  = binding;

    // set user awareness
    const idx   = usersRef.current.findIndex((u) => u.socketId === socketIdRef.current);
    const color = getColorForIndex(idx >= 0 ? idx : 0);
    provider.awareness.setLocalStateField('user', {
      name: user?.name || 'User',
      color,
    });

    // cursor tracking
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
    awarenessListener.current   = updateRemoteCursors;
    provider.awareness.on('change', updateRemoteCursors);
  };

  // ── Yjs destroy ──────────────────────────────────────────────────────────────
  const destroyCollab = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;

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
    styleMapRef.current.forEach((tag) => tag.remove());
    styleMapRef.current.clear();
  };

  // ── remote cursors ───────────────────────────────────────────────────────────
  const updateRemoteCursors = () => {
    const provider = providerRef.current;
    const editor   = editorRef.current;
    const monaco   = monacoRef.current;
    if (!provider || !editor || !monaco) return;

    const awareness = provider.awareness;
    const states    = awareness.getStates();
    const localId   = awareness.clientID;
    const nextDeco  = new Map();

    states.forEach((state, clientId) => {
      if (clientId === localId) return;
      const sel = state.selection;
      if (!sel?.start || !sel?.end) return;

      const { color = COLOR_PALETTE[0], name = 'Guest' } = state.user || {};
      upsertCursorStyle(styleMapRef.current, clientId, color, name);

      const selRange = new monaco.Range(
        sel.start.lineNumber, sel.start.column,
        sel.end.lineNumber,   sel.end.column,
      );
      const curRange = new monaco.Range(
        sel.end.lineNumber, sel.end.column,
        sel.end.lineNumber, sel.end.column,
      );

      const ids = editor.deltaDecorations(
        decorationsRef.current.get(clientId) || [],
        [
          { range: selRange, options: { className: `collab-sel-${clientId}` } },
          { range: curRange, options: { beforeContentClassName: `collab-cur-${clientId}` } },
        ],
      );
      nextDeco.set(clientId, ids);
    });

    decorationsRef.current.forEach((ids, clientId) => {
      if (!nextDeco.has(clientId)) {
        editor.deltaDecorations(ids, []);
        removeCursorStyle(styleMapRef.current, clientId);
      }
    });
    decorationsRef.current = nextDeco;
  };

  // ── Socket.IO setup when collab mode starts ──────────────────────────────────
  useEffect(() => {
    if (!isCollabMode || !roomId || !user) return;

    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socketIdRef.current = socket.id;
      setCollabStatus('connected');
      socket.emit('join-room', {
        roomId,
        username:        user.name || user.email || 'User',
        createIfMissing: isHost,
        language:        languageRef.current,
      });
    });

    socket.on('disconnect', () => setCollabStatus('disconnected'));

    socket.on('room-joined', ({ users, language: roomLang, isHost: hostFlag }) => {
      setCollabUsers(users);
      usersRef.current = users;
      if (roomLang) {
        setCollabLang(roomLang);
        languageRef.current = roomLang;
        dispatch(setLanguage(roomLang));
      }
      setIsHost(hostFlag);
      // init Yjs now that we are in the room
      if (editorRef.current) initYjs(roomId, roomLang || language);
    });

    socket.on('users-update', ({ users }) => {
      setCollabUsers(users);
      usersRef.current = users;
    });

    socket.on('language-change', ({ language: lang }) => {
      if (!lang) return;
      setCollabLang(lang);
      languageRef.current = lang;
      dispatch(setLanguage(lang));
      // update monaco model language
      const model = editorRef.current?.getModel();
      if (model && monacoRef.current) {
        monacoRef.current.editor.setModelLanguage(model, MONACO_LANG_MAP[lang] || 'javascript');
      }
    });

    socket.on('room-not-found', () => {
      setRoomClosedMsg('Room not found.');
      destroyCollab();
      setIsCollabMode(false);
    });

    socket.on('room-full', () => {
      setRoomClosedMsg('Room is full (max 5 users).');
      destroyCollab();
      setIsCollabMode(false);
    });

    // ✅ host closed the room — show message, fall back to individual mode
    socket.on('room-closed', ({ message }) => {
      setRoomClosedMsg(message || 'Host ended the session.');
      destroyCollab();
      setIsCollabMode(false);
      setRoomId(null);
      setIsHost(false);
      setCollabUsers([]);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message);
      setCollabStatus('disconnected');
    });

    return () => {
      socket.emit('leave-room', { roomId });
      socket.disconnect();
      socketRef.current = null;
      destroyCollab();
    };
  }, [isCollabMode, roomId]);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current  = editor;
    monacoRef.current  = monaco;
  };

  const meta = LANG_META[isCollabMode ? collabLang : language] || LANG_META.cpp;

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#0a0a0f] text-gray-200 overflow-hidden font-mono">

      <Sidebar
        isOpen={isSidebarOpen}
        files={files}
        currentFileId={fileId}
        onFileSelect={(id) => navigate(`/editor/${id}`)}
        onClose={() => dispatch(toggleSidebar())}
      />

      <div className="flex flex-col flex-1 min-w-0">

        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between px-4 h-12 bg-[#0d0d14] border-b border-gray-800 shrink-0">

          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
            >
              <FiLayout size={17} />
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all text-xs font-semibold"
            >
              <IoArrowBackOutline size={15} /> Dashboard
            </button>

            <div className="w-px h-5 bg-gray-700" />

            {/* file name */}
            {editingName ? (
              <input
                autoFocus
                defaultValue={fileName}
                onBlur={e => handleRename(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRename(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-md text-gray-100 px-2 py-0.5 text-sm outline-none w-40"
              />
            ) : (
              <span
                onClick={() => setEditingName(true)}
                className="flex items-center gap-1.5 text-sm text-gray-100 cursor-pointer hover:text-white px-1 rounded"
              >
                {fileName}
                {!isSaved && !isCollabMode && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                )}
              </span>
            )}

            {/* language dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(v => !v)}
                className="flex items-center gap-2 px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-xs hover:border-gray-500 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                <span className={`font-semibold ${meta.color}`}>{meta.label}</span>
                <FiChevronDown size={12} className="text-gray-500" />
              </button>
              {langOpen && (
                <div className="absolute top-9 left-0 z-50 bg-[#111118] border border-gray-700 rounded-lg shadow-xl py-1 w-40">
                  {LANGUAGES.map(lang => {
                    const m = LANG_META[lang];
                    return (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-gray-800 transition-colors ${(isCollabMode ? collabLang : language) === lang ? 'bg-gray-800' : ''}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${m.dot}`} />
                        <span className={`font-semibold ${m.color}`}>{m.label}</span>
                        {(isCollabMode ? collabLang : language) === lang && (
                          <span className="ml-auto text-gray-500">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ✅ collab room info when active */}
            {isCollabMode && roomId && (
              <div className="flex items-center gap-2 ml-2">
                <div className="w-px h-5 bg-gray-700" />
                <span className="text-[11px] text-gray-500 uppercase tracking-widest">Room</span>
                <span className="font-mono text-xs text-gray-100">{roomId}</span>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.06] text-xs text-gray-300 hover:text-white hover:bg-white/[0.12] transition-colors"
                >
                  <FiCopy size={11} />
                  {copied ? 'Copied!' : 'Copy link'}
                </button>
                <span className={`w-2 h-2 rounded-full ${collabStatus === 'connected' ? 'bg-emerald-400' : 'bg-gray-600'}`} />

                {/* user badges */}
                <div className="flex items-center gap-1 ml-1">
                  {collabUsers.map((u, i) => {
                    const color = getColorForIndex(i);
                    return (
                      <div
                        key={u.socketId}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1"
                        style={{ backgroundColor: `${color}22`, borderColor: `${color}55`, color }}
                        title={u.username}
                      >
                        {u.isHost && <RiVipCrownLine size={9} />}
                        {getInitials(u.username)}
                      </div>
                    );
                  })}
                  <span className="text-[11px] text-gray-500 ml-1">{collabUsers.length}/5</span>
                </div>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">

            {/* ✅ Collaborate button — only for logged-in users, only when not in collab mode */}
            {isAuthenticated && !isCollabMode && (
              <button
                onClick={handleStartCollab}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
              >
                <FiUsers size={13} />
                Collaborate
              </button>
            )}

            {/* ✅ Close room button — host only */}
            {isCollabMode && isHost && (
              <button
                onClick={() => setShowCloseConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-600/30 transition-all"
              >
                <FiX size={13} />
                Close Room
              </button>
            )}

            {/* ✅ Leave room button — non-host */}
            {isCollabMode && !isHost && (
              <button
                onClick={handleLeaveRoom}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-700 text-gray-300 text-xs font-bold hover:bg-gray-600 transition-all"
              >
                <FiX size={13} />
                Leave Room
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving || (isSaved && !isCollabMode)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-700 text-gray-400 text-xs font-semibold hover:border-gray-500 hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FiSave size={14} />
              {isSaving ? 'Saving...' : isCollabMode && !isHost ? 'Save Copy' : 'Save'}
            </button>

            <button
              onClick={handleRun}
              disabled={isRunning || isPolling}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-green-600 hover:bg-green-500 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-900/30"
            >
              <FiPlay size={13} fill="white" />
              {isRunning || isPolling ? 'Running...' : 'Run'}
            </button>
          </div>
        </div>

        {/* ── room closed notification ── */}
        {roomClosedMsg && (
          <div className="flex items-center justify-between px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs">
            <span>{roomClosedMsg}</span>
            <button onClick={() => setRoomClosedMsg('')} className="text-red-400 hover:text-red-300">
              <FiX size={14} />
            </button>
          </div>
        )}

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              height="100%"
              language={MONACO_LANG_MAP[isCollabMode ? collabLang : language]}
              value={isCollabMode ? undefined : code}
              onChange={isCollabMode ? undefined : (val) => dispatch(setCode(val || ''))}
              theme="vs-dark"
              options={{
                fontSize:             14,
                minimap:              { enabled: false },
                scrollBeyondLastLine: false,
                fontFamily:           'JetBrains Mono, Fira Code, monospace',
                fontLigatures:        true,
                padding:              { top: 16 },
                lineNumbersMinChars:  3,
                renderLineHighlight:  'all',
              }}
              onMount={handleEditorMount}
            />
          </div>

          <div className="w-80 flex flex-col border-l border-gray-800 shrink-0">
            <div className="flex flex-col border-b border-gray-800" style={{ height: '35%' }}>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0d0d14] border-b border-gray-800 shrink-0">
                <VscTerminal size={13} className="text-gray-500" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">stdin</span>
              </div>
              <textarea
                className="flex-1 bg-[#0a0a0f] text-gray-300 text-sm p-3 resize-none outline-none placeholder-gray-700 font-mono"
                placeholder="Enter input here..."
                value={stdin}
                onChange={e => dispatch(setStdin(e.target.value))}
                spellCheck={false}
              />
            </div>
            <OutputPanel execution={execution} isPolling={isPolling} />
          </div>
        </div>
      </div>

      {/* close lang dropdown */}
      {langOpen && <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />}

      {/* ✅ close room confirm modal */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0d0d18] border border-white/10 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-bold text-white mb-2">Close Room?</h3>
            <p className="text-sm text-gray-400 mb-6">
              This will end the session for all participants. They will be disconnected immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseRoom}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition-colors"
              >
                Close Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}