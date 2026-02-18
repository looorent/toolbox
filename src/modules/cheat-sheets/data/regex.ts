import type { CheatSheet } from '../types'

export const regexSheet: CheatSheet = {
  label: 'Regex',
  key: 'regex',
  categories: [
    {
      category: 'Character Classes',
      entries: [
        { command: '.', description: 'Any character except newline' },
        { command: '\\d', description: 'Digit (0-9)' },
        { command: '\\D', description: 'Non-digit' },
        { command: '\\w', description: 'Word character (a-z, A-Z, 0-9, _)' },
        { command: '\\W', description: 'Non-word character' },
        { command: '\\s', description: 'Whitespace (space, tab, newline)' },
        { command: '\\S', description: 'Non-whitespace' },
        { command: '[abc]', description: 'Any of a, b, or c' },
        { command: '[^abc]', description: 'Not a, b, or c' },
        { command: '[a-z]', description: 'Any character in range a-z' },
        { command: '[A-Za-z0-9]', description: 'Any alphanumeric character' },
      ],
    },
    {
      category: 'Quantifiers',
      entries: [
        { command: '*', description: 'Zero or more' },
        { command: '+', description: 'One or more' },
        { command: '?', description: 'Zero or one (optional)' },
        { command: '{n}', description: 'Exactly n times' },
        { command: '{n,}', description: 'n or more times' },
        { command: '{n,m}', description: 'Between n and m times' },
        { command: '*?', description: 'Zero or more (lazy / non-greedy)' },
        { command: '+?', description: 'One or more (lazy / non-greedy)' },
      ],
    },
    {
      category: 'Anchors & Boundaries',
      entries: [
        { command: '^', description: 'Start of string (or line in multiline mode)' },
        { command: '$', description: 'End of string (or line in multiline mode)' },
        { command: '\\b', description: 'Word boundary' },
        { command: '\\B', description: 'Non-word boundary' },
        { command: '\\A', description: 'Start of string (never matches after newline)' },
        { command: '\\Z', description: 'End of string (before optional final newline)' },
      ],
    },
    {
      category: 'Groups & Backreferences',
      entries: [
        { command: '(abc)', description: 'Capturing group' },
        { command: '(?:abc)', description: 'Non-capturing group' },
        { command: '(?<name>abc)', description: 'Named capturing group' },
        { command: '\\1', description: 'Backreference to first capturing group' },
        { command: '\\k<name>', description: 'Backreference to named group' },
        { command: '(a|b)', description: 'Alternation (a or b)' },
      ],
    },
    {
      category: 'Lookaround',
      entries: [
        { command: '(?=abc)', description: 'Positive lookahead (followed by abc)' },
        { command: '(?!abc)', description: 'Negative lookahead (not followed by abc)' },
        { command: '(?<=abc)', description: 'Positive lookbehind (preceded by abc)' },
        { command: '(?<!abc)', description: 'Negative lookbehind (not preceded by abc)' },
      ],
    },
    {
      category: 'Flags',
      entries: [
        { command: 'g', description: 'Global — match all occurrences' },
        { command: 'i', description: 'Case-insensitive matching' },
        { command: 'm', description: 'Multiline — ^ and $ match line boundaries' },
        { command: 's', description: 'Dotall — . matches newline characters' },
        { command: 'u', description: 'Unicode — full Unicode support' },
        { command: 'y', description: 'Sticky — match at lastIndex position only' },
      ],
    },
    {
      category: 'Common Patterns',
      entries: [
        { command: '^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$', description: 'Email address (simple)' },
        { command: 'https?://[\\w.-]+(?:/[\\w./?%&=-]*)?', description: 'URL with http(s)' },
        { command: '^\\d{4}-\\d{2}-\\d{2}$', description: 'Date (YYYY-MM-DD)' },
        { command: '^\\d{1,3}(\\.\\d{1,3}){3}$', description: 'IPv4 address' },
        { command: '^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$', description: 'Hex color code' },
        { command: '^\\+?[1-9]\\d{1,14}$', description: 'Phone number (E.164 format)' },
        { command: '^-?\\d+(\\.\\d+)?$', description: 'Integer or decimal number' },
        { command: '^[a-zA-Z0-9_-]{3,16}$', description: 'Username (3-16 chars, alphanumeric)' },
        { command: '(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).{8,}', description: 'Strong password (8+ chars, mixed)' },
        { command: '<[^>]+>', description: 'HTML tag' },
      ],
    },
  ],
}
