export interface Tool {
  path: string
  name: string
  abbreviation: string
}

export interface Section {
  label: string
  tools: Tool[]
}
