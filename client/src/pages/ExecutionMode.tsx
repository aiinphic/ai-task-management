import { useState } from "react";
import { Task, User } from "@/types/task";
import { mockDepartments, mockUsers } from "@/data/mockDepartments";
import { DepartmentSelector } from "@/components/DepartmentSelector";
import { MemberSelector } from "@/components/MemberSelector";
import { PersonalExecutionView } from "@/components/PersonalExecutionView";

interface ExecutionModeProps {
  tasks: Task[];
}

interface Department {
  id: string;
  name: string;
  memberCount: number;
}

export function ExecutionMode({ tasks }: ExecutionModeProps) {
  const [currentView, setCurrentView] = useState<'department' | 'member' | 'execution'>('department');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);

  // 準備部門資料
  const departments: Department[] = mockDepartments.map(dept => ({
    id: dept.id,
    name: dept.name,
    memberCount: mockUsers.filter(user => user.department === dept.name).length,
  }));

  // 處理部門選擇
  const handleSelectDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setCurrentView('member');
  };

  // 處理人員選擇
  const handleSelectMember = (member: User) => {
    setSelectedMember(member);
    setCurrentView('execution');
  };

  // 返回上一層
  const handleBackToDepartment = () => {
    setSelectedDepartment(null);
    setCurrentView('department');
  };

  const handleBackToMember = () => {
    setSelectedMember(null);
    setCurrentView('member');
  };

  // 根據當前視圖渲染不同內容
  if (currentView === 'department') {
    return (
      <DepartmentSelector
        departments={departments}
        onSelectDepartment={handleSelectDepartment}
      />
    );
  }

  if (currentView === 'member' && selectedDepartment) {
    const members = mockUsers.filter(user => user.department === selectedDepartment.name);
    return (
      <MemberSelector
        department={selectedDepartment}
        members={members}
        onSelectMember={handleSelectMember}
        onBack={handleBackToDepartment}
      />
    );
  }

  if (currentView === 'execution' && selectedMember) {
    return (
      <PersonalExecutionView
        member={selectedMember}
        tasks={tasks}
        onBack={handleBackToMember}
      />
    );
  }

  return null;
}
