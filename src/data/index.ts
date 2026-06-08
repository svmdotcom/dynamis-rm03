import Fuse from 'fuse.js';
import type { CodebookEntry } from '../types';
import { createNameFuse, createCodeFuse } from '../utils/searchUtils';
import rawRemedies from './remedies.json';

export const remedies: CodebookEntry[] = rawRemedies as CodebookEntry[];

export const nameFuse: Fuse<CodebookEntry> = createNameFuse(remedies);
export const codeFuse: Fuse<CodebookEntry> = createCodeFuse(remedies);
