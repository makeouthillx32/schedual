interface ScheduleItem {
  business_name: string;
  jobs: { job_name: string; member_name: string }[];
  before_open: boolean;
  address: string;
  onClick: () => void; // Include `onClick` property
}

interface WeekListProps {
  schedule: ScheduleItem[];
}

export default function WeekList({ schedule }: WeekListProps) {
  return (
    <div>
      {schedule.map((item, index) => (
        <div key={index} className="mb-6">
          <h4 className="underline cursor-pointer" onClick={item.onClick}>
            {item.business_name}
          </h4>
          <p className="ml-5 text-gray-600">{item.address}</p> {/* Add address if needed */}
        </div>
      ))}
    </div>
  );
}