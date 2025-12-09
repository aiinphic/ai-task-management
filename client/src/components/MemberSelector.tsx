import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { User as UserType } from "@/types/task";

interface Department {
  id: string;
  name: string;
  memberCount: number;
}

interface MemberSelectorProps {
  department: Department;
  members: UserType[];
  onSelectMember: (member: UserType) => void;
  onBack: () => void;
}

export function MemberSelector({ department, members, onSelectMember, onBack }: MemberSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{department.name} - 選擇人員</h2>
          <p className="text-sm text-muted-foreground">
            共 {members.length} 位成員
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {members.map(member => (
          <Card
            key={member.id}
            className="p-6 cursor-pointer hover:bg-secondary/50 hover:shadow-lg transition-all"
            onClick={() => onSelectMember(member)}
          >
            <div className="text-center space-y-2">
              {member.avatar ? (
                <div className="text-4xl mb-2">{member.avatar}</div>
              ) : (
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <User className="w-6 h-6 text-primary" />
                </div>
              )}
              <h3 className="font-bold">{member.name}</h3>
              {member.role && (
                <p className="text-sm text-muted-foreground">{member.role}</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
