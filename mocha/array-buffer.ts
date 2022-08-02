import Linq from '../lib/index.js';
import * as t from './func-tests/all.js';
import crypto from 'crypto';

const buffer = crypto.randomBytes(128);
const linq = Linq(buffer);

describe('array-buffer', () => {
	describe('first', () => t.testFirst(linq, buffer, v => v < 50));
	describe('last', () => t.testLast(linq, buffer, v => v < 50));
	describe('math', () => t.testMaths(linq, buffer));
	describe('order', () => t.testOrder(linq, buffer));
})
