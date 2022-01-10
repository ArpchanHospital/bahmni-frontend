import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {axe} from 'jest-axe'
import React from 'react'
import AddPrescriptionModal from './AddPrescriptionModal'
import {
  mockDrugOrderConfigApiResponse,
  mockDrugOrderConfigBadApiResponse,
  mockDrugsApiResponse,
} from '../utils/tests-utils/mockApiContract'
import MockAdapter from 'axios-mock-adapter/types'
import {initMockApi} from '../utils/tests-utils/baseApiSetup'
import {defaultDurationUnits, REST_ENDPOINTS} from '../utils/constants'

const mockDrug = mockDrugsApiResponse.validResponse.results[0]
let adapter: MockAdapter, waitForApiCalls: Function, apiParams: Function
beforeEach(() => {
  ;({adapter, waitForApiCalls, apiParams} = initMockApi())
})
test('should pass hygene accessibility tests', async () => {
  adapter
    .onGet(REST_ENDPOINTS.DRUG_ORDER_CONFIG)
    .reply(200, mockDrugOrderConfigApiResponse)
  const {container} = render(
    <AddPrescriptionModal
      drug={mockDrug}
      onClose={() => {}}
    ></AddPrescriptionModal>,
  )
  await waitForDrugOrderConfig()
  expect(await axe(container)).toHaveNoViolations()
})

describe('Medication Tab - Prescription Dialog', () => {
  beforeEach(() => {
    sessionStorage.clear()
    adapter
      .onGet(REST_ENDPOINTS.DRUG_ORDER_CONFIG)
      .reply(200, mockDrugOrderConfigApiResponse)
  })
  it('should display prescription details input controls', async () => {
    render(
      <AddPrescriptionModal
        drug={mockDrug}
        onClose={() => {}}
      ></AddPrescriptionModal>,
    )
    await waitForDrugOrderConfig()

    expect(screen.getByText(mockDrug.name)).toBeInTheDocument()
    expect(screen.getByLabelText('Dosage')).toBeInTheDocument()
    expect(screen.getByLabelText('Dosage Unit')).toBeInTheDocument()
    expect(screen.getByLabelText('Frequency')).toBeInTheDocument()
    expect(screen.getByLabelText('Duration')).toBeInTheDocument()
    expect(screen.getByLabelText('Duration Unit')).toBeInTheDocument()
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument()
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument()
    expect(screen.getByLabelText('Quantity Unit')).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Route'}))
  })

  it('should show error message when user enter drugs Quantity less then 0', async () => {
    render(
      <AddPrescriptionModal
        drug={mockDrug}
        onClose={() => {}}
      ></AddPrescriptionModal>,
    )
    await waitForDrugOrderConfig()

    const quantityInput = screen.getByLabelText('Quantity')
    userEvent.type(quantityInput, '-1')
    expect(
      screen.getByText(/quantity cannot be less than 0/i),
    ).toBeInTheDocument()
  })

  it('should show error message when user enter drugs Dosage less then 0', async () => {
    render(
      <AddPrescriptionModal
        drug={mockDrug}
        onClose={() => {}}
      ></AddPrescriptionModal>,
    )
    await waitForDrugOrderConfig()

    const dosageInput = screen.getByLabelText('Dosage')
    userEvent.type(dosageInput, '-1')
    expect(
      screen.getByText(/dosage cannot be less than 0/i),
    ).toBeInTheDocument()
  })

  it('should show error message when user enter drugs Duration less then 0', async () => {
    render(
      <AddPrescriptionModal
        drug={mockDrug}
        onClose={() => {}}
      ></AddPrescriptionModal>,
    )
    await waitForDrugOrderConfig()

    const durationInput = screen.getByLabelText('Duration')
    userEvent.type(durationInput, '-1')
    expect(
      screen.getByText(/duration cannot be less than 0/i),
    ).toBeInTheDocument()
  })

  it('should not allow user to select past date as prescription start date', async () => {
    function getFormatedDate(addDays: number): string {
      let date = new Date()
      date.setDate(date.getDate() + addDays)
      return date.toLocaleDateString('en', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    render(
      <AddPrescriptionModal
        drug={mockDrug}
        onClose={() => {}}
      ></AddPrescriptionModal>,
    )
    await waitForDrugOrderConfig()

    const startDateInput = screen.getByLabelText('Start Date')
    userEvent.click(startDateInput)

    const currentDay = screen.getByLabelText(getFormatedDate(0))
    const pastDate = screen.getByLabelText(getFormatedDate(-1))

    expect(currentDay.className).not.toMatch(/-disabled/i)
    expect(pastDate.className).toMatch(/-disabled/i)
  })
  it('should display dosage units from drug order config when user clicks on dosage unit dropdown', async () => {
    render(
      <AddPrescriptionModal
        drug={mockDrug}
        onClose={() => {}}
      ></AddPrescriptionModal>,
    )
    await waitForDrugOrderConfig()

    userEvent.click(screen.getByTitle('Dosage Unit'))
    mockDrugOrderConfigApiResponse.doseUnits.forEach(doseUnit => {
      expect(screen.getByText(doseUnit.name)).toBeInTheDocument()
    })
  })

  it('should display default duration units when user clicks on duration unit dropdown', async () => {
    render(
      <AddPrescriptionModal
        drug={mockDrug}
        onClose={() => {}}
      ></AddPrescriptionModal>,
    )
    await waitForDrugOrderConfig()

    userEvent.click(screen.getByTitle('Duration Unit'))
    defaultDurationUnits.forEach(durationUnit => {
      expect(screen.getByText(durationUnit.name)).toBeInTheDocument()
    })
  })

  it('should display quantity units from drug order config when user clicks on quantity unit dropdown', async () => {
    render(
      <AddPrescriptionModal
        drug={mockDrug}
        onClose={() => {}}
      ></AddPrescriptionModal>,
    )
    await waitForDrugOrderConfig()

    userEvent.click(screen.getByTitle('Quantity Unit'))
    mockDrugOrderConfigApiResponse.doseUnits.forEach(doseUnit => {
      expect(screen.getByText(doseUnit.name)).toBeInTheDocument()
    })
  })

  it('should display route from drug order config when user clicks on route dropdown', async () => {
    render(
      <AddPrescriptionModal
        drug={mockDrug}
        onClose={() => {}}
      ></AddPrescriptionModal>,
    )
    await waitForDrugOrderConfig()

    userEvent.click(screen.getByTitle('Route'))
    mockDrugOrderConfigApiResponse.routes.forEach(route => {
      expect(screen.getByText(route.name)).toBeInTheDocument()
    })
  })

  it('should display frequency options from drug order config when user clicks on frequency dropdown', async () => {
    render(
      <AddPrescriptionModal
        drug={mockDrug}
        onClose={() => {}}
      ></AddPrescriptionModal>,
    )
    await waitForDrugOrderConfig()

    userEvent.click(screen.getByLabelText('Frequency'))
    mockDrugOrderConfigApiResponse.frequencies.forEach(frequency => {
      expect(screen.getByText(frequency.name)).toBeInTheDocument()
    })
  })

  it('should display error message when fetching drug order config fails', async () => {
    adapter.onGet(REST_ENDPOINTS.DRUG_ORDER_CONFIG).reply(404)
    render(
      <AddPrescriptionModal
        drug={mockDrug}
        onClose={() => {}}
      ></AddPrescriptionModal>,
    )
    await waitForDrugOrderConfig()
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })

  it('should display loading message while fetching drug order config', async () => {
    adapter.onGet(REST_ENDPOINTS.DRUG_ORDER_CONFIG).timeout()
    render(
      <AddPrescriptionModal
        drug={mockDrug}
        onClose={() => {}}
      ></AddPrescriptionModal>,
    )
    expect(screen.getByText(/loading data/i)).toBeInTheDocument()
    await waitForDrugOrderConfig()
    expect(screen.queryByText(/loading data/i)).not.toBeInTheDocument()
  })

  it('should display error message when any of the config value is not defined in drug order config', async () => {
    adapter
      .onGet(REST_ENDPOINTS.DRUG_ORDER_CONFIG)
      .reply(200, mockDrugOrderConfigBadApiResponse)
    render(
      <AddPrescriptionModal
        drug={mockDrug}
        onClose={() => {}}
      ></AddPrescriptionModal>,
    )
    await waitForDrugOrderConfig()
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })

  it('should display total quantity when dose, frequency, duration, duration unit are entered', async () => {
    render(
      <AddPrescriptionModal
        drug={mockDrug}
        onClose={() => {}}
      ></AddPrescriptionModal>,
    )
    await waitForDrugOrderConfig()
    userEvent.type(screen.getByLabelText('Dosage'), '1')
    userEvent.click(screen.getByLabelText('Frequency'))
    userEvent.click(screen.getByText('Immediately'))
    userEvent.type(screen.getByLabelText('Duration'), '1')
    userEvent.click(screen.getByTitle('Duration Unit'))
    userEvent.click(screen.getByText('Day(s)'))

    expect(screen.getByLabelText('Quantity')).toHaveValue(1)
  })

  it('should recalculate total quantity when dose is changed', async () => {
    render(
      <AddPrescriptionModal
        drug={mockDrug}
        onClose={() => {}}
      ></AddPrescriptionModal>,
    )
    await waitForDrugOrderConfig()
    userEvent.type(screen.getByLabelText('Dosage'), '1')
    userEvent.click(screen.getByLabelText('Frequency'))
    userEvent.click(screen.getByText('Immediately'))
    userEvent.type(screen.getByLabelText('Duration'), '1')
    userEvent.click(screen.getByTitle('Duration Unit'))
    userEvent.click(screen.getByText('Day(s)'))

    expect(screen.getByLabelText('Quantity')).toHaveValue(1)

    userEvent.clear(screen.getByLabelText('Dosage'))
    userEvent.type(screen.getByLabelText('Dosage'), '2')
    expect(screen.getByLabelText('Quantity')).toHaveValue(2)
  })

  it('should recalculate total quantity when duration is changed', async () => {
    render(
      <AddPrescriptionModal
        drug={mockDrug}
        onClose={() => {}}
      ></AddPrescriptionModal>,
    )
    await waitForDrugOrderConfig()
    userEvent.type(screen.getByLabelText('Dosage'), '1')
    userEvent.click(screen.getByLabelText('Frequency'))
    userEvent.click(screen.getByText('Immediately'))
    userEvent.type(screen.getByLabelText('Duration'), '1')
    userEvent.click(screen.getByTitle('Duration Unit'))
    userEvent.click(screen.getByText('Day(s)'))

    expect(screen.getByLabelText('Quantity')).toHaveValue(1)

    userEvent.clear(screen.getByLabelText('Duration'))
    userEvent.type(screen.getByLabelText('Duration'), '2')
    expect(screen.getByLabelText('Quantity')).toHaveValue(2)
  })

  it('should recalculate total quantity when duration unit is changed', async () => {
    render(
      <AddPrescriptionModal
        drug={mockDrug}
        onClose={() => {}}
      ></AddPrescriptionModal>,
    )
    await waitForDrugOrderConfig()
    userEvent.type(screen.getByLabelText('Dosage'), '1')
    userEvent.click(screen.getByLabelText('Frequency'))
    userEvent.click(screen.getByText('Immediately'))
    userEvent.type(screen.getByLabelText('Duration'), '1')
    userEvent.click(screen.getByTitle('Duration Unit'))
    userEvent.click(screen.getByText('Day(s)'))

    expect(screen.getByLabelText('Quantity')).toHaveValue(1)

    userEvent.click(screen.getByTitle('Day(s)'))
    userEvent.click(screen.getByText('Week(s)'))
    expect(screen.getByLabelText('Quantity')).toHaveValue(7)
  })

  it('should recalculate total quantity when frequency is changed', async () => {
    render(
      <AddPrescriptionModal
        drug={mockDrug}
        onClose={() => {}}
      ></AddPrescriptionModal>,
    )
    await waitForDrugOrderConfig()
    userEvent.type(screen.getByLabelText('Dosage'), '1')
    userEvent.click(screen.getByLabelText('Frequency'))
    userEvent.click(screen.getByText('Immediately'))
    userEvent.type(screen.getByLabelText('Duration'), '1')
    userEvent.click(screen.getByTitle('Duration Unit'))
    userEvent.click(screen.getByText('Day(s)'))

    expect(screen.getByLabelText('Quantity')).toHaveValue(1)

    userEvent.click(screen.getByLabelText('Frequency'))
    userEvent.click(screen.getByText('Twice a day'))
    expect(screen.getByLabelText('Quantity')).toHaveValue(2)
  })

  it('should reset total quantity when frequency input is cleared', async () => {
    render(
      <AddPrescriptionModal
        drug={mockDrug}
        onClose={() => {}}
      ></AddPrescriptionModal>,
    )
    await waitForDrugOrderConfig()
    userEvent.type(screen.getByLabelText('Dosage'), '1')
    userEvent.click(screen.getByLabelText('Frequency'))
    userEvent.click(screen.getByText('Immediately'))
    userEvent.type(screen.getByLabelText('Duration'), '1')
    userEvent.click(screen.getByTitle('Duration Unit'))
    userEvent.click(screen.getByText('Day(s)'))

    expect(screen.getByLabelText('Quantity')).toHaveValue(1)

    userEvent.click(screen.getByRole('button', {name: 'Clear selected item'}))

    expect(screen.getByLabelText('Quantity')).toHaveValue(0)
  })

  it('should display total quantity in whole numbers rounded to next integer', async () => {
    render(
      <AddPrescriptionModal
        drug={mockDrug}
        onClose={() => {}}
      ></AddPrescriptionModal>,
    )
    await waitForDrugOrderConfig()
    userEvent.type(screen.getByLabelText('Dosage'), '1.5')
    userEvent.click(screen.getByLabelText('Frequency'))
    userEvent.click(screen.getByText('Immediately'))
    userEvent.type(screen.getByLabelText('Duration'), '1')
    userEvent.click(screen.getByTitle('Duration Unit'))
    userEvent.click(screen.getByText('Day(s)'))

    expect(screen.getByLabelText('Quantity')).toHaveValue(2)
  })

  it.only('should update quantity unit when dose unit is changed', async () => {
    render(
      <AddPrescriptionModal
        drug={mockDrug}
        onClose={() => {}}
      ></AddPrescriptionModal>,
    )
    await waitForDrugOrderConfig()

    userEvent.click(screen.getByTitle('Dosage Unit'))
    userEvent.click(screen.getByText('Tablet'))

    expect(screen.getByLabelText('Quantity Unit')).toHaveTextContent('Tablet')
  })
})

async function waitForDrugOrderConfig() {
  await waitForApiCalls({
    apiURL: REST_ENDPOINTS.DRUG_ORDER_CONFIG,
    times: 1,
  })
}
