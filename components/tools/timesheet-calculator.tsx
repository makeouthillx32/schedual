import React, { useState } from "react";
import "./../../style/TSC.css"; // Adjust the relative path based on your file structure

interface RowData {
  day: string;
  starthour: number;
  startminute: number;
  startampm: string;
  endhour: number;
  endminute: number;
  endampm: string;
  breaktime: number;
}

interface WeekData {
  id: number;
  name: string;
  rows: RowData[];
}

const TimeSheetCalculator: React.FC = () => {
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Start with a single empty week
  const [weeks, setWeeks] = useState<WeekData[]>([
    { id: 1, name: "Week 1", rows: [] }
  ]);
  
  const [activeWeekId, setActiveWeekId] = useState<number>(1);
  const [hourlyRate, setHourlyRate] = useState<number>(15);
  const [showPayCalculation, setShowPayCalculation] = useState<boolean>(false);
  const [customDayName, setCustomDayName] = useState<string>("");
  const [nextWeekId, setNextWeekId] = useState<number>(2);

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

  const activeWeek = weeks.find((week) => week.id === activeWeekId) || weeks[0];

  const createDefaultRow = (day: string): RowData => {
    return {
      day,
      starthour: 8,
      startminute: 0,
      startampm: "AM",
      endhour: 5,
      endminute: 0,
      endampm: "PM",
      breaktime: 60,
    };
  };

  const handleRowChange = <T extends keyof RowData>(
    weekId: number,
    rowIndex: number,
    field: T,
    value: RowData[T]
  ) => {
    const updatedWeeks = weeks.map((week) => {
      if (week.id === weekId) {
        const updatedRows = [...week.rows];
        updatedRows[rowIndex][field] = value;
        return { ...week, rows: updatedRows };
      }
      return week;
    });
    setWeeks(updatedWeeks);
  };

  const addDay = (weekId: number, dayName: string = "") => {
    let day = dayName;
    
    // If no specific day is provided, use custom name or generate a default name
    if (!day) {
      if (customDayName) {
        day = customDayName;
        setCustomDayName(""); // Reset the custom day name field
      } else {
        const week = weeks.find(w => w.id === weekId);
        day = `Day ${week?.rows.length ? week.rows.length + 1 : 1}`;
      }
    }
    
    const updatedWeeks = weeks.map((week) => {
      if (week.id === weekId) {
        return { ...week, rows: [...week.rows, createDefaultRow(day)] };
      }
      return week;
    });
    
    setWeeks(updatedWeeks);
  };

  const addWeek = (copyFromWeekId?: number) => {
    const newWeekId = nextWeekId;
    setNextWeekId(nextWeekId + 1);
    
    let newRows: RowData[] = [];
    
    // If we're copying from another week, use its rows
    if (copyFromWeekId !== undefined) {
      const sourceWeek = weeks.find(w => w.id === copyFromWeekId);
      if (sourceWeek) {
        // Deep copy rows to avoid reference issues
        newRows = sourceWeek.rows.map(row => ({...row}));
      }
    }
    
    setWeeks([
      ...weeks,
      {
        id: newWeekId,
        name: `Week ${newWeekId}`,
        rows: newRows
      }
    ]);
    
    // Automatically set the new week as active
    setActiveWeekId(newWeekId);
  };

  const addFullWeek = (weekId: number) => {
    const week = weeks.find(w => w.id === weekId);
    if (!week) return;
    
    const existingDays = new Set(week.rows.map(row => row.day));
    const daysToAdd = daysOfWeek.filter(day => !existingDays.has(day));
    
    if (daysToAdd.length === 0) return;
    
    const updatedWeeks = weeks.map((w) => {
      if (w.id === weekId) {
        return {
          ...w,
          rows: [
            ...w.rows,
            ...daysToAdd.map(day => createDefaultRow(day))
          ]
        };
      }
      return w;
    });
    
    setWeeks(updatedWeeks);
  };

  const removeRow = (weekId: number, rowIndex: number) => {
    const updatedWeeks = weeks.map((week) => {
      if (week.id === weekId) {
        const updatedRows = [...week.rows];
        updatedRows.splice(rowIndex, 1);
        return { ...week, rows: updatedRows };
      }
      return week;
    });
    setWeeks(updatedWeeks);
  };

  const removeWeek = (weekId: number) => {
    // Don't remove if it's the only week
    if (weeks.length <= 1) return;
    
    const updatedWeeks = weeks.filter(w => w.id !== weekId);
    setWeeks(updatedWeeks);
    
    // If we removed the active week, set a new active week
    if (activeWeekId === weekId) {
      setActiveWeekId(updatedWeeks[0].id);
    }
  };

  const calculateWeekTotal = (week: WeekData): number => {
    return week.rows.reduce((sum, row) => sum + calculateTotal(row), 0);
  };

  const calculateAllWeeksTotal = (): number => {
    return weeks.reduce((sum, week) => sum + calculateWeekTotal(week), 0);
  };

  const totalHours = calculateAllWeeksTotal();
  const totalPay = totalHours * hourlyRate;

  const renameWeek = (weekId: number, newName: string) => {
    const updatedWeeks = weeks.map((week) => {
      if (week.id === weekId) {
        return { ...week, name: newName };
      }
      return week;
    });
    setWeeks(updatedWeeks);
  };

  return (
    <div className="timesheet-container">
      <h1>Multi-Week Timesheet Calculator</h1>
      
      <div className="week-tabs">
        {weeks.map((week) => (
          <button
            key={week.id}
            className={`week-tab ${activeWeekId === week.id ? 'active' : ''}`}
            onClick={() => setActiveWeekId(week.id)}
          >
            {week.name}
            {weeks.length > 1 && (
              <span 
                className="remove-week-button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeWeek(week.id);
                }}
              >
                ×
              </span>
            )}
          </button>
        ))}
        <button className="week-tab add-week" onClick={() => addWeek()}>
          + New Week
        </button>
      </div>
      
      {activeWeek && (
        <>
          <div className="week-header">
            <input
              type="text"
              className="week-name-input"
              value={activeWeek.name}
              onChange={(e) => renameWeek(activeWeek.id, e.target.value)}
            />
            
            <div className="week-actions">
              <button 
                className="add-week-from-current"
                onClick={() => addWeek(activeWeek.id)}
              >
                Add Week with Same Schedule
              </button>
            </div>
          </div>
          
          <div className="action-buttons">
            <div className="custom-day-input">
              <input
                type="text"
                placeholder="Custom day name"
                value={customDayName}
                onChange={(e) => setCustomDayName(e.target.value)}
              />
            </div>
            <button className="add-button" onClick={() => addDay(activeWeek.id)}>
              Add Day
            </button>
            <button className="add-button" onClick={() => addFullWeek(activeWeek.id)}>
              Add Remaining Weekdays
            </button>
          </div>
          
          {activeWeek.rows.length === 0 ? (
            <div className="no-days-message">
              No days added to {activeWeek.name} yet. Click "Add Day" or "Add Remaining Weekdays" to start.
            </div>
          ) : (
            <div className="timesheet-table">
              {activeWeek.rows.map((row, index) => (
                <div 
                  key={index} 
                  className={`timesheet-row ${index % 2 === 1 ? 'row-alternate' : ''}`}
                >
                  <div className="day-label">{row.day}</div>
                  
                  <div className="time-section">
                    <div className="time-input">
                      <select
                        className="hour-select"
                        aria-label={`Start Hour for ${row.day}`}
                        value={row.starthour}
                        onChange={(e) =>
                          handleRowChange(activeWeek.id, index, "starthour", parseInt(e.target.value))
                        }
                      >
                        {[...Array(12)].map((_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                      <span className="time-separator">:</span>
                      <select
                        className="minute-select"
                        aria-label={`Start Minute for ${row.day}`}
                        value={row.startminute}
                        onChange={(e) =>
                          handleRowChange(
                            activeWeek.id,
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
                        className="ampm-select"
                        aria-label={`AM/PM for Start Time of ${row.day}`}
                        value={row.startampm}
                        onChange={(e) =>
                          handleRowChange(activeWeek.id, index, "startampm", e.target.value)
                        }
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                    
                    <div className="time-input">
                      <select
                        className="hour-select"
                        aria-label={`End Hour for ${row.day}`}
                        value={row.endhour}
                        onChange={(e) =>
                          handleRowChange(activeWeek.id, index, "endhour", parseInt(e.target.value))
                        }
                      >
                        {[...Array(12)].map((_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                      <span className="time-separator">:</span>
                      <select
                        className="minute-select"
                        aria-label={`End Minute for ${row.day}`}
                        value={row.endminute}
                        onChange={(e) =>
                          handleRowChange(
                            activeWeek.id,
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
                        className="ampm-select"
                        aria-label={`AM/PM for End Time of ${row.day}`}
                        value={row.endampm}
                        onChange={(e) =>
                          handleRowChange(activeWeek.id, index, "endampm", e.target.value)
                        }
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                    
                    <div className="break-input">
                      <select
                        className="break-select"
                        aria-label={`Break Time for ${row.day}`}
                        value={row.breaktime}
                        onChange={(e) =>
                          handleRowChange(
                            activeWeek.id,
                            index,
                            "breaktime",
                            parseInt(e.target.value)
                          )
                        }
                      >
                        <option value={0}>0 min</option>
                        <option value={15}>15 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>1 hour</option>
                        <option value={90}>1.5 hours</option>
                      </select>
                    </div>
                    
                    <div className="hours-total">
                      {calculateTotal(row).toFixed(2)}
                    </div>
                    
                    <button 
                      className="remove-row-button" 
                      onClick={() => removeRow(activeWeek.id, index)}
                      aria-label={`Remove ${row.day}`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <div className="week-total-row">
                <div className="week-total-label">Week Total:</div>
                <div className="week-total-hours">{calculateWeekTotal(activeWeek).toFixed(2)} hours</div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="totals-section">
        <div className="week-summaries">
          <h3>All Weeks Summary</h3>
          <div className="week-summary-list">
            {weeks.map((week) => (
              <div key={week.id} className="week-summary-item">
                <span>{week.name}:</span>
                <span>{calculateWeekTotal(week).toFixed(2)} hours</span>
              </div>
            ))}
          </div>
          <div className="all-weeks-total">
            <strong>Total Hours (All Weeks):</strong> {totalHours.toFixed(2)}
          </div>
        </div>
        
        <div className="hourly-rate-section">
          <label htmlFor="hourly-rate">Hourly Rate ($): </label>
          <input
            id="hourly-rate"
            type="number"
            min="0"
            step="0.01"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
          />
          <button 
            className="calculate-pay-button"
            onClick={() => setShowPayCalculation(!showPayCalculation)}
          >
            {showPayCalculation ? "Hide Pay" : "Calculate Pay"}
          </button>
        </div>
        
        {showPayCalculation && (
          <div className="pay-calculation">
            <div className="pay-detail">
              <span>Hours worked:</span>
              <span>{totalHours.toFixed(2)}</span>
            </div>
            <div className="pay-detail">
              <span>Hourly rate:</span>
              <span>${hourlyRate.toFixed(2)}</span>
            </div>
            <div className="pay-total">
              <span>Total pay:</span>
              <span>${totalPay.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSheetCalculator;