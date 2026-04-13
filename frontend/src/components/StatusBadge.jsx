import React from 'react';
import { statusLabel } from '../constants/status';

function StatusBadge({ status }) {
  return <span className={`status status-${status}`}>{statusLabel[status] || status}</span>;
}

export default StatusBadge;
