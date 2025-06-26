import { useState, useEffect, useMemo, useCallback } from 'react';
import Chart from 'react-google-charts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
      planning: 'PLANNING (Gantt Roadmap)',
    },
    projectInfo: 'Project Information',
    duration: 'Duration',
    resources: 'Resources',
    description: 'Description',
    analyzedOn: 'Analyzed on',
    threadId: 'Thread ID',
  },
  fr: {
    title: "Résultats de l'Analyse du Projet",
    backButton: 'Créer un Nouveau Projet',
    noResults: "Aucune analyse de projet trouvée. Veuillez d'abord créer un projet.",
    loading: "Chargement de l'analyse...",
    sections: {
      specifications: 'SPÉCIFICATIONS',
      risks: 'ÉVALUATION DES RISQUES',
      planB: 'PLAN B',
      planning: 'PLANNING (Feuille de Route Gantt)',
    },
    projectInfo: 'Informations du Projet',
    duration: 'Durée',
    resources: 'Ressources',
    description: 'Description',
    analyzedOn: 'Analysé le',
    threadId: 'ID de Thread',
  },
};

export default function ProjectResults({ onBack, language }: ProjectResultsProps) {
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [gantt, setGantt] = useState<
    Array<{
      id?: string;
      name?: string;
      text?: string;
      start?: string;
      end?: string;
      duration?: number;
      progress?: number;
      resource?: string;
      dependencies?: string;
    }>
  >([]);

  const t = translations[language];

  useEffect(() => {
    const loadAnalysis = () => {
      try {
        const stored = localStorage.getItem('projectAnalysis');
        if (stored) {
          const data = JSON.parse(stored);
          setAnalysis(data);

          // Extract Gantt JSON data from analysis - look for multiple possible JSON blocks
          const ganttJsonMatches = data.analysis.match(/```json\s*(\[[\s\S]*?\])\s*```/g);
          if (ganttJsonMatches) {
            // Try each JSON block to find the one with Gantt data
            for (const match of ganttJsonMatches) {
              const jsonContent = match.match(/```json\s*(\[[\s\S]*?\])\s*```/);
              if (jsonContent) {
                try {
                  const ganttData = JSON.parse(jsonContent[1]);
                  // Check if this looks like Gantt data (has id, name/text, start, end)
                  if (
                    Array.isArray(ganttData) &&
                    ganttData.length > 0 &&
                    ganttData[0] &&
                    (ganttData[0].id || ganttData[0].name || ganttData[0].text)
                  ) {
                    setGantt(ganttData);
                    break;
                  }
                } catch (error) {
                  console.error('Failed to parse Gantt JSON block:', error);
                }
              }
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

  const formatDate = useCallback(
    (dateString: string) => {
      return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    [language]
  );

  // Function to clean the analysis content by removing <think></think> tags and other unwanted elements
  const cleanAnalysisContent = useCallback((content: string) => {
    if (!content) return '';

    // Remove <think></think> tags and their content
    let cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, '');

    // Remove ending phrases like "Let me know if you'd like to add more details..."
    cleaned = cleaned.replace(/Let me know if you.*?(?:🚀|🔧|🎯|💡|✨|🌟)+\s*$/giu, '');
    cleaned = cleaned.replace(/N'hésitez pas à.*?(?:🚀|🔧|🎯|💡|✨|🌟)+\s*$/giu, '');

    // Remove extra whitespace and newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // Remove any remaining XML-like tags that might be artifacts
    cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, '');

    // Remove JSON blocks from the cleaned content (they're processed separately in useEffect)
    cleaned = cleaned.replace(/```json\s*(\[[\s\S]*?\])\s*```/g, '');

    cleaned = cleaned.replace(/---\n\n## 🗓️ PLANNING \(Gantt Roadmap\).*?/i, '');

    return cleaned.trim();
  }, []);

  const parseAnalysisContent = useCallback(
    (content: string) => {
      // First clean the content
      const cleanedContent = cleanAnalysisContent(content);

      const sections = {
        specifications: '',
        risks: '',
        planB: '',
        planning: '',
        fullContent: cleanedContent,
      };

      // Split content by sections with more flexible patterns
      const specMatch = cleanedContent.match(
        /(?:### 1\.|##\s*1\.|1\.)\s*(?:📝\s*)?(?:SPÉCIFICATIONS|SPECIFICATIONS)[\s\S]*?(?=(?:### 2\.|##\s*2\.|2\.)|$)/i
      );
      const riskMatch = cleanedContent.match(
        /(?:### 2\.|##\s*2\.|2\.)\s*(?:⚠️\s*)?(?:ÉVALUATION DES RISQUES|RISK EVALUATION)[\s\S]*?(?=(?:### 3\.|##\s*3\.|3\.)|$)/i
      );
      const planBMatch = cleanedContent.match(
        /(?:### 3\.|##\s*3\.|3\.)\s*(?:🔄\s*)?(?:PLAN B)[\s\S]*?(?=(?:### 4\.|##\s*4\.|4\.)|$)/i
      );
      const planningMatch = cleanedContent.match(
        /(?:### 4\.|##\s*4\.|4\.)\s*(?:🗓️\s*)?(?:PLANNING|PLANNING \(Gantt Roadmap\))[\s\S]*?(?=```json|$)/i
      );

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
    },
    [cleanAnalysisContent]
  );

  const sections = useMemo(() => {
    if (!analysis?.analysis)
      return {
        specifications: '',
        risks: '',
        planB: '',
        planning: '',
        fullContent: '',
      };

    return parseAnalysisContent(analysis.analysis);
  }, [analysis?.analysis, parseAnalysisContent]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>😔</div>
          <p className='text-gray-600 mb-6'>{t.noResults}</p>
          <button
            onClick={onBack}
            className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all'
          >
            {t.backButton}
          </button>
        </div>
      </div>
    );
  }

  // Custom component for rendering sections with proper markdown styling
  const SectionCard = ({
    title,
    content,
    icon,
    iconColor,
  }: {
    title: string;
    content: string;
    icon: string;
    iconColor: string;
  }) => {
    if (!content) return null;

    // Special handling for risk evaluation section
    if (title.includes('RISQUE') || title.includes('RISK')) {
      return (
        <RiskEvaluationCard
          title={title}
          content={content}
          icon={icon}
          iconColor={iconColor}
        />
      );
    }

    // Special handling for specifications (summary table)
    if (title.includes('SPÉCIFICATIONS') || title.includes('SPECIFICATIONS')) {
      return (
        <SpecificationsCard
          title={title}
          content={content}
          icon={icon}
          iconColor={iconColor}
        />
      );
    }

    return (
      <div className='bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
          <span className={iconColor}>{icon}</span>
          {title}
        </h3>
        <div className='prose prose-sm max-w-none text-gray-700'>
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className='text-xl font-bold text-gray-900 mb-3'>{children}</h1>,
              h2: ({ children }) => <h2 className='text-lg font-semibold text-gray-800 mb-2'>{children}</h2>,
              h3: ({ children }) => <h3 className='text-base font-medium text-gray-700 mb-2'>{children}</h3>,
              p: ({ children }) => <p className='mb-3 text-gray-700 leading-relaxed'>{children}</p>,
              ul: ({ children }) => (
                <div className='mb-3 bg-gray-50 rounded-lg p-3 enhanced-list'>
                  <ul className='space-y-1'>{children}</ul>
                </div>
              ),
              ol: ({ children }) => (
                <div className='mb-3 bg-gray-50 rounded-lg p-3 enhanced-list'>
                  <ol className='space-y-1 list-decimal list-inside'>{children}</ol>
                </div>
              ),
              li: ({ children }) => (
                <li className='flex items-start gap-2 text-gray-700'>
                  <span className='text-blue-500 text-sm mt-1'>▸</span>
                  <span className='text-sm'>{children}</span>
                </li>
              ),
              strong: ({ children }) => <strong className='font-semibold text-gray-900'>{children}</strong>,
              em: ({ children }) => <em className='italic text-gray-600'>{children}</em>,
              blockquote: ({ children }) => (
                <blockquote className='border-l-4 border-blue-200 pl-4 py-2 bg-blue-50 rounded-r-lg mb-3'>
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className='bg-gray-100 px-2 py-1 rounded text-sm font-mono'>{children}</code>
              ),
              pre: ({ children }) => <pre className='bg-gray-100 p-4 rounded-lg overflow-x-auto mb-3'>{children}</pre>,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    );
  };

  // Custom Specifications Component (Summary Table)
  const SpecificationsCard = ({
    title,
    content,
    icon,
    iconColor,
  }: {
    title: string;
    content: string;
    icon: string;
    iconColor: string;
  }) => {
    // Parse specifications content to extract structured data
    const parseSpecifications = (text: string) => {
      const specs: Array<{ category: string; details: string }> = [];

      // Look for key-value patterns
      const lines = text.split('\n').filter((line) => line.trim());
      let currentCategory = '';

      lines.forEach((line) => {
        const cleanLine = line.replace(/[•\-*]/g, '').trim();

        // Detect category headers
        if (cleanLine.includes(':') && !cleanLine.includes('📱') && !cleanLine.includes('🔧')) {
          const [category, details] = cleanLine.split(':');
          if (category && details) {
            specs.push({
              category: category.trim(),
              details: details.trim(),
            });
          }
        } else if (cleanLine.match(/^(Objectif|Cible|Public|Fonctionnalités|Technologies|Plateforme)/i)) {
          currentCategory = cleanLine;
        } else if (currentCategory && cleanLine.length > 10) {
          specs.push({
            category: currentCategory,
            details: cleanLine,
          });
          currentCategory = '';
        }
      });

      return specs.filter((spec) => spec.category.length > 2 && spec.details.length > 3);
    };

    const specifications = parseSpecifications(content);

    return (
      <div className='bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
          <span className={iconColor}>{icon}</span>
          {title}
        </h3>

        {specifications.length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm'>
              <thead>
                <tr className='bg-gradient-to-r from-blue-50 to-indigo-50'>
                  <th className='border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700'>Élément</th>
                  <th className='border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700'>
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {specifications.map((spec, index) => (
                  <tr
                    key={index}
                    className='hover:bg-blue-50/50 transition-colors'
                  >
                    <td className='border border-gray-200 px-4 py-3 font-medium text-gray-800 bg-gray-50/50'>
                      {spec.category}
                    </td>
                    <td className='border border-gray-200 px-4 py-3 text-sm text-gray-700'>{spec.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className='prose prose-sm max-w-none text-gray-700'>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    );
  };

  // Custom Risk Evaluation Component
  const RiskEvaluationCard = ({
    title,
    content,
    icon,
    iconColor,
  }: {
    title: string;
    content: string;
    icon: string;
    iconColor: string;
  }) => {
    // Parse risk content to extract structured data
    const parseRiskContent = (text: string) => {
      const risks: Array<{ category: string; level: string; probability: string; impact: string; mitigation: string }> =
        [];

      // Look for risk patterns in the text
      const riskSections = text.split(
        /(?=🔴|🟡|🟢|(?:Risque\s+)?(?:Élevé|Moyen|Faible)|(?:Risk\s+)?(?:High|Medium|Low))/i
      );

      riskSections.forEach((section) => {
        if (section.trim().length < 10) return;

        let level = 'Moyen';

        if (section.includes('🔴') || /(?:élevé|high)/i.test(section)) {
          level = 'Élevé';
        } else if (section.includes('🟢') || /(?:faible|low)/i.test(section)) {
          level = 'Faible';
        } else if (section.includes('🟡') || /(?:moyen|medium)/i.test(section)) {
          level = 'Moyen';
        }

        // Extract category (first line usually)
        const lines = section.split('\n').filter((line) => line.trim());
        const category =
          lines[0]
            ?.replace(/🔴|🟡|🟢/g, '')
            .replace(/(?:Risque\s+)?(?:Élevé|Moyen|Faible)/gi, '')
            .trim() || 'Risque';

        // Try to extract probability and impact
        const probabilityMatch = section.match(/probabilité[:\s]*([^.]*)/i);
        const impactMatch = section.match(/impact[:\s]*([^.]*)/i);
        const mitigationMatch = section.match(/(?:mitigation|solution|atténuation)[:\s]*([^.]*)/i);

        risks.push({
          category: category.substring(0, 50),
          level,
          probability: probabilityMatch?.[1]?.trim().substring(0, 30) || 'Non spécifiée',
          impact: impactMatch?.[1]?.trim().substring(0, 30) || 'Non spécifié',
          mitigation: mitigationMatch?.[1]?.trim().substring(0, 60) || 'À définir',
        });
      });

      return risks.filter((risk) => risk.category.length > 3);
    };

    const risks = parseRiskContent(content);

    return (
      <div className='bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
          <span className={iconColor}>{icon}</span>
          {title}
        </h3>

        {risks.length > 0 ? (
          <div className='overflow-x-auto'>
            <div className='rounded-xl overflow-hidden shadow-lg border border-gray-100'>
              <table className='w-full'>
                <thead>
                  <tr className='bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border-b border-red-100'>
                    <th className='px-6 py-4 text-left font-semibold text-gray-800 text-sm uppercase tracking-wide'>
                      <div className='flex items-center gap-2'>
                        <span className='text-red-500'>🏷️</span>
                        Catégorie
                      </div>
                    </th>
                    <th className='px-6 py-4 text-left font-semibold text-gray-800 text-sm uppercase tracking-wide'>
                      <div className='flex items-center gap-2'>
                        <span className='text-orange-500'>📊</span>
                        Niveau
                      </div>
                    </th>
                    <th className='px-6 py-4 text-left font-semibold text-gray-800 text-sm uppercase tracking-wide'>
                      <div className='flex items-center gap-2'>
                        <span className='text-blue-500'>🎯</span>
                        Probabilité
                      </div>
                    </th>
                    <th className='px-6 py-4 text-left font-semibold text-gray-800 text-sm uppercase tracking-wide'>
                      <div className='flex items-center gap-2'>
                        <span className='text-purple-500'>💥</span>
                        Impact
                      </div>
                    </th>
                    <th className='px-6 py-4 text-left font-semibold text-gray-800 text-sm uppercase tracking-wide'>
                      <div className='flex items-center gap-2'>
                        <span className='text-green-500'>🛡️</span>
                        Mitigation
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-100'>
                  {risks.map((risk, index) => (
                    <tr
                      key={index}
                      className='hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 transition-all duration-200 group'
                    >
                      <td className='px-6 py-4'>
                        <div className='font-medium text-gray-900 group-hover:text-gray-800'>{risk.category}</div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                              risk.level === 'Élevé'
                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                                : risk.level === 'Faible'
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                            }`}
                          >
                            {risk.level === 'Élevé' ? '🔴' : risk.level === 'Faible' ? '🟢' : '🟡'}
                            <span className='ml-1'>{risk.level}</span>
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm text-gray-700 bg-blue-50 px-3 py-2 rounded-lg border-l-4 border-blue-300'>
                          {risk.probability}
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm text-gray-700 bg-purple-50 px-3 py-2 rounded-lg border-l-4 border-purple-300'>
                          {risk.impact}
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm text-gray-700 bg-green-50 px-3 py-2 rounded-lg border-l-4 border-green-300'>
                          {risk.mitigation}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className='prose prose-sm max-w-none text-gray-700'>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4'>
      {/* Background decorations */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl'></div>
        <div className='absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl'></div>
      </div>

      <div className='max-w-6xl mx-auto relative'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center gap-4'>
            <div className='inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl shadow-lg'>
              <span className='text-xl'>✅</span>
            </div>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent'>
              {t.title}
            </h1>
          </div>
          <button
            onClick={onBack}
            className='bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:bg-white hover:shadow-md transition-all'
          >
            ← {t.backButton}
          </button>
        </div>

        {/* Project Information Card */}
        <div className='bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-8'>
          <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2'>
            <span className='text-blue-500'>📋</span>
            {t.projectInfo}
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='font-medium text-gray-600'>{t.duration}:</span>
              <span className='ml-2 text-gray-800'>{analysis.duration}</span>
            </div>
            <div>
              <span className='font-medium text-gray-600'>{t.analyzedOn}:</span>
              <span className='ml-2 text-gray-800'>{formatDate(analysis.timestamp)}</span>
            </div>
            <div className='md:col-span-2'>
              <span className='font-medium text-gray-600'>{t.resources}:</span>
              <span className='ml-2 text-gray-800'>{analysis.resources}</span>
            </div>
            <div className='md:col-span-2'>
              <span className='font-medium text-gray-600'>{t.description}:</span>
              <p className='mt-1 text-gray-800'>{analysis.description}</p>
            </div>
            <div className='md:col-span-2 text-xs text-gray-500'>
              <span className='font-medium'>{t.threadId}:</span>
              <span className='ml-2'>{analysis.thread_id}</span>
            </div>
          </div>
        </div>

        {/* Full Analysis Content */}
        {sections.fullContent && (
          <div className='bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-8'>
            <h2 className='text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2'>
              <span className='text-purple-500'>🤖</span>
              Analyse IA Complète
            </h2>
            <div className='prose prose-lg max-w-none'>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className='text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2'>
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => <h2 className='text-xl font-semibold text-gray-800 mb-3 mt-6'>{children}</h2>,
                  h3: ({ children }) => <h3 className='text-lg font-medium text-gray-700 mb-2 mt-4'>{children}</h3>,
                  h4: ({ children }) => <h4 className='text-base font-medium text-gray-600 mb-2 mt-3'>{children}</h4>,
                  p: ({ children }) => <p className='mb-4 text-gray-700 leading-relaxed'>{children}</p>,
                  ul: ({ children }) => (
                    <div className='mb-4 bg-gray-50 rounded-lg p-4'>
                      <ul className='space-y-2'>{children}</ul>
                    </div>
                  ),
                  ol: ({ children }) => (
                    <div className='mb-4 bg-gray-50 rounded-lg p-4'>
                      <ol className='space-y-2 list-decimal list-inside'>{children}</ol>
                    </div>
                  ),
                  li: ({ children }) => (
                    <li className='flex items-start gap-2 text-gray-700 leading-relaxed'>
                      <span className='text-blue-500 mt-1'>•</span>
                      <span>{children}</span>
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className='font-semibold text-gray-900 bg-blue-50 px-1 rounded'>{children}</strong>
                  ),
                  em: ({ children }) => <em className='italic text-gray-600'>{children}</em>,
                  blockquote: ({ children }) => (
                    <blockquote className='border-l-4 border-blue-300 pl-6 py-3 bg-blue-50/50 rounded-r-lg mb-4 italic'>
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className='bg-gray-100 px-2 py-1 rounded text-sm font-mono text-red-600'>{children}</code>
                  ),
                  pre: ({ children }) => (
                    <pre className='bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 shadow-inner'>
                      {children}
                    </pre>
                  ),
                  table: ({ children }) => (
                    <div className='overflow-x-auto mb-4'>
                      <table className='min-w-full border border-gray-200 rounded-lg bg-white shadow-sm'>
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className='bg-gray-50 border border-gray-200 px-4 py-3 text-left font-semibold text-gray-900'>
                      {children}
                    </th>
                  ),
                  td: ({ children }) => <td className='border border-gray-200 px-4 py-3 text-gray-700'>{children}</td>,
                }}
              >
                {sections.fullContent}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Analysis Sections */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          <SectionCard
            title={t.sections.specifications}
            content={sections.specifications}
            icon='📝'
            iconColor='text-blue-500'
          />

          <SectionCard
            title={t.sections.risks}
            content={sections.risks}
            icon='⚠️'
            iconColor='text-red-500'
          />

          <SectionCard
            title={t.sections.planB}
            content={sections.planB}
            icon='🔄'
            iconColor='text-orange-500'
          />
        </div>

        {/* Gantt Chart */}
        {gantt.length > 0 && (
          <div className='bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6'>
            <h3 className='text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2'>
              <span className='text-purple-500'>📊</span>
              Planning Gantt - Roadmap du Projet
            </h3>
            <div className='mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-l-4 border-purple-400'>
              <p className='text-sm text-gray-700'>
                <strong className='text-purple-700'>📋 Aperçu:</strong> Ce diagramme de Gantt présente la planification
                détaillée du projet avec {gantt.length} tâche{gantt.length > 1 ? 's' : ''} identifiée
                {gantt.length > 1 ? 's' : ''}.
              </p>
            </div>
            <Chart
              chartType='Gantt'
              data={[
                [
                  { type: 'string', label: 'Task ID' },
                  { type: 'string', label: 'Task Name' },
                  { type: 'string', label: 'Resource' },
                  { type: 'date', label: 'Start Date' },
                  { type: 'date', label: 'End Date' },
                  { type: 'number', label: 'Duration' },
                  { type: 'number', label: 'Percent Complete' },
                  { type: 'string', label: 'Dependencies' },
                ],
                ...gantt.map((task, index) => [
                  task.id || `task-${index + 1}`,
                  task.name || task.text || `Tâche ${index + 1}`,
                  task.resource || null,
                  new Date(task.start || Date.now()),
                  new Date(task.end || Date.now()),
                  task.duration || null,
                  task.progress || 0,
                  task.dependencies || null,
                ]),
              ]}
              options={{
                height: Math.max(300, gantt.length * 50 + 100),
                gantt: {
                  trackHeight: 35,
                  barHeight: 25,
                  criticalPathEnabled: true,
                  criticalPathStyle: {
                    stroke: '#e74c3c',
                    strokeWidth: 2,
                  },
                  innerGridHorizLine: {
                    stroke: '#e8f4fd',
                    strokeWidth: 1,
                  },
                  innerGridTrack: {
                    fill: '#f8fafc',
                  },
                  innerGridDarkTrack: {
                    fill: '#f1f5f9',
                  },
                  arrow: {
                    angle: 100,
                    length: 8,
                    spaceAfter: 4,
                  },
                  labelStyle: {
                    fontName: 'Arial',
                    fontSize: 12,
                    color: '#374151',
                  },
                  sortTasks: false,
                },
                backgroundColor: '#ffffff',
                fontSize: 12,
                fontName: 'Arial',
              }}
            />

            {/* Task Summary */}
            <div className='mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {gantt.slice(0, 6).map((task, index) => (
                <div
                  key={index}
                  className='bg-gray-50 rounded-lg p-3 border-l-4 border-purple-400'
                >
                  <h4 className='font-medium text-gray-800 text-sm mb-1'>
                    {task.name || task.text || `Tâche ${index + 1}`}
                  </h4>
                  <div className='text-xs text-gray-600 space-y-1'>
                    {task.resource && (
                      <div className='flex items-center gap-1'>
                        <span className='text-blue-500'>👤</span>
                        <span>{task.resource}</span>
                      </div>
                    )}
                    {task.duration && (
                      <div className='flex items-center gap-1'>
                        <span className='text-orange-500'>⏱️</span>
                        <span>
                          {task.duration} jour{task.duration > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {task.progress !== undefined && (
                      <div className='flex items-center gap-1'>
                        <span className='text-green-500'>📈</span>
                        <span>{task.progress}% complété</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {gantt.length > 6 && (
                <div className='bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg p-3 flex items-center justify-center text-center'>
                  <div className='text-purple-700'>
                    <div className='text-xl mb-1'>📋</div>
                    <div className='text-xs font-medium'>+{gantt.length - 6} autres tâches</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
