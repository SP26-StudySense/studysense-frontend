# 🗺️ Roadmap API - Hướng dẫn tích hợp Frontend

> Tài liệu chi tiết về các API Roadmap để Frontend Developer có thể mapping và tích hợp nhanh chóng

## 📑 Mục lục

- [Tổng quan hệ thống](#tổng-quan-hệ-thống)
- [Authentication](#authentication)
- [Base URL & Endpoints](#base-url--endpoints)
- [API Groups](#api-groups)
  - [1. Roadmap Management](#1-roadmap-management)
  - [2. Roadmap Nodes](#2-roadmap-nodes)
  - [3. Roadmap Edges](#3-roadmap-edges)
  - [4. Node Contents](#4-node-contents)
  - [5. Roadmap Graph (Bulk Operations)](#5-roadmap-graph-bulk-operations)
- [Data Models & Types](#data-models--types)
- [Enums Reference](#enums-reference)
- [Example Use Cases](#example-use-cases)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

---

## Tổng quan hệ thống

Hệ thống Roadmap bao gồm 4 thành phần chính:

```
Roadmap (Lộ trình chính)
  └── Nodes (Các điểm/module học)
       ├── Contents (Nội dung: video, article, quiz...)
       └── Edges (Kết nối giữa các nodes: prerequisite, recommended, next)
```

### Workflow tạo Roadmap

**Cách 1: Tạo từng phần riêng lẻ**
1. Tạo Roadmap metadata → nhận `roadmapId`
2. Tạo các Nodes → nhận `nodeId` cho mỗi node
3. Tạo Contents cho từng node
4. Tạo Edges để kết nối các nodes

**Cách 2: Tạo toàn bộ graph một lúc (Recommended)** ⭐
1. Gọi API `/api/roadmaps/graph` với toàn bộ dữ liệu
2. Backend tự động tạo roadmap + nodes + contents + edges
3. Nhận về mapping của IDs để sử dụng sau

---

## Authentication

Tất cả API (trừ public endpoints) yêu cầu JWT Bearer Token:

```http
Authorization: Bearer <your_jwt_token>
```

### Roles & Permissions

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| **Admin** | ✅ All | ✅ All | ✅ All | ✅ All |
| **ContentManager** | ✅ Roadmap/Node/Edge | ✅ All | ✅ Own content | ✅ Own content |
| **User** | ❌ | ✅ Public only | ❌ | ❌ |
| **Anonymous** | ❌ | ✅ Limited | ❌ | ❌ |

---

## Base URL & Endpoints

```
Base URL: https://your-api-domain.com/api
```

### Quick Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/roadmaps` | POST | Admin | Tạo roadmap mới |
| `/roadmaps` | GET | User/Admin | Lấy danh sách roadmaps |
| `/roadmaps/{id}` | GET | Public | Lấy chi tiết roadmap + graph |
| `/roadmaps/{id}` | PATCH | ContentManager | Cập nhật roadmap |
| `/roadmaps/{id}` | DELETE | Admin | Xóa roadmap |
| `/roadmaps/manager` | GET | Manager | Lấy roadmaps của manager |
| `/roadmaps/graph` | POST | ContentManager | Tạo full graph |
| `/roadmaps/{id}/graph` | PUT | ContentManager | Sync full graph |
| `/roadmaps/{id}/nodes` | POST | ContentManager | Tạo node mới |
| `/roadmaps/{id}/nodes/{nodeId}` | PATCH | ContentManager | Cập nhật node |
| `/roadmaps/{id}/nodes/{nodeId}` | DELETE | ContentManager | Xóa node |
| `/roadmaps/{id}/edges` | POST | ContentManager | Tạo edge |
| `/roadmaps/{id}/edges/bulk` | PUT | ContentManager | Bulk sync edges |
| `/roadmaps/{id}/nodes/{nodeId}/contents` | GET | Public | Lấy contents |
| `/roadmaps/{id}/nodes/{nodeId}/contents` | POST | Admin | Tạo content |

---

## API Groups

## 1. Roadmap Management

### 1.1. Tạo Roadmap mới

**Endpoint:** `POST /api/roadmaps`  
**Auth:** `Admin`  
**Use case:** Tạo roadmap metadata cơ bản (chưa có nodes/edges)

```typescript
// Request
interface CreateRoadmapRequest {
  subjectId: number;
  title: string;
  description?: string;
}

// Response
interface CreateRoadmapResponse {
  success: boolean;
  roadmapId: number;
  message: string;
}
```

**Example:**
```javascript
const createRoadmap = async (data) => {
  const response = await fetch('/api/roadmaps', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subjectId: 1,
      title: "Java Backend Development 2026",
      description: "Lộ trình học Java từ cơ bản đến nâng cao"
    })
  });
  
  return await response.json();
  // { success: true, roadmapId: 123, message: "..." }
};
```

---

### 1.2. Lấy danh sách Roadmaps (Pagination + Filter)

**Endpoint:** `GET /api/roadmaps`  
**Auth:** `User`, `Admin`  
**Use case:** Hiển thị danh sách roadmaps với filter, search, pagination

```typescript
interface GetRoadmapsParams {
  pageIndex: number;      // Required - Số trang (bắt đầu từ 1)
  pageSize: number;       // Required - Số items/trang
  subjectId?: number;     // Optional - Lọc theo subject
  q?: string;             // Optional - Tìm kiếm theo title
  status?: 'Draft' | 'Active' | 'Archived';
  version?: number;       // Optional - Lọc theo version
  isLatest?: boolean;     // Optional - Chỉ lấy version mới nhất
}

interface GetRoadmapsResponse {
  success: boolean;
  data: Roadmap[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
```

**Example:**
```javascript
const fetchRoadmaps = async (filters) => {
  const params = new URLSearchParams({
    pageIndex: '1',
    pageSize: '10',
    ...(filters.subjectId && { subjectId: filters.subjectId }),
    ...(filters.q && { q: filters.q }),
    ...(filters.isLatest && { isLatest: 'true' })
  });
  
  const response = await fetch(`/api/roadmaps?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return await response.json();
};

// Usage
const result = await fetchRoadmaps({
  subjectId: 1,
  isLatest: true,
  q: 'java'
});
// result.data: [{ id: 1, title: "Java Backend...", ... }, ...]
```

---

### 1.3. Lấy chi tiết Roadmap (Full Graph)

**Endpoint:** `GET /api/roadmaps/{roadmapId}`  
**Auth:** Public (không cần token)  
**Use case:** Hiển thị roadmap graph với đầy đủ nodes và edges

```typescript
interface GetRoadmapDetailResponse {
  success: boolean;
  data: {
    roadmap: Roadmap;
    nodes: RoadmapNode[];
    edges: RoadmapEdge[];
  };
}
```

**Example:**
```javascript
const fetchRoadmapDetail = async (roadmapId) => {
  const response = await fetch(`/api/roadmaps/${roadmapId}`);
  const result = await response.json();
  
  if (result.success) {
    const { roadmap, nodes, edges } = result.data;
    
    // Visualize graph với thư viện như ReactFlow, vis.js, D3.js
    renderRoadmapGraph(nodes, edges);
  }
};
```

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "roadmap": {
      "id": 1,
      "title": "Java Backend Development",
      "description": "...",
      "subjectId": 1,
      "subject": {
        "id": 1,
        "name": "Java Programming"
      }
    },
    "nodes": [
      {
        "id": 101,
        "roadmapId": 1,
        "title": "Java Basics",
        "description": "Learn Java fundamentals",
        "difficulty": "Beginner",
        "orderNo": 1
      },
      {
        "id": 102,
        "roadmapId": 1,
        "title": "OOP in Java",
        "difficulty": "Intermediate",
        "orderNo": 2
      }
    ],
    "edges": [
      {
        "id": 201,
        "roadmapId": 1,
        "fromNodeId": 101,
        "toNodeId": 102,
        "edgeType": "Prerequisite",
        "orderNo": 1
      }
    ]
  }
}
```

---

### 1.4. Cập nhật Roadmap

**Endpoint:** `PATCH /api/roadmaps/{id}`  
**Auth:** `ContentManager`  
**Use case:** Cập nhật metadata của roadmap (title, description)

```typescript
interface UpdateRoadmapRequest {
  id: number;
  title?: string;
  description?: string;
}
```

**Example:**
```javascript
const updateRoadmap = async (roadmapId, data) => {
  const response = await fetch(`/api/roadmaps/${roadmapId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: roadmapId,
      title: "Updated Title",
      description: "Updated description"
    })
  });
  
  return await response.json();
};
```

---

### 1.5. Xóa Roadmap

**Endpoint:** `DELETE /api/roadmaps/{roadmapId}`  
**Auth:** `Admin`, `ContentManager`  
**Use case:** Xóa roadmap và tất cả dữ liệu liên quan

```javascript
const deleteRoadmap = async (roadmapId) => {
  const response = await fetch(`/api/roadmaps/${roadmapId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  // Response: 204 No Content (no body)
  return response.status === 204;
};
```

---

### 1.6. Lấy Roadmaps của Manager đang đăng nhập

**Endpoint:** `GET /api/roadmaps/manager`  
**Auth:** `Admin`, `Manager`  
**Use case:** Manager xem các roadmaps do mình tạo

```javascript
const fetchMyRoadmaps = async (filters) => {
  const params = new URLSearchParams({
    pageIndex: '1',
    pageSize: '10',
    ...filters
  });
  
  const response = await fetch(`/api/roadmaps/manager?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return await response.json();
};
```

---

## 2. Roadmap Nodes

### 2.1. Tạo Node mới

**Endpoint:** `POST /api/roadmaps/{roadmapId}/nodes`  
**Auth:** `ContentManager`  
**Use case:** Thêm một node/module mới vào roadmap

```typescript
interface CreateNodeRequest {
  roadmapId: number;
  title: string;
  description?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  orderNo?: number;
}

interface CreateNodeResponse {
  success: boolean;
  nodeId: number;
  message: string;
}
```

**Example:**
```javascript
const createNode = async (roadmapId, nodeData) => {
  const response = await fetch(`/api/roadmaps/${roadmapId}/nodes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      roadmapId,
      title: "Spring Framework",
      description: "Learn Spring Boot and Spring MVC",
      difficulty: "Intermediate",
      orderNo: 5
    })
  });
  
  return await response.json();
  // { success: true, nodeId: 105, message: "..." }
};
```

---

### 2.2. Cập nhật Node

**Endpoint:** `PATCH /api/roadmaps/{roadmapId}/nodes/{nodeId}`  
**Auth:** `ContentManager`

```javascript
const updateNode = async (roadmapId, nodeId, updates) => {
  const response = await fetch(`/api/roadmaps/${roadmapId}/nodes/${nodeId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      roadmapId,
      nodeId,
      ...updates
    })
  });
  
  return await response.json();
};
```

---

### 2.3. Xóa Node

**Endpoint:** `DELETE /api/roadmaps/{roadmapId}/nodes/{nodeId}`  
**Auth:** `ContentManager`  
**Note:** Xóa node sẽ xóa luôn tất cả contents và edges liên quan

```javascript
const deleteNode = async (roadmapId, nodeId) => {
  const response = await fetch(`/api/roadmaps/${roadmapId}/nodes/${nodeId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return response.status === 204;
};
```

---

## 3. Roadmap Edges

### 3.1. Tạo Edge mới

**Endpoint:** `POST /api/roadmaps/{roadmapId}/edges`  
**Auth:** `ContentManager`  
**Use case:** Tạo kết nối giữa 2 nodes

```typescript
interface CreateEdgeRequest {
  roadmapId: number;
  fromNodeId: number;
  toNodeId: number;
  edgeType: 'Prerequisite' | 'Recommended' | 'Next';
  orderNo?: number;
}
```

**Edge Types:**
- `Prerequisite`: Node nguồn là điều kiện tiên quyết (phải học trước)
- `Recommended`: Khuyến nghị học tiếp
- `Next`: Bước tiếp theo trong lộ trình

**Example:**
```javascript
const createEdge = async (roadmapId, edgeData) => {
  const response = await fetch(`/api/roadmaps/${roadmapId}/edges`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      roadmapId,
      fromNodeId: 101,
      toNodeId: 102,
      edgeType: "Prerequisite",
      orderNo: 1
    })
  });
  
  return await response.json();
  // { success: true, edgeId: 201, message: "..." }
};
```

---

### 3.2. Cập nhật Edge

**Endpoint:** `PATCH /api/roadmaps/{roadmapId}/edges/{edgeId}`  
**Auth:** `ContentManager`

```javascript
const updateEdge = async (roadmapId, edgeId, updates) => {
  const response = await fetch(`/api/roadmaps/${roadmapId}/edges/${edgeId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      roadmapId,
      edgeId,
      ...updates
    })
  });
  
  return await response.json();
};
```

---

### 3.3. Xóa Edge

**Endpoint:** `DELETE /api/roadmaps/{roadmapId}/edges/{edgeId}`  
**Auth:** `ContentManager`

```javascript
const deleteEdge = async (roadmapId, edgeId) => {
  const response = await fetch(`/api/roadmaps/${roadmapId}/edges/${edgeId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return response.status === 204;
};
```

---

### 3.4. Bulk Sync Edges ⭐ (Recommended)

**Endpoint:** `PUT /api/roadmaps/{roadmapId}/edges/bulk`  
**Auth:** `ContentManager`  
**Use case:** Đồng bộ toàn bộ edges của roadmap (add/update/delete)

**Logic:**
- Edges có `id` → Update
- Edges không có `id` (null) → Create
- Edges không có trong payload → Delete

```typescript
interface BulkSyncEdgesRequest {
  roadmapId: number;
  edges: Array<{
    id?: number | null;
    fromNodeId: number;
    toNodeId: number;
    edgeType: string;
    orderNo?: number;
  }>;
}

interface BulkSyncEdgesResponse {
  success: boolean;
  added: number;
  updated: number;
  deleted: number;
  message: string;
}
```

**Example:**
```javascript
const syncEdges = async (roadmapId, edges) => {
  const response = await fetch(`/api/roadmaps/${roadmapId}/edges/bulk`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      roadmapId,
      edges: [
        {
          id: 201,  // Có ID → Update
          fromNodeId: 101,
          toNodeId: 102,
          edgeType: "Prerequisite",
          orderNo: 1
        },
        {
          id: null,  // Không có ID → Create new
          fromNodeId: 102,
          toNodeId: 103,
          edgeType: "Next",
          orderNo: 2
        }
        // Edges không có trong array này sẽ bị delete
      ]
    })
  });
  
  return await response.json();
  // { success: true, added: 1, updated: 1, deleted: 0 }
};
```

---

## 4. Node Contents

### 4.1. Lấy tất cả Contents của Node

**Endpoint:** `GET /api/roadmaps/{roadmapId}/nodes/{nodeId}/contents`  
**Auth:** Public (không cần token)  
**Use case:** Hiển thị danh sách nội dung học tập của một node

```typescript
interface GetNodeContentsResponse {
  success: boolean;
  data: NodeContent[];
}

interface NodeContent {
  id: number;
  nodeId: number;
  contentType: ContentType;
  title: string;
  url?: string;
  description?: string;
  estimatedMinutes?: number;
  difficulty?: string;
  orderNo: number;
  isRequired: boolean;
}
```

**Example:**
```javascript
const fetchNodeContents = async (roadmapId, nodeId) => {
  const response = await fetch(
    `/api/roadmaps/${roadmapId}/nodes/${nodeId}/contents`
  );
  
  const result = await response.json();
  
  if (result.success) {
    return result.data; // Array of contents
  }
};

// Usage
const contents = await fetchNodeContents(1, 101);
// [
//   { id: 301, contentType: "Video", title: "Intro to Java", ... },
//   { id: 302, contentType: "Article", title: "Java Variables", ... }
// ]
```

---

### 4.2. Tạo Content mới cho Node

**Endpoint:** `POST /api/roadmaps/{roadmapId}/nodes/{nodeId}/contents`  
**Auth:** `Admin`  
**Use case:** Thêm nội dung học tập (video, article, quiz...) cho node

```typescript
interface CreateContentRequest {
  roadmapId: number;
  nodeId: number;
  contentType: 'Video' | 'Article' | 'Book' | 'Course' | 'Exercise' | 'Quiz' | 'Project';
  title: string;
  url?: string;
  description?: string;
  estimatedMinutes?: number;
  difficulty?: string;
  orderNo: number;
  isRequired: boolean;
}
```

**Example:**
```javascript
const createContent = async (roadmapId, nodeId, contentData) => {
  const response = await fetch(
    `/api/roadmaps/${roadmapId}/nodes/${nodeId}/contents`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        roadmapId,
        nodeId,
        contentType: "Video",
        title: "Introduction to Java",
        url: "https://youtube.com/watch?v=xyz",
        description: "Video giới thiệu Java cơ bản",
        estimatedMinutes: 30,
        difficulty: "Beginner",
        orderNo: 1,
        isRequired: true
      })
    }
  );
  
  return await response.json();
  // { success: true, contentId: 301, message: "..." }
};
```

---

### 4.3. Cập nhật Content

**Endpoint:** `PATCH /api/roadmaps/{roadmapId}/nodes/{nodeId}/contents/{contentId}`  
**Auth:** `Admin`

```javascript
const updateContent = async (roadmapId, nodeId, contentId, updates) => {
  const response = await fetch(
    `/api/roadmaps/${roadmapId}/nodes/${nodeId}/contents/${contentId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contentId,
        ...updates
      })
    }
  );
  
  return await response.json();
};
```

---

### 4.4. Xóa Content

**Endpoint:** `DELETE /api/roadmaps/{roadmapId}/nodes/{nodeId}/contents/{contentId}`  
**Auth:** `Admin`

```javascript
const deleteContent = async (roadmapId, nodeId, contentId) => {
  const response = await fetch(
    `/api/roadmaps/${roadmapId}/nodes/${nodeId}/contents/${contentId}`,
    {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  return response.status === 204;
};
```

---

## 5. Roadmap Graph (Bulk Operations)

### 5.1. Tạo Full Roadmap Graph ⭐⭐⭐ (Highly Recommended)

**Endpoint:** `POST /api/roadmaps/graph`  
**Auth:** `ContentManager`  
**Use case:** Tạo toàn bộ roadmap graph (roadmap + nodes + edges + contents) trong một request duy nhất

**Đây là API được recommend nhất để tạo roadmap mới!**

```typescript
interface CreateRoadmapGraphRequest {
  roadmap: {
    subjectId: number;
    title: string;
    description?: string;
  };
  nodes: Array<{
    clientId: string;        // Temporary ID để reference
    title: string;
    description?: string;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    orderNo?: number;
  }>;
  contents: Array<{
    clientId: string;        // Temporary ID
    nodeClientId: string;    // Reference đến node.clientId
    contentType: ContentType;
    title: string;
    url?: string;
    description?: string;
    estimatedMinutes?: number;
    difficulty?: string;
    orderNo: number;
    isRequired: boolean;
  }>;
  edges: Array<{
    fromNodeClientId: string;  // Reference đến node.clientId
    toNodeClientId: string;
    edgeType: 'Prerequisite' | 'Recommended' | 'Next';
    orderNo?: number;
  }>;
}

interface CreateRoadmapGraphResponse {
  success: boolean;
  roadmapId: number;
  nodeIdMap: Record<string, number>;      // clientId → database ID
  contentIdMap: Record<string, number>;   // clientId → database ID
  summary: {
    nodesCount: number;
    edgesCount: number;
    contentsCount: number;
  };
  message: string;
}
```

**Key Concept: Client IDs**
- Vì chưa có database IDs, bạn dùng `clientId` (string tùy ý) để tham chiếu giữa các entities
- Backend sẽ tạo các entities và trả về mapping: `clientId → databaseId`

**Example:**
```javascript
const createFullRoadmap = async () => {
  const response = await fetch('/api/roadmaps/graph', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      roadmap: {
        subjectId: 1,
        title: "Complete Java Backend Roadmap",
        description: "Full learning path for Java backend"
      },
      nodes: [
        {
          clientId: "node-java-basics",
          title: "Java Basics",
          description: "Learn Java fundamentals",
          difficulty: "Beginner",
          orderNo: 1
        },
        {
          clientId: "node-oop",
          title: "OOP in Java",
          description: "Object-Oriented Programming",
          difficulty: "Intermediate",
          orderNo: 2
        },
        {
          clientId: "node-spring",
          title: "Spring Framework",
          difficulty: "Advanced",
          orderNo: 3
        }
      ],
      contents: [
        {
          clientId: "content-video-1",
          nodeClientId: "node-java-basics",  // Reference
          contentType: "Video",
          title: "Java Variables and Data Types",
          url: "https://youtube.com/...",
          estimatedMinutes: 30,
          orderNo: 1,
          isRequired: true
        },
        {
          clientId: "content-article-1",
          nodeClientId: "node-java-basics",
          contentType: "Article",
          title: "Java Syntax Guide",
          url: "https://docs.oracle.com/...",
          orderNo: 2,
          isRequired: false
        }
      ],
      edges: [
        {
          fromNodeClientId: "node-java-basics",
          toNodeClientId: "node-oop",
          edgeType: "Prerequisite",
          orderNo: 1
        },
        {
          fromNodeClientId: "node-oop",
          toNodeClientId: "node-spring",
          edgeType: "Prerequisite",
          orderNo: 2
        }
      ]
    })
  });
  
  const result = await response.json();
  
  console.log('Roadmap ID:', result.roadmapId);
  console.log('Node ID Mapping:', result.nodeIdMap);
  // {
  //   "node-java-basics": 101,
  //   "node-oop": 102,
  //   "node-spring": 103
  // }
  
  console.log('Summary:', result.summary);
  // { nodesCount: 3, edgesCount: 2, contentsCount: 2 }
  
  return result;
};
```

---

### 5.2. Sync Full Roadmap Graph ⭐⭐⭐ (Highly Recommended)

**Endpoint:** `PUT /api/roadmaps/{roadmapId}/graph`  
**Auth:** `ContentManager`  
**Use case:** Đồng bộ hóa toàn bộ roadmap graph (update existing + add new + delete missing)

**Đây là API được recommend nhất để update roadmap!**

**Sync Logic:**
- **Entities có `id`:** Update existing
- **Entities có `id = null`:** Create new
- **Entities không có trong payload:** Delete

```typescript
interface SyncRoadmapGraphRequest {
  roadmapId: number;
  roadmap?: {
    title?: string;
    description?: string;
  };
  nodes: Array<{
    id?: number | null;
    clientId?: string;
    title: string;
    description?: string;
    difficulty?: string;
    orderNo?: number;
  }>;
  contents: Array<{
    id?: number | null;
    clientId?: string;
    nodeId?: number;           // For existing nodes
    nodeClientId?: string;      // For new nodes
    contentType: ContentType;
    title: string;
    url?: string;
    orderNo: number;
    isRequired: boolean;
  }>;
  edges: Array<{
    id?: number | null;
    fromNodeId?: number;
    fromNodeClientId?: string;
    toNodeId?: number;
    toNodeClientId?: string;
    edgeType: string;
    orderNo?: number;
  }>;
}
```

**Example:**
```javascript
const syncRoadmapGraph = async (roadmapId, graphData) => {
  const response = await fetch(`/api/roadmaps/${roadmapId}/graph`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      roadmapId,
      roadmap: {
        title: "Updated Roadmap Title",
        description: "Updated description"
      },
      nodes: [
        {
          id: 101,  // Existing node → Update
          clientId: "node-1",
          title: "Java Basics - Updated",
          difficulty: "Beginner",
          orderNo: 1
        },
        {
          id: 102,  // Existing
          title: "OOP in Java",
          orderNo: 2
        },
        {
          id: null,  // New node → Create
          clientId: "node-new",
          title: "Microservices",
          difficulty: "Advanced",
          orderNo: 4
        }
        // Node 103 không có trong list → Sẽ bị xóa
      ],
      contents: [
        {
          id: 301,
          nodeId: 101,
          contentType: "Video",
          title: "Updated Video Title",
          url: "https://...",
          orderNo: 1,
          isRequired: true
        },
        {
          id: null,
          nodeClientId: "node-new",  // Reference new node
          contentType: "Article",
          title: "Microservices Guide",
          orderNo: 1,
          isRequired: true
        }
      ],
      edges: [
        {
          id: 201,
          fromNodeId: 101,
          toNodeId: 102,
          edgeType: "Prerequisite"
        },
        {
          id: null,
          fromNodeId: 102,
          toNodeClientId: "node-new",
          edgeType: "Next"
        }
      ]
    })
  });
  
  const result = await response.json();
  
  console.log('Updated Roadmap:', result.roadmapId);
  console.log('New Node IDs:', result.nodeIdMap);
  // { "node-new": 104 }
  
  console.log('Summary:', result.summary);
  // { nodesCount: 3, edgesCount: 2, contentsCount: 2 }
  
  return result;
};
```

---

## Data Models & Types

### TypeScript Interfaces

```typescript
// ==================== Roadmap ====================
interface Roadmap {
  id: number;
  subjectId: number;
  title: string;
  description?: string;
  subject?: LearningSubject;
}

interface LearningSubject {
  id: number;
  name: string;
}

// ==================== Node ====================
interface RoadmapNode {
  id: number;
  roadmapId: number;
  title: string;
  description?: string;
  difficulty?: NodeDifficulty;
  orderNo?: number;
}

type NodeDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

// ==================== Edge ====================
interface RoadmapEdge {
  id: number;
  roadmapId: number;
  fromNodeId: number;
  toNodeId: number;
  edgeType: EdgeType;
  orderNo?: number;
}

type EdgeType = 'Prerequisite' | 'Recommended' | 'Next';

// ==================== Content ====================
interface NodeContent {
  id: number;
  nodeId: number;
  contentType: ContentType;
  title: string;
  url?: string;
  description?: string;
  estimatedMinutes?: number;
  difficulty?: string;
  orderNo: number;
  isRequired: boolean;
}

type ContentType = 
  | 'Video' 
  | 'Article' 
  | 'Book' 
  | 'Course' 
  | 'Exercise' 
  | 'Quiz' 
  | 'Project';

// ==================== API Responses ====================
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
```

---

## Enums Reference

### ContentType
```
Video     - Video tutorials
Article   - Blog posts, documentation
Book      - E-books, textbooks
Course    - Online courses
Exercise  - Coding exercises
Quiz      - Knowledge assessments
Project   - Hands-on projects
```

### EdgeType
```
Prerequisite  - Node nguồn phải học trước (mandatory)
Recommended   - Khuyến nghị học tiếp (optional)
Next          - Bước tiếp theo trong lộ trình
```

### NodeDifficulty
```
Beginner      - Cơ bản (người mới bắt đầu)
Intermediate  - Trung cấp
Advanced      - Nâng cao
```

### RoadmapStatus
```
Draft     - Bản nháp (chưa public)
Active    - Đang hoạt động (public)
Archived  - Đã lưu trữ (không hiển thị)
```

---

## Example Use Cases

### Use Case 1: Tạo roadmap đơn giản từng bước

```javascript
// Step 1: Create roadmap
const roadmap = await createRoadmap({
  subjectId: 1,
  title: "Python for Data Science",
  description: "Learn Python for data analysis"
});
const roadmapId = roadmap.roadmapId;

// Step 2: Create nodes
const node1 = await createNode(roadmapId, {
  title: "Python Basics",
  difficulty: "Beginner",
  orderNo: 1
});

const node2 = await createNode(roadmapId, {
  title: "Pandas & NumPy",
  difficulty: "Intermediate",
  orderNo: 2
});

// Step 3: Create edge
await createEdge(roadmapId, {
  fromNodeId: node1.nodeId,
  toNodeId: node2.nodeId,
  edgeType: "Prerequisite"
});

// Step 4: Add contents
await createContent(roadmapId, node1.nodeId, {
  contentType: "Video",
  title: "Python Variables",
  url: "https://...",
  orderNo: 1,
  isRequired: true
});
```

---

### Use Case 2: Tạo full roadmap một lần (Recommended) ⭐

```javascript
const createCompleteRoadmap = async () => {
  const result = await fetch('/api/roadmaps/graph', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      roadmap: {
        subjectId: 1,
        title: "Python for Data Science",
        description: "Complete learning path"
      },
      nodes: [
        { clientId: "n1", title: "Python Basics", difficulty: "Beginner", orderNo: 1 },
        { clientId: "n2", title: "Pandas & NumPy", difficulty: "Intermediate", orderNo: 2 },
        { clientId: "n3", title: "Data Visualization", difficulty: "Advanced", orderNo: 3 }
      ],
      contents: [
        {
          clientId: "c1",
          nodeClientId: "n1",
          contentType: "Video",
          title: "Python Variables",
          url: "https://...",
          orderNo: 1,
          isRequired: true
        },
        {
          clientId: "c2",
          nodeClientId: "n1",
          contentType: "Article",
          title: "Python Functions",
          url: "https://...",
          orderNo: 2,
          isRequired: true
        }
      ],
      edges: [
        { fromNodeClientId: "n1", toNodeClientId: "n2", edgeType: "Prerequisite" },
        { fromNodeClientId: "n2", toNodeClientId: "n3", edgeType: "Next" }
      ]
    })
  });
  
  return await result.json();
};
```

---

### Use Case 3: Hiển thị roadmap graph

```javascript
import ReactFlow from 'reactflow';

const RoadmapGraph = ({ roadmapId }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/roadmaps/${roadmapId}`);
      const result = await response.json();
      
      if (result.success) {
        // Transform data for ReactFlow
        const flowNodes = result.data.nodes.map(node => ({
          id: node.id.toString(),
          data: { 
            label: node.title,
            difficulty: node.difficulty
          },
          position: { x: 0, y: 0 } // Calculate positions
        }));
        
        const flowEdges = result.data.edges.map(edge => ({
          id: edge.id.toString(),
          source: edge.fromNodeId.toString(),
          target: edge.toNodeId.toString(),
          label: edge.edgeType,
          animated: edge.edgeType === 'Prerequisite'
        }));
        
        setNodes(flowNodes);
        setEdges(flowEdges);
      }
    };
    
    fetchData();
  }, [roadmapId]);
  
  return <ReactFlow nodes={nodes} edges={edges} />;
};
```

---

### Use Case 4: Update roadmap với Sync API

```javascript
// User đã edit roadmap trên UI
const saveChanges = async (roadmapId, editedData) => {
  const response = await fetch(`/api/roadmaps/${roadmapId}/graph`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      roadmapId,
      roadmap: {
        title: editedData.title,
        description: editedData.description
      },
      nodes: editedData.nodes.map(node => ({
        id: node.id || null,  // null nếu là node mới
        clientId: node.clientId,
        title: node.title,
        difficulty: node.difficulty,
        orderNo: node.orderNo
      })),
      contents: editedData.contents.map(content => ({
        id: content.id || null,
        nodeId: content.nodeId,
        nodeClientId: content.nodeClientId,
        contentType: content.contentType,
        title: content.title,
        url: content.url,
        orderNo: content.orderNo,
        isRequired: content.isRequired
      })),
      edges: editedData.edges.map(edge => ({
        id: edge.id || null,
        fromNodeId: edge.fromNodeId,
        fromNodeClientId: edge.fromNodeClientId,
        toNodeId: edge.toNodeId,
        toNodeClientId: edge.toNodeClientId,
        edgeType: edge.edgeType
      }))
    })
  });
  
  return await response.json();
};
```

---

## Error Handling

### Standard Error Response

```typescript
interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
```

### Example Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    },
    {
      "field": "subjectId",
      "message": "Invalid subject ID"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Unauthorized. Please login."
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Roadmap not found"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "You don't have permission to perform this action"
}
```

### Error Handling Best Practices

```javascript
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    
    // Check HTTP status
    if (!response.ok) {
      if (response.status === 401) {
        // Redirect to login
        window.location.href = '/login';
        return;
      }
      
      if (response.status === 404) {
        throw new Error('Resource not found');
      }
      
      if (response.status === 403) {
        throw new Error('Permission denied');
      }
    }
    
    const result = await response.json();
    
    // Check API success flag
    if (!result.success) {
      // Display error messages
      if (result.errors) {
        result.errors.forEach(err => {
          console.error(`${err.field}: ${err.message}`);
        });
      }
      throw new Error(result.message || 'API request failed');
    }
    
    return result;
    
  } catch (error) {
    console.error('API Error:', error);
    // Show toast/notification to user
    showErrorToast(error.message);
    throw error;
  }
};

// Usage
try {
  const result = await fetchWithErrorHandling('/api/roadmaps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  console.log('Success:', result);
} catch (error) {
  // Handle error in UI
}
```

---

## Best Practices

### 1. ✅ Sử dụng Graph APIs cho bulk operations

**❌ Không tốt:**
```javascript
// Gọi nhiều API riêng lẻ - slow và nhiều requests
const roadmap = await createRoadmap({ ... });
const node1 = await createNode(roadmap.id, { ... });
const node2 = await createNode(roadmap.id, { ... });
const edge = await createEdge(roadmap.id, { ... });
// 4 requests riêng biệt
```

**✅ Tốt:**
```javascript
// Gọi 1 API duy nhất - fast và efficient
const result = await createRoadmapGraph({
  roadmap: { ... },
  nodes: [{ ... }, { ... }],
  edges: [{ ... }]
});
// 1 request duy nhất
```

---

### 2. ✅ Client-side ID management

Khi tạo graph mới, sử dụng `clientId` để reference:

```javascript
const graphData = {
  nodes: [
    { clientId: "node-basics", title: "Basics" },
    { clientId: "node-advanced", title: "Advanced" }
  ],
  edges: [
    {
      fromNodeClientId: "node-basics",  // Reference by clientId
      toNodeClientId: "node-advanced",
      edgeType: "Prerequisite"
    }
  ]
};

const result = await createRoadmapGraph(graphData);

// Map clientId to database ID
const nodeDbId = result.nodeIdMap["node-basics"]; // 101
```

---

### 3. ✅ Pagination & Lazy Loading

```javascript
// Implement pagination
const [roadmaps, setRoadmaps] = useState([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const result = await fetchRoadmaps({
    pageIndex: page,
    pageSize: 10
  });
  
  setRoadmaps([...roadmaps, ...result.data]);
  setHasMore(page < result.totalPages);
  setPage(page + 1);
};
```

---

### 4. ✅ Loading States & Optimistic UI

```javascript
const [loading, setLoading] = useState(false);

const handleCreateRoadmap = async (data) => {
  setLoading(true);
  
  try {
    const result = await createRoadmap(data);
    
    // Optimistic UI: Add to list immediately
    setRoadmaps([...roadmaps, result.data]);
    
    showSuccessToast('Roadmap created!');
  } catch (error) {
    showErrorToast(error.message);
  } finally {
    setLoading(false);
  }
};
```

---

### 5. ✅ Debounce Search

```javascript
import { debounce } from 'lodash';

const searchRoadmaps = debounce(async (query) => {
  const result = await fetchRoadmaps({
    pageIndex: 1,
    pageSize: 10,
    q: query
  });
  
  setSearchResults(result.data);
}, 300); // Wait 300ms after user stops typing

// Usage
<input onChange={(e) => searchRoadmaps(e.target.value)} />
```

---

### 6. ✅ Cache & State Management

```javascript
// Using React Query / TanStack Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch with caching
const { data, isLoading } = useQuery({
  queryKey: ['roadmap', roadmapId],
  queryFn: () => fetchRoadmapDetail(roadmapId),
  staleTime: 5 * 60 * 1000 // Cache for 5 minutes
});

// Mutation with cache invalidation
const queryClient = useQueryClient();

const createMutation = useMutation({
  mutationFn: createRoadmap,
  onSuccess: () => {
    // Invalidate cache để refetch
    queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
  }
});
```

---

### 7. ✅ Type Safety

```typescript
// Define types cho tất cả APIs
type RoadmapService = {
  create: (data: CreateRoadmapRequest) => Promise<ApiResponse<Roadmap>>;
  getAll: (params: GetRoadmapsParams) => Promise<PaginatedResponse<Roadmap>>;
  getById: (id: number) => Promise<ApiResponse<RoadmapDetail>>;
  update: (id: number, data: UpdateRoadmapRequest) => Promise<ApiResponse>;
  delete: (id: number) => Promise<void>;
};

// Use in service
const roadmapService: RoadmapService = {
  create: async (data) => {
    const response = await fetch('/api/roadmaps', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return await response.json();
  },
  // ...
};
```

---

## Common HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| `200` | OK | Request successful |
| `201` | Created | Resource created successfully |
| `204` | No Content | Delete successful (empty body) |
| `400` | Bad Request | Validation errors, invalid data |
| `401` | Unauthorized | Missing/invalid token, need login |
| `403` | Forbidden | Valid token but insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `500` | Internal Server Error | Server-side error |

---

## Testing API với curl

```bash
# 1. Create Roadmap
curl -X POST https://api.example.com/api/roadmaps \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subjectId": 1,
    "title": "Test Roadmap",
    "description": "Test description"
  }'

# 2. Get All Roadmaps
curl -X GET "https://api.example.com/api/roadmaps?pageIndex=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Get Roadmap Detail
curl -X GET https://api.example.com/api/roadmaps/1

# 4. Create Full Graph
curl -X POST https://api.example.com/api/roadmaps/graph \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roadmap": {
      "subjectId": 1,
      "title": "Test Graph"
    },
    "nodes": [
      {
        "clientId": "n1",
        "title": "Node 1",
        "difficulty": "Beginner"
      }
    ],
    "edges": [],
    "contents": []
  }'
```

---

## FAQ

**Q: Nên dùng API riêng lẻ hay Graph API?**  
A: Nếu bạn cần tạo/update nhiều entities cùng lúc, hãy dùng Graph API (`/api/roadmaps/graph`). Nó hiệu quả hơn nhiều và đảm bảo tính nhất quán của dữ liệu.

**Q: `clientId` là gì?**  
A: `clientId` là ID tạm thời do frontend tự sinh ra để reference giữa các entities khi chưa có database ID. Backend sẽ trả về mapping `clientId → databaseId`.

**Q: Làm sao để xóa một node trong Sync API?**  
A: Đơn giản là không đưa node đó vào payload. Backend sẽ tự động xóa các nodes không có trong request.

**Q: API nào không cần authentication?**  
A: 
- `GET /api/roadmaps/{id}` - Xem chi tiết roadmap
- `GET /api/roadmaps/{roadmapId}/nodes/{nodeId}/contents` - Xem contents

**Q: Edge type nào nên dùng?**  
A:
- `Prerequisite`: Khi node A BẮT BUỘC phải học trước node B
- `Recommended`: Khi khuyến nghị học tiếp nhưng không bắt buộc
- `Next`: Bước tiếp theo tự nhiên trong lộ trình

---

## Support & Resources

- **Swagger Documentation:** https://your-api-domain.com/swagger
- **Backend Team:** backend@example.com
- **API Version:** v1.0.0
- **Last Updated:** February 4, 2026

---

**Happy Coding! 🚀**
