import { Department } from "@/types/department";
import { User } from "@/types/task";

// 更新使用者資料,加入部門資訊
export const mockUsers: User[] = [
  // 產品部 (5人)
  { id: "1", name: "王小明", avatar: "👨‍💼", department: "產品部", role: "產品經理" },
  { id: "2", name: "李美華", avatar: "👩‍💼", department: "產品部", role: "產品設計師" },
  { id: "3", name: "張志強", avatar: "👨‍💻", department: "產品部", role: "產品分析師" },
  { id: "4", name: "陳雅婷", avatar: "👩‍🎨", department: "產品部", role: "UI/UX 設計師" },
  { id: "5", name: "林建宏", avatar: "👨‍🔧", department: "產品部", role: "產品專員" },
  
  // 會計部 (4人)
  { id: "6", name: "黃淑芬", avatar: "👩‍🏫", department: "會計部", role: "會計主管" },
  { id: "7", name: "吳俊傑", avatar: "👨‍💼", department: "會計部", role: "會計師" },
  { id: "8", name: "劉佳玲", avatar: "👩‍💼", department: "會計部", role: "出納" },
  { id: "9", name: "鄭宇軒", avatar: "👨‍💻", department: "會計部", role: "財務分析師" },
  
  // 業務部 (6人)
  { id: "10", name: "謝文傑", avatar: "👨‍💼", department: "業務部", role: "業務總監" },
  { id: "11", name: "周美玲", avatar: "👩‍💼", department: "業務部", role: "業務經理" },
  { id: "12", name: "蔡宗翰", avatar: "👨‍💼", department: "業務部", role: "業務專員" },
  { id: "13", name: "許雅雯", avatar: "👩‍💼", department: "業務部", role: "業務專員" },
  { id: "14", name: "楊承翰", avatar: "👨‍💼", department: "業務部", role: "業務助理" },
  { id: "15", name: "賴怡君", avatar: "👩‍💼", department: "業務部", role: "客服專員" },
  
  // 行銷部 (5人)
  { id: "16", name: "林詩涵", avatar: "👩‍🎨", department: "行銷部", role: "行銷總監" },
  { id: "17", name: "陳冠宇", avatar: "👨‍💻", department: "行銷部", role: "數位行銷專員" },
  { id: "18", name: "張雅筑", avatar: "👩‍💼", department: "行銷部", role: "社群經營專員" },
  { id: "19", name: "劉宇恩", avatar: "👨‍🎨", department: "行銷部", role: "視覺設計師" },
  { id: "20", name: "王欣怡", avatar: "👩‍💻", department: "行銷部", role: "內容企劃" },
  
  // 行政部 (3人)
  { id: "21", name: "徐志明", avatar: "👨‍💼", department: "行政部", role: "行政經理" },
  { id: "22", name: "蘇雅婷", avatar: "👩‍💼", department: "行政部", role: "人資專員" },
  { id: "23", name: "何俊宏", avatar: "👨‍💼", department: "行政部", role: "總務專員" },
];

export const mockDepartments: Department[] = [
  {
    id: "product",
    name: "產品部",
    icon: "🎯",
    color: "bg-blue-500",
    members: mockUsers.filter(u => u.department === "產品部"),
    taskStats: {
      pending: 0,
      inProgress: 0,
      completed: 0,
    },
  },
  {
    id: "accounting",
    name: "會計部",
    icon: "💰",
    color: "bg-green-500",
    members: mockUsers.filter(u => u.department === "會計部"),
    taskStats: {
      pending: 0,
      inProgress: 0,
      completed: 0,
    },
  },
  {
    id: "sales",
    name: "業務部",
    icon: "📊",
    color: "bg-orange-500",
    members: mockUsers.filter(u => u.department === "業務部"),
    taskStats: {
      pending: 0,
      inProgress: 0,
      completed: 0,
    },
  },
  {
    id: "marketing",
    name: "行銷部",
    icon: "📢",
    color: "bg-purple-500",
    members: mockUsers.filter(u => u.department === "行銷部"),
    taskStats: {
      pending: 0,
      inProgress: 0,
      completed: 0,
    },
  },
  {
    id: "admin",
    name: "行政部",
    icon: "📋",
    color: "bg-gray-500",
    members: mockUsers.filter(u => u.department === "行政部"),
    taskStats: {
      pending: 0,
      inProgress: 0,
      completed: 0,
    },
  },
];
