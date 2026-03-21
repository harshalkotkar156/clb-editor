import { Trash2, ExternalLink, Clock } from 'lucide-react';

export default function FileCard({ file, onOpen, onDelete, langColors }) {
  const lang   = langColors[file.language] || { bg: '#1f2937', text: '#9ca3af', label: file.language };
  const timeAgo = getTimeAgo(file.lastOpenedAt);

  return (
    <div style={styles.card} onClick={onOpen}>
      <div style={styles.cardTop}>
        <span style={{ ...styles.langBadge, background: lang.bg, color: lang.text }}>
          {lang.label}
        </span>
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          style={styles.deleteBtn}
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div style={styles.fileName}>{file.name}</div>
      <div style={styles.meta}>
        <Clock size={11} color="#6b7280" />
        <span style={styles.metaText}>{timeAgo}</span>
      </div>
      <div style={styles.openHint}>
        <ExternalLink size={12} /> Open
      </div>
    </div>
  );
}

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const styles = {
  card:       { background: '#0d0d14', border: '1px solid #1f2937', borderRadius: 10, padding: '16px', cursor: 'pointer', transition: 'border-color 0.15s', position: 'relative' },
  cardTop:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  langBadge:  { fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, letterSpacing: 0.5 },
  deleteBtn:  { background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' },
  fileName:   { fontSize: 14, fontWeight: 600, color: '#f9fafb', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  meta:       { display: 'flex', alignItems: 'center', gap: 4 },
  metaText:   { fontSize: 11, color: '#6b7280' },
  openHint:   { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#3b82f6', marginTop: 10 },
};