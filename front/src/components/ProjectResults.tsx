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
  
  function extractJsonFromAnalysis(analysisText: string) {
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

  // const { parsedJson: ganttData, cleanedText: cleanAnalysisText } = extractJsonFromAnalysis(analysis?.analysis || '');

  // Function to clean the analysis content by removing <think></think> tags and other unwanted elements
  const cleanAnalysisContent = (content: string) => {
    if (!content) return '';
    
    // Remove <think></think> tags and their content
    let cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, '');
    
    // Remove ending phrases like "Let me know if you'd like to add more details..."
    cleaned = cleaned.replace(/Let me know if you.*?[🚀🔧🎯💡✨🌟]+\s*$/gi, '');
    cleaned = cleaned.replace(/N'hésitez pas à.*?[🚀🔧🎯💡✨🌟]+\s*$/gi, '');
    
    // Remove extra whitespace and newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    // Remove any remaining XML-like tags that might be artifacts
    cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, '');
    
    return cleaned.trim();
  };

  const parseAnalysisContent = (content: string) => {
    // First clean the content
    const cleanedContent = cleanAnalysisContent(content);
    
    const sections = {
      specifications: '',
      risks: '',
      planB: '',
      planning: '',
      fullContent: cleanedContent
    };

    // Split content by sections with more flexible patterns
    const specMatch = cleanedContent.match(/(?:### 1\.|##\s*1\.|1\.)\s*(?:📝\s*)?(?:SPÉCIFICATIONS|SPECIFICATIONS)[\s\S]*?(?=(?:### 2\.|##\s*2\.|2\.)|$)/i);
    const riskMatch = cleanedContent.match(/(?:### 2\.|##\s*2\.|2\.)\s*(?:⚠️\s*)?(?:ÉVALUATION DES RISQUES|RISK EVALUATION)[\s\S]*?(?=(?:### 3\.|##\s*3\.|3\.)|$)/i);
    const planBMatch = cleanedContent.match(/(?:### 3\.|##\s*3\.|3\.)\s*(?:🔄\s*)?(?:PLAN B)[\s\S]*?(?=(?:### 4\.|##\s*4\.|4\.)|$)/i);
    const planningMatch = cleanedContent.match(/(?:### 4\.|##\s*4\.|4\.)\s*(?:🗓️\s*)?(?:PLANNING|PLANNING \(Gantt Roadmap\))[\s\S]*?(?=```json|$)/i);

    if (specMatch) {
      sections.specifications = specMatch[0]?.trim() || '';
    }
    if (riskMatch) {
      sections.risks = riskMatch[0]?.trim() || '';
    }
    if (planBMatch) {
      sections.planB = planBMatch[0]?.trim() || '';
    }
    if (planningMatch) {
      sections.planning = planningMatch[0]?.trim() || '';
    }

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

  // Custom component for rendering sections with proper markdown styling
  const SectionCard = ({ title, content, icon, iconColor }: { title: string, content: string, icon: string, iconColor: string }) => {
    if (!content) return null;

    // Special handling for risk evaluation section
    if (title.includes('RISQUE') || title.includes('RISK')) {
      return <RiskEvaluationCard title={title} content={content} icon={icon} iconColor={iconColor} />;
    }

    // Special handling for specifications (summary table)
    if (title.includes('SPÉCIFICATIONS') || title.includes('SPECIFICATIONS')) {
      return <SpecificationsCard title={title} content={content} icon={icon} iconColor={iconColor} />;
    }

    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className={iconColor}>{icon}</span>
          {title}
        </h3>
        <div className="prose prose-sm max-w-none text-gray-700">
          <ReactMarkdown 
            components={{
              h1: ({children}) => <h1 className="text-xl font-bold text-gray-900 mb-3">{children}</h1>,
              h2: ({children}) => <h2 className="text-lg font-semibold text-gray-800 mb-2">{children}</h2>,
              h3: ({children}) => <h3 className="text-base font-medium text-gray-700 mb-2">{children}</h3>,
              p: ({children}) => <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>,
              ul: ({children}) => (
                <div className="mb-3 bg-gray-50 rounded-lg p-3 enhanced-list">
                  <ul className="space-y-1">{children}</ul>
                </div>
              ),
              ol: ({children}) => (
                <div className="mb-3 bg-gray-50 rounded-lg p-3 enhanced-list">
                  <ol className="space-y-1 list-decimal list-inside">{children}</ol>
                </div>
              ),
              li: ({children}) => (
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-blue-500 text-sm mt-1">▸</span>
                  <span className="text-sm">{children}</span>
                </li>
              ),
              strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
              em: ({children}) => <em className="italic text-gray-600">{children}</em>,
              blockquote: ({children}) => <blockquote className="border-l-4 border-blue-200 pl-4 py-2 bg-blue-50 rounded-r-lg mb-3">{children}</blockquote>,
              code: ({children}) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{children}</code>,
              pre: ({children}) => <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-3">{children}</pre>
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    );
  };

  // Custom Specifications Component (Summary Table)
  const SpecificationsCard = ({ title, content, icon, iconColor }: { title: string, content: string, icon: string, iconColor: string }) => {
    // Parse specifications content to extract structured data
    const parseSpecifications = (text: string) => {
      const specs: Array<{category: string, details: string}> = [];
      
      // Look for key-value patterns
      const lines = text.split('\n').filter(line => line.trim());
      let currentCategory = '';
      
      lines.forEach(line => {
        const cleanLine = line.replace(/[•\-\*]/g, '').trim();
        
        // Detect category headers
        if (cleanLine.includes(':') && !cleanLine.includes('📱') && !cleanLine.includes('🔧')) {
          const [category, details] = cleanLine.split(':');
          if (category && details) {
            specs.push({
              category: category.trim(),
              details: details.trim()
            });
          }
        } else if (cleanLine.match(/^(Objectif|Cible|Public|Fonctionnalités|Technologies|Plateforme)/i)) {
          currentCategory = cleanLine;
        } else if (currentCategory && cleanLine.length > 10) {
          specs.push({
            category: currentCategory,
            details: cleanLine
          });
          currentCategory = '';
        }
      });
      
      return specs.filter(spec => spec.category.length > 2 && spec.details.length > 3);
    };

    const specifications = parseSpecifications(content);

    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className={iconColor}>{icon}</span>
          {title}
        </h3>
        
        {specifications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Élément</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody>
                {specifications.map((spec, index) => (
                  <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                    <td className="border border-gray-200 px-4 py-3 font-medium text-gray-800 bg-gray-50/50">{spec.category}</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">{spec.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    );
  };

  // Custom Risk Evaluation Component
  const RiskEvaluationCard = ({ title, content, icon, iconColor }: { title: string, content: string, icon: string, iconColor: string }) => {
    // Parse risk content to extract structured data
    const parseRiskContent = (text: string) => {
      const risks: Array<{category: string, level: string, probability: string, impact: string, mitigation: string}> = [];
      
      // Look for risk patterns in the text
      const riskSections = text.split(/(?=🔴|🟡|🟢|(?:Risque\s+)?(?:Élevé|Moyen|Faible)|(?:Risk\s+)?(?:High|Medium|Low))/i);
      
      riskSections.forEach(section => {
        if (section.trim().length < 10) return;
        
        let level = 'Moyen';
        let color = 'bg-yellow-100 text-yellow-800';
        
        if (section.includes('🔴') || /(?:élevé|high)/i.test(section)) {
          level = 'Élevé';
          color = 'bg-red-100 text-red-800';
        } else if (section.includes('🟢') || /(?:faible|low)/i.test(section)) {
          level = 'Faible';
          color = 'bg-green-100 text-green-800';
        } else if (section.includes('🟡') || /(?:moyen|medium)/i.test(section)) {
          level = 'Moyen';
          color = 'bg-yellow-100 text-yellow-800';
        }

        // Extract category (first line usually)
        const lines = section.split('\n').filter(line => line.trim());
        const category = lines[0]?.replace(/[🔴🟡🟢]/g, '').replace(/(?:Risque\s+)?(?:Élevé|Moyen|Faible)/gi, '').trim() || 'Risque';
        
        // Try to extract probability and impact
        const probabilityMatch = section.match(/probabilité[:\s]*([^\.]*)/i);
        const impactMatch = section.match(/impact[:\s]*([^\.]*)/i);
        const mitigationMatch = section.match(/(?:mitigation|solution|atténuation)[:\s]*([^\.]*)/i);
        
        risks.push({
          category: category.substring(0, 50),
          level,
          probability: probabilityMatch?.[1]?.trim().substring(0, 30) || 'Non spécifiée',
          impact: impactMatch?.[1]?.trim().substring(0, 30) || 'Non spécifié',
          mitigation: mitigationMatch?.[1]?.trim().substring(0, 60) || 'À définir'
        });
      });
      
      return risks.filter(risk => risk.category.length > 3);
    };

    const risks = parseRiskContent(content);

    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className={iconColor}>{icon}</span>
          {title}
        </h3>
        
        {risks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Catégorie</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Niveau</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Probabilité</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Impact</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Mitigation</th>
                </tr>
              </thead>
              <tbody>
                {risks.map((risk, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">{risk.category}</td>
                    <td className="border border-gray-200 px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        risk.level === 'Élevé' ? 'bg-red-100 text-red-800' :
                        risk.level === 'Faible' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {risk.level}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">{risk.probability}</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">{risk.impact}</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">{risk.mitigation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    );
  };

  // Custom Gantt Chart Component
  const GanttChart = ({ tasks }: { tasks: GanttTask[] }) => {
    if (!tasks || tasks.length === 0) return null;

    const parseDate = (dateStr: string) => {
      // Handle various date formats
      try {
        return new Date(dateStr);
      } catch {
        return new Date();
      }
    };

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    };

    const getTaskColor = (index: number) => {
      const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 
        'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500'
      ];
      return colors[index % colors.length];
    };

    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-purple-500">📊</span>
          Planning Gantt Interactif
        </h3>
        
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Timeline Header */}
            <div className="grid grid-cols-12 gap-1 mb-4 text-xs text-gray-500">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="text-center font-medium">
                  Sem {i + 1}
                </div>
              ))}
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div key={task.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getTaskColor(index)}`}></div>
                      <span className="font-medium text-gray-800 text-sm">{task.text}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {task.duration} jours
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full ${getTaskColor(index)} transition-all duration-500`}
                      style={{ width: `${task.progress || 0}%` }}
                    ></div>
                  </div>
                  
                  {/* Dates */}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Début: {task.start}</span>
                    <span>Fin: {task.end}</span>
                    <span>Progression: {task.progress || 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

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

        {/* Full Analysis Content */}
        {sections.fullContent && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-purple-500">🤖</span>
              Analyse IA Complète
            </h2>
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown 
                components={{
                  h1: ({children}) => <h1 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">{children}</h1>,
                  h2: ({children}) => <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-6">{children}</h2>,
                  h3: ({children}) => <h3 className="text-lg font-medium text-gray-700 mb-2 mt-4">{children}</h3>,
                  h4: ({children}) => <h4 className="text-base font-medium text-gray-600 mb-2 mt-3">{children}</h4>,
                  p: ({children}) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
                  ul: ({children}) => (
                    <div className="mb-4 bg-gray-50 rounded-lg p-4">
                      <ul className="space-y-2">{children}</ul>
                    </div>
                  ),
                  ol: ({children}) => (
                    <div className="mb-4 bg-gray-50 rounded-lg p-4">
                      <ol className="space-y-2 list-decimal list-inside">{children}</ol>
                    </div>
                  ),
                  li: ({children}) => (
                    <li className="flex items-start gap-2 text-gray-700 leading-relaxed">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{children}</span>
                    </li>
                  ),
                  strong: ({children}) => <strong className="font-semibold text-gray-900 bg-blue-50 px-1 rounded">{children}</strong>,
                  em: ({children}) => <em className="italic text-gray-600">{children}</em>,
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-blue-300 pl-6 py-3 bg-blue-50/50 rounded-r-lg mb-4 italic">
                      {children}
                    </blockquote>
                  ),
                  code: ({children}) => (
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-red-600">
                      {children}
                    </code>
                  ),
                  pre: ({children}) => (
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 shadow-inner">
                      {children}
                    </pre>
                  ),
                  table: ({children}) => (
                    <div className="overflow-x-auto mb-4">
                      <table className="min-w-full border border-gray-200 rounded-lg bg-white shadow-sm">{children}</table>
                    </div>
                  ),
                  th: ({children}) => (
                    <th className="bg-gray-50 border border-gray-200 px-4 py-3 text-left font-semibold text-gray-900">
                      {children}
                    </th>
                  ),
                  td: ({children}) => (
                    <td className="border border-gray-200 px-4 py-3 text-gray-700">{children}</td>
                  )
                }}
              >
                {sections.fullContent}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Analysis Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SectionCard 
            title={t.sections.specifications}
            content={sections.specifications}
            icon="📝"
            iconColor="text-blue-500"
          />
          
          <SectionCard 
            title={t.sections.risks}
            content={sections.risks}
            icon="⚠️"
            iconColor="text-red-500"
          />
          
          <SectionCard 
            title={t.sections.planB}
            content={sections.planB}
            icon="🔄"
            iconColor="text-orange-500"
          />
          
          <SectionCard 
            title={t.sections.planning}
            content={sections.planning}
            icon="🗓️"
            iconColor="text-green-500"
          />
        </div>

        {/* Gantt Chart */}
        {ganttTasks.length > 0 && <GanttChart tasks={ganttTasks} />}
      </div>
    </div>
  );
}
