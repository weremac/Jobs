import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import axios from 'axios';

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    ime: '',
    prezime: '',
    email: '',
    password: '',
    confirmPassword: '',
    predmet: '',
    razredi: [],
    schoolId: '',
    kontakt: {
      telefon: '',
      adresa: ''
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState([]);

  const predmeti = [
    'Matematika', 'Srpski jezik', 'Engleski jezik', 'Fizika', 
    'Hemija', 'Biologija', 'Istorija', 'Geografija', 
    'Informatika', 'Fizičko vaspitanje', 'Ostalo'
  ];

  const razredi = ['I', 'II', 'III', 'IV'];

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await axios.get('/api/schools');
      setSchools(response.data);
    } catch (error) {
      console.error('Greška pri dohvatanju škola:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'razredi') {
      const newRazredi = checked 
        ? [...formData.razredi, value]
        : formData.razredi.filter(r => r !== value);
      setFormData({ ...formData, razredi: newRazredi });
    } else if (name.startsWith('kontakt.')) {
      const kontaktField = name.split('.')[1];
      setFormData({
        ...formData,
        kontakt: {
          ...formData.kontakt,
          [kontaktField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Lozinke se ne poklapaju');
      return;
    }

    if (formData.razredi.length === 0) {
      toast.error('Morate izabrati najmanje jedan razred');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    
    if (result.success) {
      toast.success('Uspešno ste se registrovali!');
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registrujte se
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ili{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              prijavite se
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ime */}
            <div>
              <label htmlFor="ime" className="block text-sm font-medium text-gray-700">
                Ime *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="ime"
                  name="ime"
                  type="text"
                  required
                  value={formData.ime}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Vaše ime"
                />
              </div>
            </div>

            {/* Prezime */}
            <div>
              <label htmlFor="prezime" className="block text-sm font-medium text-gray-700">
                Prezime *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="prezime"
                  name="prezime"
                  type="text"
                  required
                  value={formData.prezime}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Vaše prezime"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email adresa *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="vas@email.com"
                />
              </div>
            </div>

            {/* Predmet */}
            <div>
              <label htmlFor="predmet" className="block text-sm font-medium text-gray-700">
                Predmet *
              </label>
              <select
                id="predmet"
                name="predmet"
                required
                value={formData.predmet}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
              >
                <option value="">Izaberite predmet</option>
                {predmeti.map(predmet => (
                  <option key={predmet} value={predmet}>{predmet}</option>
                ))}
              </select>
            </div>

            {/* Lozinka */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Lozinka *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Najmanje 6 karaktera"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Potvrda lozinke */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Potvrdite lozinku *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ponovite lozinku"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Škola */}
            <div className="md:col-span-2">
              <label htmlFor="schoolId" className="block text-sm font-medium text-gray-700">
                Škola *
              </label>
              <select
                id="schoolId"
                name="schoolId"
                required
                value={formData.schoolId}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
              >
                <option value="">Izaberite školu</option>
                {schools.map(school => (
                  <option key={school._id} value={school._id}>
                    {school.naziv} - {school.tip}
                  </option>
                ))}
              </select>
            </div>

            {/* Razredi */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razredi *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {razredi.map(razred => (
                  <label key={razred} className="flex items-center">
                    <input
                      type="checkbox"
                      name="razredi"
                      value={razred}
                      checked={formData.razredi.includes(razred)}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{razred} razred</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Telefon */}
            <div>
              <label htmlFor="kontakt.telefon" className="block text-sm font-medium text-gray-700">
                Telefon
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="kontakt.telefon"
                  name="kontakt.telefon"
                  type="tel"
                  value={formData.kontakt.telefon}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="+381..."
                />
              </div>
            </div>

            {/* Adresa */}
            <div>
              <label htmlFor="kontakt.adresa" className="block text-sm font-medium text-gray-700">
                Adresa
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="kontakt.adresa"
                  name="kontakt.adresa"
                  type="text"
                  value={formData.kontakt.adresa}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Vaša adresa"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Registrujte se'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;