"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ClockProps {
  /**
   * Start times of school day sessions in hours (0-24, e.g., [8] for 8:00 AM, or [7, 13] for two sessions)
   */
  startTime: number[];
  /**
   * End times of school day sessions in hours (0-24, e.g., [15] for 3:00 PM, or [12, 17] for two sessions)
   * Must have the same length as startTime array
   */
  endTime: number[];
  /**
   * Start time of cram school in hours (0-24, e.g., 15 for 3:00 PM)
   * Optional - defaults to 0 if not provided
   */
  cramSchoolStartTime?: number;
  /**
   * End time of cram school in hours (0-24, e.g., 15 for 3:00 PM)
   * Optional - defaults to 0 if not provided
   */
  cramSchoolEndTime?: number;
  /**
   * Optional title to display above the clock
   */
  title?: string;
  /**
   * Optional size of the clock in pixels (default: 300)
   */
  size?: number;
}

/**
 * Clock component that displays average school day length as a pie chart
 * resembling a clock face. The filled portion represents school hours out of 24.
 */
export default function Clock({
  startTime,
  endTime,
  cramSchoolStartTime,
  cramSchoolEndTime,
  title = "Average School Day Length",
  size = 300,
}: ClockProps) {
  // Normalize all school session times to 0-24 range
  const schoolSessions = startTime.map((start, index) => {
    const end = endTime[index];
    const normalizedStart = start % 24;
    const normalizedEnd = end % 24;

    // Calculate hours for this session
    const sessionHours =
      normalizedEnd > normalizedStart
        ? normalizedEnd - normalizedStart
        : 24 - normalizedStart + normalizedEnd;

    return {
      start: normalizedStart,
      end: normalizedEnd,
      hours: sessionHours,
    };
  });

  // Calculate total school hours across all sessions
  const actualSchoolHours = schoolSessions.reduce(
    (sum, session) => sum + session.hours,
    0
  );

  // Find first start time and last end time for display
  const firstStartTime = Math.min(...schoolSessions.map((s) => s.start));
  const lastEndTime = Math.max(...schoolSessions.map((s) => s.end));

  // Calculate cram school times from start and end times
  const actualCramHours =
    cramSchoolStartTime !== undefined && cramSchoolEndTime !== undefined
      ? (() => {
          const normalizedCramStart = cramSchoolStartTime % 24;
          const normalizedCramEnd = cramSchoolEndTime % 24;
          return normalizedCramEnd > normalizedCramStart
            ? normalizedCramEnd - normalizedCramStart
            : 24 - normalizedCramStart + normalizedCramEnd;
        })()
      : 0;

  const normalizedCramStartTime =
    cramSchoolStartTime !== undefined ? cramSchoolStartTime % 24 : 0;
  const normalizedCramEndTime =
    cramSchoolEndTime !== undefined ? cramSchoolEndTime % 24 : 0;

  // Calculate angles for pie chart
  // In recharts: 0° = 3 o'clock (right), 90° = 12 o'clock (top)
  // To go clockwise: startAngle must be > endAngle
  // Start at 12 o'clock (90 degrees) and go clockwise
  const pieStartAngle = 90;
  const pieEndAngle = 90 - 360; // -270 degrees to complete full circle clockwise

  // Build data segments in chronological order
  const chronologicalData: Array<{
    name: string;
    value: number;
    fill: string;
  }> = [];

  // Before first school session
  if (firstStartTime > 0) {
    chronologicalData.push({
      name: "Before School",
      value: firstStartTime,
      fill: "rgba(45, 62, 48, 0.2)",
    });
  }

  // Add school sessions and gaps between them
  for (let i = 0; i < schoolSessions.length; i++) {
    const session = schoolSessions[i];

    // Add gap before this session (if not first session)
    if (i > 0) {
      const prevSession = schoolSessions[i - 1];
      const gap = session.start - prevSession.end;
      if (gap > 0) {
        chronologicalData.push({
          name: "Break",
          value: gap,
          fill: "rgba(45, 62, 48, 0.25)",
        });
      }
    }

    // Add school session
    chronologicalData.push({
      name: "School Hours",
      value: session.hours,
      fill: "#81d4fa", // chalk-blue
    });
  }

  // Add gap between last school session and cram school if needed
  if (actualCramHours > 0) {
    const gap = normalizedCramStartTime - lastEndTime;
    if (gap > 0) {
      chronologicalData.push({
        name: "Between School and Cram",
        value: gap,
        fill: "rgba(45, 62, 48, 0.25)",
      });
    }

    // Add cram school
    chronologicalData.push({
      name: "Cram School",
      value: actualCramHours,
      fill: "#fff59d", // chalk-yellow
    });
  }

  // Add after hours
  const finalEnd = actualCramHours > 0 ? normalizedCramEndTime : lastEndTime;
  const afterHoursFinal = finalEnd < 24 ? 24 - finalEnd : 0;
  if (afterHoursFinal > 0) {
    chronologicalData.push({
      name: "After School",
      value: afterHoursFinal,
      fill: "rgba(45, 62, 48, 0.3)",
    });
  }

  const data = chronologicalData;

  // Calculate percentage for display (school + cram)
  const totalEducationHours = actualSchoolHours + actualCramHours;
  const percentage = ((totalEducationHours / 24) * 100).toFixed(1);

  // Clock face radius
  const clockRadius = size * 0.4;
  const centerX = size / 2;
  const centerY = size / 2;

  // Generate hour markers (12 hours on a 24-hour clock, so every 2 hours)
  const hourNumbers = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
  const hourMarkers = hourNumbers.map((hour, index) => {
    const angle = (index * 30 - 90) * (Math.PI / 180); // Convert to radians, start at top
    const radius = clockRadius + 15;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { hour, x, y, angle };
  });

  return (
    <div className="flex flex-col items-center justify-center p-6">
      {title && (
        <h3
          className="font-semibold mb-4 text-chalk-white text-center"
          style={{ fontSize: `${size * 0.07}px` }}
        >
          {title}
        </h3>
      )}

      <div className="relative" style={{ width: size, height: size }}>
        {/* Clock face background circle */}
        <svg
          width={size}
          height={size}
          className="absolute inset-0"
          style={{ zIndex: 1 }}
        >
          {/* Outer ring */}
          <circle
            cx={centerX}
            cy={centerY}
            r={clockRadius}
            fill="none"
            stroke="#fcfcfc"
            strokeWidth="2"
            opacity="0.3"
          />

          {/* Hour tick marks */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 15 - 90) * (Math.PI / 180);
            const isMainHour = i % 2 === 0;
            const innerRadius = clockRadius - (isMainHour ? 8 : 4);
            const outerRadius = clockRadius;
            const x1 = centerX + innerRadius * Math.cos(angle);
            const y1 = centerY + innerRadius * Math.sin(angle);
            const x2 = centerX + outerRadius * Math.cos(angle);
            const y2 = centerY + outerRadius * Math.sin(angle);

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#fcfcfc"
                strokeWidth={isMainHour ? "2" : "1"}
                opacity="0.5"
              />
            );
          })}

          {/* Hour numbers */}
          {hourMarkers.map((marker, index) => (
            <text
              key={index}
              x={marker.x}
              y={marker.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fcfcfc"
              fontSize={size * 0.06}
              fontWeight="600"
              opacity="0.8"
            >
              {marker.hour}
            </text>
          ))}
        </svg>

        {/* Pie chart overlay */}
        <div className="absolute inset-0" style={{ zIndex: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={size * 0.25}
                outerRadius={clockRadius}
                startAngle={pieStartAngle}
                endAngle={pieEndAngle}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Center circle and text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ zIndex: 3 }}
        >
          <div
            className="rounded-full bg-[#2d3e30] border-2 border-chalk-white/30 flex items-center justify-center"
            style={{
              width: size * 0.35,
              height: size * 0.35,
            }}
          >
            <div className="text-center px-2">
              <div
                className="font-bold text-chalk-white mb-1"
                style={{ fontSize: `${size * 0.08}px` }}
              >
                {totalEducationHours.toFixed(1)}h
              </div>
              <div
                className="text-chalk-white/70 mb-1"
                style={{ fontSize: `${size * 0.035}px` }}
              >
                {percentage}% of day
              </div>
              <div
                className="leading-tight text-chalk-white/60"
                style={{ fontSize: `${size * 0.028}px` }}
              >
                {schoolSessions.map((session, index) => (
                  <div key={index}>
                    {Math.floor(session.start)}:00 - {Math.floor(session.end)}
                    :00
                  </div>
                ))}
                {actualCramHours > 0 && (
                  <div>
                    Cram: {Math.floor(normalizedCramStartTime)}:00 -{" "}
                    {Math.floor(normalizedCramEndTime)}:00
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        className="mt-4 flex flex-wrap items-center justify-center gap-4"
        style={{ fontSize: `${size * 0.04}px` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="rounded-full"
            style={{
              width: `${size * 0.013}px`,
              height: `${size * 0.013}px`,
              backgroundColor: "#81d4fa",
            }}
          />
          <span className="text-chalk-white">School Hours</span>
        </div>
        {actualCramHours > 0 && (
          <div className="flex items-center gap-2">
            <div
              className="rounded-full"
              style={{
                width: `${size * 0.013}px`,
                height: `${size * 0.013}px`,
                backgroundColor: "#fff59d",
              }}
            />
            <span className="text-chalk-white">Cram School</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div
            className="rounded-full"
            style={{
              width: `${size * 0.013}px`,
              height: `${size * 0.013}px`,
              backgroundColor: "#2d3e30",
            }}
          />
          <span className="text-chalk-white">Other Hours</span>
        </div>
      </div>
    </div>
  );
}
