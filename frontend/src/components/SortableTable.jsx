import React, { useState } from 'react';

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

export function SortIcon({ direction }) {
  if (!direction) return <span className="sort-icon neutral">↕</span>;
  return <span className="sort-icon active">{direction === 'asc' ? '↑' : '↓'}</span>;
}

export function SortableTh({ label, sortKey, currentSort, onSort, sortable = true }) {
  const direction = currentSort.key === sortKey ? currentSort.direction : null;
  
  const handleClick = () => {
    if (!sortable) return;
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
    <th onClick={handleClick} style={{ cursor: sortable ? 'pointer' : 'default', userSelect: 'none' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
        {sortable && <SortIcon direction={direction} />}
      </span>
    </th>
  );
}

export function useSortableData(items, defaultKey = null, defaultDirection = 'asc') {
  const [sortConfig, setSortConfig] = useState(
    defaultKey ? { key: defaultKey, direction: defaultDirection } : { key: null, direction: null }
  );

  const sortedItems = useMemo(() => {
    if (!sortConfig.key) return items;

    return [...items].sort((a, b) => {
      let aVal = getNestedValue(a, sortConfig.key);
      let bVal = getNestedValue(b, sortConfig.key);

      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, sortConfig]);

  const setSort = (config) => setSortConfig(config);

  return { sortedItems, sortConfig, setSort };
}

export default function SortableTable({ columns, data, emptyMessage = 'No hay datos para mostrar' }) {
  const { sortedItems, sortConfig, setSort } = useSortableData(data);

  return (
    <div className="card table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <SortableTh
                key={col.key}
                label={col.label}
                sortKey={col.sortKey || col.key}
                currentSort={sortConfig}
                onSort={setSort}
                sortable={col.sortable !== false}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item, idx) => (
            <tr key={item.id || idx}>
              {columns.map(col => (
                <td key={col.key}>{col.render ? col.render(item) : getNestedValue(item, col.key)}</td>
              ))}
            </tr>
          ))}
          {!sortedItems.length && (
            <tr>
              <td colSpan={columns.length} className="muted" style={{ textAlign: 'center', padding: 28 }}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
