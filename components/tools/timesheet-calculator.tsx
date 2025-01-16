import React, { useState } from "react";
import "./../../style/TSC.css"; // Adjust the relative path based on your file structure

interface RowData {
  starthour: number;
  startminute: number;
  startampm: string;
  endhour: number;
  endminute: number;
  endampm: string;
  breaktime: number;
}

const TimeSheetCalculator: React.FC = () => {
  const [rows, setRows] = useState<RowData[]>([
    {
      starthour: 6,
      startminute: 0,
      startampm: "AM",
      endhour: 3,
      endminute: 0,
      endampm: "PM",
      breaktime: 0,
    },
  ]);

  const convertTo24Hour = (hour: number, ampm: string): number => {
    if (ampm === "PM" && hour !== 12) return hour + 12;
    if (ampm === "AM" && hour === 12) return 0;
    return hour;
  };

  const calculateTotal = (row: RowData): number => {
    const startHour = convertTo24Hour(row.starthour, row.startampm);
    const endHour = convertTo24Hour(row.endhour, row.endampm);
    const totalMinutes =
      endHour * 60 +
      row.endminute -
      (startHour * 60 + row.startminute) -
      row.breaktime;
    return totalMinutes > 0 ? totalMinutes / 60 : 0;
  };

  const handleRowChange = <T extends keyof RowData>(
    index: number,
    field: T,
    value: RowData[T]
  ) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        starthour: 6,
        startminute: 0,
        startampm: "AM",
        endhour: 3,
        endminute: 0,
        endampm: "PM",
        breaktime: 0,
      },
    ]);
  };

  return (
    <div>
      <h1>How much do you earn?</h1>
      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Break Time</th>
            <th>Total (Hours)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                <select
                  aria-label={`Start Hour for Day ${index + 1}`}
                  value={row.starthour}
                  onChange={(e) =>
                    handleRowChange(index, "starthour", parseInt(e.target.value))
                  }
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                :
                <select
                  aria-label={`Start Minute for Day ${index + 1}`}
                  value={row.startminute}
                  onChange={(e) =>
                    handleRowChange(
                      index,
                      "startminute",
                      parseInt(e.target.value)
                    )
                  }
                >
                  <option value={0}>00</option>
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={45}>45</option>
                </select>
                <select
                  aria-label={`AM/PM for Start Time of Day ${index + 1}`}
                  value={row.startampm}
                  onChange={(e) =>
                    handleRowChange(index, "startampm", e.target.value)
                  }
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </td>
              <td>
                <select
                  aria-label={`End Hour for Day ${index + 1}`}
                  value={row.endhour}
                  onChange={(e) =>
                    handleRowChange(index, "endhour", parseInt(e.target.value))
                  }
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                :
                <select
                  aria-label={`End Minute for Day ${index + 1}`}
                  value={row.endminute}
                  onChange={(e) =>
                    handleRowChange(
                      index,
                      "endminute",
                      parseInt(e.target.value)
                    )
                  }
                >
                  <option value={0}>00</option>
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={45}>45</option>
                </select>
                <select
                  aria-label={`AM/PM for End Time of Day ${index + 1}`}
                  value={row.endampm}
                  onChange={(e) =>
                    handleRowChange(index, "endampm", e.target.value)
                  }
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </td>
              <td>
                <select
                  aria-label={`Break Time for Day ${index + 1}`}
                  value={row.breaktime}
                  onChange={(e) =>
                    handleRowChange(
                      index,
                      "breaktime",
                      parseInt(e.target.value)
                    )
                  }
                >
                  <option value={0}>00</option>
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={45}>45</option>
                  <option value={60}>60</option>
                </select>
              </td>
              <td>{calculateTotal(row).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addRow}>Add Row</button>
      <p>
        Total Hours:{" "}
        {rows.reduce((sum, row) => sum + calculateTotal(row), 0).toFixed(2)}
      </p>
    </div>
  );
};

export default TimeSheetCalculator;
