# Quiz Attempt API Note (Frontend)

## 1) Authentication
- Both APIs require role: User.
- Send Bearer token in Authorization header.

Example header:
- Authorization: Bearer <access_token>

---

## 2) Create Quiz Attempt

### Endpoint
- Method: POST
- URL: /api/quiz-attempts

### Request Body
{
  "createQuizAttempt": {
    "studyPlanModuleId": 12,
    "level": "Intermediate"
  }
}

### Field Rules
- studyPlanModuleId: number > 0
- level: one of Begineer, Beginner, Intermediate, Advanced

### What backend does
- Get StudyPlanModule by studyPlanModuleId
- Find quiz by:
  - quiz.roadmapNodeId == studyPlanModule.roadmapNodeId
  - quiz.level == level (Begineer is normalized to Beginner)
- Create a QuizAttempt with status InProgress
- Random 10 questions from that quiz
- Return questions + options without IsCorrect

### Response Shape (200)
{
  "quizAttempt": {
    "id": 555,
    "quizId": 10,
    "userId": "user-id",
    "startedAt": "2026-03-26T10:00:00Z",
    "submittedAt": null,
    "score": null,
    "status": 0
  },
  "questions": [
    {
      "questionId": 101,
      "prompt": "What is Ruby?",
      "type": 0,
      "orderNo": 1,
      "options": [
        {
          "optionId": 1001,
          "valueKey": "A",
          "displayText": "Programming language",
          "orderNo": 1
        }
      ]
    }
  ]
}

Notes:
- status enum: 0 = InProgress, 1 = Passed, 2 = Failed
- questions length is up to 10 (if source quiz has fewer than 10, returns fewer)

---

## 3) Submit Quiz Attempt

### Endpoint
- Method: POST
- URL: /api/quiz-attempts/{Id}/submit

Example:
- /api/quiz-attempts/555/submit

### Request Body
IMPORTANT:
- Current handler reads attempt id from body field submitQuizAttempt.id.
- To avoid mismatch, frontend should send same id in both route and body.

{
  "submitQuizAttempt": {
    "id": 555,
    "answers": [
      {
        "questionId": 101,
        "optionId": 1001
      },
      {
        "questionId": 102,
        "optionId": 1005
      }
    ]
  }
}

### Field Rules
- answers: required, not empty
- each answer.questionId: required, > 0
- optionId can be null for text/number question types
- textValue, numberValue are optional

### Scoring Logic
- Backend loads full quiz + questions + options
- For each question:
  - Compare selected option with correct option
  - If correct: add selected option scoreValue
  - If wrong: +0
- totalScore = sum(scoreValue of correct selected options)
- status:
  - Passed if totalScore >= quiz.passingScore
  - Failed otherwise

### Response Shape (200)
{
  "quizAttempt": {
    "id": 555,
    "quizId": 10,
    "userId": "user-id",
    "startedAt": "2026-03-26T10:00:00Z",
    "submittedAt": "2026-03-26T10:05:00Z",
    "score": 7,
    "status": 1
  },
  "questions": [
    {
      "questionId": 101,
      "prompt": "What is Ruby?",
      "selectedOptionId": 1001,
      "selectedOptionText": "Programming language",
      "correctOptionId": 1001,
      "correctOptionText": "Programming language",
      "isCorrect": true
    },
    {
      "questionId": 102,
      "prompt": "Which file extension is Ruby script?",
      "selectedOptionId": 1005,
      "selectedOptionText": ".rbx",
      "correctOptionId": 1006,
      "correctOptionText": ".rb",
      "isCorrect": false
    }
  ]
}

---

## 4) Common Error Cases
- 401 Unauthorized: missing/invalid token
- 400 Validation Error: invalid body format or missing required fields
- 404/KeyNotFound (mapped by global exception handler):
  - StudyPlanModule not found
  - Quiz not found for module + level
  - QuizAttempt not found when submit

---

## 5) FE Implementation Checklist
- Save quizAttempt.id returned from Create API
- Render returned questions/options for user to answer
- Submit to route /api/quiz-attempts/{id}/submit
- Send submitQuizAttempt.id equal to route id
- Use returned questions review list to show correct/wrong per question
