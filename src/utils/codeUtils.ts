import type { ButtonSettings } from '../types';

export function codeToButtons(code: string): ButtonSettings {
  const digits = code.replace(/\D/g, '').slice(0, 9).split('').map(Number);
  const [a = 0, b = 0, c = 0, d = 0, e = 0, f = 0, g = 0, h = 0, i = 0] = digits;
  return [a, b, c, d, e, f, g, h, i];
}
