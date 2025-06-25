import { useState } from 'react';

// Language translations
const translations = {
  en: {
    title: 'Launch Your Project',
    subtitle: 'Transform your ideas into reality. Start by telling us about your project vision and requirements.',
    durationLabel: 'Project Duration',
    resourcesLabel: 'Project Resources',
    resourcesPlaceholder: 'List your project resources, tools, technologies, team members, budget, or any other resources you have available for this project...',
    resourcesHelper: 'characters • Include tools, budget, team, etc.',
    descriptionLabel: 'Project Description',
    descriptionPlaceholder: 'Describe your project vision, goals, target audience, key features, and any specific requirements. The more detail you provide, the better we can help bring your project to life...',
    descriptionHelper: 'characters • Be as detailed as possible',
    customDurationPlaceholder: 'Enter custom duration (e.g., 4 months, 18 months)',
    requiredFieldsError: 'Please fill in all required fields',
    submitError: 'Failed to create project. Please try again.',
    submitting: 'Launching Project...',
    submitButton: 'Launch your Project',
    successMessage: 'Project created successfully! We\'ll be in touch soon.',
    poweredBy: 'Powered by',
    weeks: 'Week',
    weeks_plural: 'Weeks',
    months: 'Month',
    months_plural: 'Months',
    year: 'Year',
    custom: 'Custom Duration'
  },
  fr: {
    title: 'Lancez Votre Projet',
    subtitle: 'Transformez vos idées en réalité. Commencez par nous parler de votre vision et de vos besoins.',
    durationLabel: 'Durée du Projet',
    resourcesLabel: 'Ressources du Projet',
    resourcesPlaceholder: 'Listez vos ressources, outils, technologies, membres de l\'équipe, budget ou toute autre ressource disponible pour ce projet...',
    resourcesHelper: 'caractères • Incluez outils, budget, équipe, etc.',
    descriptionLabel: 'Description du Projet',
    descriptionPlaceholder: 'Décrivez la vision de votre projet, les objectifs, le public cible, les fonctionnalités clés et toutes les exigences spécifiques. Plus vous fournissez de détails, mieux nous pourrons vous aider à donner vie à votre projet...',
    descriptionHelper: 'caractères • Soyez aussi détaillé que possible',
    customDurationPlaceholder: 'Entrez une durée personnalisée (ex: 4 mois, 18 mois)',
    requiredFieldsError: 'Veuillez remplir tous les champs obligatoires',
    submitError: 'Échec de la création du projet. Veuillez réessayer.',
    submitting: 'Lancement du Projet...',
    submitButton: 'Lancer votre Projet',
    successMessage: 'Projet créé avec succès! Nous vous contacterons bientôt.',
    poweredBy: 'Propulsé par',
    weeks: 'Semaine',
    weeks_plural: 'Semaines',
    months: 'Mois',
    months_plural: 'Mois',
    year: 'An',
    custom: 'Durée Personnalisée'
  }
};

interface ProjectFormData {
  duration: string;
  customDuration: string;
  resources: string;
  description: string;
}

export default function App() {
  const [formData, setFormData] = useState<ProjectFormData>({
    duration: '',
    customDuration: '',
    resources: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  
  // Get translations for current language
  const t = translations[language];

  const durationOptions = [
    { value: '1-week', label: '1 ' + (language === 'en' ? 'Week' : 'Semaine'), icon: '⚡' },
    { value: '2-weeks', label: '2 ' + (language === 'en' ? 'Weeks' : 'Semaines'), icon: '🚀' },
    { value: '1-month', label: '1 ' + t.months, icon: '📅' },
    { value: '2-months', label: '2 ' + t.months_plural, icon: '⏳' },
    { value: '3-months', label: '3 ' + t.months_plural, icon: '📊' },
    { value: '6-months', label: '6 ' + t.months_plural, icon: '🎯' },
    { value: '1-year', label: '1 ' + t.year, icon: '🏆' },
    { value: 'custom', label: t.custom, icon: '🔧' }
  ];

  // Language toggle function
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  const handleDurationChange = (duration: string) => {
    setFormData({ ...formData, duration });
    if (error) setError('');
  };

  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, customDuration: e.target.value });
    if (error) setError('');
  };

  const handleResourcesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, resources: e.target.value });
    if (error) setError('');
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Limit to 1000 characters
    if (value.length <= 1000) {
      setFormData({ ...formData, description: value });
      if (error) setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.duration || !formData.description.trim() || 
        (formData.duration === 'custom' && !formData.customDuration.trim())) {
      setError(t.requiredFieldsError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ 
          duration: '', 
          customDuration: '',
          resources: '', 
          description: '' 
        });
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(t.submitError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg shadow hover:shadow-md transition-all border border-gray-200"
        >
          <span className="text-lg">{language === 'en' ? '🇬🇧' : '🇫🇷'}</span>
          <span className="font-medium text-gray-700">{language === 'en' ? 'EN' : 'FR'}</span>
        </button>
      </div>
      
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-xl">
            <span className="text-2xl">🚀</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            {t.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Duration Selection */}
            <div className="space-y-4">
              <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-blue-500">⏱️</span>
                {t.durationLabel} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {durationOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleDurationChange(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      formData.duration === option.value
                        ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="text-sm font-medium text-gray-800">{option.label}</div>
                  </button>
                ))}
              </div>
              
              {/* Custom Duration Input */}
              {formData.duration === 'custom' && (
                <div className="mt-3 animate-fadeIn">
                  <input
                    type="text"
                    value={formData.customDuration}
                    onChange={handleCustomDurationChange}
                    placeholder={t.customDurationPlaceholder}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/70 backdrop-blur-sm"
                    required={formData.duration === 'custom'}
                  />
                </div>
              )}
            </div>

            {/* Resources Text Field */}
            <div className="space-y-4">
              <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-green-500">📋</span>
                {t.resourcesLabel}
              </label>
              <textarea
                id="resources"
                value={formData.resources}
                onChange={handleResourcesChange}
                placeholder={t.resourcesPlaceholder}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none bg-white/70 backdrop-blur-sm"
              />
              <p className={`text-sm ${formData.resources.length === 500 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                {formData.resources.length}/500 {t.resourcesHelper}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-purple-500">✍️</span>
                {t.descriptionLabel} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder={t.descriptionPlaceholder}
                rows={6}
                maxLength={1000}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none bg-white/70 backdrop-blur-sm"
                required
              />
              <p className={`text-sm ${formData.description.length === 1000 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                {formData.description.length}/1000 {t.descriptionHelper}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <span className="text-red-500 text-xl">⚠️</span>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <span className="text-green-500 text-xl">✅</span>
                <p className="text-green-700 font-medium">{t.successMessage}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t.submitting}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    🚀 {t.submitButton}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500">
          <p className="text-sm">
            {t.poweredBy}{' '}
            <a href="https://services.ceo" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
              Services.ceo
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
