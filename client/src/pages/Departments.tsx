import { useState } from "react";
import { mockDepartments } from "@/data/mockDepartments";
import { DepartmentCard } from "@/components/DepartmentCard";

export default function Departments() {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  // 計算總統計
  const totalMembers = mockDepartments.reduce((sum, dept) => sum + dept.members.length, 0);
  const totalTasks = mockDepartments.reduce((sum, dept) => {
    return sum + dept.taskStats.pending + dept.taskStats.inProgress + dept.taskStats.completed;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 頁面標題 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                部門概況
              </h1>
              <p className="text-slate-600 mt-2">
                查看各部門的任務統計與成員資訊
              </p>
            </div>
            
            {/* 總覽統計 */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {mockDepartments.length}
                </div>
                <div className="text-sm text-slate-600">部門總數</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {totalMembers}
                </div>
                <div className="text-sm text-slate-600">成員總數</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {totalTasks}
                </div>
                <div className="text-sm text-slate-600">任務總數</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 部門卡片網格 */}
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockDepartments.map((dept) => (
            <DepartmentCard
              key={dept.id}
              department={dept}
              onClick={() => setSelectedDepartment(dept.id)}
            />
          ))}
        </div>

        {/* 部門詳細資訊(可選) */}
        {selectedDepartment && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">
              {mockDepartments.find(d => d.id === selectedDepartment)?.name} - 詳細資訊
            </h2>
            {/* 這裡可以加入更詳細的部門資訊 */}
          </div>
        )}
      </div>
    </div>
  );
}
