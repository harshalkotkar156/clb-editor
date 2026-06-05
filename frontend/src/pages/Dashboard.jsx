import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getFiles, createFile, deleteFile } from '../services/api';
import { setFiles, addFile, removeFile, setLoading } from '../features/files/filesSlice';
import { selectFiles, selectLoading } from '../features/files/filesSlice';
import { selectUser, logout } from '../features/auth/authSlice';
import { FiPlus, FiLogOut, FiCode, FiTrash2, FiClock, FiFileText, FiLayers, FiX, FiArrowRight } from 'react-icons/fi';

import { SiCplusplus, SiPython, SiJavascript } from 'react-icons/si';
import { FaCoffee } from 'react-icons/fa';
// ── language config ─────────────────────────────────────────────────────────
const LANG = {
  cpp:        { label: 'C++',        Icon: SiCplusplus,  color: 'text-blue-400',   border: 'border-blue-500/30',  bg: 'bg-blue-500/10',   dot: 'bg-blue-400' },
  python:     { label: 'Python',     Icon: SiPython,     color: 'text-green-400',  border: 'border-green-500/30', bg: 'bg-green-500/10',  dot: 'bg-green-400' },
  javascript: { label: 'JavaScript', Icon: SiJavascript, color: 'text-yellow-400', border: 'border-yellow-500/30',bg: 'bg-yellow-500/10', dot: 'bg-yellow-400' },
  java:       { label: 'Java',       Icon: FaCoffee,       color: 'text-red-400',    border: 'border-red-500/30',   bg: 'bg-red-500/10',    dot: 'bg-red-400' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── File Row (table style like VS Code / Linear) ────────────────────────────
function FileRow({ file, onOpen, onDelete }) {
  const lang = LANG[file.language] || LANG.cpp;
  const { Icon } = lang;
  const [hover, setHover] = useState(false);

  return (
    <tr
      className={`border-b border-white/5 cursor-pointer transition-colors ${hover ? 'bg-white/[0.03]' : ''}`}
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* name */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${lang.bg} ${lang.border} border shrink-0`}>
            <Icon size={14} className={lang.color} />
          </div>
          <span className="text-sm text-gray-200 font-medium">{file.name}</span>
        </div>
      </td>
      {/* language */}
      <td className="py-3 px-4">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${lang.bg} ${lang.color} border ${lang.border}`}>
          {lang.label}
        </span>
      </td>
      {/* last opened */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
          <FiClock size={11} />
          {timeAgo(file.lastOpenedAt || file.updatedAt)}
        </div>
      </td>
      {/* actions */}
      <td className="py-3 px-4 text-right">
        <div className={`flex items-center justify-end gap-2 transition-opacity ${hover ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={e => { e.stopPropagation(); onOpen(); }}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded-md hover:bg-cyan-400/10 transition-colors"
          >
            Open <FiArrowRight size={11} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
          >
            <FiTrash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Recent File Card ─────────────────────────────────────────────────────────
function RecentCard({ file, onOpen }) {
  const lang = LANG[file.language] || LANG.cpp;
  const { Icon } = lang;

  return (
    <button
      onClick={onOpen}
      className={`group relative w-full text-left p-4 rounded-xl border border-white/[0.08] bg-[#0d0d14] hover:border-cyan-500/40 hover:bg-[#0f0f1a] transition-all duration-200`}
    >
      {/* top row */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${lang.bg} ${lang.border} border`}>
          <Icon size={16} className={lang.color} />
        </div>
        <span className="text-[10px] text-gray-600 flex items-center gap-1">
          <FiClock size={9} /> {timeAgo(file.lastOpenedAt || file.updatedAt)}
        </span>
      </div>
      {/* file name */}
      <div className="text-sm font-semibold text-gray-200 group-hover:text-white truncate mb-1">
        {file.name}
      </div>
      <div className={`text-xs font-medium ${lang.color}`}>{lang.label}</div>

      {/* hover arrow */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <FiArrowRight size={14} className="text-cyan-400" />
      </div>
    </button>
  );
}

// ── Create File Modal ────────────────────────────────────────────────────────
function CreateModal({ onClose, onCreate }) {
  const [name, setName]   = useState('');
  const [lang, setLang]   = useState('cpp');
  const [busy, setBusy]   = useState(false);

  async function handleCreate() {
    setBusy(true);
    await onCreate({ name: name || 'Untitled', language: lang });
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0d0d18] border border-white/10 rounded-2xl shadow-2xl p-6">

        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-white">New File</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <FiX size={18} />
          </button>
        </div>

        {/* file name */}
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">File Name</label>
        <input
          className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-cyan-500/50 transition-colors mb-5"
          placeholder="e.g. solution.cpp"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          autoFocus
        />

        {/* language */}
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Language</label>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {Object.entries(LANG).map(([key, { label, Icon, color, bg, border }]) => (
            <button
              key={key}
              onClick={() => setLang(key)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${
                lang === key
                  ? `${bg} ${border} border`
                  : 'border-white/[0.07] hover:border-white/20 bg-transparent'
              }`}
            >
              <Icon size={16} className={lang === key ? color : 'text-gray-600'} />
              <span className={`text-sm font-semibold ${lang === key ? color : 'text-gray-500'}`}>{label}</span>
              {lang === key && <span className="ml-auto text-cyan-400 text-xs">✓</span>}
            </button>
          ))}
        </div>

        {/* actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-gray-200 hover:border-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-black text-sm font-bold transition-colors disabled:opacity-50"
          >
            {busy ? 'Creating...' : 'Create File'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const files     = useSelector(selectFiles);
  const loading   = useSelector(selectLoading);
  const user      = useSelector(selectUser);
  const [showModal, setShowModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
  useEffect(() => { fetchFiles(); }, []);

  async function fetchFiles() {
    dispatch(setLoading(true));
    try {
      const { data } = await getFiles();
      dispatch(setFiles(data));
    } catch (err) { console.error(err); }
  }

  async function handleCreate(payload) {
    try {
      const { data } = await createFile(payload);
      dispatch(addFile(data));
      setShowModal(false);
      navigate(`/editor/${data._id}`);
    } catch (err) { console.error(err); }
  }

  async function handleDelete(fileId) {
    try {
      await deleteFile(fileId);
      dispatch(removeFile(fileId));
    } catch (err) { console.error(err); }
  }

  function handleLogout() {
    dispatch(logout());
    
    navigate('/');
  }

  const recentFiles = [...files].slice(0, 4);
  const langCounts  = Object.keys(LANG).reduce((acc, l) => {
    acc[l] = files.filter(f => f.language === l).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#080810] text-gray-200"
      style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(6,182,212,0.04) 0%, transparent 60%), linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: 'auto, 40px 40px, 40px 40px' }}
    >

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-3.5 border-b border-white/[0.07] bg-[#080810]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <FiCode size={14} className="text-cyan-400" />
          </div>
          <span className="font-bold text-white tracking-tight text-lg">CodeSync</span>
        </div>

        <div className="flex items-center gap-3">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=0d0d14&color=60a5fa`}
            alt=""
            className="w-8 h-8 rounded-full border border-white/10"
          />
          <span className="text-sm text-gray-400 hidden sm:block">{user?.name}</span>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 px-3 py-1.5 rounded-lg border border-white/[0.07] hover:border-red-500/30 hover:bg-red-500/5 transition-all hover:cursor-pointer"
          >
            <FiLogOut size={13} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-xs font-semibold text-cyan-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <span className="w-4 h-px bg-cyan-400 inline-block" /> Dashboard
            </p>
            <h1 className="text-3xl font-bold text-white leading-tight">
              Welcome back, <span className="text-cyan-400">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Pick up where you left off.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-black text-sm font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 hover:cursor-pointer"
          >
            <FiPlus size={15} /> New File
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Files',  value: files.length,  icon: FiFileText, color: 'text-cyan-400',   glow: 'shadow-cyan-500/10' },
            { label: 'C++ Files',    value: langCounts.cpp,         icon: SiCplusplus,  color: 'text-blue-400',   glow: 'shadow-blue-500/10' },
            { label: 'Python Files', value: langCounts.python,      icon: SiPython,     color: 'text-green-400',  glow: 'shadow-green-500/10' },
            { label: 'JS Files',     value: langCounts.javascript,  icon: SiJavascript, color: 'text-yellow-400', glow: 'shadow-yellow-500/10' },
          ].map(({ label, value, icon: Icon, color, glow }) => (
            <div key={label} className={`bg-[#0d0d14] border border-white/[0.07] rounded-xl p-4 shadow-lg ${glow}`}>
              <div className={`${color} mb-3`}><Icon size={18} /></div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Recently Opened ── */}
        {recentFiles.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-px bg-cyan-400" />
              <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-[0.15em]">Recently Opened</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recentFiles.map(file => (
                <RecentCard
                  key={file._id}
                  file={file}
                  onOpen={() => navigate(`/editor/${file._id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── All Files Table ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-px bg-cyan-400" />
              <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-[0.15em]">All Files</h2>
              <span className="text-xs text-gray-600 ml-1">({files.length})</span>
            </div>
          </div>

          <div className="bg-[#0d0d14] border border-white/[0.07] rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-600 text-sm gap-2">
                <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                Loading files...
              </div>
            ) : files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
                  <FiLayers size={24} className="text-gray-700" />
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm font-medium">No files yet</p>
                  <p className="text-gray-600 text-xs mt-1">Create your first file to get started</p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm rounded-lg hover:bg-cyan-500/20 transition-colors"
                >
                  <FiPlus size={14} /> Create File
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-3 px-4 text-[11px] font-semibold text-gray-600 uppercase tracking-widest">Name</th>
                    <th className="text-left py-3 px-4 text-[11px] font-semibold text-gray-600 uppercase tracking-widest">Language</th>
                    <th className="text-left py-3 px-4 text-[11px] font-semibold text-gray-600 uppercase tracking-widest">Last Opened</th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {files.map(file => (
                    <FileRow
                      key={file._id}
                      file={file}
                      onOpen={() => navigate(`/editor/${file._id}`)}
                      onDelete={() => handleDelete(file._id)}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

      </div>

      {/* ── Modal ── */}
      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}


      {/* Logout Confirm Modal */}
{showLogoutModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="w-full max-w-sm bg-[#0d0d18] border border-white/10 rounded-2xl shadow-2xl p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-white">Sign out</h3>
        <button
          onClick={() => setShowLogoutModal(false)}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          <FiX size={18} />
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Are you sure you want to sign out of your account?
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => setShowLogoutModal(false)}
          className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-gray-200 hover:border-white/20 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleLogout}
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 active:bg-red-600 text-white text-sm font-bold transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}