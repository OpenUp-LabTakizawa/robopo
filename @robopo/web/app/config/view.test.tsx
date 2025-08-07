import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { View } from './view'
import type { SelectCompetition } from '@/app/lib/db/schema'

// Mock child components
vi.mock('@/app/config/tabs', () => ({
  CompetitionListTab: ({ competitionList }: { competitionList: SelectCompetition[] }) => (
    <div data-testid="competition-list-tab">
      {competitionList.map((c) => (
        <div key={c.id}>{c.name}</div>
      ))}
    </div>
  ),
  NewCompetitionTab: () => <div data-testid="new-competition-tab">New Competition</div>,
}));


const mockCompetitions: SelectCompetition[] = [
  { id: 1, name: 'Test Competition 1', step: 1, createdAt: new Date() },
  { id: 2, name: 'Test Competition 2', step: 0, createdAt: new Date() },
]

describe('View component', () => {
  it('renders tabs and initial competition list', () => {
    render(<View initialCompetitionList={{ competitions: mockCompetitions }} />)

    // Check for tabs
    expect(screen.getByText('大会一覧')).toBeInTheDocument()
    expect(screen.getByText('大会登録')).toBeInTheDocument()

    // Check for mocked child components
    expect(screen.getByTestId('competition-list-tab')).toBeInTheDocument()
    expect(screen.getByTestId('new-competition-tab')).toBeInTheDocument()

    // Check for initial competition list by looking for the text rendered by the mocked component
    expect(screen.getByText('Test Competition 1')).toBeInTheDocument()
    expect(screen.getByText('Test Competition 2')).toBeInTheDocument()
  })
})
