import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  Download, 
  ArrowLeft,
  Edit,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const MonthlyPlanView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [realizationData, setRealizationData] = useState({
    procenat: 0,
    komentari: '',
    odlozeno: [],
    nadoknada: ''
  });

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      const response = await axios.get(`/api/monthly-plans/${id}`);
      setPlan(response.data);
      setRealizationData(response.data.realizacija);
    } catch (error) {
      console.error('Greška pri dohvatanju mesečnog plana:', error);
      toast.error('Greška pri dohvatanju mesečnog plana');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRealization = async () => {
    setUpdating(true);
    try {
      await axios.put(`/api/monthly-plans/${id}/realization`, realizationData);
      toast.success('Realizacija ažurirana');
      fetchPlan(); // Refresh data
    } catch (error) {
      toast.error('Greška pri ažuriranju realizacije');
    } finally {
      setUpdating(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      await axios.post(`/api/monthly-plans/${id}/regenerate`);
      toast.success('Mesečni plan regenerisan');
      fetchPlan(); // Refresh data
    } catch (error) {
      toast.error('Greška pri regenerisanju plana');
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await axios.post(`/api/export/monthly-plan/${id}/pdf`, {}, {
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
    } catch (error) {
      toast.error('Greška pri export-u PDF-a');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'draft': return <AlertCircle className="h-5 w-5 text-gray-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Završeno';
      case 'in_progress': return 'U toku';
      case 'draft': return 'Nacrt';
      default: return 'Nepoznato';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Mesečni plan nije pronađen</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Nazad na dashboard</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(plan.status)}`}>
              {getStatusText(plan.status)}
            </span>
            
            <button
              onClick={handleRegenerate}
              className="flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Regeneriši</span>
            </button>
            
            <button
              onClick={handleExportPDF}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">
          Mesečni plan - {plan.mesec} {plan.godina}
        </h1>
        <p className="text-gray-600 mt-2">
          {plan.annualPlanId.predmet} • {plan.annualPlanId.razredi.join(', ')} razred
        </p>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Osnovni podaci</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Mesec</p>
            <p className="text-lg text-gray-900">{plan.mesec} {plan.godina}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Nedeljni fond</p>
            <p className="text-lg text-gray-900">{plan.nedeljniFond} časova</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Realizacija</p>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${plan.realizacija.procenat}%` }}
                ></div>
              </div>
              <span className="text-lg text-gray-900">{plan.realizacija.procenat}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Goals */}
      {plan.ciljeviMeseca && plan.ciljeviMeseca.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ciljevi meseca</h2>
          <ul className="space-y-2">
            {plan.ciljeviMeseca.map((cilj, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-gray-700">{cilj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weekly Units */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Nedeljna razrada</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nedelja
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jedinica
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Časovi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ciljevi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domaći zadaci
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Napomene
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plan.units.map((unit, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {unit.nedelja}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {unit.jedinica}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {unit.casovi}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <ul className="list-disc list-inside space-y-1">
                      {unit.ciljevi.map((cilj, i) => (
                        <li key={i}>{cilj}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {unit.domaci}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {unit.napomene}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assessment Events */}
      {plan.assessmentEvents && plan.assessmentEvents.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Plan ocenjivanja u mesecu</h2>
          <div className="space-y-4">
            {plan.assessmentEvents.map((event, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{event.tip}</h3>
                  <div className="text-sm text-gray-500">
                    {event.datum ? new Date(event.datum).toLocaleDateString('sr-RS') : 'TBD'} • {event.casovi} časova
                  </div>
                </div>
                <p className="text-gray-700">{event.opis}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Realization */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Realizacija</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Procenat ostvarenosti
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="100"
                value={realizationData.procenat}
                onChange={(e) => setRealizationData({
                  ...realizationData,
                  procenat: parseInt(e.target.value)
                })}
                className="flex-1"
              />
              <span className="text-lg font-medium text-gray-900 w-16">
                {realizationData.procenat}%
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Komentari
            </label>
            <textarea
              value={realizationData.komentari}
              onChange={(e) => setRealizationData({
                ...realizationData,
                komentari: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Dodaj komentare o realizaciji..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Odloženo
              </label>
              <input
                type="text"
                value={realizationData.odlozeno.join(', ')}
                onChange={(e) => setRealizationData({
                  ...realizationData,
                  odlozeno: e.target.value.split(',').map(item => item.trim()).filter(item => item)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Odvojite zarezom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nadoknada
              </label>
              <input
                type="text"
                value={realizationData.nadoknada}
                onChange={(e) => setRealizationData({
                  ...realizationData,
                  nadoknada: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Plan nadoknade"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleUpdateRealization}
              disabled={updating}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Edit className="h-4 w-4" />
              <span>{updating ? 'Ažurira se...' : 'Ažuriraj realizaciju'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notes */}
      {plan.napomene && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Napomene</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{plan.napomene}</p>
        </div>
      )}
    </div>
  );
};

export default MonthlyPlanView;