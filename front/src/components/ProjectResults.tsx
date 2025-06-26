import { useState, useEffect } from 'react';
import ReactMarkdown from "react-markdown";

interface GanttTask {
  id: string;
  text: string;
  start: string;
  end: string;
  duration: number;
  progress: number;
  type: string;
}

interface ProjectAnalysis {
  duration: string;
  resources: string;
  description: string;
  language: string;
  analysis: string;
  thread_id: string;
  timestamp: string;
}

interface ProjectResultsProps {
  onBack: () => void;
  language: 'en' | 'fr';
}

const translations = {
  en: {
    title: 'Project Analysis Results',
    backButton: 'Create New Project',
    noResults: 'No project analysis found. Please create a project first.',
    loading: 'Loading analysis...',
    sections: {
      specifications: 'SPECIFICATIONS',
      risks: 'RISK EVALUATION',
      planB: 'PLAN B',
      planning: 'PLANNING (Gantt Roadmap)'
    },
    projectInfo: 'Project Information',
    duration: 'Duration',
    resources: 'Resources',
    description: 'Description',
    analyzedOn: 'Analyzed on',
    threadId: 'Thread ID'
  },
  fr: {
    title: 'Résultats de l\'Analyse du Projet',
    backButton: 'Créer un Nouveau Projet',
    noResults: 'Aucune analyse de projet trouvée. Veuillez d\'abord créer un projet.',
    loading: 'Chargement de l\'analyse...',
    sections: {
      specifications: 'SPÉCIFICATIONS',
      risks: 'ÉVALUATION DES RISQUES',
      planB: 'PLAN B',
      planning: 'PLANNING (Feuille de Route Gantt)'
    },
    projectInfo: 'Informations du Projet',
    duration: 'Durée',
    resources: 'Ressources',
    description: 'Description',
    analyzedOn: 'Analysé le',
    threadId: 'ID de Thread'
  }
};

export default function ProjectResults({ onBack, language }: ProjectResultsProps) {
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);

  const t = translations[language];

  useEffect(() => {
    const loadAnalysis = () => {
      try {
        const stored = localStorage.getItem('projectAnalysis');
        if (stored) {
          const data = JSON.parse(stored);
          setAnalysis(data);
          
          // Extract Gantt tasks from the analysis content
          const ganttMatch = data.analysis.match(/```json\s*(\[[\s\S]*?\])\s*```/);
          if (ganttMatch) {
            try {
              const tasks = JSON.parse(ganttMatch[1]);
              setGanttTasks(tasks);
            } catch (e) {
              console.error('Failed to parse Gantt tasks:', e);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  function extractJsonFromAnalysis(analysisText) {
    const jsonPattern = /```json\n([\s\S]*?)\n```/;
    const match = analysisText.match(jsonPattern);
    
    let cleanedText = analysisText;
    let parsedJson = null;
    
    if (match && match[1]) {
      try {
        parsedJson = JSON.parse(match[1]);
        cleanedText = analysisText.replace(/```json\n[\s\S]*?\n```/, '');
      } catch (error) {
        console.error("Failed to parse JSON:", error);
      }
    }
    
    return { parsedJson, cleanedText };
  }

const { parsedJson: ganttData, cleanedText: cleanAnalysisText } = extractJsonFromAnalysis(analysis?.analysis || '');

  const parseAnalysisContent = (content: string) => {
    const sections = {
      specifications: '',
      risks: '',
      planB: '',
      planning: ''
    };

    // Split content by sections
    const specMatch = content.match(/### 1\. 📝 SPÉCIFICATIONS|### 1\. 📝 SPECIFICATIONS([\s\S]*?)(?=### 2\.|$)/i);
    const riskMatch = content.match(/### 2\. ⚠️ ÉVALUATION DES RISQUES|### 2\. ⚠️ RISK EVALUATION([\s\S]*?)(?=### 3\.|$)/i);
    const planBMatch = content.match(/### 3\. 🔄 PLAN B([\s\S]*?)(?=### 4\.|$)/i);
    const planningMatch = content.match(/### 4\. 🗓️ PLANNING|### 4\. 🗓️ PLANNING \(Gantt Roadmap\)([\s\S]*?)(?=```json|$)/i);

    if (specMatch) sections.specifications = specMatch[1]?.trim() || '';
    if (riskMatch) sections.risks = riskMatch[1]?.trim() || '';
    if (planBMatch) sections.planB = planBMatch[1]?.trim() || '';
    if (planningMatch) sections.planning = planningMatch[1]?.trim() || '';

    return sections;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-gray-600 mb-6">{t.noResults}</p>
          <button
            onClick={onBack}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            {t.backButton}
          </button>
        </div>
      </div>
    );
  }

  const sections = parseAnalysisContent(analysis.analysis);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl shadow-lg">
              <span className="text-xl">✅</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              {t.title}
            </h1>
          </div>
          <button
            onClick={onBack}
            className="bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:bg-white hover:shadow-md transition-all"
          >
            ← {t.backButton}
          </button>
        </div>

        {/* Project Information Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-blue-500">📋</span>
            {t.projectInfo}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">{t.duration}:</span>
              <span className="ml-2 text-gray-800">{analysis.duration}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">{t.analyzedOn}:</span>
              <span className="ml-2 text-gray-800">{formatDate(analysis.timestamp)}</span>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-gray-600">{t.resources}:</span>
              <span className="ml-2 text-gray-800">{analysis.resources}</span>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-gray-600">{t.description}:</span>
              <p className="mt-1 text-gray-800">{analysis.description}</p>
            </div>
            <div className="md:col-span-2 text-xs text-gray-500">
              <span className="font-medium">{t.threadId}:</span>
              <span className="ml-2">{analysis.thread_id}</span>
            </div>
          </div>
        </div>

        <div> <ReactMarkdown>{cleanAnalysisText}</ReactMarkdown> </div>

        {/* Analysis Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Specifications */}
          {sections.specifications && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-blue-500">📝</span>
                {t.sections.specifications}
              </h3>
              <div className="prose prose-sm max-w-none text-gray-700">
                <pre className="whitespace-pre-wrap font-sans">{sections.specifications}</pre>
              </div>
            </div>
          )}

          {/* Risk Evaluation */}
          {sections.risks && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                {t.sections.risks}
              </h3>
              <div className="prose prose-sm max-w-none text-gray-700">
                <pre className="whitespace-pre-wrap font-sans">{sections.risks}</pre>
              </div>
            </div>
          )}

          {/* Plan B */}
          {sections.planB && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-orange-500">🔄</span>
                {t.sections.planB}
              </h3>
              <div className="prose prose-sm max-w-none text-gray-700">
                <pre className="whitespace-pre-wrap font-sans">{sections.planB}</pre>
              </div>
            </div>
          )}

          {/* Planning */}
          {sections.planning && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-green-500">🗓️</span>
                {t.sections.planning}
              </h3>
              <div className="prose prose-sm max-w-none text-gray-700">
                <pre className="whitespace-pre-wrap font-sans">{sections.planning}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Gantt Chart */}
        {ganttTasks.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-purple-500">📊</span>
              Gantt Timeline
            </h3>
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {ganttTasks.map((task, index) => (
                  <div key={task.id} className="border-b border-gray-200 py-3 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 mr-4">
                      {index + 1}
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium text-gray-800">{task.text}</div>
                      <div className="text-sm text-gray-500">
                        {task.start} → {task.end} ({task.duration} days)
                      </div>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2 ml-4">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
