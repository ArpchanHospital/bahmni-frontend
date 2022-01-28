import {
  Close24,
  Link,
  Star24,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@bahmni/design-system'
import React from 'react'
import {NewPrescription} from '../types'
import {newPrescriptionHeader} from '../utils/constants'
import {getDrugInfo} from '../utils/helper'

const styles = {
  action: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  tablePos: {padding: '5rem 16px 0px 16px'},
}

const getScheduleText = (prescriptionItem: any) => {
  const doseInfo: any = prescriptionItem.dosingInstructions
  const startDate: String = new Date(
    prescriptionItem.effectiveStartDate,
  ).toLocaleDateString()
  const schedule: String = `${doseInfo.dose} ${doseInfo.doseUnits}, ${doseInfo.frequency} for ${prescriptionItem.duration} ${prescriptionItem.durationUnits} starting on ${startDate}`
  return schedule
}
interface PrescriptionData {
  data: NewPrescription[]
}

const NewPrescriptionTable = React.memo((props: PrescriptionData) => {
  return (
    props.data.length > 0 && (
      <div style={styles.tablePos}>
        <h5>New Prescription</h5>
        <br></br>
        <Table title="newPrescription">
          <TableHead>
            <TableRow>
              {newPrescriptionHeader.map((header, i) => (
                <TableHeader key={i}>{header}</TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {props.data.map(row => (
              <React.Fragment key={Math.random()}>
                <TableRow data-testid="prescription">
                  <TableCell>{getDrugInfo(row)}</TableCell>
                  <TableCell>{getScheduleText(row)}</TableCell>
                  <TableCell>
                    {row.dosingInstructions.quantity}{' '}
                    {row.dosingInstructions.quantityUnits}
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell>
                    <span style={styles.action}>
                      <Link>edit</Link>
                      <Star24 data-testid="favourite" />
                      <Close24 data-testid="close" />
                    </span>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  )
})

export default NewPrescriptionTable
