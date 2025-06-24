import { useState, useEffect } from 'react';

type TranslationKey = keyof typeof translations.en;

const translations = {
  en: {
    title: 'AI Text Corrector',
    poweredBy: 'Powered by',
    subtitle: 'Correct spelling, grammar, and vocabulary in multiple languages',
    selectLanguage: 'Select Language',
    languageHelp: 'Choose the language of your text',
    yourText: 'Your Text',
    textPlaceholder: 'Enter your text here to be corrected...',
    textHelp: 'Paste or type the text you want to correct',
    correctText: 'Correct Text',
    correcting: 'Correcting...',
    clear: 'Clear',
    correctedText: 'Corrected Text',
    copyToClipboard: 'Copy to Clipboard',
    enterTextError: 'Please enter some text to correct',
    failedError: 'Failed to correct text. Please try again.',
    languages: {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese'
    }
  },
  es: {
    title: 'Corrector de Texto IA',
    poweredBy: 'Desarrollado por',
    subtitle: 'Corrige ortografía, gramática y vocabulario en múltiples idiomas',
    selectLanguage: 'Seleccionar Idioma',
    languageHelp: 'Elige el idioma de tu texto',
    yourText: 'Tu Texto',
    textPlaceholder: 'Ingresa tu texto aquí para ser corregido...',
    textHelp: 'Pega o escribe el texto que quieres corregir',
    correctText: 'Corregir Texto',
    correcting: 'Corrigiendo...',
    clear: 'Limpiar',
    correctedText: 'Texto Corregido',
    copyToClipboard: 'Copiar al Portapapeles',
    enterTextError: 'Por favor ingresa algún texto para corregir',
    failedError: 'Error al corregir el texto. Por favor intenta de nuevo.',
    languages: {
      en: 'Inglés',
      es: 'Español',
      fr: 'Francés',
      de: 'Alemán',
      it: 'Italiano',
      pt: 'Portugués'
    }
  },
  fr: {
    title: 'Correcteur de Texte IA',
    poweredBy: 'Alimenté par',
    subtitle: 'Corrigez l\'orthographe, la grammaire et le vocabulaire en plusieurs langues',
    selectLanguage: 'Sélectionner la Langue',
    languageHelp: 'Choisissez la langue de votre texte',
    yourText: 'Votre Texte',
    textPlaceholder: 'Entrez votre texte ici pour être corrigé...',
    textHelp: 'Collez ou tapez le texte que vous voulez corriger',
    correctText: 'Corriger le Texte',
    correcting: 'Correction...',
    clear: 'Effacer',
    correctedText: 'Texte Corrigé',
    copyToClipboard: 'Copier dans le Presse-papiers',
    enterTextError: 'Veuillez entrer du texte à corriger',
    failedError: 'Échec de la correction du texte. Veuillez réessayer.',
    languages: {
      en: 'Anglais',
      es: 'Espagnol',
      fr: 'Français',
      de: 'Allemand',
      it: 'Italien',
      pt: 'Portugais'
    }
  },
  de: {
    title: 'KI-Textkorrektur',
    poweredBy: 'Unterstützt von',
    subtitle: 'Korrigieren Sie Rechtschreibung, Grammatik und Wortschatz in mehreren Sprachen',
    selectLanguage: 'Sprache Auswählen',
    languageHelp: 'Wählen Sie die Sprache Ihres Textes',
    yourText: 'Ihr Text',
    textPlaceholder: 'Geben Sie hier Ihren Text zur Korrektur ein...',
    textHelp: 'Fügen Sie den zu korrigierenden Text ein oder tippen Sie ihn',
    correctText: 'Text Korrigieren',
    correcting: 'Korrigiere...',
    clear: 'Löschen',
    correctedText: 'Korrigierter Text',
    copyToClipboard: 'In Zwischenablage Kopieren',
    enterTextError: 'Bitte geben Sie Text zur Korrektur ein',
    failedError: 'Textkorrektur fehlgeschlagen. Bitte versuchen Sie es erneut.',
    languages: {
      en: 'Englisch',
      es: 'Spanisch',
      fr: 'Französisch',
      de: 'Deutsch',
      it: 'Italienisch',
      pt: 'Portugiesisch'
    }
  }
} as const;

const detectBrowserLanguage = (): keyof typeof translations => {
  const browserLang = navigator.language.split('-')[0] as keyof typeof translations;
  return translations[browserLang] ? browserLang : 'en';
};

export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof translations>(() => {
    const saved = localStorage.getItem('ui-language');
    return (saved as keyof typeof translations) || detectBrowserLanguage();
  });

  useEffect(() => {
    localStorage.setItem('ui-language', currentLanguage);
  }, [currentLanguage]);

  const t = (key: TranslationKey): string => {
    return translations[currentLanguage][key] as string;
  };

  const changeLanguage = (lang: keyof typeof translations) => {
    setCurrentLanguage(lang);
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
    availableLanguages: Object.keys(translations) as Array<keyof typeof translations>
  };
};
