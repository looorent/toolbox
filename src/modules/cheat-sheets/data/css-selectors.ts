import type { CheatSheet } from '../types'

export const cssSelectorsSheet: CheatSheet = {
  label: 'CSS Selectors',
  key: 'css-selectors',
  categories: [
    {
      category: 'Basic Selectors',
      entries: [
        { command: '*', description: 'Universal — matches all elements' },
        { command: 'element', description: 'Type — matches all elements of that type' },
        { command: '.class', description: 'Class — matches elements with that class' },
        { command: '#id', description: 'ID — matches element with that ID' },
        { command: '.a.b', description: 'Compound — matches elements with both classes' },
      ],
    },
    {
      category: 'Combinators',
      entries: [
        { command: 'A B', description: 'Descendant — B anywhere inside A' },
        { command: 'A > B', description: 'Child — B is a direct child of A' },
        { command: 'A + B', description: 'Adjacent sibling — B immediately after A' },
        { command: 'A ~ B', description: 'General sibling — B anywhere after A (same parent)' },
      ],
    },
    {
      category: 'Attribute Selectors',
      entries: [
        { command: '[attr]', description: 'Has the attribute' },
        { command: '[attr="val"]', description: 'Attribute equals value' },
        { command: '[attr~="val"]', description: 'Attribute contains word' },
        { command: '[attr^="val"]', description: 'Attribute starts with value' },
        { command: '[attr$="val"]', description: 'Attribute ends with value' },
        { command: '[attr*="val"]', description: 'Attribute contains substring' },
        { command: '[attr|="val"]', description: 'Attribute equals or starts with value-' },
        { command: '[attr="val" i]', description: 'Case-insensitive attribute match' },
      ],
    },
    {
      category: 'Pseudo-classes: State',
      entries: [
        { command: ':hover', description: 'Mouse is over the element' },
        { command: ':focus', description: 'Element has keyboard focus' },
        { command: ':focus-visible', description: 'Element has visible keyboard focus' },
        { command: ':focus-within', description: 'Element or descendant has focus' },
        { command: ':active', description: 'Element is being activated (clicked)' },
        { command: ':visited', description: 'Link has been visited' },
        { command: ':link', description: 'Unvisited link' },
        { command: ':target', description: 'Element targeted by URL fragment' },
        { command: ':checked', description: 'Checked input or option' },
        { command: ':disabled', description: 'Disabled form element' },
        { command: ':enabled', description: 'Enabled form element' },
        { command: ':required', description: 'Form element with required attribute' },
        { command: ':valid', description: 'Form element with valid value' },
        { command: ':invalid', description: 'Form element with invalid value' },
        { command: ':placeholder-shown', description: 'Input showing placeholder text' },
      ],
    },
    {
      category: 'Pseudo-classes: Structural',
      entries: [
        { command: ':first-child', description: 'First child of its parent' },
        { command: ':last-child', description: 'Last child of its parent' },
        { command: ':nth-child(n)', description: 'Nth child (1-indexed, supports formulas like 2n+1)' },
        { command: ':nth-last-child(n)', description: 'Nth child counting from the end' },
        { command: ':only-child', description: 'Element with no siblings' },
        { command: ':first-of-type', description: 'First sibling of its type' },
        { command: ':last-of-type', description: 'Last sibling of its type' },
        { command: ':nth-of-type(n)', description: 'Nth sibling of its type' },
        { command: ':only-of-type', description: 'No siblings of the same type' },
        { command: ':empty', description: 'Element with no children' },
        { command: ':root', description: 'Document root element (usually <html>)' },
      ],
    },
    {
      category: 'Pseudo-classes: Logical',
      entries: [
        { command: ':not(selector)', description: 'Elements that do not match the selector' },
        { command: ':is(a, b)', description: 'Matches any of the listed selectors' },
        { command: ':where(a, b)', description: 'Like :is() but with zero specificity' },
        { command: ':has(selector)', description: 'Parent that contains matching children' },
      ],
    },
    {
      category: 'Pseudo-elements',
      entries: [
        { command: '::before', description: 'Insert content before element' },
        { command: '::after', description: 'Insert content after element' },
        { command: '::first-line', description: 'First line of a block element' },
        { command: '::first-letter', description: 'First letter of a block element' },
        { command: '::placeholder', description: 'Placeholder text of an input' },
        { command: '::selection', description: 'User-selected text' },
        { command: '::marker', description: 'List item marker (bullet/number)' },
        { command: '::backdrop', description: 'Backdrop behind a fullscreen/dialog element' },
      ],
    },
  ],
}
