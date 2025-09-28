import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  Edit, 
  Download, 
  Send, 
  MessageSquare, 
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const AnnualPlanView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      const response = await axios.get(`/api/annual-plans/${id}`);
      setPlan(response.data);
    } catch (error) {
      console.error('Greška pri dohvatanju plana:', error);
      toast.error('Greška pri dohvatanju plana');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await axios.post(`/api/annual-plans/${id}/submit`);
      toast.success('Plan poslat na odobrenje');
      fetchPlan(); // Refresh data
    } catch (error) {
      toast.error('Greška pri slanju plana');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    setAddingComment(true);
    try {
      await axios.post(`/api/annual-plans/${id}/comment`, { text: comment });
      toast.success('Komentar dodat');
      setComment('');
      fetchPlan(); // Refresh data
    } catch (error) {
      toast.error('Greška pri dodavanju komentara');
    } finally {
      setAddingComment(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await axios.post(`/api/export/annual-plan/${id}/pdf`, {}, {
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
    } catch (error) {
      toast.error('Greška pri export-u PDF-a');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'submitted': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'draft': return <AlertCircle className="h-5 w-5 text-gray-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'submitted': return 'text-yellow-600 bg-yellow-100';
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
        <p className="text-gray-500">Plan nije pronađen</p>
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
              onClick={handleExportPDF}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              <span>Export PDF</span>
            </button>
            
            {plan.status === 'draft' && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{submitting ? 'Šalje se...' : 'Pošalji na odobrenje'}</span>
              </button>
            )}
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">
          Godišnji plan - {plan.predmet}
        </h1>
        <p className="text-gray-600 mt-2">
          {plan.razredi.join(', ')} razred • Školska godina: {plan.schoolYear}
        </p>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Osnovni podaci</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Nastavnik</p>
            <p className="text-lg text-gray-900">{plan.teacherId.ime} {plan.teacherId.prezime}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Škola</p>
            <p className="text-lg text-gray-900">{plan.schoolId.naziv}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Nedeljni fond</p>
            <p className="text-lg text-gray-900">{plan.nedeljniFond} časova</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Ukupni fond</p>
            <p className="text-lg text-gray-900">{plan.ukupniFond} časova</p>
          </div>
        </div>
      </div>

      {/* Main Goals */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Glavni ciljevi školske godine</h2>
        <ul className="space-y-2">
          {plan.glavniCiljevi.map((cilj, index) => (
            <li key={index} className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                {index + 1}
              </span>
              <span className="text-gray-700">{cilj}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Learning Outcomes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Raspodela nastavnih jedinica po mesecima</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jedinica
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesec
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Časovi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ishod učenja
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plan.learningOutcomes.map((outcome, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {outcome.jedinica}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {outcome.mesec}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {outcome.casovi}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <ul className="list-disc list-inside space-y-1">
                      {outcome.ishodi.map((ishod, i) => (
                        <li key={i}>{ishod}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assessment Plan */}
      {plan.assessmentPlan && plan.assessmentPlan.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Plan ocenjivanja</h2>
          <div className="space-y-4">
            {plan.assessmentPlan.map((assessment, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{assessment.tip}</h3>
                  <div className="text-sm text-gray-500">
                    {assessment.mesec} • {assessment.casovi} časova
                  </div>
                </div>
                <p className="text-gray-700">{assessment.opis}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Activities */}
      {(plan.dodatnaNastava?.opis || plan.extracurricular?.length > 0 || plan.professionalDevelopment?.length > 0) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dodatne aktivnosti</h2>
          
          {plan.dodatnaNastava?.opis && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Dodatna nastava</h3>
              <p className="text-gray-700">{plan.dodatnaNastava.opis}</p>
              <p className="text-sm text-gray-500 mt-1">
                {plan.dodatnaNastava.casovi} časova • {plan.dodatnaNastava.mesec}
              </p>
            </div>
          )}

          {plan.extracurricular && plan.extracurricular.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Vannastavne aktivnosti</h3>
              <div className="space-y-3">
                {plan.extracurricular.map((activity, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900">{activity.aktivnost}</h4>
                    <p className="text-gray-700">{activity.opis}</p>
                    <p className="text-sm text-gray-500">
                      {activity.mesec} • {activity.casovi} časova
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {plan.professionalDevelopment && plan.professionalDevelopment.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Stručno usavršavanje nastavnika</h3>
              <div className="space-y-3">
                {plan.professionalDevelopment.map((pd, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium text-gray-900">{pd.aktivnost}</h4>
                    <p className="text-gray-700">{pd.opis}</p>
                    <p className="text-sm text-gray-500">
                      {pd.mesec} • {pd.casovi} časova
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {plan.napomene && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Napomene</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{plan.napomene}</p>
        </div>
      )}

      {/* Comments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Komentari</h2>
        
        {/* Add Comment */}
        <div className="mb-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Dodaj komentar..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={handleAddComment}
              disabled={addingComment || !comment.trim()}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{addingComment ? 'Dodaje se...' : 'Dodaj komentar'}</span>
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {plan.comments && plan.comments.length > 0 ? (
            plan.comments.map((comment, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">
                    {comment.author?.ime} {comment.author?.prezime}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString('sr-RS')}
                  </p>
                </div>
                <p className="text-gray-700">{comment.text}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">Nema komentara</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnualPlanView;