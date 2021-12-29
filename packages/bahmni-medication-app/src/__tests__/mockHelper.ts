export const mockDrugsApiResponse = {
  validResponse: {
    results: [
      {
        uuid: 1,
        name: 'Paracetomal 1',
      },
      {
        uuid: 2,
        name: 'Paracetomal 2',
      },
    ],
  },
  emptyResponse: {
    results: [],
  },
};

export const mockActivePrescriptionResponse = [
  {
    visit: {
      startDateTime: 1496851128000,
    },
    dateStopped: null,
    provider: {
      name: 'Super Man',
    },
    drug: {
      name: 'Aspirin 75mg',
      form: 'Tablet',
    },
    dosingInstructions: {
      dose: 5.0,
      doseUnits: 'Capsule(s)',
      route: 'Oral',
      frequency: 'Thrice a day',
      administrationInstructions: '{"instructions":"As directed"}',
      quantity: 150.0,
      quantityUnits: 'Capsule(s)',
    },
    durationUnits: 'Day(s)',
    effectiveStartDate: 1640164841000,
  },
];

export const mockPrescriptionResponse = [
  {
    visit: {
      startDateTime: 1496851128000,
    },
    dateStopped: '1607888143',
    provider: {
      name: 'Super Man',
    },
    drug: {
      name: 'Aspirin 75mg',
      form: 'Tablet',
    },
    dosingInstructions: {
      dose: 5.0,
      doseUnits: 'Capsule(s)',
      route: 'Oral',
      frequency: 'Thrice a day',
      administrationInstructions: '{"instructions":"As directed"}',
      quantity: 150.0,
      quantityUnits: 'Capsule(s)',
    },
    durationUnits: 'Day(s)',
    effectiveStartDate: 1640164841000,
  },
];
