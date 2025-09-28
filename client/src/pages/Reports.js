import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  Download, 
  Calendar, 
  BarChart3,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [annualPlans, setAnnualPlans] = useState([]);
  const [monthlyPlans, setMonthlyPlans] = useState([]);
  const [lessonPreps, setLessonPreps] = useState([]);
  const [stats, setStats] = useState({
    totalPlans: 0,
    completedPlans: 0,
    pendingPlans: 0,
    thisMonthPreps: 0,
    totalRealization: 0,
    averageRealization: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [annualResponse, monthlyResponse, prepsResponse] = await Promise.all([
        axios.get('/api/annual-plans'),
        axios.get('/api/monthly-plans'),
        axios.get('/api/lesson-preps')
      ]);

      setAnnualPlans(annualResponse.data);
      setMonthlyPlans(monthlyResponse.data);
      setLessonPreps(prepsResponse.data);

      // Calculate stats
      const currentMonth = new Date().getMonth() + 1;
      const thisMonthPreps = prepsResponse.data.filter(prep => 
        new Date(prep.datum).getMonth() + 1 === currentMonth
      );

      const totalRealization = monthlyResponse.data.reduce((sum, plan) => 
        sum + plan.realizacija.procenat, 0
      );
      const averageRealization = monthlyResponse.data.length > 0 
        ? totalRealization / monthlyResponse.data.length 
        : 0;

      setStats({
        totalPlans: annualResponse.data.length,
        completedPlans: annualResponse.data.filter(plan => plan.status === 'approved').length,
        pendingPlans: annualResponse.data.filter(plan => plan.status === 'draft').length,
        thisMonthPreps: thisMonthPreps.length,
        totalRealization,
        averageRealization: Math.round(averageRealization)
      });
    } catch (error) {
      console.error('Greška pri dohvatanju podataka:', error);
      toast.error('Greška pri dohvatanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAllPlans = async () => {
    try {
      // Export all annual plans
      for (const plan of annualPlans) {
        const response = await axios.post(`/api/export/annual-plan/${plan._id}/pdf`, {}, {
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `godisnji-plan-${plan.predmet}-${plan.schoolYear}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast.success('Svi godišnji planovi su eksportovani');
    } catch (error) {
      toast.error('Greška pri export-u planova');
    }
  };

  const handleExportMonthlyPlans = async () => {
    try {
      // Export all monthly plans
      for (const plan of monthlyPlans) {
        const response = await axios.post(`/api/export/monthly-plan/${plan._id}/pdf`, {}, {
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `mesecni-plan-${plan.mesec}-${plan.godina}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast.success('Svi mesečni planovi su eksportovani');
    } catch (error) {
      toast.error('Greška pri export-u mesečnih planova');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'submitted': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Odobren';
      case 'submitted': return 'Poslat na odobrenje';
      case 'draft': return 'Nacrt';
      default: return 'Nepoznato';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Izveštaji i statistike</h1>
        <p className="text-gray-600">Pregled vaših planova, realizacije i aktivnosti</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ukupno planova</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPlans}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Odobreni planovi</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedPlans}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Na čekanju</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingPlans}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Prosečna realizacija</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRealization}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Export opcije</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleExportAllPlans}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            <Download className="h-5 w-5" />
            <span>Export svi godišnji planovi</span>
          </button>
          
          <button
            onClick={handleExportMonthlyPlans}
            className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            <Download className="h-5 w-5" />
            <span>Export svi mesečni planovi</span>
          </button>
        </div>
      </div>

      {/* Annual Plans Report */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Godišnji planovi</h2>
        </div>
        <div className="p-6">
          {annualPlans.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nemate kreiranih godišnjih planova</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Predmet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Razredi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Školska godina
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kreiran
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {annualPlans.map((plan) => (
                    <tr key={plan._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {plan.predmet}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {plan.razredi.join(', ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {plan.schoolYear}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plan.status)}`}>
                          {getStatusText(plan.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(plan.createdAt).toLocaleDateString('sr-RS')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Plans Report */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Mesečni planovi</h2>
        </div>
        <div className="p-6">
          {monthlyPlans.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nemate kreiranih mesečnih planova</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mesec
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Predmet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Realizacija
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {monthlyPlans.map((plan) => (
                    <tr key={plan._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {plan.mesec} {plan.godina}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {plan.annualPlanId?.predmet}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${plan.realizacija.procenat}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">{plan.realizacija.procenat}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          plan.status === 'completed' ? 'text-green-600 bg-green-100' :
                          plan.status === 'in_progress' ? 'text-yellow-600 bg-yellow-100' :
                          'text-gray-600 bg-gray-100'
                        }`}>
                          {plan.status === 'completed' ? 'Završeno' :
                           plan.status === 'in_progress' ? 'U toku' : 'Nacrt'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Lesson Preps Report */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pripreme za čas</h2>
        </div>
        <div className="p-6">
          {lessonPreps.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nemate kreiranih priprema za čas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tema
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Razred
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Realizovano
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ostvarenje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lessonPreps.slice(0, 10).map((prep) => (
                    <tr key={prep._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(prep.datum).toLocaleDateString('sr-RS')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {prep.tema}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {prep.razred}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {prep.realizovano ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {prep.procenatOstvarenja}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {lessonPreps.length > 10 && (
                <p className="text-center text-gray-500 mt-4">
                  Prikazano {10} od {lessonPreps.length} priprema
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;