export const DEMO_CHIIKAWA_SCHEDULE: string = `{
  "id": "demo_chiikawa",
  "name": "吉伊卡哇醫院7月份班表",
  "month": 6,
  "year": 2025,
  "employees": [
    {
      "id": "146d5052-510c-4583-b270-ff2e51abffe8",
      "name": "吉伊",
      "shiftsPerMonth": [
        7,
        8
      ],
      "weekdayShifts": [
        0,
        7
      ],
      "weekendShifts": [
        0,
        3
      ],
      "tags": [
        "tags.weekendType",
        "tags.rookie"
      ]
    },
    {
      "id": "3f741185-00c9-4d28-9d30-82f51ed67ca6",
      "name": "小八",
      "shiftsPerMonth": [
        7,
        8
      ],
      "weekdayShifts": [
        0,
        7
      ],
      "weekendShifts": [
        0,
        3
      ],
      "tags": [
        "tags.weekendType"
      ]
    },
    {
      "id": "2165a0f4-1fa4-4fa9-9a60-a12381aa3775",
      "name": "烏薩奇",
      "shiftsPerMonth": [
        7,
        8
      ],
      "weekdayShifts": [
        0,
        7
      ],
      "weekendShifts": [
        0,
        3
      ],
      "tags": [
        "tags.weekendType",
        "tags.veteran"
      ]
    },
    {
      "id": "4f39e5b7-0fcd-4f9f-aadd-aba87106e790",
      "name": "小桃",
      "shiftsPerMonth": [
        7,
        8
      ],
      "weekdayShifts": [
        0,
        7
      ],
      "weekendShifts": [
        0,
        3
      ],
      "tags": [
        "tags.weekendType"
      ]
    },
    {
      "id": "a463cbba-958f-4e8f-a9d1-21c075f73584",
      "name": "栗子饅頭",
      "shiftsPerMonth": [
        7,
        8
      ],
      "weekdayShifts": [
        0,
        7
      ],
      "weekendShifts": [
        0,
        3
      ],
      "tags": []
    },
    {
      "id": "1416fad6-b449-4e26-bc89-a3f097b0f86f",
      "name": "師傅",
      "shiftsPerMonth": [
        7,
        8
      ],
      "weekdayShifts": [
        0,
        7
      ],
      "weekendShifts": [
        0,
        3
      ],
      "tags": [
        "tags.veteran"
      ]
    },
    {
      "id": "cacbc07c-1c75-4984-b2e8-333da03280cb",
      "name": "獅薩",
      "shiftsPerMonth": [
        7,
        8
      ],
      "weekdayShifts": [
        0,
        7
      ],
      "weekendShifts": [
        0,
        3
      ],
      "tags": [
        "tags.rookie"
      ]
    },
    {
      "id": "a6f58193-10b1-4dc1-9a85-064b0a99597c",
      "name": "古本屋",
      "shiftsPerMonth": [
        7,
        8
      ],
      "weekdayShifts": [
        0,
        7
      ],
      "weekendShifts": [
        0,
        3
      ],
      "tags": []
    }
  ],
  "constraints": [
    {
      "id": "3ae5455a-32ce-4718-945c-d13a20975f31",
      "employeeId": "146d5052-510c-4583-b270-ff2e51abffe8",
      "type": "avoid",
      "date": 18,
      "shiftIndex": 0
    },
    {
      "id": "4b7d7aa3-f5ae-4dcc-82f9-b0414ac520aa",
      "employeeId": "146d5052-510c-4583-b270-ff2e51abffe8",
      "type": "avoid",
      "date": 17,
      "shiftIndex": 0
    },
    {
      "id": "20b30840-7025-4d3c-8da7-2807e967175e",
      "employeeId": "146d5052-510c-4583-b270-ff2e51abffe8",
      "type": "prefer",
      "date": 20,
      "shiftIndex": 0
    },
    {
      "id": "0db4be83-84d0-4404-abe7-0b09cd79717d",
      "employeeId": "146d5052-510c-4583-b270-ff2e51abffe8",
      "type": "prefer",
      "date": 19,
      "shiftIndex": 0
    },
    {
      "id": "0581a519-273d-46b6-b8af-3078fb6e6c5b",
      "employeeId": "3f741185-00c9-4d28-9d30-82f51ed67ca6",
      "type": "prefer",
      "date": 20,
      "shiftIndex": 0
    },
    {
      "id": "e7876d61-fb6b-46ad-ad2e-a35bd5c9a7ab",
      "employeeId": "3f741185-00c9-4d28-9d30-82f51ed67ca6",
      "type": "prefer",
      "date": 19,
      "shiftIndex": 0
    },
    {
      "id": "ba5f6d9c-9379-4b9d-9a93-a244f38ef9f1",
      "employeeId": "2165a0f4-1fa4-4fa9-9a60-a12381aa3775",
      "type": "avoid",
      "date": 3,
      "shiftIndex": 0
    },
    {
      "id": "17cb309d-da43-48b3-89a1-cf516a6081cd",
      "employeeId": "2165a0f4-1fa4-4fa9-9a60-a12381aa3775",
      "type": "avoid",
      "date": 4,
      "shiftIndex": 0
    },
    {
      "id": "eda80898-e074-42f4-999f-311c5f3f4851",
      "employeeId": "2165a0f4-1fa4-4fa9-9a60-a12381aa3775",
      "type": "avoid",
      "date": 5,
      "shiftIndex": 0
    },
    {
      "id": "a590fe23-f306-40a9-ad3d-44680ee2d36d",
      "employeeId": "2165a0f4-1fa4-4fa9-9a60-a12381aa3775",
      "type": "avoid",
      "date": 6,
      "shiftIndex": 0
    },
    {
      "id": "52ea5020-73bd-4974-a38a-52d753d905f3",
      "employeeId": "2165a0f4-1fa4-4fa9-9a60-a12381aa3775",
      "type": "avoid",
      "date": 7,
      "shiftIndex": 0
    },
    {
      "id": "db159af6-8379-4770-8aa8-f593f2db8939",
      "employeeId": "2165a0f4-1fa4-4fa9-9a60-a12381aa3775",
      "type": "avoid",
      "date": 8,
      "shiftIndex": 0
    },
    {
      "id": "fbb6d4d7-0e94-48ef-b099-961f88556fb8",
      "employeeId": "2165a0f4-1fa4-4fa9-9a60-a12381aa3775",
      "type": "avoid",
      "date": 11,
      "shiftIndex": 0
    },
    {
      "id": "3ab181cd-fa9e-4e4a-934e-5b476f408138",
      "employeeId": "2165a0f4-1fa4-4fa9-9a60-a12381aa3775",
      "type": "avoid",
      "date": 12,
      "shiftIndex": 0
    },
    {
      "id": "84801a01-90a6-4e69-aa7a-539179842179",
      "employeeId": "2165a0f4-1fa4-4fa9-9a60-a12381aa3775",
      "type": "avoid",
      "date": 13,
      "shiftIndex": 0
    },
    {
      "id": "bc586a95-0691-4d18-b0f2-bbc66fcafed9",
      "employeeId": "2165a0f4-1fa4-4fa9-9a60-a12381aa3775",
      "type": "prefer",
      "date": 10,
      "shiftIndex": 0
    },
    {
      "id": "8f508578-1710-44e6-950c-3ed7058bbc5c",
      "employeeId": "2165a0f4-1fa4-4fa9-9a60-a12381aa3775",
      "type": "prefer",
      "date": 26,
      "shiftIndex": 0
    },
    {
      "id": "5923f863-7bd6-4985-a573-0bd9b62cb0e0",
      "employeeId": "2165a0f4-1fa4-4fa9-9a60-a12381aa3775",
      "type": "prefer",
      "date": 27,
      "shiftIndex": 0
    },
    {
      "id": "02991966-af26-40fe-bbd7-f056b864f860",
      "employeeId": "4f39e5b7-0fcd-4f9f-aadd-aba87106e790",
      "type": "avoid",
      "date": 19,
      "shiftIndex": 0
    },
    {
      "id": "be3974e2-5a83-4b32-aa69-a162a6ee12e8",
      "employeeId": "4f39e5b7-0fcd-4f9f-aadd-aba87106e790",
      "type": "avoid",
      "date": 26,
      "shiftIndex": 0
    },
    {
      "id": "35791606-ac4e-45c7-bd17-0b5a36441bf2",
      "employeeId": "4f39e5b7-0fcd-4f9f-aadd-aba87106e790",
      "type": "avoid",
      "date": 28,
      "shiftIndex": 0
    },
    {
      "id": "31131745-6597-4aa7-b823-8d27488b76d6",
      "employeeId": "4f39e5b7-0fcd-4f9f-aadd-aba87106e790",
      "type": "avoid",
      "date": 27,
      "shiftIndex": 0
    },
    {
      "id": "648e7957-6928-4673-bc0b-349b29cf9617",
      "employeeId": "4f39e5b7-0fcd-4f9f-aadd-aba87106e790",
      "type": "prefer",
      "date": 12,
      "shiftIndex": 0
    },
    {
      "id": "60e55ddf-b5df-4639-94c7-6207a6dcbd9c",
      "employeeId": "4f39e5b7-0fcd-4f9f-aadd-aba87106e790",
      "type": "prefer",
      "date": 13,
      "shiftIndex": 0
    },
    {
      "id": "1c9bc6c8-b128-4b07-ad07-ad2858b11715",
      "employeeId": "a463cbba-958f-4e8f-a9d1-21c075f73584",
      "type": "avoid",
      "date": 3,
      "shiftIndex": 0
    },
    {
      "id": "694a5769-8811-4557-a819-5b57c747dc5c",
      "employeeId": "a463cbba-958f-4e8f-a9d1-21c075f73584",
      "type": "avoid",
      "date": 10,
      "shiftIndex": 0
    },
    {
      "id": "8ad6ba83-0f63-4c66-8055-a11c5622b9d8",
      "employeeId": "a463cbba-958f-4e8f-a9d1-21c075f73584",
      "type": "avoid",
      "date": 11,
      "shiftIndex": 0
    },
    {
      "id": "89e2c48d-56cc-4726-b313-6debd08a1621",
      "employeeId": "a463cbba-958f-4e8f-a9d1-21c075f73584",
      "type": "avoid",
      "date": 12,
      "shiftIndex": 0
    },
    {
      "id": "8df21edc-d5c9-4e70-9374-e81cde4b252b",
      "employeeId": "a463cbba-958f-4e8f-a9d1-21c075f73584",
      "type": "avoid",
      "date": 13,
      "shiftIndex": 0
    },
    {
      "id": "aaa8468b-f20c-4dd2-aa96-bd7049e7e0fd",
      "employeeId": "cacbc07c-1c75-4984-b2e8-333da03280cb",
      "type": "avoid",
      "date": 1,
      "shiftIndex": 0
    },
    {
      "id": "fb0f76b4-3b8c-4067-9e47-32d6d2ebc41b",
      "employeeId": "cacbc07c-1c75-4984-b2e8-333da03280cb",
      "type": "avoid",
      "date": 2,
      "shiftIndex": 0
    },
    {
      "id": "91ff4d51-6bc7-407f-ab3d-b9886a39fe89",
      "employeeId": "cacbc07c-1c75-4984-b2e8-333da03280cb",
      "type": "avoid",
      "date": 3,
      "shiftIndex": 0
    },
    {
      "id": "12f898fa-09f8-4311-bd41-c669cc26e8eb",
      "employeeId": "cacbc07c-1c75-4984-b2e8-333da03280cb",
      "type": "avoid",
      "date": 4,
      "shiftIndex": 0
    },
    {
      "id": "8946dfd9-7370-440c-b434-23320ded9330",
      "employeeId": "cacbc07c-1c75-4984-b2e8-333da03280cb",
      "type": "avoid",
      "date": 5,
      "shiftIndex": 0
    },
    {
      "id": "36632904-dc49-4dcc-8318-e5e130c55404",
      "employeeId": "cacbc07c-1c75-4984-b2e8-333da03280cb",
      "type": "avoid",
      "date": 19,
      "shiftIndex": 0
    },
    {
      "id": "2ba95cfd-14a5-40ea-9fd3-18c74e0236a1",
      "employeeId": "cacbc07c-1c75-4984-b2e8-333da03280cb",
      "type": "avoid",
      "date": 20,
      "shiftIndex": 0
    },
    {
      "id": "18143da2-f02e-44af-9e87-312079cd6c76",
      "employeeId": "cacbc07c-1c75-4984-b2e8-333da03280cb",
      "type": "prefer",
      "date": 10,
      "shiftIndex": 0
    },
    {
      "id": "5ca7b217-a117-420b-99fd-6d6a14904166",
      "employeeId": "cacbc07c-1c75-4984-b2e8-333da03280cb",
      "type": "prefer",
      "date": 24,
      "shiftIndex": 0
    },
    {
      "id": "22f1a547-860d-4552-8ee1-cef67774709a",
      "employeeId": "a6f58193-10b1-4dc1-9a85-064b0a99597c",
      "type": "avoid",
      "date": 12,
      "shiftIndex": 0
    },
    {
      "id": "261df1ab-edaf-4ada-9e8e-6cac80ef7041",
      "employeeId": "a6f58193-10b1-4dc1-9a85-064b0a99597c",
      "type": "avoid",
      "date": 13,
      "shiftIndex": 0
    },
    {
      "id": "0cecf706-6fd1-448f-a1ef-06cdd34ad2f9",
      "employeeId": "a6f58193-10b1-4dc1-9a85-064b0a99597c",
      "type": "avoid",
      "date": 14,
      "shiftIndex": 0
    }
  ],
  "schedule": {
  },
  "createdAt": "2025-08-04T23:44:40.945Z",
  "isGenerated": true
}`
export const DEMO_CHIIKAWA_SETTINGS: string = `{
  "shiftsPerDay": 1,
  "personsPerShift": [
    2
  ],
  "maxConsecutiveShifts": 1,
  "maxConsecutiveDays": 6,
  "minRestDaysBetweenShifts": 0,
  "preventMultipleShiftsPerDay": true,
  "maxShiftsPerWeek": 6,
  "minShiftsPerWeek": 1,
  "evenDistribution": true,
  "shiftLabels": [
    "白班"
  ],
  "preferredAlgorithm": "cp-sat"
}`
