import { User } from "./task";

export interface Department {
  id: string;
  name: string;
  icon: string;
  color: string;
  members: User[];
  taskStats: {
    pending: number;
    inProgress: number;
    completed: number;
  };
}

export type DepartmentId = "product" | "accounting" | "sales" | "marketing" | "admin";
