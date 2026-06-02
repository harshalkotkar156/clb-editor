// import { useEffect, useState, useCallback } from 'react';
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


// import Sidebar from '../components/Sidebar';
// import OutputPanel from '../components/OutputPanel';
// import {
//     Play, Save, PanelLeft, ChevronDown,
//     Circle, CheckCircle, XCircle, Loader
// } from 'lucide-react';

// const LANGUAGES = ['cpp', 'java', 'python', 'javascript'];
// const MONACO_LANG_MAP = {
//     cpp: 'cpp', java: 'java', python: 'python', javascript: 'javascript'
// };

// export default function Editor() {
//     const { fileId } = useParams();
//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     const code = useSelector(selectCode);
//     const language = useSelector(selectLanguage);
//     const stdin = useSelector(selectStdin);
//     const isSidebarOpen = useSelector(selectIsSidebarOpen);
//     const isSaved = useSelector(selectIsSaved);
//     const currentFile = useSelector(selectCurrentFile);
//     const execution = useSelector(selectExecution);
//     const isPolling = useSelector(selectIsPolling);
//     const files = useSelector(selectFiles);

//     const [isRunning, setIsRunning] = useState(false);
//     const [isSaving, setIsSaving] = useState(false);
//     const [fileName, setFileName] = useState('Untitled');
//     const [editingName, setEditingName] = useState(false);

//     // start polling when we have a jobId
//     usePolling(execution.jobId, isPolling);

//     // load file on mount
//     useEffect(() => {
//         if (fileId && fileId !== 'new') {
//             loadFile(fileId);
//         }
//     }, [fileId]);

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
//         setFileName(newName);
//         setEditingName(false);
//         if (fileId && fileId !== 'new') {
//             await updateFile(fileId, { name: newName }).catch(console.error);
//         }
//     }

//     // auto-save on Ctrl+S
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

//     return (
//         <div style={styles.root}>

//             {/* Sidebar */}
//             <Sidebar
//                 isOpen={isSidebarOpen}
//                 files={files}
//                 currentFileId={fileId}
//                 onFileSelect={(id) => navigate(`/editor/${id}`)}
//                 onClose={() => dispatch(toggleSidebar())}
//             />

//             {/* Main area */}
//             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

//                 {/* Top Bar */}
//                 <div style={styles.topBar}>
//                     <div style={styles.topLeft}>
//                         <button onClick={() => dispatch(toggleSidebar())} style={styles.iconBtn}>
//                             <PanelLeft size={18} />
//                         </button>

//                         {/* File name — click to rename */}
//                         {editingName ? (
//                             <input
//                                 autoFocus
//                                 defaultValue={fileName}
//                                 onBlur={e => handleRename(e.target.value)}
//                                 onKeyDown={e => e.key === 'Enter' && handleRename(e.target.value)}
//                                 style={styles.renameInput}
//                             />
//                         ) : (
//                             <span style={styles.fileNameLabel} onClick={() => setEditingName(true)}>
//                                 {fileName}
//                                 {!isSaved && <span style={styles.unsavedDot}>●</span>}
//                             </span>
//                         )}

//                         <div style={styles.langSelect}>
//                             <select
//                                 value={language}
//                                 onChange={e => dispatch(setLanguage(e.target.value))}
//                                 style={styles.select}
//                             >
//                                 {LANGUAGES.map(l => (
//                                     <option key={l} value={l}>{l.toUpperCase()}</option>
//                                 ))}
//                             </select>
//                             <ChevronDown size={12} style={{ position: 'absolute', right: 8, pointerEvents: 'none', color: '#6b7280' }} />
//                         </div>
//                     </div>

//                     <div style={styles.topRight}>
//                         <button onClick={handleSave} style={styles.saveBtn} disabled={isSaving || isSaved}>
//                             <Save size={15} />
//                             {isSaving ? 'Saving...' : 'Save'}
//                         </button>
//                         <button onClick={handleRun} style={styles.runBtn} disabled={isRunning || isPolling}>
//                             <Play size={15} fill="#fff" />
//                             {isRunning || isPolling ? 'Running...' : 'Run'}
//                         </button>
//                     </div>
//                 </div>

//                 {/* Editor + IO panels */}
//                 <div style={styles.body}>

//                     {/* Monaco Editor */}
//                     <div style={styles.editorPane}>
//                         <MonacoEditor
//                             height="100%"
//                             language={MONACO_LANG_MAP[language]}
//                             value={code}
//                             onChange={(val) => dispatch(setCode(val || ''))}
//                             theme="vs-dark"
//                             options={{
//                                 fontSize: 14,
//                                 minimap: { enabled: false },
//                                 scrollBeyondLastLine: false,
//                                 fontFamily: 'JetBrains Mono, Fira Code, monospace',
//                                 fontLigatures: true,
//                                 padding: { top: 16 },
//                                 lineNumbersMinChars: 3,
//                             }}
//                         />
//                     </div>

//                     {/* Right panel — Input + Output */}
//                     <div style={styles.rightPane}>
//                         {/* Input */}
//                         <div style={styles.panel}>
//                             <div style={styles.panelHeader}>stdin</div>
//                             <textarea
//                                 style={styles.stdinArea}
//                                 placeholder="Enter input here..."
//                                 value={stdin}
//                                 onChange={e => dispatch(setStdin(e.target.value))}
//                                 spellCheck={false}
//                             />
//                         </div>

//                         {/* Output */}
//                         <OutputPanel execution={execution} isPolling={isPolling} />
//                     </div>

//                 </div>
//             </div>
//         </div>
//     );
// }

// const styles = {
//     root: { display: 'flex', height: '100vh', background: '#0a0a0f', color: '#e5e7eb', fontFamily: 'monospace', overflow: 'hidden' },
//     topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', height: 48, background: '#0d0d14', borderBottom: '1px solid #1f2937', flexShrink: 0 },
//     topLeft: { display: 'flex', alignItems: 'center', gap: 12 },
//     topRight: { display: 'flex', alignItems: 'center', gap: 10 },
//     iconBtn: { background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center' },
//     fileNameLabel: { fontSize: 13, color: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
//     unsavedDot: { color: '#f59e0b', fontSize: 10 },
//     renameInput: { background: '#1f2937', border: '1px solid #374151', borderRadius: 6, color: '#f9fafb', padding: '3px 8px', fontSize: 13, outline: 'none' },
//     langSelect: { position: 'relative', display: 'flex', alignItems: 'center' },
//     select: { background: '#1f2937', border: '1px solid #374151', borderRadius: 6, color: '#9ca3af', padding: '4px 28px 4px 10px', fontSize: 12, cursor: 'pointer', appearance: 'none', outline: 'none' },
//     saveBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid #374151', color: '#9ca3af', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
//     runBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700 },
//     body: { display: 'flex', flex: 1, overflow: 'hidden' },
//     editorPane: { flex: 1, overflow: 'hidden' },
//     rightPane: { width: 340, display: 'flex', flexDirection: 'column', borderLeft: '1px solid #1f2937', flexShrink: 0 },
//     panel: { display: 'flex', flexDirection: 'column', borderBottom: '1px solid #1f2937', height: '35%' },
//     panelHeader: { padding: '6px 14px', fontSize: 11, color: '#6b7280', background: '#0d0d14', borderBottom: '1px solid #1f2937', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' },
//     stdinArea: { flex: 1, background: '#0a0a0f', border: 'none', color: '#e5e7eb', padding: 12, resize: 'none', fontSize: 13, fontFamily: 'monospace', outline: 'none' },
// };


import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import { getFile, updateFile, executeCode } from '../services/api';
import {
    openFile, setCode, setLanguage, setStdin,
    toggleSidebar, markSaved,
    selectCode, selectLanguage, selectStdin,
    selectIsSidebarOpen, selectIsSaved, selectCurrentFile
} from '../features/editor/editorSlice';
import {
    submitJob, resetExecution,
    selectExecution, selectIsPolling
} from '../features/execution/executionSlice';
import { selectFiles } from '../features/files/filesSlice';
import { usePolling } from '../hooks/usePolling.js';

import Sidebar from '../components/Sidebar';
import OutputPanel from '../components/OutputPanel';

import { FiSave, FiPlay, FiLayout, FiChevronDown } from 'react-icons/fi';
import { IoArrowBackOutline } from 'react-icons/io5';
import { VscTerminal } from 'react-icons/vsc';


const DEFAULT_CODE = {
    cpp: `#include<iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    python: `# Python
print("Hello, World!")`,
    javascript: `// JavaScript
console.log("Hello, World!");`,
};

const MONACO_LANG_MAP = {
    cpp: 'cpp',
    java: 'java',
    python: 'python',
    javascript: 'javascript',
};

const LANG_META = {
    cpp:        { label: 'C++',        color: 'text-blue-400',   dot: 'bg-blue-400' },
    java:       { label: 'Java',       color: 'text-red-400',    dot: 'bg-red-400' },
    python:     { label: 'Python',     color: 'text-green-400',  dot: 'bg-green-400' },
    javascript: { label: 'JavaScript', color: 'text-yellow-400', dot: 'bg-yellow-400' },
};

const LANGUAGES = ['cpp', 'java', 'python', 'javascript'];

export default function Editor() {
    const { fileId } = useParams();
    const dispatch   = useDispatch();
    const navigate   = useNavigate();

    const code          = useSelector(selectCode);
    const language      = useSelector(selectLanguage);
    const stdin         = useSelector(selectStdin);
    const isSidebarOpen = useSelector(selectIsSidebarOpen);
    const isSaved       = useSelector(selectIsSaved);
    const execution     = useSelector(selectExecution);
    const isPolling     = useSelector(selectIsPolling);
    const files         = useSelector(selectFiles);

    const [isRunning,   setIsRunning]   = useState(false);
    const [isSaving,    setIsSaving]    = useState(false);
    const [fileName,    setFileName]    = useState('Untitled');
    const [editingName, setEditingName] = useState(false);
    const [langOpen,    setLangOpen]    = useState(false);

    usePolling(execution.jobId, isPolling);

    // load file on mount
    useEffect(() => {
        if (fileId && fileId !== 'new') {
            loadFile(fileId);
        } else {
            // new file — load default code for current language
            dispatch(setCode(DEFAULT_CODE[language] || ''));
        }
    }, [fileId]);

    // when language changes → load default template
    // but only if the editor is empty or still has the previous default
    function handleLanguageChange(newLang) {
        dispatch(setLanguage(newLang));
        dispatch(setCode(DEFAULT_CODE[newLang] || ''));
        setLangOpen(false);
    }

    async function loadFile(id) {
        try {
            const { data } = await getFile(id);
            dispatch(openFile(data));
            setFileName(data.name);
        } catch (err) {
            console.error(err);
            navigate('/dashboard');
        }
    }

    async function handleRun() {
        dispatch(resetExecution());
        setIsRunning(true);
        try {
            const { data } = await executeCode({
                language,
                code,
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

    async function handleSave() {
        if (!fileId || fileId === 'new') return;
        setIsSaving(true);
        try {
            await updateFile(fileId, { code, name: fileName });
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

    // Ctrl+S / Cmd+S → save
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [code, fileName]);

    const meta = LANG_META[language] || LANG_META.cpp;

    return (
        <div className="flex h-screen bg-[#0a0a0f] text-gray-200 overflow-hidden font-mono">

            {/* ── Sidebar ── */}
            <Sidebar
                isOpen={isSidebarOpen}
                files={files}
                currentFileId={fileId}
                onFileSelect={(id) => navigate(`/editor/${id}`)}
                onClose={() => dispatch(toggleSidebar())}
            />

            {/* ── Main ── */}
            <div className="flex flex-col flex-1 min-w-0">

                {/* ── Top Bar ── */}
                <div className="flex items-center justify-between px-4 h-12 bg-[#0d0d14] border-b border-gray-800 shrink-0">

                    {/* Left side */}
                    <div className="flex items-center gap-3">

                        {/* Sidebar toggle */}
                        <button
                            onClick={() => dispatch(toggleSidebar())}
                            className="p-1.5 rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
                            title="Toggle sidebar"
                        >
                            <FiLayout size={17} />
                        </button>

                        {/* Back to dashboard */}
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all text-xs font-semibold"
                            title="Back to dashboard"
                        >
                            <IoArrowBackOutline size={15} />
                            Dashboard
                        </button>

                        <div className="w-px h-5 bg-gray-700" />

                        {/* File name — click to rename */}
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
                                className="flex items-center gap-1.5 text-sm text-gray-100 cursor-pointer hover:text-white transition-colors px-1 rounded"
                                title="Click to rename"
                            >
                                {fileName}
                                {!isSaved && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" title="Unsaved changes" />
                                )}
                            </span>
                        )}

                        {/* Language selector — custom dropdown */}
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
                                                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-gray-800 transition-colors ${language === lang ? 'bg-gray-800' : ''}`}
                                            >
                                                <span className={`w-2 h-2 rounded-full ${m.dot}`} />
                                                <span className={`font-semibold ${m.color}`}>{m.label}</span>
                                                {language === lang && (
                                                    <span className="ml-auto text-gray-500">✓</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2">

                        {/* Save button */}
                        <button
                            onClick={handleSave}
                            disabled={isSaving || isSaved}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-700 text-gray-400 text-xs font-semibold hover:border-gray-500 hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <FiSave size={14} />
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>

                        {/* Run button */}
                        <button
                            onClick={handleRun}
                            disabled={isRunning || isPolling}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-green-600 hover:bg-green-500 active:bg-green-700 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-900/30"
                        >
                            <FiPlay size={13} fill="white" />
                            {isRunning || isPolling ? 'Running...' : 'Run'}
                        </button>
                    </div>
                </div>

                {/* ── Body: Editor + IO ── */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Monaco editor */}
                    <div className="flex-1 overflow-hidden">
                        <MonacoEditor
                            height="100%"
                            language={MONACO_LANG_MAP[language]}
                            value={code}
                            onChange={(val) => dispatch(setCode(val || ''))}
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
                        />
                    </div>

                    {/* Right pane: stdin + output */}
                    <div className="w-80 flex flex-col border-l border-gray-800 shrink-0">

                        {/* stdin */}
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

                        {/* output */}
                        <OutputPanel execution={execution} isPolling={isPolling} />
                    </div>
                </div>
            </div>

            {/* close lang dropdown on outside click */}
            {langOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
            )}
        </div>
    );
}