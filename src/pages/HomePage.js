import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Sparkles, TrendingUp, Award } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const fileType = selectedFile.name.toLowerCase();
    if (!fileType.endsWith('.pdf') && !fileType.endsWith('.docx')) {
      toast.error('Please upload a PDF or DOCX file');
      return;
    }
    setFile(selectedFile);
    toast.success('File selected successfully!');
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Resume uploaded successfully!');
        navigate('/analysis', {
          state: {
            extractedText: response.data.extracted_text,
            filename: response.data.filename
          }
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-start items-center bg-slate-900">
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-72 h-72 sm:w-96 sm:h-96 -top-36 -left-36 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute w-72 h-72 sm:w-96 sm:h-96 -bottom-36 -right-36 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative w-full max-w-4xl sm:max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 mx-auto flex flex-col items-center">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full px-5 py-2 mb-4 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">AI-Powered Resume Analysis</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent leading-tight text-center">
              AI Power Resume
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 max-w-md sm:max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed text-center">
              Transform your resume with cutting-edge AI analysis. Get instant feedback,
              identify weak areas, and create a job-winning resume that stands out.
            </p>
          </div>

          {/* Upload Section */}
          <Card className="w-full max-w-md sm:max-w-2xl mx-auto bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-xl shadow-2xl">
            <CardContent className="p-6 sm:p-8">
              <div
                className={`border-2 border-dashed rounded-xl p-6 sm:p-12 transition-all duration-300 text-center ${
                  dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-slate-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}Panal
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileInput}
                  className="hidden"
                />

                <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-blue-500/30">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>

                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                  {file ? file.name : 'Upload Your Resume'}
                </h3>

                <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                  Drag and drop your resume here, or click to browse
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="border-slate-600 hover:border-blue-500 hover:bg-blue-500/10 hover:text-white text-white"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Browse Files
                  </Button>

                  <Button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/30"
                  >
                    {uploading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Analyze Resume
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-sm text-gray-500 mt-4 text-center">
                  Supported formats: PDF, DOCX
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl w-full mt-12 sm:mt-16">
            <Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-slate-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                <div className='flex w-full justify-center items-center'>
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">AI Analysis</h3>
                <p className="text-gray-400 text-sm">
                  GPT-5 powered analysis identifies missing sections, weak descriptions, and areas for improvement.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-slate-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Smart Suggestions</h3>
                <p className="text-gray-400 text-sm">
                  Get actionable recommendations with strong action verbs and measurable achievements.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-slate-700/50 backdrop-blur-sm hover:border-green-500/50 transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Multiple Templates</h3>
                <p className="text-gray-400 text-sm">
                  Export your improved resume in Modern, Classic, Creative, or Professional formats.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
