import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders placeholder page', () => {
    render(<App />)

    expect(screen.getByText('RuoYi-React')).toBeInTheDocument()
    expect(screen.getByText('项目骨架已就绪，等待需求迁移')).toBeInTheDocument()
  })
})
