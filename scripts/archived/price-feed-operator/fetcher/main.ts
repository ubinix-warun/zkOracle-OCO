import { isReady, shutdown, Mina, PrivateKey } from 'o1js';

import fs from 'fs';
import { loopUntilAccountExists, deploy } from './utils.js';

await isReady;

console.log('o1js loaded');

// ----------------------------------------------------
