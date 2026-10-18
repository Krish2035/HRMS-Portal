export interface TokenPayload {
  userId: string;
  organizationId: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    organizationId: string;
    status: string;
    roles: string[];
  };
  employee?: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    departmentId?: string | null;
    designationId?: string | null;
    workLocation: string;
  } | null;
}
