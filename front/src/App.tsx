import { useState, useEffect } from 'react';
import ProjectResults from './components/ProjectResults';
import { apiCall, API_CONFIG } from './config/api';
import { apiMock } from './mock/api';
import logo from './assets/logo.png';

// Language translations
const translations = {
  en: {
    title: 'Launch Your Project',
    subtitle: 'Transform your ideas into reality. Start by telling us about your project vision and requirements.',
    durationLabel: 'Project Duration',
    resourcesLabel: 'Project Resources',
    resourcesPlaceholder:
      'List your project resources, tools, technologies, team members, budget, or any other resources you have available for this project...',
    resourcesHelper: 'characters • Include tools, budget, team, etc.',
    descriptionLabel: 'Project Description',
    descriptionPlaceholder:
      'Describe your project vision, goals, target audience, key features, and any specific requirements. The more detail you provide, the better we can help bring your project to life...',
    descriptionHelper: 'characters • Be as detailed as possible',
    customDurationPlaceholder: 'Enter custom duration (e.g., 4 months, 18 months)',
    requiredFieldsError: 'Please fill in all required fields',
    submitError: 'Failed to create project. Please try again.',
    serverError: 'Unable to connect to the server. Please make sure the backend is running.',
    submitting: 'Launching Project...',
    submitButton: 'Launch your Project',
    viewResultsButton: 'View Previous Results',
    successMessage: "Project created successfully! We'll be in touch soon.",
    poweredBy: 'Powered by',
    weeks: 'Week',
    weeks_plural: 'Weeks',
    months: 'Month',
    months_plural: 'Months',
    year: 'Year',
    custom: 'Custom Duration',
  },
  fr: {
    title: 'Lancez Votre Projet',
    subtitle: 'Transformez vos idées en réalité. Commencez par nous parler de votre vision et de vos besoins.',
    durationLabel: 'Durée du Projet',
    resourcesLabel: 'Ressources du Projet',
    resourcesPlaceholder:
      "Listez vos ressources, outils, technologies, membres de l'équipe, budget ou toute autre ressource disponible pour ce projet...",
    resourcesHelper: 'caractères • Incluez outils, budget, équipe, etc.',
    descriptionLabel: 'Description du Projet',
    descriptionPlaceholder:
      'Décrivez la vision de votre projet, les objectifs, le public cible, les fonctionnalités clés et toutes les exigences spécifiques. Plus vous fournissez de détails, mieux nous pourrons vous aider à donner vie à votre projet...',
    descriptionHelper: 'caractères • Soyez aussi détaillé que possible',
    customDurationPlaceholder: 'Entrez une durée personnalisée (ex: 4 mois, 18 mois)',
    requiredFieldsError: 'Veuillez remplir tous les champs obligatoires',
    submitError: 'Échec de la création du projet. Veuillez réessayer.',
    serverError:
      "Impossible de se connecter au serveur. Veuillez vous assurer que le backend est en cours d'exécution.",
    submitting: 'Lancement du Projet...',
    submitButton: 'Lancer votre Projet',
    viewResultsButton: 'Voir les Résultats Précédents',
    successMessage: 'Projet créé avec succès! Nous vous contacterons bientôt.',
    poweredBy: 'Propulsé par',
    weeks: 'Semaine',
    weeks_plural: 'Semaines',
    months: 'Mois',
    months_plural: 'Mois',
    year: 'An',
    custom: 'Durée Personnalisée',
  },
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
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [currentView, setCurrentView] = useState<'form' | 'results'>('form');
  const [hasPreviousResults, setHasPreviousResults] = useState(false);

  // Check for previous results on component mount
  useEffect(() => {
    const stored = localStorage.getItem('projectAnalysis');
    if (stored) {
      setHasPreviousResults(true);
    }
  }, []);

  // Get translations for current language
  const t = translations[language];

  const durationOptions = [
    {
      value: '1-week',
      label: '1 ' + (language === 'en' ? 'Week' : 'Semaine'),
      icon: '⚡',
    },
    {
      value: '2-weeks',
      label: '2 ' + (language === 'en' ? 'Weeks' : 'Semaines'),
      icon: '🚀',
    },
    { value: '1-month', label: '1 ' + t.months, icon: '📅' },
    { value: '2-months', label: '2 ' + t.months_plural, icon: '⏳' },
    { value: '3-months', label: '3 ' + t.months_plural, icon: '📊' },
    { value: '6-months', label: '6 ' + t.months_plural, icon: '🎯' },
    { value: '1-year', label: '1 ' + t.year, icon: '🏆' },
    { value: 'custom', label: t.custom, icon: '🔧' },
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

    if (
      !formData.duration ||
      !formData.description.trim() ||
      (formData.duration === 'custom' && !formData.customDuration.trim())
    ) {
      setError(t.requiredFieldsError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Prepare the project data for the manager agent
      const projectData = {
        duration: formData.duration === 'custom' ? formData.customDuration : formData.duration,
        resources: formData.resources || 'To be determined',
        description: formData.description,
        language: language,
      };

      let result;
      if (import.meta.env.VITE_USE_MOCK === '1') {
        result = apiMock;
      } else {
        // Create the message for the manager agent
        const message = `
      Analyze this project idea:

      **Project Description:** ${projectData.description}

      **Duration:** ${projectData.duration}

      **Available Resources:** ${projectData.resources}

      **Language:** ${projectData.language}

      Please provide a complete project analysis with specifications, risk evaluation, plan B, and a detailed Gantt roadmap planning.
            `.trim();

        // Call the backend API
        result = await apiCall(API_CONFIG.ENDPOINTS.MANAGER_INVOKE, {
          method: 'POST',
          body: JSON.stringify({
            message: message,
            context: projectData,
          }),
        });
      }

      // Show success and store the analysis result
      setSuccess(true);

      // You can store the result in state or localStorage for later use
      localStorage.setItem(
        'projectAnalysis',
        JSON.stringify({
          ...projectData,
          analysis: result.content,
          thread_id: result.thread_id,
          timestamp: new Date().toISOString(),
        })
      );

      // Navigate to results view after a short delay
      setTimeout(() => {
        setSuccess(false);
        setCurrentView('results');
      }, 2000);
    } catch (err) {
      console.error('Error submitting project:', err);
      if (err instanceof Error) {
        if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
          setError(t.serverError);
        } else {
          setError(err.message);
        }
      } else {
        setError(t.submitError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle navigation back to form
  const handleBackToForm = () => {
    setCurrentView('form');
    setFormData({
      duration: '',
      customDuration: '',
      resources: '',
      description: '',
    });
    setError('');
    setSuccess(false);
  };

  // Render results view if current view is results
  if (currentView === 'results') {
    return (
      <ProjectResults
        onBack={handleBackToForm}
        language={language}
      />
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#0A1B2A] via-[#0A1B2A] to-[#4B0082] py-8 px-4'>
      {/* Language Selector */}
      <div className='absolute top-4 right-4 z-10'>
        <button
          onClick={toggleLanguage}
          className='flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-xl rounded-xl shadow-xl hover:shadow-2xl transition-all border border-[#33E1FF]/20 hover:border-[#00B7FF]'
        >
          <span className='text-lg'>{language === 'en' ? '🇬🇧' : '🇫🇷'}</span>
          <span className='font-medium text-[#0A1B2A]'>{language === 'en' ? 'EN' : 'FR'}</span>
        </button>
      </div>

      {/* Background decorations */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-[#00B7FF]/20 to-[#33E1FF]/20 rounded-full blur-3xl'></div>
        <div className='absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-[#4B0082]/20 to-[#00B7FF]/20 rounded-full blur-3xl'></div>
      </div>

      <div className='max-w-4xl mx-auto relative'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='inline-flex items-center justify-center w-40 h-20 bg-white/01 backdrop-blur-xl rounded-md mb-6 shadow-xl p-1'>
            <img
              src={logo}
              alt='Axivio Logo'
              className='w-full h-full object-contain'
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0, 183, 255, 0.3))',
              }}
            />
          </div>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-white via-[#33E1FF] to-white bg-clip-text text-transparent mb-4'>
            {t.title}
          </h1>
          <p className='text-lg text-[#33E1FF] max-w-2xl mx-auto'>{t.subtitle}</p>
        </div>

        {/* Main Form Card */}
        <div className='bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-[#33E1FF]/20 p-8 mb-8'>
          <form
            onSubmit={handleSubmit}
            className='space-y-8'
          >
            {/* Duration Selection */}
            <div className='space-y-4'>
              <label className='text-lg font-semibold text-[#0A1B2A] flex items-center gap-2'>
                <span className='text-[#00B7FF]'>⏱️</span>
                {t.durationLabel} <span className='text-red-500'>*</span>
              </label>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                {durationOptions.map((option) => (
                  <button
                    key={option.value}
                    type='button'
                    onClick={() => handleDurationChange(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 bg-white/30 backdrop-blur-sm ${
                      formData.duration === option.value
                        ? 'border-[#00B7FF] bg-[#00B7FF]/20 shadow-lg shadow-[#00B7FF]/20'
                        : 'border-[#33E1FF]/20 hover:border-[#00B7FF] hover:bg-[#00B7FF]/10'
                    }`}
                  >
                    <div className='text-2xl mb-2'>{option.icon}</div>
                    <div className='text-sm font-medium text-[#0A1B2A]'>{option.label}</div>
                  </button>
                ))}
              </div>

              {/* Custom Duration Input */}
              {formData.duration === 'custom' && (
                <div className='mt-3 animate-fadeIn'>
                  <input
                    type='text'
                    value={formData.customDuration}
                    onChange={handleCustomDurationChange}
                    placeholder={t.customDurationPlaceholder}
                    className='w-full px-4 py-3 border border-[#33E1FF]/20 rounded-xl focus:ring-2 focus:ring-[#00B7FF] focus:border-transparent transition-all duration-200 bg-white/90 backdrop-blur-sm shadow-sm'
                    required={formData.duration === 'custom'}
                  />
                </div>
              )}
            </div>

            {/* Resources Text Field */}
            <div className='space-y-4'>
              <label className='text-lg font-semibold text-[#0A1B2A] flex items-center gap-2'>
                <span className='text-[#33E1FF]'>📋</span>
                {t.resourcesLabel}
              </label>
              <textarea
                id='resources'
                value={formData.resources}
                onChange={handleResourcesChange}
                placeholder={t.resourcesPlaceholder}
                rows={4}
                maxLength={500}
                className='w-full px-4 py-3 border border-[#33E1FF]/20 rounded-xl focus:ring-2 focus:ring-[#00B7FF] focus:border-transparent transition-all duration-200 resize-none bg-white/90 backdrop-blur-sm shadow-sm'
              />
              <p
                className={`text-sm ${
                  formData.resources.length === 500 ? 'text-red-500 font-medium' : 'text-[#33E1FF]'
                }`}
              >
                {formData.resources.length}/500 {t.resourcesHelper}
              </p>
            </div>

            {/* Description */}
            <div className='space-y-4'>
              <label className='text-lg font-semibold text-[#0A1B2A] flex items-center gap-2'>
                <span className='text-[#4B0082]'>✍️</span>
                {t.descriptionLabel} <span className='text-red-500'>*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder={t.descriptionPlaceholder}
                rows={6}
                maxLength={1000}
                className='w-full px-4 py-3 border border-[#33E1FF]/20 rounded-xl focus:ring-2 focus:ring-[#00B7FF] focus:border-transparent transition-all duration-200 resize-none bg-white/90 backdrop-blur-sm shadow-sm'
                required
              />
              <p
                className={`text-sm ${
                  formData.description.length === 1000 ? 'text-red-500 font-medium' : 'text-[#33E1FF]'
                }`}
              >
                {formData.description.length}/1000 {t.descriptionHelper}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className='bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm'>
                <span className='text-red-500 text-xl'>⚠️</span>
                <p className='text-red-700 font-medium'>{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className='bg-green-50/90 backdrop-blur-sm border border-green-200 rounded-xl p-4 flex items-center gap-3 shadow-sm'>
                <span className='text-green-500 text-xl'>✅</span>
                <p className='text-green-700 font-medium'>{t.successMessage}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-4 pt-4'>
              <button
                type='submit'
                disabled={isLoading}
                className='flex-1 bg-gradient-to-r from-[#00B7FF] to-[#33E1FF] text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-[#00B7FF]/90 hover:to-[#33E1FF]/90 focus:ring-4 focus:ring-[#00B7FF]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]'
              >
                {isLoading ? (
                  <span className='flex items-center justify-center gap-3'>
                    <svg
                      className='animate-spin h-5 w-5'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    {t.submitting}
                  </span>
                ) : (
                  <span className='flex items-center justify-center gap-2'>🚀 {t.submitButton}</span>
                )}
              </button>

              {hasPreviousResults && (
                <button
                  type='button'
                  onClick={() => setCurrentView('results')}
                  className='sm:w-auto bg-white/90 backdrop-blur-sm border-2 border-[#00B7FF] text-[#00B7FF] py-4 px-6 rounded-xl font-semibold text-lg hover:bg-[#00B7FF]/10 focus:ring-4 focus:ring-[#00B7FF]/30 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]'
                >
                  📊 {t.viewResultsButton}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className='text-center text-[#33E1FF]'>
          <p className='text-sm'>
            {t.poweredBy}{' '}
            <a
              href='https://services.ceo'
              className='text-[#00B7FF] hover:text-[#33E1FF] font-medium transition-colors'
            >
              Services.ceo
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
