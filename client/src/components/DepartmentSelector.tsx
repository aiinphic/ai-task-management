import { Card } from "@/components/ui/card";
import { Building2, Users } from "lucide-react";

interface Department {
  id: string;
  name: string;
  memberCount: number;
}

interface DepartmentSelectorProps {
  departments: Department[];
  onSelectDepartment: (department: Department) => void;
}

export function DepartmentSelector({ departments, onSelectDepartment }: DepartmentSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          選擇部門
        </h2>
        <p className="text-muted-foreground">
          請選擇要查看的部門,然後選擇人員進入執行模式
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {departments.map(dept => (
          <Card
            key={dept.id}
            className="p-6 cursor-pointer hover:bg-secondary/50 hover:shadow-lg transition-all"
            onClick={() => onSelectDepartment(dept)}
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg">{dept.name}</h3>
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{dept.memberCount} 人</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
