export interface ClozeParts {
  segments: string[]
  blanks: number
}

// Split a prompt on {{...}} markers. segments.length === blanks + 1.
export function parseCloze(prompt: string): ClozeParts {
  const segments = prompt.split(/\{\{[^}]*\}\}/)
  return { segments, blanks: segments.length - 1 }
}
