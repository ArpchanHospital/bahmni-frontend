import {render, waitFor, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {when} from 'jest-when'
import React from 'react'
import {axe} from 'jest-axe'
import {PrescriptionWidget} from '../PrescriptionWidget'
import ActivePrescription from '../ActivePrescription'
import AllPrescription from '../AllPrescription'

Element.prototype.scrollIntoView = jest.fn()

jest.mock('../ActivePrescription')
jest.mock('../AllPrescription')

test('should pass hygene accessibility tests', async () => {
  when(ActivePrescription).mockReturnValue(<p>Active Prescription</p>)
  when(AllPrescription).mockReturnValue(<p>Test All Prescription</p>)
  const {container} = render(<PrescriptionWidget />)
  expect(await axe(container)).toHaveNoViolations()
})

describe('Medication tab - Drugs search', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  beforeEach(() => {
    when(ActivePrescription).mockReturnValue(<p>Test Component</p>)
    when(AllPrescription).mockReturnValue(<p>Test All Prescription</p>)
  })

  it('should display all the tabs', async () => {
    render(<PrescriptionWidget />)

    expect(
      screen.getByRole('tab', {
        name: /active prescription/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', {
        name: /scheduled/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', {
        name: /show all/i,
      }),
    ).toBeInTheDocument()
  })

  it('should show active prescription content', async () => {
    render(<PrescriptionWidget />)

    expect(screen.getByText(/Test Component/)).toBeVisible()
  })

  it('should not display active prescription content on user clicking scheduled tab', async () => {
    render(<PrescriptionWidget />)

    userEvent.click(
      screen.getByRole('tab', {
        name: /scheduled/i,
      }),
    )
    expect(screen.getByText(/Test Component/)).not.toBeVisible()

    userEvent.click(
      screen.getByRole('tab', {
        name: /active prescription/i,
      }),
    )
    expect(screen.getByText(/Test Component/)).toBeVisible()
  })

  it('should display all prescription content on user clicking show all tab', async () => {
    render(<PrescriptionWidget />)

    expect(screen.getByText(/Test All Prescription/)).not.toBeVisible()
    userEvent.click(
      screen.getByRole('tab', {
        name: /show all/i,
      }),
    )

    expect(screen.getByText(/Test All Prescription/)).toBeVisible()
  })
})
