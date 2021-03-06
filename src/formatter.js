'use strict';

// This file is copied from eslint-formatter-pretty except that it also outputs
// the source line that failed the rules because we don't keep track of line/col numbers

const path = require('path');
const c = require('ansi-colors');
const logSymbols = require('log-symbols');
const plur = require('plur');
const stringWidth = require('string-width');
const ansiEscapes = require('ansi-escapes');

module.exports = results => {
  const lines = [];
  let errorCount = 0;
  let warningCount = 0;
  let maxLineWidth = 0;
  let maxColumnWidth = 0;
  let maxMessageWidth = 0;
  let showLineNumbers = false;

  results.sort((a, b) => a.errorCount - b.errorCount).forEach(result => {
    const messages = result.messages;

    if (messages.length === 0) {
      return;
    }

    errorCount += result.errorCount;
    warningCount += result.warningCount;

    if (lines.length !== 0) {
      lines.push({ type: 'separator' });
    }

    const filePath = result.filePath;

    lines.push({
      type: 'header',
      filePath,
      relativeFilePath: path.relative('.', filePath),
      firstLineCol: messages[0].line + ':' + messages[0].column
    });

    messages
      .sort((a, b) => {
        if (a.fatal === b.fatal && a.severity === b.severity) {
          if (a.line === b.line) {
            return a.column < b.column ? -1 : 1;
          }

          return a.line < b.line ? -1 : 1;
        }
        if ((a.fatal || a.severity === 2) && (!b.fatal || b.severity !== 2)) {
          return 1;
        }

        return -1;
      })
      .forEach(x => {
        let message = x.message;

        // Stylize inline code blocks
        message = message.replace(/\B`(.*?)`\B|\B'(.*?)'\B/g, (m, p1, p2) =>
          c.bold(p1 || p2)
        );

        const line = String(x.line || 0);
        const column = String(x.column || 0);
        const lineWidth = stringWidth(line);
        const columnWidth = stringWidth(column);
        const messageWidth = stringWidth(message);

        maxLineWidth = Math.max(lineWidth, maxLineWidth);
        maxColumnWidth = Math.max(columnWidth, maxColumnWidth);
        maxMessageWidth = Math.max(messageWidth, maxMessageWidth);
        showLineNumbers = showLineNumbers || x.line || x.column;

        lines.push({
          type: 'message',
          severity:
            x.fatal || x.severity === 2 || x.severity === 'error'
              ? 'error'
              : 'warning',
          line,
          lineWidth,
          column,
          columnWidth,
          source: x.source,
          message,
          messageWidth,
          ruleId: x.ruleId || ''
        });
      });
  });

  let output = '\n';

  if (process.stdout.isTTY && !process.env.CI) {
    // Make relative paths Cmd+click'able in iTerm
    output += ansiEscapes.iTerm.setCwd();
  }

  output +=
    lines
      .map(x => {
        if (x.type === 'header') {
          // Add the line number so it's Cmd+click'able in some terminals
          // Use dim & gray for terminals like iTerm that doesn't support `hidden`
          const position = showLineNumbers
            ? c.hidden.dim.gray(`:${x.firstLineCol}`)
            : '';

          return '  ' + c.underline(x.relativeFilePath) + position;
        }

        if (x.type === 'message') {
          const line = [
            '',
            x.severity === 'warning' ? logSymbols.warning : logSymbols.error,
            ' '.repeat(maxLineWidth - x.lineWidth) +
              c.dim(x.line + c.gray(':') + x.column),
            ' '.repeat(maxColumnWidth - x.columnWidth) + x.message,
            ' '.repeat(maxMessageWidth - x.messageWidth) + c.gray.dim(x.ruleId)
          ];

          if (!showLineNumbers) {
            line.splice(2, 1);
          }

          const formattedSource = `
     ${c.gray(x.source)}`;

          return line.join('  ') + (x.source ? formattedSource : '');
        }

        return '';
      })
      .join('\n') + '\n\n';

  if (warningCount > 0) {
    output +=
      '  ' +
      c.yellow(`${warningCount} ${plur('warning', warningCount)}`) +
      '\n';
  }

  if (errorCount > 0) {
    output += '  ' + c.red(`${errorCount} ${plur('error', errorCount)}`) + '\n';
  }

  return errorCount + warningCount > 0 ? output : '';
};
