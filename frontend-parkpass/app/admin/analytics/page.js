'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { formatINR } from '../../../utils/currency';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [salesData, setSalesData] = useState(null);
  const [visitorData, setVisitorData] = useState(null);
  const [parkPopularity, setParkPopularity] = useState(null);

  useEffect(() => {
    // Check if user is logged in and has the right role
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        toast.error('You must be logged in to access this page');
        router.push('/admin');
        return;
      }
      
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Check if user has the right role
        if (parsedUser.role !== 'super-admin') {
          toast.error('You do not have permission to access this page');
          router.push('/admin');
          return;
        }

        // Fetch analytics data
        fetchAnalyticsData(token);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/admin');
      }
    };
    
    checkAuth();
  }, [router, selectedPeriod]);

  const fetchAnalyticsData = async (token) => {
    try {
      setIsLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      
      // Fetch sales data
      const salesResponse = await axios.get(`${API_URL}/analytics/sales?period=${selectedPeriod}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch visitor data
      const visitorResponse = await axios.get(`${API_URL}/analytics/visitors?period=${selectedPeriod}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch park popularity
      const popularityResponse = await axios.get(`${API_URL}/analytics/popularity`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (salesResponse.data.success) {
        setSalesData(salesResponse.data.data);
      }
      
      if (visitorResponse.data.success) {
        setVisitorData(visitorResponse.data.data);
      }
      
      if (popularityResponse.data.success) {
        setParkPopularity({ popularParks: popularityResponse.data.data });
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/admin');
  };

  const handleBackToDashboard = () => {
    router.push('/admin/dashboard');
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'white'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        ticks: {
          color: 'white'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'white',
          font: {
            size: 12
          },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1
      }
    }
  };

  // Prepare chart data
  const getSalesChartData = () => {
    if (!salesData || !salesData.salesByDate) return null;

    const labels = salesData.salesByDate.map(item => {
      if (selectedPeriod === 'daily') return `${item._id}:00`;
      if (selectedPeriod === 'weekly') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[item._id - 1];
      }
      if (selectedPeriod === 'monthly') return `Day ${item._id}`;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months[item._id - 1];
    });

    const data = salesData.salesByDate.map(item => item.total);

    return {
      labels,
      datasets: [
        {
          label: 'Sales (₹)',
          data,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }
      ]
    };
  };

  const getVisitorChartData = () => {
    if (!visitorData || !visitorData.visitorsByDate) return null;

    const labels = visitorData.visitorsByDate.map(item => {
      if (selectedPeriod === 'daily') return `${item._id}:00`;
      if (selectedPeriod === 'weekly') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[item._id - 1];
      }
      if (selectedPeriod === 'monthly') return `Day ${item._id}`;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months[item._id - 1];
    });

    return {
      labels,
      datasets: [
        {
          label: 'Adults',
          data: visitorData.visitorsByDate.map(item => item.adults || 0),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2
        },
        {
          label: 'Children',
          data: visitorData.visitorsByDate.map(item => item.children || 0),
          backgroundColor: 'rgba(168, 85, 247, 0.8)',
          borderColor: 'rgb(168, 85, 247)',
          borderWidth: 2
        }
      ]
    };
  };

  const getParkPopularityData = () => {
    if (!parkPopularity || !parkPopularity.popularParks) return null;

    const colors = [
      'rgba(239, 68, 68, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(168, 85, 247, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(14, 165, 233, 0.8)',
      'rgba(139, 69, 19, 0.8)'
    ];

    return {
      labels: parkPopularity.popularParks.map(park => park.park?.name || 'Unknown Park'),
      datasets: [
        {
          data: parkPopularity.popularParks.map(park => park.visitorsCount || 0),
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('0.8', '1')),
          borderWidth: 2
        }
      ]
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToDashboard}
              className="px-4 py-2 bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 text-white hover:bg-white/30 transition-all duration-300 flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
              <span className="text-4xl">📊</span>
              <span>Analytics Dashboard</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-white/80">
              Welcome, {user?.name || 'Admin'}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 backdrop-blur-lg rounded-xl border border-red-300/20 text-white hover:bg-red-500/30 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Period Selection */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <span>📅</span>
              <span>Time Period</span>
            </h2>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'daily', label: 'Today', icon: '🌅' },
                { key: 'weekly', label: 'This Week', icon: '📅' },
                { key: 'monthly', label: 'This Month', icon: '🗓️' },
                { key: 'yearly', label: 'This Year', icon: '📆' }
              ].map((period) => (
                <button
                  key={period.key}
                  onClick={() => handlePeriodChange(period.key)}
                  className={`px-6 py-3 rounded-xl border transition-all duration-300 flex items-center space-x-2 ${
                    selectedPeriod === period.key
                      ? 'bg-blue-500/30 border-blue-300/50 text-blue-200'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <span>{period.icon}</span>
                  <span>{period.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Sales */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Sales</p>
                <p className="text-3xl font-bold text-white">
                  {salesData ? formatINR(salesData.totalSales) : '₹0'}
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          {/* Total Visitors */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Visitors</p>
                <p className="text-3xl font-bold text-white">
                  {visitorData ? visitorData.totalVisitors.total : 0}
                </p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          {/* Popular Parks */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Active Parks</p>
                <p className="text-3xl font-bold text-white">
                  {parkPopularity ? parkPopularity.popularParks.length : 0}
                </p>
              </div>
              <div className="text-4xl">🏞️</div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <span>📈</span>
              <span>Sales Trend</span>
            </h3>
            <div className="h-80">
              {getSalesChartData() ? (
                <Line data={getSalesChartData()} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-white/60">
                  No sales data available
                </div>
              )}
            </div>
          </div>

          {/* Visitor Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <span>👥</span>
              <span>Visitor Analytics</span>
            </h3>
            <div className="h-80">
              {getVisitorChartData() ? (
                <Bar data={getVisitorChartData()} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-white/60">
                  No visitor data available
                </div>
              )}
            </div>
          </div>

          {/* Park Popularity Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <span>🏆</span>
              <span>Park Popularity</span>
            </h3>
            <div className="h-80">
              {getParkPopularityData() ? (
                <Doughnut data={getParkPopularityData()} options={doughnutOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-white/60">
                  No park data available
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;
