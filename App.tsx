import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Image as ImageIcon, Sparkles, RefreshCcw, Trash2, Zap, ArrowRight, Layers, Monitor, Apple, Globe, Mail, User } from 'lucide-react';
import { generateIconLayers, createIcoFile, createIcnsFile } from './utils/icoGenerator';
import { generateIcon } from './services/geminiService';
import { IconLayer, AppTab, IconFormat } from './types';
import { Button } from './components/Button';
import { Alert } from './components/Alert';

type Language = 'zh' | 'en';

const translations = {
  en: {
    appTitle: "Icon Converter",
    navConvert: "Convert",
    navGenerate: "AI Generate",
    aiTitle: "Generate Icons with AI",
    aiDesc: "Describe the icon you need, and our AI will create a professional, vector-style asset ready for conversion.",
    aiPlaceholder: "e.g., A futuristic blue rocket ship, minimalist flat design...",
    aiButton: "Generate",
    aiPoweredBy: "Powered by Google Gemini 2.5 Flash Image",
    convertTitle: "Convert PNG to Icon",
    convertDesc: "Create multi-size icons for Windows (.ICO) and macOS (.ICNS) effortlessly. Secure, client-side conversion.",
    formatWindows: "Windows",
    formatMac: "macOS",
    uploadClick: "Click to upload image",
    uploadDesc: "PNG, JPG or WEBP (rec. 512x512px+)",
    sourceImage: "Source Image",
    startOver: "Start Over",
    readyDownload: "Ready to download",
    readyDownloadDesc: (format: string, count: number) => `Your .${format.toLowerCase()} file contains ${count} sizes optimized for ${format === 'ICO' ? 'Windows' : 'macOS'}.`,
    downloadButton: (format: string) => `Download .${format} File`,
    generatedLayers: "Generated Layers",
    processing: "Processing...",
    layersCount: (count: number) => `${count} Layers`,
    footerCopyright: "All processing done locally.",
    author: "Author: houxiaohou",
    email: "Email: itxysh@gmail.com",
    privacy: "Privacy",
    terms: "Terms",
    errorImage: "Please upload a valid image file (PNG, JPG).",
    errorGen: "Failed to generate icon.",
    layerType: "32-bit PNG"
  },
  zh: {
    appTitle: "Icon格式转化器",
    navConvert: "格式转换",
    navGenerate: "AI生成图标",
    aiTitle: "AI 智能生成图标",
    aiDesc: "描述您需要的图标，AI 将为您创建专业的矢量风格素材，随时可以转换。",
    aiPlaceholder: "例如：一个极简风格的蓝色火箭图标...",
    aiButton: "开始生成",
    aiPoweredBy: "由 Google Gemini 2.5 Flash Image 提供支持",
    convertTitle: "图片转图标格式",
    convertDesc: "轻松制作 Windows (.ICO) 和 macOS (.ICNS) 多尺寸图标。安全、本地转换。",
    formatWindows: "Windows",
    formatMac: "macOS",
    uploadClick: "点击上传图片",
    uploadDesc: "支持 PNG, JPG 或 WEBP (推荐 512x512px 以上)",
    sourceImage: "源图片",
    startOver: "重新开始",
    readyDownload: "准备下载",
    readyDownloadDesc: (format: string, count: number) => `您的 .${format.toLowerCase()} 文件包含 ${count} 个尺寸，已针对 ${format === 'ICO' ? 'Windows' : 'macOS'} 进行优化。`,
    downloadButton: (format: string) => `下载 .${format} 文件`,
    generatedLayers: "生成图层预览",
    processing: "处理中...",
    layersCount: (count: number) => `${count} 个尺寸`,
    footerCopyright: "所有处理均在本地完成。",
    author: "作者: houxiaohou",
    email: "邮箱: itxysh@gmail.com",
    privacy: "隐私政策",
    terms: "服务条款",
    errorImage: "请上传有效的图片文件 (PNG, JPG)。",
    errorGen: "生成图标失败。",
    layerType: "32位 PNG"
  }
};

const App = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.CONVERT);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [layers, setLayers] = useState<IconLayer[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<IconFormat>('ICO');
  const [lang, setLang] = useState<Language>('zh');

  // Generation state
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang];

  const resetState = () => {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    layers.forEach(l => URL.revokeObjectURL(l.url));
    setSourceImage(null);
    setLayers([]);
    setOutputBlob(null);
    setOutputUrl(null);
    setError(null);
  };

  const processImage = async (url: string, targetFormat: IconFormat = format) => {
    setIsProcessing(true);
    setError(null);
    try {
      // 1. Generate Layers
      const generatedLayers = await generateIconLayers(url, targetFormat);
      setLayers(generatedLayers);

      // 2. Create File Blob
      let blob: Blob;
      if (targetFormat === 'ICO') {
        blob = await createIcoFile(generatedLayers);
      } else {
        blob = await createIcnsFile(generatedLayers);
      }
      
      setOutputBlob(blob);
      
      const newUrl = URL.createObjectURL(blob);
      setOutputUrl(newUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormatChange = (newFormat: IconFormat) => {
    if (format === newFormat) return;
    setFormat(newFormat);
    
    // If we have an image, re-process with new format
    if (sourceImage) {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      processImage(sourceImage, newFormat);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(t.errorImage);
      return;
    }

    resetState();
    const url = URL.createObjectURL(file);
    setSourceImage(url);
    processImage(url, format);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await generateIcon(prompt);
      resetState();
      setSourceImage(result.url);
      // Automatically switch to Convert tab to show results
      setActiveTab(AppTab.CONVERT);
      // Wait a tick for UI update then process
      setTimeout(() => processImage(result.url, format), 100);
    } catch (err: any) {
      setError(err.message || t.errorGen);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    const link = document.createElement('a');
    link.href = outputUrl;
    link.download = format === 'ICO' ? 'icon.ico' : 'icon.icns';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'zh' ? 'en' : 'zh');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col font-sans">
      
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Layers size={18} strokeWidth={3} />
            </div>
            <span className="font-bold text-xl tracking-tight text-white hidden sm:inline">{t.appTitle}</span>
            <span className="font-bold text-xl tracking-tight text-white sm:hidden">IconConvert</span>
          </div>
          
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setActiveTab(AppTab.CONVERT)}
                className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === AppTab.CONVERT 
                    ? 'bg-zinc-800 text-white shadow-sm' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {t.navConvert}
              </button>
              <button
                onClick={() => setActiveTab(AppTab.GENERATE)}
                className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === AppTab.GENERATE 
                    ? 'bg-indigo-600/10 text-indigo-400 shadow-sm ring-1 ring-inset ring-indigo-500/20' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <Sparkles size={14} />
                <span className="hidden sm:inline">{t.navGenerate}</span>
                <span className="sm:hidden">AI</span>
              </button>
            </nav>

            <button 
              onClick={toggleLanguage}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title={lang === 'zh' ? 'Switch to English' : '切换到中文'}
            >
              <Globe size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full">
        
        {error && (
          <div className="mb-8">
            <Alert type="error" message={error} />
          </div>
        )}

        {/* GENERATE TAB */}
        {activeTab === AppTab.GENERATE && (
          <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold text-white tracking-tight">{t.aiTitle}</h1>
              <p className="text-zinc-400 text-lg">{t.aiDesc}</p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
              <div className="flex gap-3 flex-col sm:flex-row">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t.aiPlaceholder}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <Button 
                  onClick={handleGenerate} 
                  isLoading={isGenerating} 
                  disabled={!prompt.trim()}
                  icon={<Zap size={18} />}
                  className="px-6 w-full sm:w-auto"
                >
                  {t.aiButton}
                </Button>
              </div>
              <p className="text-xs text-zinc-500 mt-3 text-left">{t.aiPoweredBy}</p>
            </div>
          </div>
        )}

        {/* CONVERT TAB */}
        {activeTab === AppTab.CONVERT && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Upload Section */}
            {!sourceImage && (
              <div className="max-w-xl mx-auto text-center space-y-8">
                 <div className="space-y-4">
                  <h1 className="text-4xl font-extrabold text-white tracking-tight">{t.convertTitle}</h1>
                  <p className="text-zinc-400 text-lg">{t.convertDesc}</p>
                </div>
                
                {/* Format Selection (Initial) */}
                 <div className="flex justify-center gap-4">
                   <button
                     onClick={() => setFormat('ICO')}
                     className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all ${
                       format === 'ICO' 
                       ? 'bg-zinc-800 border-indigo-500 ring-1 ring-indigo-500 text-white' 
                       : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                     }`}
                   >
                     <Monitor size={20} />
                     <div className="text-left">
                       <div className="font-semibold text-sm">{t.formatWindows}</div>
                       <div className="text-xs opacity-70">.ICO</div>
                     </div>
                   </button>
                   <button
                     onClick={() => setFormat('ICNS')}
                     className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all ${
                       format === 'ICNS' 
                       ? 'bg-zinc-800 border-indigo-500 ring-1 ring-indigo-500 text-white' 
                       : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                     }`}
                   >
                     <Apple size={20} />
                      <div className="text-left">
                       <div className="font-semibold text-sm">{t.formatMac}</div>
                       <div className="text-xs opacity-70">.ICNS</div>
                     </div>
                   </button>
                 </div>

                <div 
                  className="border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-900/50 bg-zinc-900/20 rounded-2xl p-12 transition-all cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept="image/png,image/jpeg,image/webp" 
                    className="hidden" 
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 flex items-center justify-center transition-colors">
                      <Upload size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-medium text-white group-hover:text-indigo-300 transition-colors">{t.uploadClick}</p>
                      <p className="text-sm text-zinc-500">{t.uploadDesc}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Section */}
            {sourceImage && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left: Source Image & Controls */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 shadow-lg">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <ImageIcon size={16} /> {t.sourceImage}
                    </h3>
                    <div className="aspect-square bg-[url('https://bg-patterns.netlify.app/bg-zinc-950-check.svg')] bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-center p-4 relative overflow-hidden group">
                      <img src={sourceImage} alt="Source" className="max-w-full max-h-full object-contain shadow-2xl drop-shadow-2xl" />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="secondary" onClick={resetState} icon={<RefreshCcw size={16}/>}>
                            {t.startOver}
                          </Button>
                       </div>
                    </div>
                  </div>
                  
                  {/* Format Switcher in results */}
                  <div className="bg-zinc-900 rounded-xl p-1 border border-zinc-800 flex">
                     <button
                        onClick={() => handleFormatChange('ICO')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          format === 'ICO' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                        }`}
                     >
                        <Monitor size={16} /> {t.formatWindows} (.ico)
                     </button>
                     <button
                        onClick={() => handleFormatChange('ICNS')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          format === 'ICNS' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                        }`}
                     >
                        <Apple size={16} /> {t.formatMac} (.icns)
                     </button>
                  </div>

                  <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
                     <h3 className="text-sm font-semibold text-zinc-400 mb-2">{t.readyDownload}</h3>
                     <p className="text-zinc-500 text-sm mb-4">
                       {t.readyDownloadDesc(format, layers.length)}
                     </p>
                     <Button 
                        onClick={handleDownload} 
                        className="w-full" 
                        disabled={!outputUrl || isProcessing}
                        icon={<Download size={18} />}
                      >
                        {t.downloadButton(format)}
                      </Button>
                  </div>
                </div>

                {/* Right: Generated Sizes */}
                <div className="lg:col-span-8 space-y-6">
                   <div className="flex items-center justify-between">
                     <h3 className="text-lg font-bold text-white flex items-center gap-2">
                       {t.generatedLayers}
                       {isProcessing && <span className="text-xs font-normal text-indigo-400 animate-pulse">({t.processing})</span>}
                     </h3>
                     <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md">{t.layersCount(layers.length)}</span>
                   </div>

                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {layers.map((layer) => (
                        <div key={layer.size} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center gap-3 transition-hover hover:border-zinc-700">
                          <div className="w-full aspect-square bg-zinc-950/50 rounded-lg flex items-center justify-center p-2 relative">
                             {/* Checkerboard background simulation */}
                             <div className="absolute inset-2 opacity-20" style={{
                               backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
                               backgroundSize: '10px 10px',
                               backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px'
                             }}/>
                             <img src={layer.url} alt={`${layer.size}x${layer.size}`} className="relative z-10 max-w-full max-h-full object-contain image-render-pixel" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-zinc-200">{layer.size} x {layer.size}</p>
                            <p className="text-xs text-zinc-500 uppercase mt-0.5">{t.layerType}</p>
                          </div>
                        </div>
                      ))}
                      
                      {layers.length === 0 && isProcessing && Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse">
                          <div className="w-full aspect-square bg-zinc-800 rounded-lg mb-3"></div>
                          <div className="h-4 bg-zinc-800 rounded w-1/2 mx-auto"></div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      <footer className="border-t border-zinc-900 py-8 mt-auto bg-zinc-950">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-zinc-500">
           <div className="flex flex-col md:flex-row gap-2 md:gap-6 items-center text-center md:text-left">
             <p>&copy; {new Date().getFullYear()} {t.appTitle}. {t.footerCopyright}</p>
             <div className="flex items-center gap-4 text-zinc-400">
                <span className="hidden md:block w-1 h-1 rounded-full bg-zinc-700"></span>
                <div className="flex items-center gap-1.5">
                  <User size={14} />
                  <span>{t.author}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail size={14} />
                  <span>{t.email}</span>
                </div>
             </div>
           </div>
           
           <div className="flex gap-4">
             <a href="#" className="hover:text-zinc-300">{t.privacy}</a>
             <a href="#" className="hover:text-zinc-300">{t.terms}</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;