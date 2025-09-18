import React, { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { saveAs } from 'file-saver';
import { CSVLink } from 'react-csv';
import supabase from '../lib/Supabase';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ReportsPage = () => {
  const [appointmentData, setAppointmentData] = useState([]);
  const [patientData, setPatientData] = useState([]);
  const [caseData, setCaseData] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalPatients: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Fetch appointments data
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*');
      
      // Fetch patient records data
      const { data: patients } = await supabase
        .from('patient-record')
        .select('*');
      
      // Process all data
      const monthlyAppointments = processAppointmentsByMonth(appointments || []);
      setAppointmentData(monthlyAppointments);
      
      const patientDemographics = processPatientDemographics(patients || []);
      setPatientData(patientDemographics);
      
      const caseDistribution = processCaseDistribution(patients || []);
      setCaseData(caseDistribution);
      
      // Calculate accurate summary stats
      const totalAppointments = appointments?.length || 0;
      const completedAppointments = appointments?.filter(a => a.status === 'accepted').length || 0;
      const uniquePatients = [...new Set(patients?.map(p => p.id) || [])].length;
      
      setStats({
        totalAppointments,
        totalPatients: uniquePatients,
        completionRate: totalAppointments > 0 
          ? Math.round((completedAppointments / totalAppointments) * 100)
          : 0
      });
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAppointmentsByMonth = (appointments) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Get last 6 months including current month
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last6Months.push({
        name: months[monthIndex],
        monthIndex,
        year: monthIndex > currentMonth ? currentYear - 1 : currentYear
      });
    }
    
    // Count appointments by status for each month
    return last6Months.map(month => {
      const monthAppointments = appointments.filter(appt => {
        const date = new Date(appt.created_at);
        return date.getMonth() === month.monthIndex && 
               date.getFullYear() === month.year;
      });
      
      return {
        name: month.name,
        pending: monthAppointments.filter(a => a.status === 'pending').length,
        accepted: monthAppointments.filter(a => a.status === 'accepted').length
      };
    });
  };

  const processPatientDemographics = (patients) => {
    const uniquePatientIds = [...new Set(patients.map(p => p.id))];
    const totalPatients = uniquePatientIds.length;
    
    // Count patients with multiple records
    const patientRecordCounts = {};
    patients.forEach(patient => {
      patientRecordCounts[patient.id] = (patientRecordCounts[patient.id] || 0) + 1;
    });
    
    const newPatients = Object.values(patientRecordCounts).filter(count => count === 1).length;
    
    return [
      { name: 'New Patients', value: newPatients }
    ];
  };

  const processCaseDistribution = (patients) => {
    const caseCounts = {};
    patients.forEach(patient => {
      const result = patient.result || 'Other';
      caseCounts[result] = (caseCounts[result] || 0) + 1;
    });
    
    // Sort by count and limit to top 5 categories
    return Object.entries(caseCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  };

  // Convert data to CSV format
  const appointmentCSV = [
    ['Month', 'Pending', 'Accepted'],
    ...appointmentData.map(item => [item.name, item.pending, item.accepted])
  ];

  const patientCSV = [
    ['Type', 'Count'],
    ...patientData.map(item => [item.name, item.value])
  ];

  const caseCSV = [
    ['Case Type', 'Count'],
    ...caseData.map(item => [item.name, item.value])
  ];

  const downloadAppointmentChart = () => {
    const svg = document.getElementById('appointment-chart');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        saveAs(blob, 'appointment-stats.png');
      });
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (loading) {
    return (
      <div className="ml-16 p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading reports data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-16 p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Reports Dashboard</h1>
      
      {/* Appointments Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Appointment Statistics</h2>
          <div className="flex space-x-2">
            <button 
              onClick={downloadAppointmentChart}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Download Chart
            </button>
            <CSVLink 
              data={appointmentCSV} 
              filename="appointment-stats.csv"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Download CSV
            </CSVLink>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              id="appointment-chart"
              data={appointmentData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pending" fill="#8884d8" name="Pending" />
              <Bar dataKey="accepted" fill="#82ca9d" name="Accepted" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Patients and Cases Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Patient Demographics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">Patient Demographics</h2>
            <CSVLink 
              data={patientCSV} 
              filename="patient-stats.csv"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Download CSV
            </CSVLink>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, left: 100, bottom: 30 }}>
                <Pie
                  data={patientData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {patientData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} patients`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Case Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">Case Distribution</h2>
            <CSVLink 
              data={caseCSV} 
              filename="case-stats.csv"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Download CSV
            </CSVLink>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 30 }}>
                <Pie
                  data={caseData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => {
                    if (percent < 0.1) return null;
                    return `${name}: ${(percent * 100).toFixed(0)}%`;
                  }}
                >
                  {caseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} cases`]} />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 font-medium">Total Appointments</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalAppointments}</p>
          <p className="text-sm text-gray-500 mt-2">All time</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 font-medium">Total Patients</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalPatients}</p>
          <p className="text-sm text-gray-500 mt-2">All time</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 font-medium">Completion Rate</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.completionRate}%</p>
          <p className="text-sm text-gray-500 mt-2">All time</p>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;