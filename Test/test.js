import { describe, expect, test } from '@jest/globals';
import { normalizeURL } from '../JS/crawler.js';

test('normalizeURL', () => {
    const input = '';
    const output = normalizeURL();
    const expected = 1;
    expect(output).toEqual(expected);
});
