import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming/create'

const theme = create({
  base: 'dark',

  // Brand
  brandTitle: 'DS Lorent',
  brandTarget: '_self',

  // Colors — match toolbox tokens
  colorPrimary: '#7a9a60',
  colorSecondary: '#7a9a60',

  // UI
  appBg: '#0e120f',
  appContentBg: '#0e120f',
  appPreviewBg: '#0e120f',
  appBorderColor: '#2e3a2c',
  appBorderRadius: 8,

  // Text
  textColor: '#dce4d0',
  textMutedColor: '#56634e',
  textInverseColor: '#0e120f',

  // Toolbar
  barBg: '#181e1a',
  barTextColor: '#99a88e',
  barSelectedColor: '#8aac6c',
  barHoverColor: '#8aac6c',

  // Inputs
  inputBg: '#181e1a',
  inputBorder: '#2e3a2c',
  inputTextColor: '#dce4d0',
  inputBorderRadius: 4,

  // Buttons
  buttonBg: '#181e1a',
  buttonBorder: '#2e3a2c',

  // Fonts
  fontBase: '"Inter", ui-sans-serif, system-ui, sans-serif',
  fontCode: '"JetBrains Mono", ui-monospace, monospace',

  // Boolean
  booleanBg: '#181e1a',
  booleanSelectedBg: '#7a9a60',
})

addons.setConfig({ theme })
