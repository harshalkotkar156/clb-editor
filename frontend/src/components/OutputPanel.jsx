import { Loader, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function OutputPanel({ execution, isPolling }) {
  const { status, stdout, stderr, exitCode, executionTime } = execution;

  function renderStatus() {
    if (!status)               return null;
    if (status === 'queued')   return <StatusBadge icon={<Loader size={12} className="spin" />}  text="Queued"    color="#f59e0b" />;
    if (status === 'running')  return <StatusBadge icon={<Loader size={12} />}  text="Running..."  color="#60a5fa" />;
    if (status === 'completed') return <StatusBadge icon={<CheckCircle size={12} />} text={`Done · ${executionTime}ms`} color="#4ade80" />;
    if (status === 'failed')   return <StatusBadge icon={<XCircle size={12} />} text="Failed"    color="#f87171" />;
  }

  return (
    <div style={styles.outputPanel}>
      <div style={styles.panelHeader}>
        <span>output</span>
        {renderStatus()}
      </div>
      <div style={styles.outputBody}>
        {!status && (
          <div style={styles.placeholder}>Click Run to execute your code</div>
        )}
        {(status === 'queued' || status === 'running') && (
          <div style={styles.placeholder}>⏳ Waiting for result...</div>
        )}
        {status === 'completed' && (
          <pre style={styles.stdout}>{stdout || '(no output)'}</pre>
        )}
        {status === 'failed' && (
          <>
            {stdout && <pre style={styles.stdout}>{stdout}</pre>}
            <pre style={styles.stderr}>{stderr}</pre>
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ icon, text, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color, fontSize: 11 }}>
      {icon} {text}
    </div>
  );
}

const styles = {
  outputPanel: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
  panelHeader: { padding: '6px 14px', fontSize: 11, color: '#6b7280', background: '#0d0d14', borderBottom: '1px solid #1f2937', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
  outputBody:  { flex: 1, overflowY: 'auto', padding: 12 },
  placeholder: { color: '#4b5563', fontSize: 13, padding: '12px 0' },
  stdout:      { color: '#4ade80', fontSize: 13, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  stderr:      { color: '#f87171', fontSize: 13, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
};