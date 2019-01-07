import hub from './hub';

// determine path prefix by config
const prefix = '';

export const getRoles = (params) => hub.get(`${prefix}/roles`, params);
