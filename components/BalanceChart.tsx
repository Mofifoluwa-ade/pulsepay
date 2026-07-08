'use client';

import React, { useState, useMemo } from 'react';
import { Transaction } from '../lib/types';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

interface BalanceChartProps {
  transactions: Transaction[];
  currentBalance: number;
}

export default function BalanceChart({ transactions, currentBalance }: BalanceChartProps) {
  const [hoverData, setHoverData] = useState<{ date: Date; balance: number; x: number; y: number } | null>(null);

  // Define SVG dimensions and margins
  const width = 600;
  const height = 200;
  const margin = { top: 15, right: 15, bottom: 25, left: 50 };

  // Reconstruct historical data
  const data = useMemo(() => {
    const now = new Date();
    
    // Generate dates for the last 30 days (index 0 is 30 days ago, index 30 is today)
    const dates: Date[] = [];
    for (let i = 30; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0); // Start of day
      dates.push(d);
    }

    // Parse transaction timestamps and sort descending (newest first)
    const parsedTxs = transactions
      .map(tx => {
        const dateStr = tx.timestamp.replace(' ', 'T');
        return {
          ...tx,
          date: new Date(dateStr),
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    let runningBalance = currentBalance;
    const points: { date: Date; balance: number }[] = new Array(31);
    points[30] = { date: dates[30], balance: runningBalance };

    let txIndex = 0;

    // Work backwards day-by-day
    for (let i = 29; i >= 0; i--) {
      const nextDayStart = dates[i + 1];
      
      // Revert any transaction that occurred on day i+1 or later
      while (txIndex < parsedTxs.length && parsedTxs[txIndex].date >= nextDayStart) {
        const tx = parsedTxs[txIndex];
        if (tx.type === 'send') {
          runningBalance += tx.amount;
        } else if (tx.type === 'receive') {
          runningBalance -= tx.amount;
        }
        txIndex++;
      }
      points[i] = { date: dates[i], balance: runningBalance };
    }

    return points;
  }, [transactions, currentBalance]);

  // Set up D3 scales
  const xScale = useMemo(() => {
    return d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);
  }, [data]);

  const yScale = useMemo(() => {
    const yMin = d3.min(data, d => d.balance) || 0;
    const yMax = d3.max(data, d => d.balance) || 1000;
    // Add 15% padding to the top and bottom of the domain range
    const pad = (yMax - yMin) * 0.15 || 100;
    return d3.scaleLinear()
      .domain([Math.max(0, yMin - pad), yMax + pad])
      .range([height - margin.bottom, margin.top]);
  }, [data]);

  // Generate SVG path string
  const linePath = useMemo(() => {
    const lineGenerator = d3.line<{ date: Date; balance: number }>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.balance))
      .curve(d3.curveMonotoneX); // Smooth spline curve
    return lineGenerator(data) || '';
  }, [data, xScale, yScale]);

  // Generate Area path for gradient background
  const areaPath = useMemo(() => {
    const areaGenerator = d3.area<{ date: Date; balance: number }>()
      .x(d => xScale(d.date))
      .y0(height - margin.bottom)
      .y1(d => yScale(d.balance))
      .curve(d3.curveMonotoneX);
    return areaGenerator(data) || '';
  }, [data, xScale, yScale]);

  // Generate Tick elements
  const yTicks = useMemo(() => yScale.ticks(4), [yScale]);
  const xTicks = useMemo(() => xScale.ticks(5), [xScale]);
  const formatDate = d3.timeFormat('%b %d');

  // Handle Mouse Hover tracking
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const svgEl = e.currentTarget;
    const rect = svgEl.getBoundingClientRect();
    
    // Extract cursor coordinate relative to SVG container bounding box
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * width;

    // Invert X scale to find corresponding Date
    const date = xScale.invert(svgX);

    // Bisect data to find closest date point
    const bisect = d3.bisector<{ date: Date; balance: number }, Date>(d => d.date).left;
    const index = bisect(data, date, 1);
    const d0 = data[index - 1];
    const d1 = data[index];

    let closest = d0;
    if (d1 && date.getTime() - d0.date.getTime() > d1.date.getTime() - date.getTime()) {
      closest = d1;
    }

    if (closest) {
      setHoverData({
        date: closest.date,
        balance: closest.balance,
        x: xScale(closest.date),
        y: yScale(closest.balance),
      });
    }
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5 shadow-lg relative select-none">
      
      {/* Header Info */}
      <div className="flex justify-between items-baseline mb-4">
        <div>
          <h3 className="font-mono text-[9px] uppercase tracking-widest text-[#b7b5b4]/60">Historical Balance</h3>
          <span className="font-sans text-xs text-[#b7b5b4]/40">Last 30 days trend</span>
        </div>
        {hoverData ? (
          <div className="text-right leading-none">
            <span className="font-mono text-[9px] text-[#b7b5b4]/40 uppercase block mb-0.5">
              {formatDate(hoverData.date)}
            </span>
            <span className="font-sans text-xs font-bold text-[#C1121F]">
              ${hoverData.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        ) : (
          <div className="text-right leading-none">
            <span className="font-mono text-[9px] text-[#b7b5b4]/40 uppercase block mb-0.5">
              Current
            </span>
            <span className="font-sans text-xs font-bold text-[#F5F5F5]">
              ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      {/* SVG Container */}
      <div className="h-44 w-full relative">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full cursor-crosshair overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C1121F" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#C1121F" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <g>
            {yTicks.map((tick, i) => (
              <line 
                key={i}
                x1={margin.left}
                y1={yScale(tick)}
                x2={width - margin.right}
                y2={yScale(tick)}
                stroke="#2A2A2A"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            ))}
          </g>

          {/* Glowing Area Fill */}
          <path 
            d={areaPath} 
            fill="url(#areaGradient)" 
            className="transition-all duration-300"
          />

          {/* Main Red Spline Curve */}
          <motion.path 
            d={linePath} 
            fill="none" 
            stroke="#C1121F" 
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />

          {/* X Axis Ticks */}
          <g>
            {xTicks.map((tick, i) => (
              <text
                key={i}
                x={xScale(tick)}
                y={height - 5}
                className="fill-[#b7b5b4]/30 font-mono text-[8px] uppercase text-anchor-middle text-center"
                textAnchor="middle"
              >
                {formatDate(tick)}
              </text>
            ))}
          </g>

          {/* Y Axis Ticks */}
          <g>
            {yTicks.map((tick, i) => (
              <text
                key={i}
                x={margin.left - 8}
                y={yScale(tick) + 3}
                className="fill-[#b7b5b4]/30 font-mono text-[8px]"
                textAnchor="end"
              >
                ${d3.format(',.0f')(tick)}
              </text>
            ))}
          </g>

          {/* Interactive Hover elements */}
          {hoverData && (
            <g>
              {/* Vertical Guide Guideline */}
              <line 
                x1={hoverData.x}
                y1={margin.top}
                x2={hoverData.x}
                y2={height - margin.bottom}
                stroke="#C1121F"
                strokeWidth="1"
                strokeDasharray="2,2"
                strokeOpacity="0.4"
              />

              {/* Glowing Dot on path */}
              <circle 
                cx={hoverData.x}
                cy={hoverData.y}
                r="4.5"
                fill="#C1121F"
                stroke="#F5F5F5"
                strokeWidth="1.5"
                className="animate-pulse"
              />
            </g>
          )}

        </svg>
      </div>

    </div>
  );
}
