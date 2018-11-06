// [\w\W] matches any character (like . except it also matches newlines)
// ? so that it finds the shortest matches
// g flag for global, multiple matches
// m for multiline
const TAG_REGEX = /{%[\w\W]*?%}/gm;

/**
 * Finds the liquid tags in a source string
 * @param {string} source The source to find the tags from
 * @returns {string[]}
 */
export const findTags = source =>
  (source.match(TAG_REGEX) || []).map(t => {
    const inner = t
      .replace(/^{%/, '') // Remove start liquid tag
      .replace(/%}$/, '') // Remove end liquid tag
      .replace(/\s+/gm, ' '); // Normalize whitespace
    const [tag, ...filters] = inner.split('|').map(i => i.trim());
    const [tagName, ...tagValue] = tag.split(' ');
    return { tagName, tagValue: tagValue.join(' '), filters, source: t };
  });

/**
 * @typedef {Object} Message
 * @param {number} [column];
 * @param {number} [line];
 * @param {number} [endColumn];
 * @param {number} [endLine];
 * @param {string} ruleId;
 * @param {string} message;
 * @param {string} severity;
 */

/**
 * @typedef {(source: string) => Message} Rule
 */

/**
 * Flattens an array
 * @param {Array} arrays The arrays to flatten
 */
const flatten = arrays => [].concat(...arrays);

/**
 * Lints a liquid tag
 * @param {string} tag The liquid tag to check
 * @param {Rule} rules The rules to run against the tag
 */
const lintTag = (tag, rules) => flatten(rules.map(r => r(tag)).filter(Boolean));

export const lintFile = (path, source, rules) => {
  const tags = findTags(source);
  const messages = flatten(tags.map(t => lintTag(t, rules)));
  const errorCount = messages.filter(m => m.severity === 'error').length;
  return {
    filePath: path,
    messages,
    errorCount,
    warningCount: messages.length - errorCount
  };
};
