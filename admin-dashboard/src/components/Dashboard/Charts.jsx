import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2e86c1', '#27ae60', '#f39c12', '#e74c3c', '#8e44ad', '#1abc9c'];

const Charts = ({ stats }) => {
  if (!stats) return null;

  const categoryData = stats.institutions_by_category || [];
  const countyData = stats.institutions_by_county || [];

  return (
    <div className="charts-container">
      <div className="chart-box">
        <h3>Institutions by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#2e86c1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-box">
        <h3>Institutions by County</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={countyData.slice(0, 10)}
              dataKey="count"
              nameKey="county__name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ county__name, count }) => `${county__name}: ${count}`}
            >
              {countyData.slice(0, 10).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;