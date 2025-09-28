import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Save,
  Send
} from 'lucide-react';

const AnnualPlanWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    predmet: user?.predmet || '',
    razredi: user?.razredi || [],
    nedeljniFond: 4,
    ukupniFond: 144,
    glavniCiljevi: [''],
    learningOutcomes: [],
    assessmentPlan: [],
    dodatnaNastava: {
      opis: '',
      casovi: 0,
      mesec: ''
    },
    extracurricular: [],
    professionalDevelopment: [],
    napomene: ''
  });

  const months = [
    'Septembar', 'Oktobar', 'Novembar', 'Decembar',
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun'
  ];

  const assessmentTypes = [
    'formativno', 'summativno', 'projekat', 'praktični rad'
  ];

  const steps = [
    { id: 1, title: 'Osnovni podaci', description: 'Predmet, razredi, fond časova' },
    { id: 2, title: 'Glavni ciljevi', description: 'Ciljevi za školske godine' },
    { id: 3, title: 'Ishodi učenja', description: 'Raspodela po mesecima' },
    { id: 4, title: 'Ocenjivanje', description: 'Plan ocenjivanja' },
    { id: 5, title: 'Dodatne aktivnosti', description: 'Vannastavne i stručne aktivnosti' },
    { id: 6, title: 'Pregled', description: 'Finalni pregled i čuvanje' }
  ];

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

  const addLearningOutcome = () => {
    setFormData(prev => ({
      ...prev,
      learningOutcomes: [
        ...prev.learningOutcomes,
        {
          jedinica: '',
          ishodi: [''],
          casovi: 0,
          mesec: '',
          nedelje: []
        }
      ]
    }));
  };

  const updateLearningOutcome = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.map((outcome, i) => 
        i === index ? { ...outcome, [field]: value } : outcome
      )
    }));
  };

  const removeLearningOutcome = (index) => {
    setFormData(prev => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== index)
    }));
  };

  const addAssessment = () => {
    setFormData(prev => ({
      ...prev,
      assessmentPlan: [
        ...prev.assessmentPlan,
        {
          tip: 'formativno',
          opis: '',
          mesec: '',
          casovi: 0
        }
      ]
    }));
  };

  const updateAssessment = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      assessmentPlan: prev.assessmentPlan.map((assessment, i) => 
        i === index ? { ...assessment, [field]: value } : assessment
      )
    }));
  };

  const removeAssessment = (index) => {
    setFormData(prev => ({
      ...prev,
      assessmentPlan: prev.assessmentPlan.filter((_, i) => i !== index)
    }));
  };

  const addExtracurricular = () => {
    setFormData(prev => ({
      ...prev,
      extracurricular: [
        ...prev.extracurricular,
        {
          aktivnost: '',
          mesec: '',
          casovi: 0,
          opis: ''
        }
      ]
    }));
  };

  const updateExtracurricular = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      extracurricular: prev.extracurricular.map((activity, i) => 
        i === index ? { ...activity, [field]: value } : activity
      )
    }));
  };

  const removeExtracurricular = (index) => {
    setFormData(prev => ({
      ...prev,
      extracurricular: prev.extracurricular.filter((_, i) => i !== index)
    }));
  };

  const addProfessionalDevelopment = () => {
    setFormData(prev => ({
      ...prev,
      professionalDevelopment: [
        ...prev.professionalDevelopment,
        {
          aktivnost: '',
          mesec: '',
          casovi: 0,
          opis: ''
        }
      ]
    }));
  };

  const updateProfessionalDevelopment = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      professionalDevelopment: prev.professionalDevelopment.map((pd, i) => 
        i === index ? { ...pd, [field]: value } : pd
      )
    }));
  };

  const removeProfessionalDevelopment = (index) => {
    setFormData(prev => ({
      ...prev,
      professionalDevelopment: prev.professionalDevelopment.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const savePlan = async (status = 'draft') => {
    setSaving(true);
    try {
      const response = await axios.post('/api/annual-plans', {
        ...formData,
        status
      });

      toast.success('Plan uspešno sačuvan!');
      navigate(`/annual-plan/${response.data.plan._id}`);
    } catch (error) {
      toast.error('Greška pri čuvanju plana');
      console.error('Greška:', error);
    } finally {
      setSaving(false);
    }
  };

  const submitPlan = async () => {
    await savePlan('submitted');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Osnovni podaci</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Predmet
              </label>
              <input
                type="text"
                value={formData.predmet}
                onChange={(e) => handleChange('predmet', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Naziv predmeta"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razredi
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['I', 'II', 'III', 'IV'].map(razred => (
                  <label key={razred} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.razredi.includes(razred)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleChange('razredi', [...formData.razredi, razred]);
                        } else {
                          handleChange('razredi', formData.razredi.filter(r => r !== razred));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{razred} razred</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nedeljni fond časova
                </label>
                <input
                  type="number"
                  value={formData.nedeljniFond}
                  onChange={(e) => handleChange('nedeljniFond', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ukupni fond časova
                </label>
                <input
                  type="number"
                  value={formData.ukupniFond}
                  onChange={(e) => handleChange('ukupniFond', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Glavni ciljevi školske godine</h3>
            
            {formData.glavniCiljevi.map((cilj, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={cilj}
                  onChange={(e) => {
                    const newCiljevi = [...formData.glavniCiljevi];
                    newCiljevi[index] = e.target.value;
                    handleChange('glavniCiljevi', newCiljevi);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Cilj ${index + 1}`}
                />
                {formData.glavniCiljevi.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newCiljevi = formData.glavniCiljevi.filter((_, i) => i !== index);
                      handleChange('glavniCiljevi', newCiljevi);
                    }}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => handleChange('glavniCiljevi', [...formData.glavniCiljevi, ''])}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <Plus className="h-4 w-4" />
              <span>Dodaj cilj</span>
            </button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Ishodi učenja po mesecima</h3>
              <button
                type="button"
                onClick={addLearningOutcome}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Dodaj jedinicu</span>
              </button>
            </div>

            {formData.learningOutcomes.map((outcome, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Jedinica {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeLearningOutcome(index)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Naziv jedinice
                    </label>
                    <input
                      type="text"
                      value={outcome.jedinica}
                      onChange={(e) => updateLearningOutcome(index, 'jedinica', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Naziv jedinice"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mesec
                    </label>
                    <select
                      value={outcome.mesec}
                      onChange={(e) => updateLearningOutcome(index, 'mesec', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Izaberite mesec</option>
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Broj časova
                  </label>
                  <input
                    type="number"
                    value={outcome.casovi}
                    onChange={(e) => updateLearningOutcome(index, 'casovi', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Broj časova"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ishod učenja
                  </label>
                  <textarea
                    value={outcome.ishodi.join('\n')}
                    onChange={(e) => updateLearningOutcome(index, 'ishodi', e.target.value.split('\n').filter(line => line.trim()))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Jedan ishod po liniji"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Plan ocenjivanja</h3>
              <button
                type="button"
                onClick={addAssessment}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Dodaj ocenjivanje</span>
              </button>
            </div>

            {formData.assessmentPlan.map((assessment, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Ocenjivanje {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeAssessment(index)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tip ocenjivanja
                    </label>
                    <select
                      value={assessment.tip}
                      onChange={(e) => updateAssessment(index, 'tip', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {assessmentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mesec
                    </label>
                    <select
                      value={assessment.mesec}
                      onChange={(e) => updateAssessment(index, 'mesec', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Izaberite mesec</option>
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Broj časova
                    </label>
                    <input
                      type="number"
                      value={assessment.casovi}
                      onChange={(e) => updateAssessment(index, 'casovi', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opis
                  </label>
                  <textarea
                    value={assessment.opis}
                    onChange={(e) => updateAssessment(index, 'opis', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Opis ocenjivanja"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            {/* Dodatna nastava */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Dodatna nastava</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opis
                  </label>
                  <input
                    type="text"
                    value={formData.dodatnaNastava.opis}
                    onChange={(e) => handleNestedChange('dodatnaNastava', 'opis', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Opis dodatne nastave"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Broj časova
                  </label>
                  <input
                    type="number"
                    value={formData.dodatnaNastava.casovi}
                    onChange={(e) => handleNestedChange('dodatnaNastava', 'casovi', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mesec
                  </label>
                  <select
                    value={formData.dodatnaNastava.mesec}
                    onChange={(e) => handleNestedChange('dodatnaNastava', 'mesec', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Izaberite mesec</option>
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Vannastavne aktivnosti */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Vannastavne aktivnosti</h3>
                <button
                  type="button"
                  onClick={addExtracurricular}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Dodaj aktivnost</span>
                </button>
              </div>

              {formData.extracurricular.map((activity, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4 mb-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Aktivnost {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeExtracurricular(index)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Naziv aktivnosti
                      </label>
                      <input
                        type="text"
                        value={activity.aktivnost}
                        onChange={(e) => updateExtracurricular(index, 'aktivnost', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Naziv aktivnosti"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mesec
                      </label>
                      <select
                        value={activity.mesec}
                        onChange={(e) => updateExtracurricular(index, 'mesec', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Izaberite mesec</option>
                        {months.map(month => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Broj časova
                      </label>
                      <input
                        type="number"
                        value={activity.casovi}
                        onChange={(e) => updateExtracurricular(index, 'casovi', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opis
                    </label>
                    <textarea
                      value={activity.opis}
                      onChange={(e) => updateExtracurricular(index, 'opis', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder="Opis aktivnosti"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Stručno usavršavanje */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Stručno usavršavanje nastavnika</h3>
                <button
                  type="button"
                  onClick={addProfessionalDevelopment}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Dodaj aktivnost</span>
                </button>
              </div>

              {formData.professionalDevelopment.map((pd, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4 mb-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Aktivnost {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeProfessionalDevelopment(index)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Naziv aktivnosti
                      </label>
                      <input
                        type="text"
                        value={pd.aktivnost}
                        onChange={(e) => updateProfessionalDevelopment(index, 'aktivnost', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Naziv aktivnosti"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mesec
                      </label>
                      <select
                        value={pd.mesec}
                        onChange={(e) => updateProfessionalDevelopment(index, 'mesec', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Izaberite mesec</option>
                        {months.map(month => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Broj časova
                      </label>
                      <input
                        type="number"
                        value={pd.casovi}
                        onChange={(e) => updateProfessionalDevelopment(index, 'casovi', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opis
                    </label>
                    <textarea
                      value={pd.opis}
                      onChange={(e) => updateProfessionalDevelopment(index, 'opis', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder="Opis aktivnosti"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Napomene */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Napomene
              </label>
              <textarea
                value={formData.napomene}
                onChange={(e) => handleChange('napomene', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Dodatne napomene..."
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Pregled godišnjeg plana</h3>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Osnovni podaci</h4>
                <p className="text-sm text-gray-600">
                  <strong>Predmet:</strong> {formData.predmet}<br/>
                  <strong>Razredi:</strong> {formData.razredi.join(', ')}<br/>
                  <strong>Nedeljni fond:</strong> {formData.nedeljniFond} časova<br/>
                  <strong>Ukupni fond:</strong> {formData.ukupniFond} časova
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Glavni ciljevi</h4>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  {formData.glavniCiljevi.filter(cilj => cilj.trim()).map((cilj, index) => (
                    <li key={index}>{cilj}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Ishodi učenja</h4>
                <p className="text-sm text-gray-600">
                  Ukupno jedinica: {formData.learningOutcomes.length}<br/>
                  Ukupno časova: {formData.learningOutcomes.reduce((total, outcome) => total + outcome.casovi, 0)}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Ocenjivanje</h4>
                <p className="text-sm text-gray-600">
                  Ukupno tipova ocenjivanja: {formData.assessmentPlan.length}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Dodatne aktivnosti</h4>
                <p className="text-sm text-gray-600">
                  Vannastavne aktivnosti: {formData.extracurricular.length}<br/>
                  Stručno usavršavanje: {formData.professionalDevelopment.length}
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => savePlan('draft')}
                disabled={saving}
                className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>Sačuvaj kao nacrt</span>
              </button>
              
              <button
                type="button"
                onClick={submitPlan}
                disabled={saving}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>Pošalji na odobrenje</span>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step.id}
              </div>
              <div className="ml-3 hidden md:block">
                <p className="text-sm font-medium text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`hidden md:block w-16 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Nazad</span>
        </button>

        {currentStep < steps.length && (
          <button
            type="button"
            onClick={nextStep}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <span>Dalje</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AnnualPlanWizard;