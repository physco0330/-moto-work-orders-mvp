const STATUS = Object.freeze({
  RECIBIDA: 'RECIBIDA',
  DIAGNOSTICO: 'DIAGNOSTICO',
  EN_PROCESO: 'EN_PROCESO',
  LISTA: 'LISTA',
  ENTREGADA: 'ENTREGADA',
  CANCELADA: 'CANCELADA',
});

const ORDER = [STATUS.RECIBIDA, STATUS.DIAGNOSTICO, STATUS.EN_PROCESO, STATUS.LISTA, STATUS.ENTREGADA];

const MECANICO_ALLOWED_STATUSES = [STATUS.DIAGNOSTICO, STATUS.EN_PROCESO, STATUS.LISTA];

// Determina las transiciones permitidas por el negocio.
const getAllowedTransitions = (currentStatus) => {
  if (currentStatus === STATUS.ENTREGADA || currentStatus === STATUS.CANCELADA) return [];
  if (currentStatus === STATUS.RECIBIDA) return [STATUS.EN_PROCESO, STATUS.DIAGNOSTICO, STATUS.CANCELADA];
  if (currentStatus === STATUS.DIAGNOSTICO) return [STATUS.EN_PROCESO, STATUS.LISTA, STATUS.CANCELADA];
  if (currentStatus === STATUS.EN_PROCESO) return [STATUS.LISTA, STATUS.CANCELADA];
  if (currentStatus === STATUS.LISTA) return [STATUS.LISTA, STATUS.CANCELADA];
  return ORDER;
};

const getAllowedTransitionsByRole = (currentStatus, role) => {
  const allowed = getAllowedTransitions(currentStatus);

  if (role === 'MECANICO') {
    return allowed.filter((status) => MECANICO_ALLOWED_STATUSES.includes(status));
  }

  return allowed;
};

const isValidTransition = (currentStatus, toStatus) => {
  if (!currentStatus || !toStatus || currentStatus === toStatus) return false;
  return getAllowedTransitions(currentStatus).includes(toStatus);
};

module.exports = { STATUS, getAllowedTransitions, getAllowedTransitionsByRole, isValidTransition, MECANICO_ALLOWED_STATUSES };
