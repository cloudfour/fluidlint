/* global describe, it, expect, jest */

import { findTags, lintFile } from './lint';

describe('findTags', () => {
  it('should find tags in a string', () => {
    const source = `
{% comment %}
  Lorem ipsum dolor sit amet.
{% endcomment %}

{{heading | default: 'My Fallback Heading'}}`;

    expect(findTags(source)).toMatchObject([
      { tagName: 'comment', filters: [] },
      { tagName: 'endcomment', filters: [] }
    ]);
  });

  it('should return an empty array if there are no results', () => {
    const source = '';
    expect(findTags(source)).toEqual([]);
  });

  it('should handle multiline tag params', () => {
    const source = `
{% include 'components/input-extra/text',
  content: content,
  glyph: '$' %}`;

    expect(findTags(source)).toEqual([
      {
        tagName: 'include',
        filters: [],
        source: source.trim(),
        tagValue: `'components/input-extra/text', content: content, glyph: '$'`
      }
    ]);
  });
});

describe('lintFile', () => {
  it('should return a LintResult object', () => {
    const source = `
{% comment %}

{{heading | default: 'My Fallback Heading'}}`;
    const fakeRule = jest.fn(tag => {
      expect(tag).toEqual({
        tagName: 'comment',
        tagValue: '',
        source: '{% comment %}',
        filters: []
      });
      return {
        message: 'Not Allowed',
        severity: 'error'
      };
    });

    const results = lintFile('path-to-file', source, [fakeRule]);
    expect(fakeRule).toHaveBeenCalledTimes(1);
    expect(results).toEqual({
      filePath: 'path-to-file',
      messages: [
        {
          message: 'Not Allowed',
          severity: 'error'
        }
      ],
      errorCount: 1,
      warningCount: 0
    });
  });
});
