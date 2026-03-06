import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming/create'

const theme = create({
  base: 'dark',

  // Brand
  brandTitle: 'DS Lorent',
  brandTarget: '_self',

  // Colors — match toolbox tokens
  colorPrimary: '#5f61e8',
  colorSecondary: '#5f61e8',

  // UI
  appBg: '#0f1117',
  appContentBg: '#0f1117',
  appPreviewBg: '#0f1117',
  appBorderColor: '#565e8c',
  appBorderRadius: 8,

  // Text
  textColor: '#e2e8f0',
  textMutedColor: '#7a8a9b',
  textInverseColor: '#0f1117',

  // Toolbar
  barBg: '#1a1d2e',
  barTextColor: '#94a3b8',
  barSelectedColor: '#818cf8',
  barHoverColor: '#818cf8',

  // Inputs
  inputBg: '#1a1d2e',
  inputBorder: '#565e8c',
  inputTextColor: '#e2e8f0',
  inputBorderRadius: 4,

  // Buttons
  buttonBg: '#1a1d2e',
  buttonBorder: '#565e8c',

  // Fonts
  fontBase: '"Inter", ui-sans-serif, system-ui, sans-serif',
  fontCode: '"JetBrains Mono", ui-monospace, monospace',

  // Boolean
  booleanBg: '#1a1d2e',
  booleanSelectedBg: '#5f61e8',
})

addons.setConfig({ theme })
