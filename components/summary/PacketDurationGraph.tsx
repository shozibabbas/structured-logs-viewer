/**
 * Packet duration line graph
 * X-axis: Packet numbers, Y-axis: Duration
 */

import React, { useMemo } from 'react';
import type { PacketDurationSummary } from '@/types/summary.types';
import { formatPacketDurationMs, formatPacketId } from '@/utils/ui.utils';

interface PacketDurationGraphProps {
  items: PacketDurationSummary[];
  packetColors?: Record<string, string>;
}

interface GraphPoint {
  duration: number;
  packetId: string;
}

interface GraphData {
  points: GraphPoint[];
  maxDuration: number;
  avgDuration: number;
  yAxisLabels: string[];
  xAxisLabels: string[];
}

export function PacketDurationGraph({ items, packetColors = {} }: PacketDurationGraphProps) {
  const graphData = useMemo(() => calculateGraphData(items), [items]);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
        No packet durations available.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-visible">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Packet Processing Duration
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {items.length} packet{items.length !== 1 ? 's' : ''} • Avg: {formatPacketDurationMs(graphData.avgDuration)} • Max: {formatPacketDurationMs(graphData.maxDuration)}
        </p>
      </div>
      <div className="p-6 overflow-visible">
        <div className="w-full overflow-y-visible pb-4">
          <PacketGraph data={graphData} packetColors={packetColors} />
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-500"></div>
            <span>Processing duration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Hover for details</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PacketGraphProps {
  data: GraphData;
  packetColors: Record<string, string>;
}

function PacketGraph({ data: graphData, packetColors }: PacketGraphProps) {
  const graphHeight = 400;
  const graphWidth = 1200; // Reference width for viewBox
  const padding = { top: 40, right: 40, bottom: 60, left: 70 };
  const chartHeight = graphHeight - padding.top - padding.bottom;
  const chartWidth = graphWidth - padding.left - padding.right;

  return (
    <svg
      viewBox={`0 0 ${graphWidth} ${graphHeight}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Y-axis grid lines */}
      {graphData.yAxisLabels.map((label: string, index: number) => {
        const y = padding.top + (chartHeight * index) / (graphData.yAxisLabels.length - 1);
        return (
          <g key={`grid-${index}`}>
            <line
              x1={padding.left}
              y1={y}
              x2={padding.left + chartWidth}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x={padding.left - 10}
              y={y}
              textAnchor="end"
              alignmentBaseline="middle"
              className="text-xs fill-gray-600"
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* X-axis */}
      <line
        x1={padding.left}
        y1={padding.top + chartHeight}
        x2={padding.left + chartWidth}
        y2={padding.top + chartHeight}
        stroke="#374151"
        strokeWidth="2"
      />

      {/* Y-axis */}
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={padding.top + chartHeight}
        stroke="#374151"
        strokeWidth="2"
      />

      {/* Line graph */}
      <polyline
        points={graphData.points.map((point: GraphPoint, index: number) => {
          const x = padding.left + (chartWidth * index) / Math.max(graphData.points.length - 1, 1);
          const y = padding.top + chartHeight - (chartHeight * point.duration) / graphData.maxDuration;
          return `${x},${y}`;
        }).join(' ')}
        fill="none"
        stroke="#9ca3af"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {graphData.points.map((point: GraphPoint, index: number) => {
        const x = padding.left + (chartWidth * index) / Math.max(graphData.points.length - 1, 1);
        const y = padding.top + chartHeight - (chartHeight * point.duration) / graphData.maxDuration;
        const pointColor = packetColors[point.packetId] || '#3b82f6';

        return (
          <g key={`point-${index}`} className="group cursor-pointer">
            <circle
              cx={x}
              cy={y}
              r="4"
              fill={pointColor}
              className="transition-all"
            />
            <circle
              cx={x}
              cy={y}
              r="8"
              fill={pointColor}
              fillOpacity="0.2"
              className="group-hover:fill-opacity-40"
            />
            {/* Tooltip on hover */}
            <g className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              <rect
                x={x - 60}
                y={y + 10}
                width="120"
                height="40"
                fill="#1f2937"
                rx="4"
                className="drop-shadow-lg"
              />
              <text
                x={x}
                y={y + 25}
                textAnchor="middle"
                className="text-xs fill-white font-semibold"
              >
                {formatPacketId(point.packetId)}
              </text>
              <text
                x={x}
                y={y + 40}
                textAnchor="middle"
                className="text-xs fill-gray-300"
              >
                {formatPacketDurationMs(point.duration)}
              </text>
            </g>
          </g>
        );
      })}

      {/* X-axis labels */}
      {graphData.xAxisLabels.map((label: string, index: number) => {
        const x = padding.left + (chartWidth * index) / (graphData.xAxisLabels.length - 1);
        return (
          <text
            key={`x-label-${index}`}
            x={x}
            y={padding.top + chartHeight + 20}
            textAnchor="middle"
            className="text-xs fill-gray-600"
          >
            {label}
          </text>
        );
      })}

      {/* Axis labels */}
      <text
        x={graphWidth / 2}
        y={graphHeight - 5}
        textAnchor="middle"
        className="text-sm fill-gray-700 font-semibold"
      >
        Packet Number
      </text>
      <text
        x={15}
        y={graphHeight / 2}
        textAnchor="middle"
        className="text-sm fill-gray-700 font-semibold"
        transform={`rotate(-90 15 ${graphHeight / 2})`}
      >
        Duration (ms)
      </text>
    </svg>
  );
}

function calculateGraphData(items: PacketDurationSummary[]): GraphData {
  const sortedItems = [...items].sort((a, b) =>
    parseTimestamp(a.startTimestamp).getTime() - parseTimestamp(b.startTimestamp).getTime()
  );

  const maxDuration = Math.max(...sortedItems.map((item) => item.durationMs));
  const avgDuration = sortedItems.reduce((sum, item) => sum + item.durationMs, 0) / sortedItems.length;

  // Calculate points (only store data, not coordinates)
  const points: GraphPoint[] = sortedItems.map((item) => ({
    duration: item.durationMs,
    packetId: item.packetId,
  }));

  // Y-axis labels (duration)
  const ySteps = 5;
  const yAxisLabels = Array.from({ length: ySteps }, (_, i) => {
    const value = maxDuration - (maxDuration * i) / (ySteps - 1);
    return formatPacketDurationMs(value);
  });

  // X-axis labels (packet numbers)
  const xSteps = Math.min(10, sortedItems.length);
  const xAxisLabels = Array.from({ length: xSteps }, (_, i) => {
    const index = Math.floor((sortedItems.length - 1) * i / (xSteps - 1));
    return `#${index + 1}`;
  });

  return {
    points,
    maxDuration,
    avgDuration,
    yAxisLabels,
    xAxisLabels,
  };
}

function parseTimestamp(timestamp: string): Date {
  return new Date(timestamp.replace(',', '.'));
}
