import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Lightbulb, Download, ArrowLeft, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AnalysisPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [editedResume, setEditedResume] = useState('');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportTemplate, setExportTemplate] = useState('professional');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (location.state?.extractedText) {
      setResumeText(location.state.extractedText);
    } else {
      toast.error('No resume data found');
      navigate('/');
    }
  }, [location, navigate]);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast.error('Resume text is empty');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await axios.post(`${API}/analyze`, {
        resume_text: resumeText,
        target_role: targetRole || null,
      });

      setAnalysis(response.data);
      setEditedResume(response.data.improved_resume);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error.response?.data?.detail || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExport = async () => {
    if (!editedResume.trim()) {
      toast.error('No resume content to export');
      return;
    }

    setExporting(true);
    try {
      const response = await axios.post(
        `${API}/export`,
        {
          resume_text: editedResume,
          template_style: exportTemplate,
          format: exportFormat,
        },
        {
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume_${exportTemplate}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Resume exported as ${exportFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white mb-4 hover:border-blue-500 hover:bg-blue-500/10 hover:text-white"
            data-testid="back-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </Button>
          
          <h1 className="text-4xl text-center font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Resume Analysis & Editor
          </h1>
          <p className="text-gray-400 text-center">Review your resume, get AI insights, and make improvements</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Original Resume */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-xl" data-testid="original-resume-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  <p>Original Resume</p>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="target-role" className="text-gray-300">Target Role (Optional)</Label>
                  <Input
                    id="target-role"
                    placeholder="e.g., Project Manager, Data Analyst"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-white mt-1"
                    data-testid="target-role-input"
                  />
                </div>
                
                <div>
                  <Label htmlFor="resume-text" className="text-gray-300">Resume Text</Label>
                  <Textarea
                    id="resume-text"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="min-h-[400px] bg-slate-900/50 border-slate-700 text-white mt-1 font-mono text-sm"
                    data-testid="resume-textarea"
                  />
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                  data-testid="analyze-resume-button"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    'Analyze with AI'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Analysis Results */}
          <div className="space-y-6">
            {analysis ? (
              <>
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-xl" data-testid="analysis-results-card">
                  <CardHeader>
                    <CardTitle className="text-white">AI Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="missing" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 bg-slate-900/50">
                        <TabsTrigger value="missing" data-testid="tab-missing">Missing</TabsTrigger>
                        <TabsTrigger value="weak" data-testid="tab-weak">Weak Areas</TabsTrigger>
                        <TabsTrigger value="suggestions" data-testid="tab-suggestions">Suggestions</TabsTrigger>
                      </TabsList>

                      <TabsContent value="missing" className="space-y-2 mt-4" data-testid="missing-sections-content">
                        {analysis.missing_sections.length > 0 ? (
                          analysis.missing_sections.map((section, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-300 text-sm">{section}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-gray-300 text-sm">All sections present!</span>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="weak" className="space-y-2 mt-4" data-testid="weak-areas-content">
                        {analysis.weak_areas.length > 0 ? (
                          analysis.weak_areas.map((area, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-300 text-sm">{area}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-gray-300 text-sm">No weak areas detected!</span>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="suggestions" className="space-y-2 mt-4" data-testid="suggestions-content">
                        {analysis.improvement_suggestions.length > 0 ? (
                          analysis.improvement_suggestions.map((suggestion, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                              <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-300 text-sm">{suggestion}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-gray-300 text-sm">Resume looks great!</span>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-xl" data-testid="improved-resume-card">
                  <CardHeader>
                    <CardTitle className="text-white">Improved Resume</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={editedResume}
                      onChange={(e) => setEditedResume(e.target.value)}
                      className="min-h-[300px] bg-slate-900/50 border-slate-700 text-white font-mono text-sm"
                      data-testid="improved-resume-textarea"
                    />

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-gray-300 text-sm">Template Style</Label>
                          <Select value={exportTemplate} onValueChange={setExportTemplate}>
                            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white mt-1" data-testid="template-select">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="modern">Modern</SelectItem>
                              <SelectItem value="classic">Classic</SelectItem>
                              <SelectItem value="creative">Creative</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-gray-300 text-sm">Format</Label>
                          <Select value={exportFormat} onValueChange={setExportFormat}>
                            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white mt-1" data-testid="format-select">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="docx">DOCX</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button
                        onClick={handleExport}
                        disabled={exporting}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                        data-testid="export-button"
                      >
                        {exporting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Exporting...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Export Resume
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-xl" data-testid="waiting-card">
                <CardContent className="p-12 text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-4">
                    <Lightbulb className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Ready to Analyze</h3>
                  <p className="text-gray-400">
                    Click "Analyze with AI" to get insights and recommendations for your resume.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;