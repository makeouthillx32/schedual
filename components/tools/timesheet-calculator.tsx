"use client";

import React, { useState } from "react";

const TimesheetCalculator: React.FC = () => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [breakTime, setBreakTime] = useState(0);
  const [totalHours, setTotalHours] = useState<number | null>(null);

  const calculateHours = () => {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);

    if (start >= end) {
      alert("Start time must be before end time");
      return;
    }

    const hoursWorked = (end.getTime() - start.getTime()) / (1000 * 60 * 60) - breakTime;
    setTotalHours(hoursWorked > 0 ? hoursWorked : 0);
  };

  return (
    <div className="timesheet-calculator">
      <h1>Timesheet Calculator</h1>
      <div className="input-group">
        <label htmlFor="start-time">Start Time:</label>
        <input
          type="time"
          id="start-time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="end-time">End Time:</label>
        <input
          type="time"
          id="end-time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="break-time">Break Time (hours):</label>
        <input
          type="number"
          id="break-time"
          value={breakTime}
          onChange={(e) => setBreakTime(parseFloat(e.target.value))}
          min="0"
          step="0.25"
        />
      </div>
      <button onClick={calculateHours}>Calculate Hours</button>
      {totalHours !== null && (
        <p className="result">Total Hours Worked: {totalHours.toFixed(2)}</p>
      )}
    </div>
  );
};

export default TimesheetCalculator;