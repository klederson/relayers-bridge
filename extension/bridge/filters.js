// Bounded data-only conditions. No scripts, regular expressions or remote code.
import { uuid } from './contracts.js';
const fields = new Set(['text', 'type', 'chatId']);
const operators = new Set(['contains', 'notContains', 'equals', 'startsWith']);
export function normalizeFilter(input) {
  if (input == null) return { mode: 'basic', match: 'any', conditions: [] };
  if (!['basic', 'advanced'].includes(input.mode) || !['any', 'all'].includes(input.match) || !Array.isArray(input.conditions) || input.conditions.length > 10) throw new Error('invalid-filter');
  const conditions = input.conditions.map(condition => {
    if (!condition || !fields.has(condition.field) || !operators.has(condition.operator) || typeof condition.value !== 'string' || !condition.value.trim() || condition.value.length > 200) throw new Error('invalid-filter');
    if (input.mode === 'basic' && (condition.field !== 'text' || condition.operator !== 'contains')) throw new Error('invalid-filter');
    if (condition.field !== 'text' && condition.operator !== 'equals') throw new Error('invalid-filter');
    return { field: condition.field, operator: condition.operator, value: condition.value.trim() };
  });
  return { mode: input.mode, match: input.match, conditions };
}
const fold = value => String(value ?? '').normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('en');
export function matchesFilter(input, message) {
  const filter = normalizeFilter(input);
  if (!filter.conditions.length) return true;
  const matches = condition => {
    const value = fold(message[condition.field]), wanted = fold(condition.value);
    return condition.operator === 'equals' ? value === wanted : condition.operator === 'startsWith' ? value.startsWith(wanted)
      : condition.operator === 'notContains' ? !value.includes(wanted) : value.includes(wanted);
  };
  return filter.match === 'all' ? filter.conditions.every(matches) : filter.conditions.some(matches);
}
export function normalizeDestination(input) {
  if (input == null || input.kind === 'none') return { kind: 'none' };
  if (!['remote', 'local'].includes(input.kind) || typeof input.url !== 'string' || input.url.length > 2048) throw new Error('invalid-destination');
  let url; try { url = new URL(input.url); } catch { throw new Error('invalid-destination'); }
  if (url.username || url.password || url.hash) throw new Error('invalid-destination');
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (input.kind === 'remote' && (url.protocol !== 'https:' || loopback)) throw new Error('invalid-destination');
  if (input.kind === 'local' && (!loopback || !['http:', 'https:'].includes(url.protocol) || !uuid(input.daemonId))) throw new Error('invalid-destination');
  return { kind: input.kind, url: url.href, ...(input.kind === 'local' ? { daemonId: input.daemonId } : {}) };
}
export function normalizeSettings(input = {}) {
  return { incomingFilter: normalizeFilter(input.incomingFilter), outgoingFilter: normalizeFilter(input.outgoingFilter), destination: normalizeDestination(input.destination) };
}
