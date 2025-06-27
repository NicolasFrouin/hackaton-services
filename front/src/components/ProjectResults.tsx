import { useState, useEffect, useMemo, useCallback } from 'react';
import Chart from 'react-google-charts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import logo from '../assets/logo.png';

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
    exportButton: 'Export to PDF',
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
    exportButton: 'Exporter en PDF',
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

  // Export to PDF function
  const exportToPDF = useCallback(() => {
    const printContent = document.getElementById('results-content');
    if (!printContent) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get the current page styles
    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n');
        } catch {
          return '';
        }
      })
      .join('\n');

    // Create the print document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Analyse de Projet - ${analysis?.description || 'Projet'}</title>
          <meta charset="utf-8">
          <style>
            ${styles}
            @media print {
              body { 
                font-family: Arial, sans-serif;
                line-height: 1.5;
                color: #000;
                background: white !important;
              }
              .no-print { display: none !important; }
              .bg-gradient-to-br,
              .bg-gradient-to-r,
              .backdrop-blur-xl,
              .backdrop-blur-sm { 
                background: white !important; 
              }
              .bg-white\\/50,
              .bg-white\\/30,
              .bg-\\[\\#33E1FF\\]\\/5,
              .bg-\\[\\#33E1FF\\]\\/10,
              .bg-\\[\\#00B7FF\\]\\/5,
              .bg-\\[\\#00B7FF\\]\\/10,
              .bg-\\[\\#4B0082\\]\\/10,
              .bg-\\[\\#0A1B2A\\]\\/90 {
                background: white !important;
              }
              .shadow-xl,
              .shadow-lg,
              .shadow-md { 
                box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important; 
              }
              .border-white { 
                border-color: #e5e7eb !important; 
              }
              .text-transparent { 
                color: #1f2937 !important; 
              }
              .text-\\[\\#0A1B2A\\] { 
                color: #1f2937 !important; 
              }
              .text-\\[\\#00B7FF\\] { 
                color: #0070f3 !important; 
              }
              .text-\\[\\#33E1FF\\] { 
                color: #0070f3 !important; 
              }
              .text-\\[\\#4B0082\\] { 
                color: #6b46c1 !important; 
              }
              .break-inside-avoid { 
                page-break-inside: avoid; 
              }
              table { 
                page-break-inside: avoid; 
              }
              h1, h2, h3 { 
                page-break-after: avoid; 
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }, [analysis]);

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

    cleaned = cleaned.replace(/---\n\n## 🗓️ (?:\*\*)?PLANNING \(Gantt Roadmap\)(?:\*\*)?.*?/i, '');

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
      <div className='min-h-screen bg-gradient-to-br from-[#0A1B2A] via-[#0A1B2A] to-[#4B0082] py-8 px-4 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B7FF] mx-auto mb-4'></div>
          <p className='text-[#33E1FF]'>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-[#0A1B2A] via-[#0A1B2A] to-[#4B0082] py-8 px-4 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>😔</div>
          <p className='text-[#33E1FF] mb-6'>{t.noResults}</p>
          <button
            onClick={onBack}
            className='bg-gradient-to-r from-[#00B7FF] to-[#33E1FF] text-white px-6 py-3 rounded-xl hover:from-[#00B7FF]/90 hover:to-[#33E1FF]/90 transition-all shadow-xl'
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
      <div className='bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-[#33E1FF]/20 p-6'>
        <h3 className='text-lg font-semibold text-[#0A1B2A] mb-4 flex items-center gap-2'>
          <span className={iconColor}>{icon}</span>
          {title}
        </h3>
        <div className='prose prose-sm max-w-none text-[#0A1B2A]'>
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className='text-xl font-bold text-[#0A1B2A] mb-3'>{children}</h1>,
              h2: ({ children }) => <h2 className='text-lg font-semibold text-[#0A1B2A] mb-2'>{children}</h2>,
              h3: ({ children }) => <h3 className='text-base font-medium text-[#0A1B2A] mb-2'>{children}</h3>,
              p: ({ children }) => <p className='mb-3 text-[#0A1B2A] leading-relaxed'>{children}</p>,
              ul: ({ children }) => (
                <div className='mb-3 bg-[#33E1FF]/5 rounded-lg p-3 enhanced-list'>
                  <ul className='space-y-1'>{children}</ul>
                </div>
              ),
              ol: ({ children }) => (
                <div className='mb-3 bg-[#33E1FF]/5 rounded-lg p-3 enhanced-list'>
                  <ol className='space-y-1 list-decimal list-inside'>{children}</ol>
                </div>
              ),
              li: ({ children }) => (
                <li className='flex items-start gap-2 text-[#0A1B2A]'>
                  <span className='text-[#00B7FF] text-sm mt-1'>▸</span>
                  <span className='text-sm'>{children}</span>
                </li>
              ),
              strong: ({ children }) => <strong className='font-semibold text-[#0A1B2A]'>{children}</strong>,
              em: ({ children }) => <em className='italic text-[#33E1FF]'>{children}</em>,
              blockquote: ({ children }) => (
                <blockquote className='border-l-4 border-[#00B7FF] pl-4 py-2 bg-[#00B7FF]/5 rounded-r-lg mb-3'>
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className='bg-[#33E1FF]/10 px-2 py-1 rounded text-sm font-mono'>{children}</code>
              ),
              pre: ({ children }) => (
                <pre className='bg-[#33E1FF]/10 p-4 rounded-lg overflow-x-auto mb-3'>{children}</pre>
              ),
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
      <div className='bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-[#33E1FF]/20 p-6'>
        <h3 className='text-lg font-semibold text-[#0A1B2A] mb-4 flex items-center gap-2'>
          <span className={iconColor}>{icon}</span>
          {title}
        </h3>

        {specifications.length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse bg-white/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm'>
              <thead>
                <tr className='bg-gradient-to-r from-[#00B7FF]/10 to-[#33E1FF]/10'>
                  <th className='border border-[#33E1FF]/20 px-4 py-3 text-left font-semibold text-[#0A1B2A]'>
                    Élément
                  </th>
                  <th className='border border-[#33E1FF]/20 px-4 py-3 text-left font-semibold text-[#0A1B2A]'>
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {specifications.map((spec, index) => (
                  <tr
                    key={index}
                    className='hover:bg-[#00B7FF]/5 transition-colors'
                  >
                    <td className='border border-[#33E1FF]/20 px-4 py-3 font-medium text-[#0A1B2A] bg-[#33E1FF]/10'>
                      {spec.category}
                    </td>
                    <td className='border border-[#33E1FF]/20 px-4 py-3 text-sm text-[#0A1B2A] bg-white/30'>
                      {spec.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className='prose prose-sm max-w-none text-[#0A1B2A]'>
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
      <div className='bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-[#33E1FF]/20 p-6'>
        <h3 className='text-lg font-semibold text-[#0A1B2A] mb-4 flex items-center gap-2'>
          <span className={iconColor}>{icon}</span>
          {title}
        </h3>

        {risks.length > 0 ? (
          <div className='overflow-x-auto'>
            <div className='rounded-xl overflow-hidden shadow-xl border border-[#33E1FF]/20'>
              <table className='w-full bg-white/50 backdrop-blur-sm'>
                <thead>
                  <tr className='bg-gradient-to-r from-red-50/50 via-orange-50/50 to-yellow-50/50 border-b border-[#33E1FF]/20'>
                    <th className='px-6 py-4 text-left font-semibold text-[#0A1B2A] text-sm uppercase tracking-wide'>
                      <div className='flex items-center gap-2'>
                        <span className='text-red-500'>🏷️</span>
                        Catégorie
                      </div>
                    </th>
                    <th className='px-6 py-4 text-left font-semibold text-[#0A1B2A] text-sm uppercase tracking-wide'>
                      <div className='flex items-center gap-2'>
                        <span className='text-orange-500'>📊</span>
                        Niveau
                      </div>
                    </th>
                    <th className='px-6 py-4 text-left font-semibold text-[#0A1B2A] text-sm uppercase tracking-wide'>
                      <div className='flex items-center gap-2'>
                        <span className='text-[#00B7FF]'>🎯</span>
                        Probabilité
                      </div>
                    </th>
                    <th className='px-6 py-4 text-left font-semibold text-[#0A1B2A] text-sm uppercase tracking-wide'>
                      <div className='flex items-center gap-2'>
                        <span className='text-[#4B0082]'>💥</span>
                        Impact
                      </div>
                    </th>
                    <th className='px-6 py-4 text-left font-semibold text-[#0A1B2A] text-sm uppercase tracking-wide'>
                      <div className='flex items-center gap-2'>
                        <span className='text-[#33E1FF]'>🛡️</span>
                        Mitigation
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white/30 divide-y divide-[#33E1FF]/10'>
                  {risks.map((risk, index) => (
                    <tr
                      key={index}
                      className='hover:bg-gradient-to-r hover:from-[#33E1FF]/5 hover:to-[#00B7FF]/5 transition-all duration-200 group'
                    >
                      <td className='px-6 py-4'>
                        <div className='font-medium text-[#0A1B2A] group-hover:text-[#0A1B2A]'>{risk.category}</div>
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
                        <div className='text-sm text-[#0A1B2A] bg-[#00B7FF]/10 px-3 py-2 rounded-lg border-l-4 border-[#00B7FF]'>
                          {risk.probability}
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm text-[#0A1B2A] bg-[#4B0082]/10 px-3 py-2 rounded-lg border-l-4 border-[#4B0082]'>
                          {risk.impact}
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm text-[#0A1B2A] bg-[#33E1FF]/10 px-3 py-2 rounded-lg border-l-4 border-[#33E1FF]'>
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
          <div className='prose prose-sm max-w-none text-[#0A1B2A]'>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#0A1B2A] via-[#0A1B2A] to-[#4B0082] py-8 px-4'>
      {/* Background decorations */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none no-print'>
        <div className='absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-[#00B7FF]/20 to-[#33E1FF]/20 rounded-full blur-3xl'></div>
        <div className='absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-[#4B0082]/20 to-[#00B7FF]/20 rounded-full blur-3xl'></div>
      </div>

      <div
        className='max-w-6xl mx-auto relative'
        id='results-content'
      >
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center gap-4'>
            <div className='inline-flex items-center justify-center w-40 h-20 bg-white/01 backdrop-blur-xl rounded-md shadow-xl p-1'>
              <img
                src={logo}
                alt='Axivio Logo'
                className='w-full h-full object-contain'
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0, 183, 255, 0.3))',
                }}
              />
            </div>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-white via-[#33E1FF] to-white bg-clip-text text-transparent'>
              {t.title}
            </h1>
          </div>
          <div className='flex items-center gap-3 no-print'>
            <button
              onClick={exportToPDF}
              className='bg-gradient-to-r from-[#00B7FF] to-[#33E1FF] text-white px-4 py-2 rounded-xl border border-[#33E1FF]/20 hover:from-[#00B7FF]/90 hover:to-[#33E1FF]/90 hover:shadow-xl transition-all flex items-center gap-2 shadow-xl'
            >
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
              {t.exportButton}
            </button>
            <button
              onClick={onBack}
              className='bg-white/90 backdrop-blur-xl text-[#0A1B2A] px-4 py-2 rounded-xl border border-[#33E1FF]/20 hover:bg-white/95 hover:shadow-xl transition-all shadow-xl'
            >
              ← {t.backButton}
            </button>
          </div>
        </div>

        {/* Project Information Card */}
        <div className='bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-[#33E1FF]/20 p-6 mb-8'>
          <h2 className='text-xl font-semibold text-[#0A1B2A] mb-4 flex items-center gap-2'>
            <span className='text-[#00B7FF]'>📋</span>
            {t.projectInfo}
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='font-medium text-[#33E1FF]'>{t.duration}:</span>
              <span className='ml-2 text-[#0A1B2A]'>{analysis.duration}</span>
            </div>
            <div>
              <span className='font-medium text-[#33E1FF]'>{t.analyzedOn}:</span>
              <span className='ml-2 text-[#0A1B2A]'>{formatDate(analysis.timestamp)}</span>
            </div>
            <div className='md:col-span-2'>
              <span className='font-medium text-[#33E1FF]'>{t.resources}:</span>
              <span className='ml-2 text-[#0A1B2A]'>{analysis.resources}</span>
            </div>
            <div className='md:col-span-2'>
              <span className='font-medium text-[#33E1FF]'>{t.description}:</span>
              <p className='mt-1 text-[#0A1B2A]'>{analysis.description}</p>
            </div>
            <div className='md:col-span-2 text-xs text-[#33E1FF]/70'>
              <span className='font-medium'>{t.threadId}:</span>
              <span className='ml-2'>{analysis.thread_id}</span>
            </div>
          </div>
        </div>

        {/* Full Analysis Content */}
        {sections.fullContent && (
          <div className='bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-[#33E1FF]/20 p-6 mb-8'>
            <h2 className='text-xl font-semibold text-[#0A1B2A] mb-6 flex items-center gap-2'>
              <span className='text-[#4B0082]'>🤖</span>
              Analyse IA Complète
            </h2>
            <div className='prose prose-lg max-w-none'>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className='text-2xl font-bold text-[#0A1B2A] mb-4 border-b-2 border-[#33E1FF]/30 pb-2'>
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => <h2 className='text-xl font-semibold text-[#0A1B2A] mb-3 mt-6'>{children}</h2>,
                  h3: ({ children }) => <h3 className='text-lg font-medium text-[#0A1B2A] mb-2 mt-4'>{children}</h3>,
                  h4: ({ children }) => <h4 className='text-base font-medium text-[#0A1B2A] mb-2 mt-3'>{children}</h4>,
                  p: ({ children }) => <p className='mb-4 text-[#0A1B2A] leading-relaxed'>{children}</p>,
                  ul: ({ children }) => (
                    <div className='mb-4 bg-[#33E1FF]/5 rounded-lg p-4'>
                      <ul className='space-y-2'>{children}</ul>
                    </div>
                  ),
                  ol: ({ children }) => (
                    <div className='mb-4 bg-[#33E1FF]/5 rounded-lg p-4'>
                      <ol className='space-y-2 list-decimal list-inside'>{children}</ol>
                    </div>
                  ),
                  li: ({ children }) => (
                    <li className='flex items-start gap-2 text-[#0A1B2A] leading-relaxed'>
                      <span className='text-[#00B7FF] mt-1'>•</span>
                      <span>{children}</span>
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className='font-semibold text-[#0A1B2A] bg-[#00B7FF]/10 px-1 rounded'>{children}</strong>
                  ),
                  em: ({ children }) => <em className='italic text-[#33E1FF]'>{children}</em>,
                  blockquote: ({ children }) => (
                    <blockquote className='border-l-4 border-[#00B7FF] pl-6 py-3 bg-[#00B7FF]/5 rounded-r-lg mb-4 italic'>
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className='bg-[#33E1FF]/10 px-2 py-1 rounded text-sm font-mono text-[#4B0082]'>
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className='bg-[#0A1B2A]/90 backdrop-blur-sm text-[#33E1FF] p-4 rounded-lg overflow-x-auto mb-4 shadow-inner'>
                      {children}
                    </pre>
                  ),
                  table: ({ children }) => (
                    <div className='overflow-x-auto mb-4'>
                      <table className='min-w-full border border-[#33E1FF]/20 rounded-lg bg-white/50 backdrop-blur-sm shadow-sm'>
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className='bg-[#33E1FF]/10 border border-[#33E1FF]/20 px-4 py-3 text-left font-semibold text-[#0A1B2A]'>
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className='border border-[#33E1FF]/20 px-4 py-3 text-[#0A1B2A] bg-white/30'>{children}</td>
                  ),
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
            iconColor='text-[#00B7FF]'
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
            iconColor='text-[#33E1FF]'
          />
        </div>

        {/* Gantt Chart */}
        {gantt.length > 0 && (
          <div className='bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-[#33E1FF]/20 p-6'>
            <h3 className='text-lg font-semibold text-[#0A1B2A] mb-6 flex items-center gap-2'>
              <span className='text-[#4B0082]'>📊</span>
              Planning Gantt - Roadmap du Projet
            </h3>
            <div className='mb-4 p-4 bg-gradient-to-r from-[#4B0082]/10 to-[#00B7FF]/10 rounded-lg border-l-4 border-[#4B0082]'>
              <p className='text-sm text-[#0A1B2A]'>
                <strong className='text-[#4B0082]'>📋 Aperçu:</strong> Ce diagramme de Gantt présente la planification
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
                    fill: '#f8fdff',
                  },
                  innerGridDarkTrack: {
                    fill: '#f0f9ff',
                  },
                  arrow: {
                    angle: 100,
                    length: 8,
                    spaceAfter: 4,
                  },
                  labelStyle: {
                    fontName: 'Arial',
                    fontSize: 12,
                    color: '#0A1B2A',
                  },
                  sortTasks: false,
                },
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                fontSize: 12,
                fontName: 'Arial',
              }}
            />

            {/* Task Summary */}
            <div className='mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {gantt.slice(0, 6).map((task, index) => (
                <div
                  key={index}
                  className='bg-[#33E1FF]/5 rounded-lg p-3 border-l-4 border-[#4B0082]'
                >
                  <h4 className='font-medium text-[#0A1B2A] text-sm mb-1'>
                    {task.name || task.text || `Tâche ${index + 1}`}
                  </h4>
                  <div className='text-xs text-[#0A1B2A] space-y-1'>
                    {task.resource && (
                      <div className='flex items-center gap-1'>
                        <span className='text-[#00B7FF]'>👤</span>
                        <span>{task.resource}</span>
                      </div>
                    )}
                    {task.duration && (
                      <div className='flex items-center gap-1'>
                        <span className='text-[#33E1FF]'>⏱️</span>
                        <span>
                          {task.duration} jour{task.duration > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {task.progress !== undefined && (
                      <div className='flex items-center gap-1'>
                        <span className='text-[#4B0082]'>📈</span>
                        <span>{task.progress}% complété</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {gantt.length > 6 && (
                <div className='bg-gradient-to-br from-[#4B0082]/10 to-[#00B7FF]/10 rounded-lg p-3 flex items-center justify-center text-center'>
                  <div className='text-[#4B0082]'>
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
