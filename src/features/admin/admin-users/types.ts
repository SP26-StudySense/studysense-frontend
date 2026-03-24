export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedSubjectId?: number;
  assignedSubjectName?: string;
  status: string;
  joinDate: string;
  isLocked?: boolean;
}
