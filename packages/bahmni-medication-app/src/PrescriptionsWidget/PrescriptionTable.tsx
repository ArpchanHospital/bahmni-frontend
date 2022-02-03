import {
  Column,
  Grid,
  Link,
  Reset24,
  Row,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
} from '@bahmni/design-system'
import React, {useState} from 'react'
import {useStoppedPrescriptions} from '../context/StoppedPrescriptionContext'
import {StopPrescriptionInfo} from '../types'
import {PrescriptionItem} from '../types/medication'
import {headerData} from '../utils/constants'
import StopPrescripotionModal from './StopPrescriptionModal'

const styles = {
  providerName: {
    fontSize: '0.7rem',
    float: 'right',
    paddingTop: '10px',
  } as React.CSSProperties,
  tableSubHeading: {textAlign: 'center'},
}
enum PrescriptionStatus {
  ACTIVE = 'active',
  FINISHED = 'finished',
  SCHEDULED = 'scheduled',
  STOPPED = 'stopped',
}
const StatusStylesMap = {
  active: {color: 'orange'},
  scheduled: {color: 'green'},
  stopped: {textDecoration: 'line-through'},
}

const getScheduleText = (drugInfo: any, drugStatus: PrescriptionStatus) => {
  const doseInfo: any = drugInfo.dosingInstructions
  const startDate: String = new Date(
    drugInfo.effectiveStartDate,
  ).toLocaleDateString()
  const schedule: String = `${doseInfo.dose} ${doseInfo.doseUnits}, ${
    doseInfo.frequency
  } for ${drugInfo.duration} ${drugInfo.durationUnits} ${
    drugStatus === PrescriptionStatus.SCHEDULED ? 'start on' : 'started on'
  } ${startDate}`
  return schedule
}

const getSubHeading = (prescriptionData: PrescriptionItem[], index: number) => {
  if (
    index == 0 ||
    new Date(prescriptionData[index - 1].dateActivated).toLocaleDateString() !==
      new Date(prescriptionData[index].dateActivated).toLocaleDateString()
  ) {
    return (
      <TableRow data-testid="date-row">
        <TableCell colSpan={6} style={styles.tableSubHeading}>
          {new Date(prescriptionData[index].dateActivated).toLocaleDateString()}
        </TableCell>
      </TableRow>
    )
  }
}

const getAdditionalInstruction = (row: PrescriptionItem) => {
  const instructionJson = JSON.parse(
    row.dosingInstructions.administrationInstructions,
  )
  return (
    <>
      <Tag type="green" title="Instruction">
        {' '}
        {instructionJson.instructions}{' '}
      </Tag>
      {instructionJson.additionalInstructions && (
        <Tag type="blue" title="Instruction">
          {' '}
          {instructionJson.additionalInstructions}{' '}
        </Tag>
      )}
    </>
  )
}

const getStatus = (row: PrescriptionItem): PrescriptionStatus => {
  const currentDateTime = Date.now()
  if (row.dateStopped) return PrescriptionStatus.STOPPED
  if (row.effectiveStartDate > currentDateTime)
    return PrescriptionStatus.SCHEDULED
  return row.effectiveStopDate > currentDateTime
    ? PrescriptionStatus.ACTIVE
    : PrescriptionStatus.FINISHED
}

const getDrugInfo = (row: PrescriptionItem) => {
  if (row.drug === null && row.drugNonCoded) return row.drugNonCoded

  return ` ${row.drug.name}, ${row.drug.form}, ${row.dosingInstructions.route}`
}
interface PrescriptionData {
  data: PrescriptionItem[]
}

const PrescriptionTable = (props: PrescriptionData) => {
  const {stoppedPrescriptions, setStoppedPrescriptions} =
    useStoppedPrescriptions()
  const [stoppedPrescriptionsInfo, setStoppedPrescriptionsInfo] = useState<
    StopPrescriptionInfo[]
  >(Array(props.data.length).fill(undefined))
  const [selectedStopPrescriptionIndex, setSelectedStopPrescriptionIndex] =
    useState<number>(-1)

  function isPrescrioptionFinishedOrStopped(status: PrescriptionStatus) {
    return (
      status === PrescriptionStatus.FINISHED ||
      status === PrescriptionStatus.STOPPED
    )
  }

  const getActionLinks = (
    status: PrescriptionStatus,
    prescriptionIndex: number,
  ) => {
    if (isPrescrioptionFinishedOrStopped(status)) return <Link inline>add</Link>
    if (stoppedPrescriptionsInfo[prescriptionIndex])
      return (
        <Reset24
          aria-label="Reset"
          onClick={() => handleUndoStopAction(prescriptionIndex)}
        />
      )

    return (
      <>
        <Link inline>revise</Link>{' '}
        <Link
          inline
          onClick={() => setSelectedStopPrescriptionIndex(prescriptionIndex)}
        >
          stop
        </Link>{' '}
        <Link inline>renew</Link>{' '}
      </>
    )
  }

  function isStopActionClicked() {
    return selectedStopPrescriptionIndex >= 0
  }

  function renderStoppedPrecriptionInfo(currentRow: number): React.ReactNode {
    return (
      <TableRow style={{borderTop: 'hidden'}}>
        <TableCell colSpan={6}>
          <Grid>
            <Row>
              <Column>
                {`Stop Date : ${stoppedPrescriptionsInfo[
                  currentRow
                ].stopDate.toLocaleDateString()} `}{' '}
              </Column>
              <Column>{`Reason : ${stoppedPrescriptionsInfo[currentRow].reason}`}</Column>
              <Column>{`Notes: ${stoppedPrescriptionsInfo[currentRow].notes}`}</Column>
            </Row>
          </Grid>
        </TableCell>
      </TableRow>
    )
  }

  const handleStopPrescriptionModalClose = (
    stopPrescriptionInfo: StopPrescriptionInfo,
  ) => {
    if (stopPrescriptionInfo) {
      updateStoppedPrescriptionsInfo(stopPrescriptionInfo)
      setStoppedPrescriptions([
        ...stoppedPrescriptions,
        getStoppedPrescriptionItem(),
      ])
    }
    setSelectedStopPrescriptionIndex(-1)

    function getStoppedPrescriptionItem(): PrescriptionItem {
      let stoppedPrescriptionItem = JSON.parse(
        JSON.stringify(props.data[selectedStopPrescriptionIndex]),
      )
      stoppedPrescriptionItem.action = 'DISCONTINUE'
      stoppedPrescriptionItem.dateActivated = null
      stoppedPrescriptionItem.dateStopped = stopPrescriptionInfo.stopDate
      stoppedPrescriptionItem.previousOrderUuid = stoppedPrescriptionItem.uuid
      stoppedPrescriptionItem.uuid = null
      stoppedPrescriptionItem.orderReasonText = stopPrescriptionInfo.notes

      //TODO Update setting orderReasonConcept based on stopData.reason
      stoppedPrescriptionItem.orderReasonConcept = null
      return stoppedPrescriptionItem
    }
  }

  const handleUndoStopAction = (index: number) => {
    updateStoppedPrescriptionsInfo(undefined, index)

    const removedArray = stoppedPrescriptions.filter(
      item => item.previousOrderUuid != props.data[index].uuid,
    )
    setStoppedPrescriptions(removedArray)
  }

  function updateStoppedPrescriptionsInfo(
    stopPrescriptionInfo: StopPrescriptionInfo,
    index: number = selectedStopPrescriptionIndex,
  ) {
    let updatedArray = [...stoppedPrescriptionsInfo]
    updatedArray[index] = stopPrescriptionInfo
    setStoppedPrescriptionsInfo(updatedArray)
  }

  return (
    <>
      <Table title="prescription">
        <TableHead>
          <TableRow>
            {headerData.map((header, i) => (
              <TableHeader key={i}>{header}</TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.data.map((row, index) => {
            const drugStatus = getStatus(row)
            return (
              <React.Fragment key={Math.random()}>
                {getSubHeading(props.data, index)}
                <TableRow>
                  <TableCell
                    style={{
                      textDecoration:
                        StatusStylesMap[drugStatus]?.textDecoration,
                    }}
                  >
                    {getDrugInfo(row)}
                  </TableCell>
                  <TableCell
                    style={{
                      textDecoration:
                        StatusStylesMap[drugStatus]?.textDecoration,
                    }}
                  >
                    {getScheduleText(row, drugStatus)}
                    <small style={styles.providerName}>
                      by {row.provider.name}
                    </small>
                  </TableCell>
                  <TableCell>
                    {row.dosingInstructions.quantity}{' '}
                    {row.dosingInstructions.quantityUnits}
                  </TableCell>
                  <TableCell>{getAdditionalInstruction(row)}</TableCell>
                  <TableCell
                    style={{
                      color: StatusStylesMap[drugStatus]?.color,
                      fontWeight: 'bold',
                    }}
                  >
                    {drugStatus}
                  </TableCell>
                  <TableCell>{getActionLinks(drugStatus, index)}</TableCell>
                </TableRow>
                {stoppedPrescriptionsInfo[index] &&
                  renderStoppedPrecriptionInfo(index)}
              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>
      {isStopActionClicked() && (
        <StopPrescripotionModal
          drugInfo={getDrugInfo(props.data[selectedStopPrescriptionIndex])}
          onClose={(stopPrescriptionInfo: StopPrescriptionInfo) =>
            handleStopPrescriptionModalClose(stopPrescriptionInfo)
          }
        />
      )}
    </>
  )
}
export default PrescriptionTable
