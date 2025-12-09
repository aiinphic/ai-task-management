import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronRight } from "lucide-react";
import { mockDepartments } from "@/data/mockDepartments";

interface DepartmentMemberSelectorProps {
  selectedMembers: string[];
  onMemberToggle: (memberId: string) => void;
}

export function DepartmentMemberSelector({ selectedMembers, onMemberToggle }: DepartmentMemberSelectorProps) {
  const [expandedDepts, setExpandedDepts] = useState<string[]>(mockDepartments.map((d: any) => d.id));

  const toggleDepartment = (deptId: string) => {
    setExpandedDepts(prev =>
      prev.includes(deptId)
        ? prev.filter(id => id !== deptId)
        : [...prev, deptId]
    );
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-card-foreground">協作單位</label>
      <div className="border rounded-lg divide-y max-h-80 overflow-y-auto">
        {mockDepartments.map((dept: any) => {
          const isExpanded = expandedDepts.includes(dept.id);
          const selectedCount = dept.members.filter((m: any) => selectedMembers.includes(m.id)).length;
          
          return (
            <div key={dept.id} className="bg-card">
              {/* Department Header */}
              <button
                type="button"
                onClick={() => toggleDepartment(dept.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="font-medium text-sm">{dept.name}</span>
                  {selectedCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      已選 {selectedCount}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {dept.members.length} 人
                </span>
              </button>

              {/* Department Members */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {dept.members.map((member: any) => {
                      const isSelected = selectedMembers.includes(member.id);
                      
                      return (
                        <label
                          key={(member as any).id}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-background border-border hover:bg-accent"
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onMemberToggle(member.id)}
                          />
                          <span className="text-sm">{member.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Selected Members Summary */}
      {selectedMembers.length > 0 && (
        <div className="mt-2 p-2 bg-accent/30 rounded-md">
          <p className="text-xs text-muted-foreground mb-1">已選擇 {selectedMembers.length} 位協作人員:</p>
          <div className="flex flex-wrap gap-1">
            {selectedMembers.map((memberId) => {
              const member = mockDepartments
                .flatMap((d: any) => d.members)
                .find((m: any) => m.id === memberId);
              
              return member ? (
                <Badge key={memberId} variant="secondary" className="text-xs">
                  {member.name}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
