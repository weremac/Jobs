import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  Save, 
  ArrowLeft,
  Calendar,
  BookOpen,
  Target,
  Activity,
  Settings,
  CheckCircle
} from 'lucide-react';

const LessonPrepForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [monthlyPlans, setMonthlyPlans] = useState([]);
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    monthlyPlanId: '',
    datum: '',
    razred: '',
    redniBrojCasa: 1,
    tema: '',
    ciljCasa: '',
    ishodUcenja: '',
    metoda: '',
    aktivnosti: [''],
    sredstva: [''],
    materijali: [''],
    procena: {
      tip: 'formativna',
      kriterijumi: [''],
      zadatak: ''
    },
    trajanje: 45,
    diferencijacija: {
      zaNapredne: '',
      zaSpore: '',
      individualniPristup: ''
    },
    domaci: '',
    napomene: '',
    realizovano: false,
    komentariRealizacije: '',
    procenatOstvarenja: 0
  });

  const assessmentTypes = [
    { value: 'formativna', label: 'Formativna' },
    { value: 'summativna', label: 'Summativna' },
    { value: 'samoprocena', label: 'Samoprocena' },
    { value: 'uzajamna', label: 'Uzajamna' }
  ];

  const methods = [
    'Predavanje', 'Diskusija', 'Rad u grupama', 'Individualni rad',
    'Eksperiment', 'Demonstracija', 'Projektni rad', 'Problem solving',
    'Brainstorming', 'Case study', 'Role play', 'Ostalo'
  ];

  useEffect(() => {
    fetchMonthlyPlans();
    if (id) {
      setIsEdit(true);
      fetchLessonPrep();
    }
  }, [id]);

  const fetchMonthlyPlans = async () => {
    try {
      const response = await axios.get('/api/monthly-plans');
      setMonthlyPlans(response.data);
    } catch (error) {
      console.error('Greška pri dohvatanju mesečnih planova:', error);
    }
  };

  const fetchLessonPrep = async () => {
    try {
      const response = await axios.get(`/api/lesson-preps/${id}`);
      const prep = response.data;
      setFormData({
        ...prep,
        datum: prep.datum ? new Date(prep.datum).toISOString().split('T')[0] : '',
        aktivnosti: prep.aktivnosti || [''],
        sredstva: prep.sredstva || [''],
        materijali: prep.materijali || [''],
        procena: {
          tip: prep.procena?.tip || 'formativna',
          kriterijumi: prep.procena?.kriterijumi || [''],
          zadatak: prep.procena?.zadatak || ''
        },
        diferencijacija: {
          zaNapredne: prep.diferencijacija?.zaNapredne || '',
          zaSpore: prep.diferencijacija?.zaSpore || '',
          individualniPristup: prep.diferencijacija?.individualniPristup || ''
        }
      });
    } catch (error) {
      console.error('Greška pri dohvatanju pripreme:', error);
      toast.error('Greška pri dohvatanju pripreme');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parentField, childField, value) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSend = {
        ...formData,
        datum: new Date(formData.datum).toISOString()
      };

      if (isEdit) {
        await axios.put(`/api/lesson-preps/${id}`, dataToSend);
        toast.success('Priprema za čas uspešno ažurirana');
      } else {
        await axios.post('/api/lesson-preps', dataToSend);
        toast.success('Priprema za čas uspešno kreirana');
      }
      
      navigate('/dashboard');
    } catch (error) {
      toast.error('Greška pri čuvanju pripreme');
      console.error('Greška:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Nazad na dashboard</span>
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Ažuriranje pripreme za čas' : 'Nova priprema za čas'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Osnovni podaci
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mesečni plan *
              </label>
              <select
                value={formData.monthlyPlanId}
                onChange={(e) => handleChange('monthlyPlanId', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Izaberite mesečni plan</option>
                {monthlyPlans.map(plan => (
                  <option key={plan._id} value={plan._id}>
                    {plan.mesec} {plan.godina} - {plan.annualPlanId?.predmet}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Datum *
              </label>
              <input
                type="date"
                value={formData.datum}
                onChange={(e) => handleChange('datum', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razred *
              </label>
              <select
                value={formData.razred}
                onChange={(e) => handleChange('razred', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Izaberite razred</option>
                <option value="I">I razred</option>
                <option value="II">II razred</option>
                <option value="III">III razred</option>
                <option value="IV">IV razred</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Redni broj časa
              </label>
              <input
                type="number"
                value={formData.redniBrojCasa}
                onChange={(e) => handleChange('redniBrojCasa', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tema *
              </label>
              <input
                type="text"
                value={formData.tema}
                onChange={(e) => handleChange('tema', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Naziv teme časa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trajanje (minuti)
              </label>
              <input
                type="number"
                value={formData.trajanje}
                onChange={(e) => handleChange('trajanje', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Goals and Outcomes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Ciljevi i ishodi
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cilj časa *
              </label>
              <textarea
                value={formData.ciljCasa}
                onChange={(e) => handleChange('ciljCasa', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Šta želite da učenici nauče..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ishod učenja *
              </label>
              <textarea
                value={formData.ishodUcenja}
                onChange={(e) => handleChange('ishodUcenja', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Kako ćete znati da su učenici postigli cilj..."
              />
            </div>
          </div>
        </div>

        {/* Methods and Activities */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Metode i aktivnosti
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metoda *
              </label>
              <select
                value={formData.metoda}
                onChange={(e) => handleChange('metoda', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Izaberite metodu</option>
                {methods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aktivnosti
              </label>
              {formData.aktivnosti.map((aktivnost, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={aktivnost}
                    onChange={(e) => handleArrayChange('aktivnosti', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Aktivnost ${index + 1}`}
                  />
                  {formData.aktivnosti.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('aktivnosti', index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('aktivnosti')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Dodaj aktivnost
              </button>
            </div>
          </div>
        </div>

        {/* Materials and Resources */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Sredstva i materijali
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sredstva
              </label>
              {formData.sredstva.map((sredstvo, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={sredstvo}
                    onChange={(e) => handleArrayChange('sredstva', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Sredstvo ${index + 1}`}
                  />
                  {formData.sredstva.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('sredstva', index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('sredstva')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Dodaj sredstvo
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materijali
              </label>
              {formData.materijali.map((materijal, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={materijal}
                    onChange={(e) => handleArrayChange('materijali', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Materijal ${index + 1}`}
                  />
                  {formData.materijali.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('materijali', index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('materijali')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Dodaj materijal
              </button>
            </div>
          </div>
        </div>

        {/* Assessment */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Procena i zadaci
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tip procene
              </label>
              <select
                value={formData.procena.tip}
                onChange={(e) => handleNestedChange('procena', 'tip', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {assessmentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kriterijumi ocenjivanja
              </label>
              {formData.procena.kriterijumi.map((kriterijum, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={kriterijum}
                    onChange={(e) => {
                      const newKriterijumi = [...formData.procena.kriterijumi];
                      newKriterijumi[index] = e.target.value;
                      handleNestedChange('procena', 'kriterijumi', newKriterijumi);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Kriterijum ${index + 1}`}
                  />
                  {formData.procena.kriterijumi.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newKriterijumi = formData.procena.kriterijumi.filter((_, i) => i !== index);
                        handleNestedChange('procena', 'kriterijumi', newKriterijumi);
                      }}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newKriterijumi = [...formData.procena.kriterijumi, ''];
                  handleNestedChange('procena', 'kriterijumi', newKriterijumi);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Dodaj kriterijum
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zadatak za učenike
              </label>
              <textarea
                value={formData.procena.zadatak}
                onChange={(e) => handleNestedChange('procena', 'zadatak', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Opis zadatka..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domaći zadatak
              </label>
              <textarea
                value={formData.domaci}
                onChange={(e) => handleChange('domaci', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                placeholder="Domaći zadatak..."
              />
            </div>
          </div>
        </div>

        {/* Differentiation */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Diferencijacija
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Za napredne učenike
              </label>
              <textarea
                value={formData.diferencijacija.zaNapredne}
                onChange={(e) => handleNestedChange('diferencijacija', 'zaNapredne', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                placeholder="Dodatne aktivnosti za napredne učenike..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Za sporije učenike
              </label>
              <textarea
                value={formData.diferencijacija.zaSpore}
                onChange={(e) => handleNestedChange('diferencijacija', 'zaSpore', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                placeholder="Dodatna podrška za sporije učenike..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Individualni pristup
              </label>
              <textarea
                value={formData.diferencijacija.individualniPristup}
                onChange={(e) => handleNestedChange('diferencijacija', 'individualniPristup', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                placeholder="Specifični pristup za pojedinačne učenike..."
              />
            </div>
          </div>
        </div>

        {/* Notes and Realization */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Napomene i realizacija</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Napomene
              </label>
              <textarea
                value={formData.napomene}
                onChange={(e) => handleChange('napomene', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Dodatne napomene..."
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.realizovano}
                  onChange={(e) => handleChange('realizovano', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Čas je realizovan</span>
              </label>
            </div>

            {formData.realizovano && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Komentari realizacije
                  </label>
                  <textarea
                    value={formData.komentariRealizacije}
                    onChange={(e) => handleChange('komentariRealizacije', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Kako je prošao čas..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Procenat ostvarenja (%)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.procenatOstvarenja}
                      onChange={(e) => handleChange('procenatOstvarenja', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-lg font-medium text-gray-900 w-16">
                      {formData.procenatOstvarenja}%
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Otkaži
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Čuva se...' : (isEdit ? 'Ažuriraj' : 'Sačuvaj')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default LessonPrepForm;