import { useNavigate } from 'react-router-dom';
import { Plus, Code2, X, LayoutDashboard } from 'lucide-react';

const LANG_COLORS = {
  cpp: '#60a5fa', python: '#4ade80', javascript: '#facc15', java: '#f87171'
};

export default function Sidebar({ isOpen, files, currentFileId, onFileSelect, onClose }) {
  const navigate = useNavigate();

  return (
    <>
      {/* Sidebar panel */}
      <div style={{ ...styles.sidebar, width: isOpen ? 240 : 0, overflow: isOpen ? 'visible' : 'hidden' }}>
        <div style={styles.sidebarInner}>

          {/* Header */}
          <div style={styles.sidebarHeader}>
            <span style={styles.sidebarTitle}>Files</span>
            <button onClick={onClose} style={styles.closeBtn}><X size={15} /></button>
          </div>

          {/* Nav buttons */}
          <button onClick={() => navigate('/dashboard')} style={styles.navBtn}>
            <LayoutDashboard size={14} /> Dashboard
          </button>
          <button onClick={() => navigate('/editor/new')} style={styles.navBtn}>
            <Plus size={14} /> New File
          </button>

          <div style={styles.divider} />

          {/* File list */}
          <div style={styles.fileList}>
            {files.length === 0 && (
              <div style={styles.noFiles}>No files yet</div>
            )}
            {files.map(file => (
              <button
                key={file._id}
                onClick={() => onFileSelect(file._id)}
                style={{
                  ...styles.fileItem,
                  background: file._id === currentFileId ? '#1f2937' : 'transparent',
                  color:      file._id === currentFileId ? '#f9fafb' : '#9ca3af',
                }}
              >
                <span style={{ ...styles.langDot, background: LANG_COLORS[file.language] || '#6b7280' }} />
                <span style={styles.fileItemName}>{file.name}</span>
              </button>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}

const styles = {
  sidebar:       { height: '100vh', background: '#0d0d14', borderRight: '1px solid #1f2937', transition: 'width 0.2s ease', flexShrink: 0 },
  sidebarInner:  { width: 240, height: '100%', display: 'flex', flexDirection: 'column', padding: '12px 0' },
  sidebarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 14px 12px', },
  sidebarTitle:  { fontSize: 12, fontWeight: 700, color: '#6b7280', letterSpacing: 1, textTransform: 'uppercase' },
  closeBtn:      { background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 4, display: 'flex' },
  navBtn:        { display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: '#9ca3af', padding: '8px 14px', cursor: 'pointer', fontSize: 13, width: '100%', textAlign: 'left' },
  divider:       { height: 1, background: '#1f2937', margin: '8px 0' },
  fileList:      { flex: 1, overflowY: 'auto' },
  noFiles:       { padding: '12px 14px', fontSize: 12, color: '#4b5563' },
  fileItem:      { display: 'flex', alignItems: 'center', gap: 8, width: '100%', border: 'none', padding: '8px 14px', cursor: 'pointer', fontSize: 13, textAlign: 'left', borderRadius: 0 },
  langDot:       { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  fileItemName:  { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
};