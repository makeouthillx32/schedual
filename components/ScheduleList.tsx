import { useTheme } from "@/app/provider";

interface ScheduleItem {
  business_name: string;
  jobs: { job_name: string; member_name: string }[];
  before_open: boolean;
  address: string;
  onClick: () => void;
}

interface ScheduleListProps {
  schedule: ScheduleItem[];
}

export default function ScheduleList({ schedule }: ScheduleListProps) {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  return (
    <div className="space-y-6">
      {schedule.map((item, index) => (
        <div 
          key={index} 
          className={`p-4 rounded-lg ${
            isDark 
              ? "bg-[hsl(var(--card))] shadow-[var(--shadow-sm)]" 
              : "bg-[hsl(var(--background))] shadow-[var(--shadow-xs)]"
          } transition-all duration-200 hover:shadow-[var(--shadow-md)]`}
        >
          <h4 
            className={`text-lg font-medium mb-3 text-[hsl(var(--sidebar-primary))] cursor-pointer flex items-center`}
            onClick={item.onClick}
          >
            <span className="hover:underline">{item.business_name}</span>
            <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
              item.before_open 
                ? "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]" 
                : "bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]"
            }`}>
              {item.before_open ? "Before Open" : "After Hours"}
            </span>
          </h4>
          
          <ul className="space-y-2">
            {item.jobs.map((job, jobIndex) => (
              <li 
                key={jobIndex}
                className={`flex justify-between p-2 rounded ${
                  isDark 
                    ? "bg-[hsl(var(--secondary))]" 
                    : "bg-[hsl(var(--muted))]"
                }`}
              >
                <span className="font-medium">{job.job_name}</span>
                <span className="text-[hsl(var(--muted-foreground))]">{job.member_name}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}