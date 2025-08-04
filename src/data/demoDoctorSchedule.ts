export const DEMO_DOCTOR_SCHEDULE: string = `{
  "id": "demo_doctor",
  "name": "範例 - 醫生",
  "month": 7,
  "year": 2025,
  "employees": [
    {
      "id": "b9b11af3-0e12-463b-9428-98596f0e4001",
      "name": "燈",
      "shiftsPerMonth": [
        6,
        11
      ],
      "weekdayShifts": [
        0,
        8
      ],
      "weekendShifts": [
        0,
        8
      ],
      "tags": [
        "tags.veteran"
      ]
    },
    {
      "id": "40e410e3-a5bb-4ee0-9570-b2376f4584ab",
      "name": "愛音",
      "shiftsPerMonth": [
        6,
        11
      ],
      "weekdayShifts": [
        0,
        8
      ],
      "weekendShifts": [
        0,
        8
      ],
      "tags": [
        "tags.weekendType",
        "tags.veteran"
      ]
    },
    {
      "id": "d35f20f7-c8d4-42c7-93dc-74134a29113c",
      "name": "樂奈",
      "shiftsPerMonth": [
        6,
        11
      ],
      "weekdayShifts": [
        0,
        8
      ],
      "weekendShifts": [
        0,
        8
      ],
      "tags": []
    },
    {
      "id": "0bab0319-e62c-4301-a2ef-78957b2e9cb1",
      "name": "爽世",
      "shiftsPerMonth": [
        6,
        11
      ],
      "weekdayShifts": [
        0,
        8
      ],
      "weekendShifts": [
        0,
        8
      ],
      "tags": []
    },
    {
      "id": "37783a5d-47e8-4a1a-a437-1333c55dfb12",
      "name": "立希",
      "shiftsPerMonth": [
        6,
        11
      ],
      "weekdayShifts": [
        0,
        8
      ],
      "weekendShifts": [
        0,
        8
      ],
      "tags": []
    },
    {
      "id": "1f17fb7d-6761-4279-b321-8e2339f13029",
      "name": "睦",
      "shiftsPerMonth": [
        6,
        11
      ],
      "weekdayShifts": [
        0,
        8
      ],
      "weekendShifts": [
        0,
        8
      ],
      "tags": []
    },
    {
      "id": "a95e6bd9-1912-40d4-b681-7e4912713634",
      "name": "祥子",
      "shiftsPerMonth": [
        6,
        11
      ],
      "weekdayShifts": [
        0,
        8
      ],
      "weekendShifts": [
        0,
        8
      ],
      "tags": []
    }
  ],
  "constraints": [
    {
      "id": "3706b982-7c2b-4707-825d-7acb7f1bf90c",
      "employeeId": "a95e6bd9-1912-40d4-b681-7e4912713634",
      "type": "avoid",
      "date": 4,
      "shiftIndex": 0
    },
    {
      "id": "afd9bd14-ea77-426a-8171-1f63775ae8e5",
      "employeeId": "a95e6bd9-1912-40d4-b681-7e4912713634",
      "type": "avoid",
      "date": 11,
      "shiftIndex": 0
    },
    {
      "id": "5ad3b9ac-4b56-4e2a-9444-1e787d8af4f3",
      "employeeId": "a95e6bd9-1912-40d4-b681-7e4912713634",
      "type": "avoid",
      "date": 18,
      "shiftIndex": 0
    },
    {
      "id": "96afc696-49f7-4a50-8f13-bf5823a80b1c",
      "employeeId": "a95e6bd9-1912-40d4-b681-7e4912713634",
      "type": "avoid",
      "date": 25,
      "shiftIndex": 0
    },
    {
      "id": "c16ad8c9-8582-4859-a437-cf5ba804d06c",
      "employeeId": "40e410e3-a5bb-4ee0-9570-b2376f4584ab",
      "type": "prefer",
      "date": 3,
      "shiftIndex": 0
    },
    {
      "id": "05337bc3-da89-444e-9c57-b5009f50dd27",
      "employeeId": "40e410e3-a5bb-4ee0-9570-b2376f4584ab",
      "type": "prefer",
      "date": 2,
      "shiftIndex": 0
    },
    {
      "id": "061e33fe-8e06-44d7-aa04-6db780a12af3",
      "employeeId": "d35f20f7-c8d4-42c7-93dc-74134a29113c",
      "type": "avoid",
      "date": 5,
      "shiftIndex": 0
    },
    {
      "id": "33631a51-de4b-4960-bc81-7f4babf112c3",
      "employeeId": "d35f20f7-c8d4-42c7-93dc-74134a29113c",
      "type": "avoid",
      "date": 12,
      "shiftIndex": 0
    },
    {
      "id": "da2733a0-ff59-4e3e-8fa8-72d4dcbd20ed",
      "employeeId": "d35f20f7-c8d4-42c7-93dc-74134a29113c",
      "type": "avoid",
      "date": 19,
      "shiftIndex": 0
    },
    {
      "id": "16560925-97ee-4375-96a9-b6111013ee71",
      "employeeId": "d35f20f7-c8d4-42c7-93dc-74134a29113c",
      "type": "avoid",
      "date": 26,
      "shiftIndex": 0
    },
    {
      "id": "94da9f80-a0ab-4255-9bb1-f89ce83e983e",
      "employeeId": "b9b11af3-0e12-463b-9428-98596f0e4001",
      "type": "avoid",
      "date": 9,
      "shiftIndex": 0
    },
    {
      "id": "fd496335-e674-4d25-89da-a2f9029b6cdd",
      "employeeId": "37783a5d-47e8-4a1a-a437-1333c55dfb12",
      "type": "avoid",
      "date": 9,
      "shiftIndex": 0
    },
    {
      "id": "2e5a7de5-05d9-4100-9463-89d3ea161cfb",
      "employeeId": "37783a5d-47e8-4a1a-a437-1333c55dfb12",
      "type": "avoid",
      "date": 25,
      "shiftIndex": 0
    },
    {
      "id": "0a5c40b2-eede-4661-b7ed-c051b9ce01fd",
      "employeeId": "37783a5d-47e8-4a1a-a437-1333c55dfb12",
      "type": "avoid",
      "date": 26,
      "shiftIndex": 0
    },
    {
      "id": "67880409-5b19-48f2-bdb0-c3d498423abd",
      "employeeId": "37783a5d-47e8-4a1a-a437-1333c55dfb12",
      "type": "avoid",
      "date": 27,
      "shiftIndex": 0
    },
    {
      "id": "7dbb155c-32da-4c72-b823-a799972ec084",
      "employeeId": "37783a5d-47e8-4a1a-a437-1333c55dfb12",
      "type": "avoid",
      "date": 28,
      "shiftIndex": 0
    },
    {
      "id": "de134bc2-ae16-4d07-923d-266b24d789b6",
      "employeeId": "1f17fb7d-6761-4279-b321-8e2339f13029",
      "type": "avoid",
      "date": 6,
      "shiftIndex": 0
    },
    {
      "id": "0780d79f-dd3b-468b-9370-ffe8772491b9",
      "employeeId": "1f17fb7d-6761-4279-b321-8e2339f13029",
      "type": "avoid",
      "date": 13,
      "shiftIndex": 0
    },
    {
      "id": "757c6310-c955-496a-b8c0-6de31b32ffdb",
      "employeeId": "1f17fb7d-6761-4279-b321-8e2339f13029",
      "type": "avoid",
      "date": 20,
      "shiftIndex": 0
    },
    {
      "id": "672dfe71-b295-4841-847b-9cacc1b3c811",
      "employeeId": "1f17fb7d-6761-4279-b321-8e2339f13029",
      "type": "avoid",
      "date": 27,
      "shiftIndex": 0
    },
    {
      "id": "72106ef7-fb49-4464-ada3-acc5b7e871e7",
      "employeeId": "b9b11af3-0e12-463b-9428-98596f0e4001",
      "type": "avoid",
      "date": 10,
      "shiftIndex": 0
    },
    {
      "id": "5cbe57fe-7440-4672-b5e6-6901f1cc2624",
      "employeeId": "b9b11af3-0e12-463b-9428-98596f0e4001",
      "type": "avoid",
      "date": 3,
      "shiftIndex": 0
    }
  ],
  "schedule":{},
  "createdAt": "2025-07-30T21:04:16.760Z",
  "isGenerated": true
}`

export const DEMO_DOCTOR_SETTINGS: string = `{
  "shiftsPerDay": 1,
  "personsPerShift": [
    2
  ],
  "maxConsecutiveShifts": 1,
  "maxConsecutiveDays": 1,
  "minRestDaysBetweenShifts": 2,
  "preventMultipleShiftsPerDay": true,
  "maxShiftsPerWeek": 6,
  "minShiftsPerWeek": 1,
  "evenDistribution": true,
  "shiftLabels": [
    "白班"
  ],
  "preferredAlgorithm": "auto"
}`
