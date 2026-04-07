# QuizAttempt API Update Note (for Frontend)

Updated date: 2026-04-08
Scope: QuizAttempt flow (create attempt, get questions by attempt, submit attempt)

## 1) Summary of changes

This update adds full support for question types:
- SingleChoice
- MultipleChoice
- ShortAnswer

Main changes:
- CreateQuizAttempt uses request `level` when provided, otherwise it gets quiz level from `UserLearningTarget.CurrentLevel` of current user (active target by roadmap).
- CreateQuizAttempt now selects question count by new rule:
  - If quiz has less than 10 questions -> pick 5 questions (or all available if total < 5)
  - Otherwise -> pick up to 10 questions
- GetQuizzesByQuizAttempt now returns richer DTO for FE rendering and review of MultipleChoice and ShortAnswer.
- SubmitQuizAttempt now:
  - Accepts multiple selected options for MultipleChoice via OptionIds
  - Supports text answer for ShortAnswer via TextValue
  - Uses equal score per question and final score in 10-point scale
- SaveQuizAnswersByAttemptId now also accepts MultipleChoice via OptionIds and preserves selected option sets on readback.

## 2) Endpoints

- POST /api/quiz-attempts
- GET /api/quiz-attempts/{AttemptId}/questions
- POST /api/quiz-attempts/{Id}/submit

## 3) API contract details

### 3.1 Create Quiz Attempt

Endpoint:
- POST /api/quiz-attempts

Request body (unchanged):

```json
{
  "createQuizAttempt": {
    "studyPlanModuleId": 123
  }
}
```

Behavior change:
- Server uses request `level` first if FE sends it.
- If `level` is omitted or empty, server derives it from active `UserLearningTarget.CurrentLevel` by user + roadmap.
- Server now chooses random questions using new count rule above.

Response:
- Same structure as before (quiz attempt metadata).

---

### 3.4 Save Quiz Answers By Attempt ID

Endpoint:
- POST /api/quiz-answers/attempt/{AttemptId}

Request model (updated):

```json
{
  "attemptId": 555,
  "quizAnswers": [
    {
      "questionId": 2001,
      "optionId": 3001,
      "optionIds": [],
      "textValue": null,
      "numberValue": null,
      "answeredAt": "2026-04-08T10:00:00Z"
    },
    {
      "questionId": 2002,
      "optionId": null,
      "optionIds": [3002, 3004],
      "textValue": null,
      "numberValue": null,
      "answeredAt": "2026-04-08T10:01:00Z"
    },
    {
      "questionId": 2003,
      "optionId": null,
      "optionIds": [],
      "textValue": "OSI model has 7 layers",
      "numberValue": null,
      "answeredAt": "2026-04-08T10:02:00Z"
    }
  ]
}
```

Save behavior:
- SingleChoice: send `optionId`.
- MultipleChoice: send `optionIds`.
- ShortAnswer: send `textValue`.
- Server stores multiple-choice selections in a backward-compatible form so GET answer APIs can restore them.

Readback note:
- `GET /api/quiz-answer/attempt/{attemptId}/question/{questionId}` now exposes `OptionIds` in the response DTO for restore flows.

### 3.2 Get Questions By Attempt

Endpoint:
- GET /api/quiz-attempts/{AttemptId}/questions

Response model:

```json
{
  "quiz": {
    "quizId": 1001,
    "title": "...",
    "description": "...",
    "level": "Beginner",
    "totalScore": 10,
    "passingScore": 6
  },
  "questions": [
    {
      "questionId": 2001,
      "prompt": "...",
      "type": "SingleChoice | MultipleChoice | ShortAnswer",
      "orderNo": 1,
      "options": [
        {
          "optionId": 3001,
          "valueKey": "A",
          "displayText": "...",
          "orderNo": 1
        }
      ],
      "selectedOptionId": 3001,
      "selectedOptionIds": [3001, 3003],
      "selectedTextValue": "user typed answer",
      "correctOptionId": 3002,
      "correctOptionIds": [3002, 3004],
      "correctTextValue": "expected text answer"
    }
  ]
}
```

Important for FE:
- New field `type` is required for UI rendering by question type.
- For SingleChoice:
  - Use `selectedOptionId`
- For MultipleChoice:
  - Use `selectedOptionIds`
- For ShortAnswer:
  - Use `selectedTextValue`
- `correctOptionIds` and `correctTextValue` are now returned for richer review UI.

---

### 3.3 Submit Quiz Attempt

Endpoint:
- POST /api/quiz-attempts/{Id}/submit

Request model (updated):

```json
{
  "submitQuizAttempt": {
    "id": 555,
    "answers": [
      {
        "questionId": 2001,
        "optionId": 3001,
        "optionIds": [],
        "textValue": null,
        "numberValue": null
      },
      {
        "questionId": 2002,
        "optionId": null,
        "optionIds": [3002, 3004],
        "textValue": null,
        "numberValue": null
      },
      {
        "questionId": 2003,
        "optionId": null,
        "optionIds": [],
        "textValue": "OSI model has 7 layers",
        "numberValue": null
      }
    ]
  }
}
```

FE mapping rules when submit:
- SingleChoice:
  - send `optionId`
  - keep `optionIds` empty
- MultipleChoice:
  - send `optionIds` (array of selected option ids)
  - `optionId` can be null (or first selected value if legacy UI still uses it)
- ShortAnswer:
  - send `textValue`
  - keep `optionId` null and `optionIds` empty

Response model (updated question review payload):

```json
{
  "quizAttempt": {
    "id": 555,
    "quizId": 1001,
    "userId": "...",
    "startedAt": "...",
    "submittedAt": "...",
    "score": 7.5,
    "status": "Passed | Failed"
  },
  "questions": [
    {
      "questionId": 2001,
      "prompt": "...",
      "type": "SingleChoice | MultipleChoice | ShortAnswer",
      "selectedOptionId": 3001,
      "selectedOptionIds": [3001, 3003],
      "selectedTextValue": "...",
      "selectedOptionText": "...",
      "correctOptionId": 3002,
      "correctOptionIds": [3002, 3004],
      "correctTextValue": "...",
      "correctOptionText": "...",
      "isCorrect": false
    }
  ]
}
```

## 4) Scoring logic update

New scoring is uniform by question count in attempt:
- Score per question = 10 / N
- N = number of questions in current attempt
- Final score = sum of correct questions * score per question
- Final score scale is always /10

Correctness by type:
- SingleChoice:
  - Correct only when selected option exactly equals the single correct option
- MultipleChoice:
  - Correct only when selected option set equals correct option set (exact match)
- ShortAnswer:
  - Correct when `textValue` matches expected answer text (case-insensitive trim compare)

Pass/fail:
- attempt status = Passed if final score >= quiz.passingScore
- otherwise Failed

## 5) Frontend UI/logic checklist

- Render question UI by `type`.
- Keep local answer state in a shape that supports all 3 types.
- On submit, map UI state to payload using rules in section 3.3.
- For review screen:
  - SingleChoice: compare and highlight selected/correct option
  - MultipleChoice: support multiple selected and multiple correct highlights
  - ShortAnswer: show user text and expected text
- Do not assume each question has only one selected option.
- Do not assume score is based on option score; now score is equal per question and normalized to /10.

## 6) Backward-compatibility note for FE

- `createQuizAttempt.level` is optional.
- Existing FE code that only sends `optionId` still works for SingleChoice.
- For MultipleChoice, FE must move to `optionIds` to avoid losing selected data.
- For ShortAnswer, FE must send `textValue`.

## 7) References in backend code

- Create attempt question-count logic:
  - src/SSS.Application/Features/QuizAttempts/CreateQuizAttempt/CreateQuizAttemptHandler.cs
- Get questions payload DTO and mapping:
  - src/SSS.Application/Features/QuizAttempts/GetQuizzesByQuizAttempt/GetQuizzesByQuizAttemptHandler.cs
  - src/SSS.Application/Features/QuizAttempts/Common/QuizQuestionWithAnswerDto.cs
- Submit payload and scoring logic:
  - src/SSS.Application/Features/QuizAttempts/SubmitQuizAttemp/SubmitQuizAttemptHandler.cs
  - src/SSS.Application/Features/QuizAttempts/Common/SubmitQuizAttemptAnswerDto.cs
  - src/SSS.Application/Features/QuizAttempts/Common/QuizAttemptQuestionReviewDto.cs
