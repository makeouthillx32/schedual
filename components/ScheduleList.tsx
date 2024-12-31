interface ScheduleItem {
    business_name: string;
    jobs: { job_name: string; member_name: string }[];
    before_open: boolean;
    address: string;
    onClick: () => void; // Include `onClick` property
  }
  
  interface ScheduleListProps {
    schedule: ScheduleItem[];
  }
  
  export default function ScheduleList({ schedule }: ScheduleListProps) {
    return (
      <div>
        {schedule.map((item, index) => (
          <div key={index} className="mb-6">
            <h4 className="underline cursor-pointer" onClick={item.onClick}>
              {item.business_name}
            </h4>
            <ul className="ml-5 list-disc">
              {item.jobs.map((job, jobIndex) => (
                <li key={jobIndex}>
                  {job.job_name} - {job.member_name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }
  