import { useState } from 'react';
import { useTranslation } from './hooks/useTranslation';

export default function App() {
  const { t, currentLanguage, changeLanguage, availableLanguages } = useTranslation();

  const [formData, setFormData] = useState({
    text: '',
    language: 'en',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [correctedText, setCorrectedText] = useState('');
  const [error, setError] = useState('');

  const MAX_CHARACTERS = 5000;

  const languages = [
    { code: 'en', name: (t('languages') as unknown as { en: string }).en, flag: '🇺🇸' },
    { code: 'es', name: (t('languages') as unknown as { es: string }).es, flag: '🇪🇸' },
    { code: 'fr', name: (t('languages') as unknown as { fr: string }).fr, flag: '🇫🇷' },
    { code: 'de', name: (t('languages') as unknown as { de: string }).de, flag: '🇩🇪' },
    { code: 'it', name: (t('languages') as unknown as { it: string }).it, flag: '🇮🇹' },
    { code: 'pt', name: (t('languages') as unknown as { pt: string }).pt, flag: '🇵🇹' },
  ];

  const uiLanguageNames = {
    en: { name: 'English', flag: '🇺🇸' },
    es: { name: 'Español', flag: '🇪🇸' },
    fr: { name: 'Français', flag: '🇫🇷' },
    de: { name: 'Deutsch', flag: '🇩🇪' },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.text.trim()) {
      setError(t('enterTextError'));
      return;
    }

    setIsLoading(true);
    setError('');
    setCorrectedText('');

    try {
      // TODO: Replace with actual API call to AI agent
      // Simulating API call for now
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock response - replace with actual API integration
      setCorrectedText(`Corrected version of: "${formData.text}"`);
    } catch (err) {
      console.error(err);
      setError(t('failedError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'text' && value.length > MAX_CHARACTERS) {
      return; // Don't allow input beyond the limit
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleClear = () => {
    setFormData({ text: '', language: 'en' });
    setCorrectedText('');
    setError('');
  };

  return (
    <div className='h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-4 overflow-hidden'>
      <div className='max-w-4xl mx-auto h-full flex flex-col'>
        {/* Header */}
        <div className='text-center mb-6'>
          <div className='flex justify-between items-center mb-3'>
            <div></div>
            {/* Language Switcher */}
            <div className='relative'>
              <select
                value={currentLanguage}
                onChange={(e) => changeLanguage(e.target.value as keyof typeof uiLanguageNames)}
                className='bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer'
                aria-label='Select interface language'
              >
                {availableLanguages.map((lang) => (
                  <option
                    key={lang}
                    value={lang}
                  >
                    {uiLanguageNames[lang].flag} {uiLanguageNames[lang].name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h1 className='text-3xl font-bold text-gray-900 mb-2'>{t('title')}</h1>
          <p className='text-base text-gray-600'>
            {t('poweredBy')}{' '}
            <a
              href='https://services.ceo'
              className='text-blue-600 hover:text-blue-800 underline'
            >
              Services.ceo
            </a>
          </p>
          <p className='text-sm text-gray-500 mt-1'>{t('subtitle')}</p>
        </div>

        {/* Main Form */}
        <div className='bg-white rounded-xl shadow-lg p-4 mb-4 flex-1 overflow-hidden flex flex-col'>
          <form
            onSubmit={handleSubmit}
            className='space-y-4 flex-1 flex flex-col'
          >
            {/* Language Selection */}
            <div>
              <label
                htmlFor='language'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                {t('selectLanguage')}
              </label>
              <select
                id='language'
                name='language'
                value={formData.language}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer'
                aria-describedby='language-help'
              >
                {languages.map((lang) => (
                  <option
                    key={lang.code}
                    value={lang.code}
                  >
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <p
                id='language-help'
                className='text-xs text-gray-500 mt-1'
              >
                {t('languageHelp')}
              </p>
            </div>

            {/* Text Input */}
            <div className='flex-1 flex flex-col'>
              <label
                htmlFor='text'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                {t('yourText')}
              </label>
              <textarea
                id='text'
                name='text'
                value={formData.text}
                onChange={handleInputChange}
                placeholder={t('textPlaceholder')}
                maxLength={MAX_CHARACTERS}
                className='flex-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none'
                aria-describedby='text-help'
                required
              />
              <div className='flex justify-between items-center mt-1'>
                <p
                  id='text-help'
                  className='text-xs text-gray-500'
                >
                  {t('textHelp')}
                </p>
                <p
                  className={`text-xs ${
                    formData.text.length > MAX_CHARACTERS * 0.9 ? 'text-amber-600' : 'text-gray-500'
                  }`}
                >
                  {formData.text.length}/{MAX_CHARACTERS}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className='bg-red-50 border border-red-200 rounded-lg p-2'
                role='alert'
              >
                <p className='text-sm text-red-700'>{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className='flex flex-col sm:flex-row gap-3'>
              <button
                type='submit'
                disabled={isLoading || !formData.text.trim()}
                className='flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer'
                aria-describedby='submit-help'
              >
                {isLoading ? (
                  <span className='flex items-center justify-center'>
                    <svg
                      className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
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
                    {t('correcting')}
                  </span>
                ) : (
                  t('correctText')
                )}
              </button>

              <button
                type='button'
                onClick={handleClear}
                className='flex-1 sm:flex-initial bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium cursor-pointer'
              >
                {t('clear')}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {correctedText && (
          <div className='bg-white rounded-xl shadow-lg p-4 flex-shrink-0 max-h-48 overflow-y-auto'>
            <h2 className='text-lg font-semibold text-gray-900 mb-3'>{t('correctedText')}</h2>
            <div className='bg-green-50 border border-green-200 rounded-lg p-3'>
              <p className='text-gray-800 whitespace-pre-wrap text-sm'>{correctedText}</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(correctedText)}
              className='mt-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition-colors cursor-pointer'
            >
              {t('copyToClipboard')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
