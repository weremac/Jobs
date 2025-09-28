import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Plus, 
  FileText, 
  Calendar, 
  BookOpen, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [annualPlans, setAnnualPlans] = useState([]);
  const [monthlyPlans, setMonthlyPlans] = useState([]);
  const [lessonPreps, setLessonPreps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPlans: 0,
    completedPlans: 0,
    pendingPlans: 0,
    thisMonthPreps: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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

      setStats({
        totalPlans: annualResponse.data.length,
        completedPlans: annualResponse.data.filter(plan => plan.status === 'approved').length,
        pendingPlans: annualResponse.data.filter(plan => plan.status === 'draft').length,
        thisMonthPreps: thisMonthPreps.length
      });
    } catch (error) {
      console.error('Greška pri dohvatanju podataka:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-900">
          Dobrodošli, {user.ime} {user.prezime}!
        </h1>
        <p className="text-gray-600 mt-2">
          Evo pregleda vaših planova i aktivnosti za {user.predmet}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/annual-plan/new"
          className="bg-blue-600 text-white p-6 rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          <div className="flex items-center">
            <Plus className="h-8 w-8 mr-4" />
            <div>
              <h3 className="text-lg font-semibold">Novi godišnji plan</h3>
              <p className="text-blue-100">Kreiraj plan za novu školske godine</p>
            </div>
          </div>
        </Link>

        <Link
          to="/lesson-prep/new"
          className="bg-green-600 text-white p-6 rounded-lg shadow hover:bg-green-700 transition-colors"
        >
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 mr-4" />
            <div>
              <h3 className="text-lg font-semibold">Priprema za čas</h3>
              <p className="text-green-100">Napravi pripremu za sledeći čas</p>
            </div>
          </div>
        </Link>

        <Link
          to="/reports"
          className="bg-purple-600 text-white p-6 rounded-lg shadow hover:bg-purple-700 transition-colors"
        >
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 mr-4" />
            <div>
              <h3 className="text-lg font-semibold">Izveštaji</h3>
              <p className="text-purple-100">Pregled realizacije i statistike</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
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
            <AlertCircle className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Na čekanju</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingPlans}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pripreme ovaj mesec</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thisMonthPreps}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Annual Plans */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Nedavni godišnji planovi</h2>
            <Link
              to="/annual-plan/new"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Novi plan
            </Link>
          </div>
        </div>
        <div className="p-6">
          {annualPlans.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nemate kreiranih godišnjih planova</p>
              <Link
                to="/annual-plan/new"
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Kreiraj prvi plan
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {annualPlans.slice(0, 5).map((plan) => (
                <div key={plan._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {plan.predmet} - {plan.razredi.join(', ')} razred
                      </h3>
                      <p className="text-sm text-gray-600">
                        Školska godina: {plan.schoolYear}
                      </p>
                      <p className="text-sm text-gray-600">
                        Ukupno časova: {plan.ukupniFond}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                        {getStatusText(plan.status)}
                      </span>
                      <Link
                        to={`/annual-plan/${plan._id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Pregled
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Monthly Plans */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Mesečni planovi</h2>
        </div>
        <div className="p-6">
          {monthlyPlans.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nemate kreiranih mesečnih planova</p>
            </div>
          ) : (
            <div className="space-y-4">
              {monthlyPlans.slice(0, 5).map((plan) => (
                <div key={plan._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {plan.mesec} {plan.godina}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Realizacija: {plan.realizacija.procenat}%
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${plan.realizacija.procenat}%` }}
                        ></div>
                      </div>
                      <Link
                        to={`/monthly-plan/${plan._id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Pregled
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Lesson Preps */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Nedavne pripreme za čas</h2>
            <Link
              to="/lesson-prep/new"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Nova priprema
            </Link>
          </div>
        </div>
        <div className="p-6">
          {lessonPreps.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nemate kreiranih priprema za čas</p>
              <Link
                to="/lesson-prep/new"
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Kreiraj prvu pripremu
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {lessonPreps.slice(0, 5).map((prep) => (
                <div key={prep._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {prep.tema}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {prep.razred} razred - {new Date(prep.datum).toLocaleDateString('sr-RS')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {prep.realizovano ? 'Realizovano' : 'Nije realizovano'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {prep.realizovano ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                      <Link
                        to={`/lesson-prep/${prep._id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Pregled
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;