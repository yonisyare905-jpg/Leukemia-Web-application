import React, { useEffect, useState } from "react";
import supabase from "../lib/Supabase";
import { useAuth } from "../context/AuthContext";
import {
  FiUsers,
  FiCalendar,
  FiActivity,
  FiUser,
  FiUserCheck,
  FiPlus,
} from "react-icons/fi";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardViewPage = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalCases: 0,
    malePatients: 0,
    femalePatients: 0,
    pendingAppointments: 0,
    acceptedAppointments: 0,
    normalCases: 0,
    allCases: 0,
    totalDoctors: 0,
    patientAppointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [patientChartData, setPatientChartData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    if (profile?.role !== "patient") {
      fetchInitialActivities();
      setupRealtimeSubscriptions();
    }

    return () => {
      supabase.removeAllChannels();
    };
  }, [profile?.role]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (profile?.role === "patient") {
        // Patient-specific data
        const { count: patientAppointmentCount } = await supabase
          .from("appointments")
          .select("*", { count: "exact" })
          .eq("user_id", user.id);

        // Get patient's appointments for last 3 months
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const { data: patientAppointments } = await supabase
          .from("appointments")
          .select("*")
          .eq("user_id", user.id)
          .gte("created_at", threeMonthsAgo.toISOString());

        setStats(prev => ({
          ...prev,
          patientAppointments: patientAppointmentCount || 0,
        }));

        preparePatientChartData(patientAppointments || []);
        return;
      }

      // Admin/User data
      const [
        { count: patientCount },
        { count: appointmentCount },
        { count: caseCount },
        { data: genderData },
        { count: pendingCount },
        { count: acceptedCount },
        { count: normalCasesCount },
        { count: allCasesCount },
        { data: monthlyData },
        { count: doctorCount },
      ] = await Promise.all([
        supabase.from("patient-record").select("*", { count: "exact" }),
        supabase.from("appointments").select("*", { count: "exact" }),
        supabase.from("patient-record").select("*", { count: "exact" }),
        supabase.from("patient-record").select("gender"),
        supabase
          .from("appointments")
          .select("*", { count: "exact" })
          .or("status.eq.pending,status.is.null"),
        supabase
          .from("appointments")
          .select("*", { count: "exact" })
          .eq("status", "accepted"),
        supabase.from("patient-record").select("*", { count: "exact" }).eq("result", "Normal"),
        supabase.from("patient-record").select("*", { count: "exact" }).eq("result", "ALL"),
        getMonthlyCaseData(),
        profile?.role === "admin" 
          ? supabase.from("doctor-management").select("*", { count: "exact" })
          : { count: 0 },
      ]);

      const maleCount = genderData.filter(
        (p) => p.gender?.toLowerCase() === "male"
      ).length;
      const femaleCount = genderData.filter(
        (p) => p.gender?.toLowerCase() === "female"
      ).length;

      setStats({
        totalPatients: patientCount || 0,
        totalAppointments: appointmentCount || 0,
        totalCases: caseCount || 0,
        malePatients: maleCount,
        femalePatients: femaleCount,
        pendingAppointments: pendingCount || 0,
        acceptedAppointments: acceptedCount || 0,
        normalCases: normalCasesCount || 0,
        allCases: allCasesCount || 0,
        totalDoctors: doctorCount || 0,
      });

      prepareChartData(monthlyData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const preparePatientChartData = (appointments) => {
    if (!appointments?.length) {
      console.log("No patient appointment data");
      return;
    }

    const months = [];
    const currentDate = new Date();

    for (let i = 2; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      months.push(date.toLocaleString("default", { month: "short" }));
    }

    const appointmentCounts = months.map((month) => {
      return appointments.filter((appt) => {
        try {
          if (!appt?.created_at) return false;
          const itemDate = new Date(appt.created_at);
          return (
            itemDate.toLocaleString("default", { month: "short" }) === month
          );
        } catch (e) {
          console.error("Error processing date:", appt?.created_at, e);
          return false;
        }
      }).length;
    });

    setPatientChartData({
      labels: months,
      datasets: [
        {
          label: "Your Appointments",
          data: appointmentCounts,
          backgroundColor: "rgba(104, 117, 245, 0.8)",
          borderColor: "rgba(104, 117, 245, 1)",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    });
  };

  const fetchInitialActivities = async () => {
    try {
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: patients } = await supabase
        .from('patient-record')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      const activities = [
        ...appointments.map(app => ({
          type: 'appointment',
          event: 'created',
          data: app,
          timestamp: app.created_at || new Date().toISOString()
        })),
        ...patients.map(pat => ({
          type: 'patient',
          event: 'created',
          data: pat,
          timestamp: pat.created_at || new Date().toISOString()
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
       .slice(0, 5);

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching initial activities:', error);
    }
  };

  const setupRealtimeSubscriptions = () => {
    console.log('Setting up realtime subscriptions...');
    
    const appointmentSubscription = supabase
      .channel("appointments_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
        },
        (payload) => {
          console.log('Appointment change detected:', payload);
          const activity = {
            type: "appointment",
            event: payload.eventType,
            data: payload.new,
            timestamp: new Date().toISOString(),
          };
          setRecentActivities((prev) => [activity, ...prev.slice(0, 4)]);
        }
      )
      .subscribe()
      .on('error', error => {
        console.error('Appointment subscription error:', error);
      });

    const patientSubscription = supabase
      .channel("patients_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "patient-record",
        },
        (payload) => {
          console.log('Patient change detected:', payload);
          const activity = {
            type: "patient",
            event: payload.eventType,
            data: payload.new,
            timestamp: new Date().toISOString(),
          };
          setRecentActivities((prev) => [activity, ...prev.slice(0, 4)]);
        }
      )
      .subscribe()
      .on('error', error => {
        console.error('Patient subscription error:', error);
      });

    const doctorSubscription = supabase
      .channel("doctors_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "doctor-management",
        },
        (payload) => {
          console.log('Doctor change detected:', payload);
          const activity = {
            type: "doctor",
            event: payload.eventType,
            data: payload.new,
            timestamp: new Date().toISOString(),
          };
          setRecentActivities((prev) => [activity, ...prev.slice(0, 4)]);
          fetchDashboardData();
        }
      )
      .subscribe()
      .on('error', error => {
        console.error('Doctor subscription error:', error);
      });
  };

  const getMonthlyCaseData = async () => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data, error } = await supabase
      .from("patient-record")
      .select("created_at, result")
      .gte("created_at", threeMonthsAgo.toISOString());

    if (error) {
      console.error("Error fetching monthly data:", error);
      return { data: [], error };
    }

    return { data, error };
  };

  const prepareChartData = (monthlyDataResponse) => {
    const monthlyData = Array.isArray(monthlyDataResponse)
      ? monthlyDataResponse
      : monthlyDataResponse?.data || [];

    if (!monthlyData.length) {
      console.log("No valid monthly data:", monthlyData);
      return;
    }

    const months = [];
    const currentDate = new Date();

    for (let i = 2; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      months.push(date.toLocaleString("default", { month: "short" }));
    }

    const caseTypes = [...new Set(monthlyData.map((item) => item.result))];

    const datasets = caseTypes.map((caseType) => {
      const caseCounts = months.map((month) => {
        return monthlyData.filter((item) => {
          try {
            if (!item?.created_at || item.result !== caseType) return false;
            const itemDate = new Date(item.created_at);
            return (
              itemDate.toLocaleString("default", { month: "short" }) === month
            );
          } catch (e) {
            console.error("Error processing date:", item?.created_at, e);
            return false;
          }
        }).length;
      });

      const color = `hsl(${Math.random() * 360}, 70%, 50%)`;

      return {
        label: caseType,
        data: caseCounts,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
        borderRadius: 4,
      };
    });

    setChartData({
      labels: months,
      datasets,
    });
  };

  const patientCardData = [
    {
      title: "Your Appointments",
      value: stats.patientAppointments,
      icon: <FiCalendar className="text-2xl" />,
      color: "bg-blue-100 text-blue-600",
    },
  ];

  const adminCardData = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: <FiUsers className="text-2xl" />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      icon: <FiCalendar className="text-2xl" />,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total Cases",
      value: stats.totalCases,
      icon: <FiActivity className="text-2xl" />,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Normal Cases",
      value: stats.normalCases,
      icon: <FiActivity className="text-2xl" />,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "ALL Cases",
      value: stats.allCases,
      icon: <FiActivity className="text-2xl" />,
      color: "bg-red-100 text-red-600",
    },
  ];

  const userCardData = [
    {
      title: "Patients Recorded",
      value: stats.totalPatients,
      icon: <FiUsers className="text-2xl" />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      icon: <FiCalendar className="text-2xl" />,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total Cases",
      value: stats.totalCases,
      icon: <FiActivity className="text-2xl" />,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Normal Cases",
      value: stats.normalCases,
      icon: <FiActivity className="text-2xl" />,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "ALL Cases",
      value: stats.allCases,
      icon: <FiActivity className="text-2xl" />,
      color: "bg-red-100 text-red-600",
    },
  ];

  if (profile?.role === "admin") {
    adminCardData.push({
      title: "Total Doctors",
      value: stats.totalDoctors,
      icon: <FiPlus className="text-2xl" />,
      color: "bg-indigo-100 text-indigo-600",
    });
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "appointment":
        return <FiCalendar />;
      case "patient":
        return <FiActivity />;
      case "doctor":
        return <FiUser />;
      default:
        return <FiActivity />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "appointment":
        return "bg-blue-100 text-blue-600";
      case "patient":
        return "bg-fuchsia-100 text-fuchsia-600";
      case "doctor":
        return "bg-indigo-100 text-indigo-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatActivityMessage = (activity) => {
    switch (activity.type) {
      case "appointment":
        return `Appointment ${activity.event} for ${activity.data.patient_name || 'unknown patient'}`;
      case "patient":
        return `Patient record ${activity.event}: ${activity.data.name || 'unknown patient'}`;
      case "doctor":
        return `Doctor ${activity.event}: ${activity.data.name || 'unknown doctor'}`;
      default:
        return `${activity.type} ${activity.event}`;
    }
  };

  return (
    <div className="ml-16 px-4 py-6 min-h-screen bg-gray-50">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-600"></div>
        </div>
      ) : (
        <>
          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {profile?.role === "patient" ? (
              patientCardData.map((card, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-6 flex items-center"
                >
                  <div className={`rounded-full p-3 mr-4 ${card.color}`}>
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">
                      {card.title}
                    </h3>
                    <p className="text-2xl font-bold text-gray-800">
                      {card.value}
                    </p>
                  </div>
                </div>
              ))
            ) : profile?.role === "user" ? (
              userCardData.map((card, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-6 flex items-center"
                >
                  <div className={`rounded-full p-3 mr-4 ${card.color}`}>
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">
                      {card.title}
                    </h3>
                    <p className="text-2xl font-bold text-gray-800">
                      {card.value}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              adminCardData.map((card, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-6 flex items-center"
                >
                  <div className={`rounded-full p-3 mr-4 ${card.color}`}>
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-gray-500 text-sm font-medium">
                      {card.title}
                    </h3>
                    <p className="text-2xl font-bold text-gray-800">
                      {card.value}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Patient View */}
          {profile?.role === "patient" && patientChartData && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Your Appointments in Last 3 Months
              </h3>
              <div className="h-64">
                <Bar
                  data={patientChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* Admin/User View */}
          {(profile?.role === "admin" || profile?.role === "user") && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Patient Gender Distribution
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-gray-600">Male</span>
                    </div>
                    <span className="font-medium">{stats.malePatients}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full"
                      style={{
                        width: `${
                          stats.totalPatients
                            ? (stats.malePatients / stats.totalPatients) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                      <span className="text-gray-600">Female</span>
                    </div>
                    <span className="font-medium">{stats.femalePatients}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
                    <div
                      className="bg-pink-500 h-2.5 rounded-full"
                      style={{
                        width: `${
                          stats.totalPatients
                            ? (stats.femalePatients / stats.totalPatients) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Appointment Status
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span className="text-gray-600">Pending</span>
                    </div>
                    <span className="font-medium">{stats.pendingAppointments}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
                    <div
                      className="bg-yellow-500 h-2.5 rounded-full"
                      style={{
                        width: `${
                          stats.totalAppointments
                            ? (stats.pendingAppointments /
                                stats.totalAppointments) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-gray-600">Accepted</span>
                    </div>
                    <span className="font-medium">
                      {stats.acceptedAppointments}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{
                        width: `${
                          stats.totalAppointments
                            ? (stats.acceptedAppointments /
                                stats.totalAppointments) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {chartData && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Cases in Last 3 Months
                  </h3>
                  <div className="h-64">
                    <Bar
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1,
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardViewPage;