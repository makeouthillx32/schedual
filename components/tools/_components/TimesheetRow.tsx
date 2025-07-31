// components/tools/_components/TimesheetRow.tsx (Mobile-Friendly Version)
import React from 'react';
import { RowData } from '../../../types/timesheet';
import { calculateTotal } from '../../../utils/timesheetUtils';
import { TimeInput } from './TimeInput';

interface TimesheetRowProps {
  row: RowData;
  index: number;
  onRowChange: <T extends keyof RowData>(field: T, value: RowData[T]) => void;
  onRemoveRow: () => void;
}

export const TimesheetRow: React.FC<TimesheetRowProps> = ({
  row,
  index,
  onRowChange,
  onRemoveRow,
}) => {
  return (
    <div 
      className={`timesheet-row ${index % 2 === 1 ? 'row-alternate' : ''}`}
    >
      <div className="row-header">
        <div className="day-label">{row.day}</div>
        <div className="hours-total-mobile">
          {calculateTotal(row).toFixed(2)}h
        </div>
        <button 
          className="remove-row-button" 
          onClick={onRemoveRow}
          aria-label={`Remove ${row.day}`}
        >
          ×
        </button>
      </div>
      
      <div className="time-section">
        <div className="time-row">
          <div className="time-group">
            <label className="time-label">Start Time</label>
            <TimeInput
              hour={row.starthour}
              minute={row.startminute}
              ampm={row.startampm}
              onHourChange={(hour) => onRowChange("starthour", hour)}
              onMinuteChange={(minute) => onRowChange("startminute", minute)}
              onAmPmChange={(ampm) => onRowChange("startampm", ampm)}
              label="Start"
              dayName={row.day}
            />
          </div>
          
          <div className="time-group">
            <label className="time-label">End Time</label>
            <TimeInput
              hour={row.endhour}
              minute={row.endminute}
              ampm={row.endampm}
              onHourChange={(hour) => onRowChange("endhour", hour)}
              onMinuteChange={(minute) => onRowChange("endminute", minute)}
              onAmPmChange={(ampm) => onRowChange("endampm", ampm)}
              label="End"
              dayName={row.day}
            />
          </div>
        </div>
        
        <div className="break-row">
          <div className="break-group">
            <label className="break-label">Break Time</label>
            <div className="break-input">
              <select
                className="break-select"
                aria-label={`Break Time for ${row.day}`}
                value={row.breaktime}
                onChange={(e) => onRowChange("breaktime", parseInt(e.target.value))}
              >
                <option value={0}>0 min</option>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
              </select>
            </div>
          </div>
          
          <div className="hours-total-desktop">
            <label className="hours-label">Total Hours</label>
            <div className="hours-value">
              {calculateTotal(row).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};