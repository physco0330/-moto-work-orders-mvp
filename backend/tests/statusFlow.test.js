const { STATUS, getAllowedTransitions, getAllowedTransitionsByRole, isValidTransition } = require('../src/utils/statusFlow');

describe('statusFlow', () => {
  test('permite transiciones del flujo principal', () => {
    expect(getAllowedTransitions(STATUS.RECIBIDA)).toEqual([STATUS.DIAGNOSTICO, STATUS.CANCELADA]);
    expect(isValidTransition(STATUS.DIAGNOSTICO, STATUS.EN_PROCESO)).toBe(true);
  });

  test('limita las transiciones del mecanico', () => {
    expect(getAllowedTransitionsByRole(STATUS.DIAGNOSTICO, 'MECANICO')).toEqual([STATUS.EN_PROCESO]);
    expect(getAllowedTransitionsByRole(STATUS.LISTA, 'MECANICO')).toEqual([]);
    expect(getAllowedTransitionsByRole(STATUS.LISTA, 'ADMIN')).toEqual([STATUS.ENTREGADA, STATUS.CANCELADA]);
  });
});
