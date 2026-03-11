# StudyPlans API Documentation

Tài liệu API chi tiết cho module **StudyPlans** và **TaskItems**, dành cho team Frontend integration.

---

## 📋 Table of Contents

1. [Enums](#enums)
2. [DTOs (Data Transfer Objects)](#dtos)
3. [StudyPlans API Endpoints](#studyplans-api-endpoints)
4. [TaskItems API Endpoints](#taskitems-api-endpoints)
5. [Error Handling](#error-handling)

---

## Enums

### StudyPlanStatus
```typescript
enum StudyPlanStatus {
  Draft = "Draft",     // Kế hoạch học đang ở dạng nháp
  Active = "Active",   // Kế hoạch học đang hoạt động
  Archived = "Archived" // Kế hoạch học đã lưu trữ
}
```

### StudyPlanStrategy
```typescript
enum StudyPlanStrategy {
  Balanced = "Balanced", // Cân bằng giữa tốc độ và chiều sâu
  Speed = "Speed",       // Ưu tiên tốc độ hoàn thành
  Depth = "Depth"        // Ưu tiên hiểu sâu
}
```

### ModuleStatus
```typescript
enum ModuleStatus {
  Locked = "Locked",       // Module đang bị khóa (chưa mở)
  Active = "Active",       // Module đang được học
  Completed = "Completed", // Module đã hoàn thành
  Skipped = "Skipped"      // Module bị bỏ qua
}
```

### TaskStatus
```typescript
enum TaskStatus {
  Pending = "Pending",       // Task đang chờ
  Scheduled = "Scheduled",   // Task đã được lên lịch
  InProgress = "InProgress", // Task đang thực hiện
  Completed = "Completed",   // Task đã hoàn thành
  Skipped = "Skipped",       // Task bị bỏ qua
  Archived = "Archived"      // Task đã lưu trữ
}
```

### RoadmapStatus
```typescript
enum RoadmapStatus {
  Draft = "Draft",
  Active = "Active",
  Archived = "Archived"
}
```

---

## DTOs

### StudyPlanDto (Chi tiết đầy đủ)
```typescript
interface StudyPlanDto {
  id: number;              // ID của Study Plan
  userId: string;          // ID người dùng
  roadmapId: number;       // ID của Roadmap
  roadmapName: string;     // Tên Roadmap
  strategy?: StudyPlanStrategy; // Chiến lược học tập
  status?: StudyPlanStatus;     // Trạng thái plan
  createdAt: string;       // ISO DateTime
  modules: StudyModuleDto[]; // Danh sách các modules
}
```

### StudyPlanSummaryDto (Tóm tắt với thông tin Roadmap)
```typescript
interface StudyPlanSummaryDto {
  id: number;              // ID của Study Plan
  userId: string;          // ID người dùng
  roadmapId: number;       // ID của Roadmap
  strategy?: StudyPlanStrategy;
  status?: StudyPlanStatus;
  createdAt: string;       // ISO DateTime
  
  // Roadmap info
  roadmapTitle: string;         // Tiêu đề Roadmap
  roadmapDescription?: string;  // Mô tả Roadmap
  roadmapStatus: RoadmapStatus; // Trạng thái Roadmap
}
```

### StudyModuleDto
```typescript
interface StudyModuleDto {
  id: number;              // ID Module
  studyPlanId: number;     // ID của Study Plan
  roadmapNodeId: number;   // ID Node trong Roadmap
  roadmapNodeName: string; // Tên Node
  status?: ModuleStatus;   // Trạng thái module
}
```

### TaskItemDto
```typescript
interface TaskItemDto {
  id: number;                     // ID của Task
  studyPlanModuleId: number;      // ID của Module chứa Task
  title: string;                  // Tiêu đề task
  description?: string;           // Mô tả task (optional)
  status?: TaskStatus;            // Trạng thái task
  estimatedDurationSeconds: number; // Thời gian ước tính (giây)
  scheduledDate: string;          // Ngày lên lịch (ISO DateTime)
  completedAt?: string;           // Ngày hoàn thành (optional)
}
```

### TaskItemInput (Dùng cho Create/Update)
```typescript
interface TaskItemInput {
  studyPlanModuleId: number;      // ID của Module
  title: string;                  // Tiêu đề task
  description?: string;           // Mô tả task (optional)
  status?: TaskStatus;            // Trạng thái task
  estimatedDurationSeconds: number; // Thời gian ước tính (giây)
  scheduledDate: string;          // Ngày lên lịch (ISO DateTime)
  completedAt?: string;           // Ngày hoàn thành (optional)
}
```

---

## StudyPlans API Endpoints

### 1. Create Study Plan

Tạo kế hoạch học mới từ một Roadmap.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **URL** | `/api/study-plans` |
| **Auth** | Required (Bearer Token) |
| **Tag** | `StudyPlans` |

#### Request Body
```json
{
  "roadmapId": 1
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Study plan created successfully",
  "data": {
    "id": 1,
    "userId": "user-id-here",
    "roadmapId": 1,
    "roadmapName": "Frontend Development",
    "strategy": null,
    "status": "Active",
    "createdAt": "2026-02-04T15:30:00Z",
    "modules": [
      {
        "id": 1,
        "studyPlanId": 1,
        "roadmapNodeId": 101,
        "roadmapNodeName": "HTML Basics",
        "status": "Locked"
      },
      {
        "id": 2,
        "studyPlanId": 1,
        "roadmapNodeId": 102,
        "roadmapNodeName": "CSS Fundamentals",
        "status": "Locked"
      }
    ]
  }
}
```

#### Errors
| Code | Description |
|------|-------------|
| `409` | Study plan already exists for this roadmap |
| `404` | Roadmap with Id {id} not found |

---

### 2. Get Study Plan by ID

Lấy thông tin chi tiết Study Plan theo ID.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/api/study-plans/{studyPlanId}` |
| **Auth** | Required |
| **Tag** | `StudyPlans` |

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `studyPlanId` | `long` | ID của Study Plan |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": "user-id-here",
    "roadmapId": 1,
    "roadmapName": "Frontend Development",
    "strategy": "Balanced",
    "status": "Active",
    "createdAt": "2026-02-04T15:30:00Z",
    "modules": [...]
  }
}
```

---

### 3. Get Study Plan by Roadmap ID

Lấy Study Plan của user hiện tại theo Roadmap ID. Useful để check xem user đã enroll roadmap chưa.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/api/study-plans/by-roadmap/{roadmapId}` |
| **Auth** | Required |
| **Tag** | `StudyPlans` |

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `roadmapId` | `long` | ID của Roadmap |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": "user-id-here",
    "roadmapId": 1,
    "roadmapName": "Frontend Development",
    "strategy": "Balanced",
    "status": "Active",
    "createdAt": "2026-02-04T15:30:00Z",
    "modules": [...]
  }
}
```

---

### 4. Get All Study Plans by User

Lấy tất cả Study Plans của user hiện tại (bao gồm thông tin Roadmap).

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/api/study-plans/user` |
| **Auth** | Required |
| **Tag** | `StudyPlans` |

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": "user-id-here",
      "roadmapId": 1,
      "strategy": "Balanced",
      "status": "Active",
      "createdAt": "2026-02-04T15:30:00Z",
      "roadmapTitle": "Frontend Development",
      "roadmapDescription": "Complete roadmap for frontend development",
      "roadmapStatus": "Active"
    },
    {
      "id": 2,
      "userId": "user-id-here",
      "roadmapId": 2,
      "strategy": "Speed",
      "status": "Active",
      "createdAt": "2026-02-03T10:00:00Z",
      "roadmapTitle": "Backend Development",
      "roadmapDescription": "Complete roadmap for backend development",
      "roadmapStatus": "Active"
    }
  ]
}
```

---

## TaskItems API Endpoints

### 1. Create Task

Tạo một task mới.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **URL** | `/api/tasks` |
| **Auth** | Required |
| **Tag** | `TaskItems` |

#### Request Body
```json
{
  "studyPlanModuleId": 1,
  "title": "Complete HTML Tutorial",
  "description": "Watch video and practice",
  "status": "Pending",
  "estimatedDurationSeconds": 3600,
  "scheduledDate": "2026-02-05T09:00:00Z",
  "completedAt": null
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 1,
    "studyPlanModuleId": 1,
    "title": "Complete HTML Tutorial",
    "description": "Watch video and practice",
    "status": "Pending",
    "estimatedDurationSeconds": 3600,
    "scheduledDate": "2026-02-05T09:00:00Z",
    "completedAt": null
  }
}
```

---

### 2. Create Multiple Tasks (Batch)

Tạo nhiều tasks cùng lúc.

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **URL** | `/api/tasks/batch` |
| **Auth** | Required |
| **Tag** | `TaskItems` |

#### Request Body
```json
{
  "tasks": [
    {
      "studyPlanModuleId": 1,
      "title": "Task 1",
      "estimatedDurationSeconds": 1800,
      "scheduledDate": "2026-02-05T09:00:00Z"
    },
    {
      "studyPlanModuleId": 1,
      "title": "Task 2",
      "estimatedDurationSeconds": 2400,
      "scheduledDate": "2026-02-05T10:00:00Z"
    }
  ]
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Tasks created successfully",
  "data": [
    { "id": 1, ... },
    { "id": 2, ... }
  ]
}
```

---

### 3. Get Task by ID

Lấy thông tin task theo ID.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/api/tasks/{taskId}` |
| **Auth** | Required |
| **Tag** | `TaskItems` |

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `taskId` | `long` | ID của Task |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "studyPlanModuleId": 1,
    "title": "Complete HTML Tutorial",
    "description": "Watch video and practice",
    "status": "InProgress",
    "estimatedDurationSeconds": 3600,
    "scheduledDate": "2026-02-05T09:00:00Z",
    "completedAt": null
  }
}
```

---

### 4. Get Tasks by Study Plan

Lấy tất cả tasks của một Study Plan.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/api/tasks/by-plan/{studyPlanId}` |
| **Auth** | Required |
| **Tag** | `TaskItems` |

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `studyPlanId` | `long` | ID của Study Plan |

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "studyPlanModuleId": 1,
      "title": "Complete HTML Tutorial",
      "status": "Completed",
      ...
    },
    {
      "id": 2,
      "studyPlanModuleId": 2,
      "title": "Learn CSS Grid",
      "status": "Pending",
      ...
    }
  ]
}
```

---

### 5. Get Tasks by Module

Lấy tất cả tasks của một Module cụ thể.

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **URL** | `/api/tasks/by-module/{studyPlanModuleId}` |
| **Auth** | Required |
| **Tag** | `TaskItems` |

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `studyPlanModuleId` | `long` | ID của Module |

#### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "studyPlanModuleId": 1,
      "title": "Task within module",
      ...
    }
  ]
}
```

---

### 6. Update Task

Cập nhật thông tin task.

| Property | Value |
|----------|-------|
| **Method** | `PUT` |
| **URL** | `/api/tasks/{taskId}` |
| **Auth** | Required |
| **Tag** | `TaskItems` |

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `taskId` | `long` | ID của Task |

#### Request Body
```json
{
  "studyPlanModuleId": 1,
  "title": "Updated Title",
  "description": "Updated description",
  "status": "Completed",
  "estimatedDurationSeconds": 3600,
  "scheduledDate": "2026-02-05T09:00:00Z",
  "completedAt": "2026-02-05T10:30:00Z"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Title",
    "status": "Completed",
    ...
  }
}
```

---

### 7. Delete Task

Xóa một task.

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **URL** | `/api/tasks/{taskId}` |
| **Auth** | Required |
| **Tag** | `TaskItems` |

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `taskId` | `long` | ID của Task |

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## Error Handling

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success - Request completed successfully |
| `400` | Bad Request - Invalid input data |
| `401` | Unauthorized - Missing or invalid auth token |
| `403` | Forbidden - User doesn't have permission |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Resource already exists |
| `500` | Internal Server Error |

### Error Response Format
```json
{
  "success": false,
  "message": "Error message here",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

---

## TypeScript Types (For Frontend)

```typescript
// Enums
export enum StudyPlanStatus {
  Draft = "Draft",
  Active = "Active",
  Archived = "Archived"
}

export enum StudyPlanStrategy {
  Balanced = "Balanced",
  Speed = "Speed",
  Depth = "Depth"
}

export enum ModuleStatus {
  Locked = "Locked",
  Active = "Active", 
  Completed = "Completed",
  Skipped = "Skipped"
}

export enum TaskStatus {
  Pending = "Pending",
  Scheduled = "Scheduled",
  InProgress = "InProgress",
  Completed = "Completed",
  Skipped = "Skipped",
  Archived = "Archived"
}

export enum RoadmapStatus {
  Draft = "Draft",
  Active = "Active",
  Archived = "Archived"
}

// Interfaces
export interface StudyModuleDto {
  id: number;
  studyPlanId: number;
  roadmapNodeId: number;
  roadmapNodeName: string;
  status?: ModuleStatus;
}

export interface StudyPlanDto {
  id: number;
  userId: string;
  roadmapId: number;
  roadmapName: string;
  strategy?: StudyPlanStrategy;
  status?: StudyPlanStatus;
  createdAt: string;
  modules: StudyModuleDto[];
}

export interface StudyPlanSummaryDto {
  id: number;
  userId: string;
  roadmapId: number;
  strategy?: StudyPlanStrategy;
  status?: StudyPlanStatus;
  createdAt: string;
  roadmapTitle: string;
  roadmapDescription?: string;
  roadmapStatus: RoadmapStatus;
}

export interface TaskItemDto {
  id: number;
  studyPlanModuleId: number;
  title: string;
  description?: string;
  status?: TaskStatus;
  estimatedDurationSeconds: number;
  scheduledDate: string;
  completedAt?: string;
}

export interface TaskItemInput {
  studyPlanModuleId: number;
  title: string;
  description?: string;
  status?: TaskStatus;
  estimatedDurationSeconds: number;
  scheduledDate: string;
  completedAt?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}
```

---

## Quick Reference - All Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/study-plans` | Create new study plan |
| `GET` | `/api/study-plans/{studyPlanId}` | Get study plan by ID |
| `GET` | `/api/study-plans/by-roadmap/{roadmapId}` | Get study plan by roadmap |
| `GET` | `/api/study-plans/user` | Get all user's study plans |
| `POST` | `/api/tasks` | Create single task |
| `POST` | `/api/tasks/batch` | Create multiple tasks |
| `GET` | `/api/tasks/{taskId}` | Get task by ID |
| `GET` | `/api/tasks/by-plan/{studyPlanId}` | Get tasks by study plan |
| `GET` | `/api/tasks/by-module/{studyPlanModuleId}` | Get tasks by module |
| `PUT` | `/api/tasks/{taskId}` | Update task |
| `DELETE` | `/api/tasks/{taskId}` | Delete task |
