import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'

import { Breadcrumb } from '@/shared/ui/components/Breadcrumb'
import { Card } from '@/shared/ui/components/Card'
import { Section } from '@/shared/ui/components/Section'

describe('primitives', () => {
  it('Card renders children', () => {
    render(<Card>hola</Card>)
    expect(screen.getByText('hola')).toBeInTheDocument()
  })

  it('Section shows its label and body', () => {
    render(<Section label="Significado">cuerpo</Section>)
    expect(screen.getByText('Significado')).toBeInTheDocument()
    expect(screen.getByText('cuerpo')).toBeInTheDocument()
  })

  it('Breadcrumb renders a nav with ordered items', () => {
    render(
      <MemoryRouter>
        <Breadcrumb items={[{ label: 'Cadena' }, { label: 'HABCDE' }]} />
      </MemoryRouter>,
    )
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    expect(screen.getByText('HABCDE')).toBeInTheDocument()
  })
})
