import React from 'react';

export function ConfirmDialog({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = '¿Estás seguro?', 
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger'
}) {
  if (!isOpen) return null;

  const buttonColors = {
    danger: { bg: 'linear-gradient(180deg, #ef4444, #dc2626)', confirm: 'Confirmar eliminación' },
    warning: { bg: 'linear-gradient(180deg, #f59e0b, #d97706)', confirm: 'Confirmar' },
    info: { bg: 'linear-gradient(180deg, #3b82f6, #2563eb)', confirm: 'Confirmar' },
  };

  const config = buttonColors[type] || buttonColors.danger;

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-dialog-actions">
          <button className="ghost" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            style={{ background: config.bg }} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LoadingButton({ children, loading, disabled, onClick, className = '', ...props }) {
  return (
    <button
      className={`${className} ${loading ? 'loading-btn' : ''}`}
      disabled={disabled || loading}
      onClick={onClick}
      style={{ minWidth: loading ? 80 : 'auto' }}
      {...props}
    >
      {!loading && children}
    </button>
  );
}
