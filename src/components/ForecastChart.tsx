import React from 'react';
import type { ForecastData } from '../App';

interface ForecastChartProps {
  forecast: ForecastData[];
}

const ForecastChart: React.FC<ForecastChartProps> = ({ forecast }) => {
  if (forecast.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          <p>No forecast data available</p>
          <p className="text-sm mt-1">Backend connection may be unavailable</p>
        </div>
      </div>
    );
  }

  // --- Start of Changes ---

  // Calculate summary statistics
  const premiseIndexes = forecast.map(f => f.premiseIndex);
  const maxIndex = Math.max(...premiseIndexes);
  const minIndex = Math.min(...premiseIndexes);
  const highRiskDays = forecast.filter(f => f.premiseIndex > 60).length;

  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = 500;
  const chartHeight = 200;
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`;
  };

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="relative h-64 bg-gray-50 rounded-lg p-4">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          {/* Y-axis and grid lines */}
          {[0, 25, 50, 75, 100].map(value => {
            const y = innerHeight - (value / 100) * innerHeight + margin.top;
            return (
              <g key={value} className="text-gray-400">
                <line x1={margin.left} y1={y} x2={chartWidth - margin.right} y2={y} stroke="currentColor" strokeWidth="0.5" />
                <text x={margin.left - 8} y={y + 3} fontSize="12" fill="#6b7280" textAnchor="end">{value}%</text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {forecast.filter((_, index) => index % Math.max(1, Math.floor(forecast.length / 5)) === 0).map((data, index) => {
            const tickIndex = index * Math.max(1, Math.floor(forecast.length / 5));
            const x = margin.left + (tickIndex / (forecast.length - 1)) * innerWidth;
            return <text key={data.date} x={x} y={chartHeight - margin.bottom + 15} fontSize="12" fill="#6b7280" textAnchor="middle">{formatDate(data.date)}</text>;
          })}

          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Data line */}
            <polyline fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={forecast.map((data, index) => `${(index / (forecast.length - 1)) * innerWidth},${innerHeight - (data.premiseIndex / 100) * innerHeight}`).join(' ')} />
            
            {/* Data area fill */}
            <path fill="url(#forecastGradient)" d={`M0,${innerHeight} ${forecast.map((data, index) => `L${(index / (forecast.length - 1)) * innerWidth},${innerHeight - (data.premiseIndex / 100) * innerHeight}`).join(' ')} L${innerWidth},${innerHeight} Z`} />
          </g>
          
          <defs>
            <linearGradient id="forecastGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Forecast Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">
            {forecast.length > 0 ? Math.round(forecast.reduce((acc, f) => acc + f.premiseIndex, 0) / forecast.length) : 0}%
          </p>
          <p className="text-sm text-blue-800">Average Risk</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">{Math.round(maxIndex)}%</p>
          <p className="text-sm text-red-800">Peak Risk</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{Math.round(minIndex)}%</p>
          <p className="text-sm text-green-800">Lowest Risk</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600">{highRiskDays}</p>
          <p className="text-sm text-yellow-800">High Risk Days</p>
        </div>
      </div>

      {/* Forecast Legend */}
      <div className="text-center text-sm text-gray-600">
        <p>Predicted forecast for the next 90 days • Higher values indicate increased dengue breeding risk</p>
      </div>
    </div>
  );
};

export default ForecastChart;