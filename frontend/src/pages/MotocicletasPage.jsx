import React, { useEffect, useState } from 'react';
import api from '../services/api';

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function SortableTh({ label, sortKey, currentSort, onSort }) {
  const direction = currentSort.key === sortKey ? currentSort.direction : null;
  
  const handleClick = () => {
    if (currentSort.key === sortKey) {
      if (currentSort.direction === 'asc') {
        onSort({ key: sortKey, direction: 'desc' });
      } else {
        onSort({ key: null, direction: null });
      }
    } else {
      onSort({ key: sortKey, direction: 'asc' });
    }
  };

  return (
    <th onClick={handleClick} style={{ cursor: 'pointer', userSelect: 'none' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
        {direction === 'asc' && <span>↑</span>}
        {direction === 'desc' && <span>↓</span>}
        {!direction && <span style={{ opacity: 0.3 }}>↕</span>}
      </span>
    </th>
  );
}

export default MotocicletasPage;
