# 📚 StudySessions API Documentation

> **Base URL**: `/api/study-sessions`
> **Authentication**: Bearer Token (JWT) — required cho tất cả API
> **Content-Type**: `application/json`

---

## 📖 Mục lục

1. [Start Session](#1-start-session)
2. [Pause Session](#2-pause-session)
3. [Resume Session](#3-resume-session)
4. [End Session](#4-end-session)
5. [Get Active Session](#5-get-active-session)
6. [Get Session By ID](#6-get-session-by-id)
7. [Get Session History](#7-get-session-history)
8. [Get Recent Sessions](#8-get-recent-sessions)
9. [Get Session Statistics](#9-get-session-statistics)
10. [Log Study Event](#10-log-study-event)
11. [Enums Reference](#-enums-reference)
12. [Flow Guide](#-flow-guide-cho-fe)

---

## 1. Start Session

Bắt đầu một phiên học mới.

```
POST /api/study-sessions/start
```

**Request Body:**
```json
{
  "studyPlanId": 1,          // optional - ID study plan đang học
  "nodeId": 5,               // optional - ID node trong roadmap
  "moduleId": 3,             // optional - ID module trong study plan
  "taskId": 10,              // optional - ID task cụ thể
  "plannedDurationSeconds": 3600,  // optional - thời gian dự kiến (giây)
  "timezone": "Asia/Ho_Chi_Minh"   // optional - timezone của user
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": null,
  "data": {
    "sessionId": "67d0a1b2c3d4e5f6a7b8c9d0",
    "startAt": "2026-03-11T07:00:00Z",
    "status": "InProgress",
    "node": {                    // nullable
      "id": 5,
      "title": "React Hooks",
      "description": "Learn React Hooks"
    },
    "tasks": [                   // danh sách task trong session
      {
        "id": 10,
        "title": "Read documentation",
        "description": "...",
        "order": 1,
        "estimatedMinutes": 30,
        "isCompleted": false
      }
    ]
  }
}
```

---

## 2. Pause Session

Tạm dừng phiên học đang hoạt động.

```
PATCH /api/study-sessions/{id}/pause
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": null,
  "data": {
    "sessionId": "67d0a1b2c3d4e5f6a7b8c9d0",
    "status": "Paused",
    "pauseCount": 2,
    "activeSeconds": 1200,
    "pauseSeconds": 300
  }
}
```

---

## 3. Resume Session

Tiếp tục phiên học đã tạm dừng.

```
PATCH /api/study-sessions/{id}/resume
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": null,
  "data": {
    "sessionId": "67d0a1b2c3d4e5f6a7b8c9d0",
    "status": "InProgress"
  }
}
```

---

## 4. End Session

Kết thúc phiên học và gửi dữ liệu tổng kết.

```
PATCH /api/study-sessions/{id}/end
```

**Request Body:**
```json
{
  "endedReason": "Completed",     // optional - "Completed" | "TimedOut" | "Cancelled" | "SystemTerminated"
  "selfRating": 4,                // optional - tự đánh giá 1-5
  "notes": "Learned a lot today", // optional - ghi chú
  "actualDurationSeconds": 3500,  // optional - thời gian thực tế
  "activeSeconds": 3000,          // optional - thời gian học thực
  "idleSeconds": 500,             // optional - thời gian idle
  "tasksCompleted": [10, 11],     // optional - mảng task ID đã hoàn thành
  "focusScore": 85,               // optional - điểm tập trung 0-100
  "fatigueScore": 30              // optional - điểm mệt mỏi 0-100
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": null,
  "data": {
    "sessionId": "67d0a1b2c3d4e5f6a7b8c9d0",
    "totalDurationMinutes": 58,
    "tasksCompleted": 2,
    "totalTasks": 3,
    "focusScore": 85,
    "xpEarned": 150
  }
}
```

---

## 5. Get Active Session

Lấy phiên học đang hoạt động (nếu có) của user hiện tại.

```
GET /api/study-sessions/active
```

**Response `200 OK`** (có session active):
```json
{
  "success": true,
  "data": {
    "sessionId": "67d0a1b2c3d4e5f6a7b8c9d0",
    "status": "InProgress",
    "startAt": "2026-03-11T07:00:00Z",
    "elapsedSeconds": 1200,
    "planId": 1,
    "nodeId": 5,
    "nodeTitle": "React Hooks",
    "planTitle": "Frontend Mastery"
  }
}
```

**Response `204 No Content`** — không có session nào đang active.

> ⚡ **FE Tip**: Gọi API này khi app mở lên để kiểm tra xem user có đang trong phiên học dở không. Nếu có → hiện lại timer/UI phiên học.

---

## 6. Get Session By ID

Lấy chi tiết đầy đủ của một phiên học.

```
GET /api/study-sessions/{id}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": null,
  "data": {
    "id": "67d0a1b2c3d4e5f6a7b8c9d0",
    "userId": "firebase-uid",
    "studyPlanId": 1,
    "nodeId": 5,
    "moduleId": 3,
    "startAt": "2026-03-11T07:00:00Z",
    "endAt": "2026-03-11T08:00:00Z",
    "status": "Completed",
    "endedReason": "Completed",
    "plannedDurationSeconds": 3600,
    "actualDurationSeconds": 3500,
    "activeSeconds": 3000,
    "idleSeconds": 500,
    "pauseCount": 1,
    "pauseSeconds": 300,
    "focusScore": 85,
    "selfRating": 4,
    "fatigueScore": 30,
    "timezone": "Asia/Ho_Chi_Minh",
    "createdAt": "2026-03-11T07:00:00Z",
    "node": {
      "id": 5,
      "title": "React Hooks",
      "description": "..."
    },
    "plan": {
      "id": 1,
      "title": "Frontend Mastery"
    }
  }
}
```

---

## 7. Get Session History

Lấy lịch sử phiên học có phân trang và bộ lọc.

```
GET /api/study-sessions/history?pageNumber=1&pageSize=10&sortBy=date&sortOrder=desc&startDate=2026-03-01&endDate=2026-03-31&status=Completed
```

**Query Parameters:**

| Param | Type | Default | Mô tả |
|---|---|---|---|
| `pageNumber` | int | `1` | Trang hiện tại |
| `pageSize` | int | `10` | Số item mỗi trang |
| `sortBy` | string | `"date"` | Sắp xếp theo field |
| `sortOrder` | string | `"desc"` | `"asc"` hoặc `"desc"` |
| `startDate` | string? | — | Lọc từ ngày (format: `YYYY-MM-DD`) |
| `endDate` | string? | — | Lọc đến ngày |
| `status` | string? | — | Lọc theo status (`Completed`, `Cancelled`, ...) |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "67d0a1b2c3d4e5f6a7b8c9d0",
        "date": "2026-03-11",
        "nodeTitle": "React Hooks",
        "planTitle": "Frontend Mastery",
        "durationMinutes": 58,
        "tasksCompleted": 2,
        "totalTasks": 3,
        "xpEarned": 150,
        "rating": 4,
        "status": "Completed"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalPages": 5,
    "totalCount": 48,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

---

## 8. Get Recent Sessions

Lấy các phiên học gần đây (cho dashboard widget).

```
GET /api/study-sessions/recent?limit=5
```

**Query Parameters:**

| Param | Type | Default | Mô tả |
|---|---|---|---|
| `limit` | int | `5` | Số session muốn lấy |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "67d0a1b2c3d4e5f6a7b8c9d0",
      "durationMinutes": 58,
      "tasksCompleted": 2,
      "date": "2026-03-11",
      "rating": 4,
      "nodeTitle": "React Hooks"
    }
  ]
}
```

---

## 9. Get Session Statistics

Lấy thống kê phiên học cho dashboard.

```
GET /api/study-sessions/statistics?period=week
```

**Query Parameters:**

| Param | Type | Default | Mô tả |
|---|---|---|---|
| `period` | string? | — | Khoảng thời gian: `"week"`, `"month"`, `"all"` |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "totalSessions": 45,
    "totalMinutes": 2700,
    "averageSessionLength": 60,
    "completionRate": 0.85,
    "currentStreak": 5,
    "longestStreak": 12,
    "sessionsThisWeek": 4,
    "minutesThisWeek": 240,
    "totalXpEarned": 3500,
    "averageRating": 3.8
  }
}
```

---

## 10. Log Study Event

Ghi nhận một sự kiện trong phiên học (lưu vào MongoDB).

```
POST /api/study-sessions/{id}/events
```

**Request Body:**
```json
{
  "eventType": "TaskComplete",   // required - xem bảng EventType bên dưới
  "taskId": 10,                  // optional - task liên quan
  "metadata": {                  // optional - dữ liệu bổ sung tùy event
    "score": 85,
    "timeSpent": 300,
    "notes": "Finished reading"
  }
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "id": "67d0a1b2c3d4e5f6a7b8c9d0",
    "sessionId": "67d0a1b2c3d4e5f6a7b8c9d1",
    "eventType": "TaskComplete",
    "taskId": 10,
    "timestamp": "2026-03-11T07:30:00Z"
  }
}
```

### Metadata Examples theo EventType

| EventType | Metadata gợi ý |
|---|---|
| `SessionStart` | `{}` |
| `SessionPause` | `{ "reason": "break" }` |
| `SessionResume` | `{}` |
| `SessionEnd` | `{ "endReason": "completed" }` |
| `TaskStart` | `{ "taskId": 10 }` |
| `TaskComplete` | `{ "taskId": 10, "timeSpent": 300 }` |
| `TaskSkip` | `{ "taskId": 10, "reason": "too difficult" }` |
| `FeedbackSubmitted` | `{ "rating": 4, "comment": "..." }` |

---

## 📋 Enums Reference

### SessionStatus
| Value | Mô tả |
|---|---|
| `NotStarted` | Chưa bắt đầu |
| `InProgress` | Đang học |
| `Paused` | Tạm dừng |
| `Completed` | Đã hoàn thành |
| `Cancelled` | Đã hủy |

### SessionEndedReason
| Value | Mô tả |
|---|---|
| `Completed` | User kết thúc bình thường |
| `TimedOut` | Hết thời gian dự kiến |
| `Cancelled` | User hủy giữa chừng |
| `SystemTerminated` | Hệ thống tự kết thúc |

### SessionEventType
| Value | Mô tả |
|---|---|
| `SessionStart` | Bắt đầu phiên |
| `SessionPause` | Tạm dừng phiên |
| `SessionResume` | Tiếp tục phiên |
| `SessionEnd` | Kết thúc phiên |
| `TaskStart` | Bắt đầu task |
| `TaskComplete` | Hoàn thành task |
| `TaskSkip` | Bỏ qua task |
| `FeedbackSubmitted` | Gửi feedback |

---

## 🔄 Flow Guide cho FE

### Flow chính khi học

```
[App mở] → GET /active → Có session dở? → Hiện lại UI session
                        → Không có? → Hiện nút "Bắt đầu học"

[Bắt đầu] → POST /start → Nhận sessionId → Hiện timer + task list

[Đang học] → POST /{id}/events → Log events khi user tương tác
           → PATCH /{id}/pause → Tạm dừng (cập nhật UI)
           → PATCH /{id}/resume → Tiếp tục

[Kết thúc] → PATCH /{id}/end → Nhận summary → Hiện màn kết quả
```

### Dashboard

```
GET /statistics?period=week  → Hiện thống kê tổng hợp
GET /recent?limit=5          → Hiện danh sách session gần đây
GET /history?pageNumber=1    → Hiện lịch sử đầy đủ (phân trang)
```

### Lưu ý quan trọng

1. **Chỉ có 1 active session** tại một thời điểm. Muốn start session mới phải end/cancel session cũ trước.
2. **Gọi `GET /active` khi app mở** để khôi phục session đang dở.
3. **Log events** (`POST /{id}/events`) liên tục trong quá trình học để tracking chi tiết.
4. **Tất cả API yêu cầu JWT** — gửi header `Authorization: Bearer <token>`.
5. **Session ID** có format MongoDB ObjectId (24-digit hex string).
