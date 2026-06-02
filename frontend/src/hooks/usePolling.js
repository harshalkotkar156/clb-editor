import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { getJobStatus } from '../services/api';
import { updateStatus, setResult } from '../features/execution/executionSlice';

export function usePolling(jobId, isPolling) {
  const dispatch  = useDispatch();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!jobId || !isPolling) return;

    intervalRef.current = setInterval(async () => {
      try {
        const { data } = await getJobStatus(jobId);

        if (data.status === 'queued' || data.status === 'running') {
          dispatch(updateStatus(data.status));
          return;
        }

        // completed or failed — stop polling, set result
        clearInterval(intervalRef.current);
        dispatch(setResult(data));

      } catch (err) {
        clearInterval(intervalRef.current);
        dispatch(setResult({
          status:   'failed',
          stdout:   '',
          stderr:   'Failed to fetch result. Please try again.',
          exitCode: 1,
        }));
      }
    }, 1000); // poll every 1 second

    return () => clearInterval(intervalRef.current);
  }, [jobId, isPolling]);
}