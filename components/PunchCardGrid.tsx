const PunchCardGrid: React.FC<PunchCardGridProps> = ({ numPunchCards }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mt-6 p-4 max-w-[816px] mx-auto border bg-white shadow-md">
      {Array.from({ length: numPunchCards }, (_, index) => (
        <div key={index} className="w-[400px] h-[300px] flex flex-col items-center justify-center border bg-gray-200">
          <Image
            src={`/images/punchcard.png`}
            alt={`Punch Card ${index + 1}`}
            width={400}
            height={300}
            className="w-full"
          />
          <p className="text-center font-bold mt-2">Card #{index + 1}</p>
        </div>
      ))}
    </div>
  );
};