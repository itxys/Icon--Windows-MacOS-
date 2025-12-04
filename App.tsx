import React, { useState, useRef } from 'react';
import { Upload, Download, Image as ImageIcon, Sparkles, RefreshCcw, Zap, Layers, Monitor, Apple, Globe, Mail, User, Settings, Key, ChevronDown, ChevronUp, Cpu, Disc, FileCode, Github } from 'lucide-react';
import { generateIconLayers, createIcoFile, createIcnsFile } from './utils/icoGenerator';
import { generateIcon } from './services/geminiService';
import { IconLayer, AppTab, IconFormat, AIConfig } from './types';
import { Button } from './components/Button';
import { Alert } from './components/Alert';

type Language = 'zh' | 'en';

const translations = {
  en: {
    appTitle: "ICON_CONVERTER",
    navConvert: "FORMAT_CONVERT",
    navGenerate: "AI_GENERATOR",
    aiTitle: "AI_ICON_SYNTHESIS",
    aiDesc: "Initialize generation sequence. Describe target vector asset. System will render professional-grade imagery.",
    aiPlaceholder: "INPUT_PROMPT > e.g. Minimalist cyber-rocket...",
    aiButton: "EXECUTE_GEN",
    aiPoweredBy: "SYSTEM: POWERED BY AI NEURAL NET",
    convertTitle: "IMG_TO_ICON_MODULE",
    convertDesc: "Convert raster graphics to multi-size Windows (.ICO) and macOS (.ICNS) format. Client-side processing only.",
    formatWindows: "WINDOWS",
    formatMac: "MACOS",
    uploadClick: "INITIALIZE_UPLOAD",
    uploadDesc: "SUPPORTED: PNG, JPG, WEBP (512px+)",
    sourceImage: "SOURCE_BUFFER",
    startOver: "RESET_SYSTEM",
    readyDownload: "OUTPUT_READY",
    readyDownloadDesc: (format: string, count: number) => `FILE_TYPE: .${format.toLowerCase()} // LAYERS: ${count} // OPTIMIZED_FOR: ${format}`,
    downloadButton: (format: string) => `DOWNLOAD .${format}`,
    generatedLayers: "LAYER_PREVIEW",
    processing: "PROCESSING...",
    layersCount: (count: number) => `COUNT: ${count}`,
    footerCopyright: "LOCAL_PROCESSING_ONLY.",
    author: "DEV: houxiaohou",
    email: "CONTACT: itxysh@gmail.com",
    github: "GITHUB: github.com/itxys",
    privacy: "PRIVACY",
    terms: "TERMS",
    errorImage: "ERR: INVALID_FILE_TYPE",
    errorGen: "ERR: GENERATION_FAILED",
    layerType: "32-BIT",
    settingsTitle: "CONFIG",
    providerLabel: "PROVIDER_SELECT",
    apiKeyLabel: "ACCESS_KEY",
    apiKeyPlaceholder: "INPUT_KEY...",
    apiKeyHelp: "DEFAULT_KEY_ACTIVE (GEMINI)",
    providerGemini: "GOOGLE_GEMINI_2.5",
    providerOpenAI: "OPENAI_DALLE_3",
    providerDoubao: "VOLCANO_DOUBAO",
    providerQwen: "ALIBABA_QWEN"
  },
  zh: {
    appTitle: "图标格式转换器",
    navConvert: "格式转换",
    navGenerate: "AI生成",
    aiTitle: "AI_智能绘图",
    aiDesc: "启动生成序列。描述目标矢量素材，系统将渲染专业级图像。",
    aiPlaceholder: "指令输入 > 例如：极简风格的蓝色火箭...",
    aiButton: "执行生成",
    aiPoweredBy: "系统：AI 神经网络驱动",
    convertTitle: "图片转图标模块",
    convertDesc: "将光栅图形转换为多尺寸 Windows (.ICO) 和 macOS (.ICNS) 格式。仅客户端处理。",
    formatWindows: "WINDOWS",
    formatMac: "MACOS",
    uploadClick: "初始化上传",
    uploadDesc: "支持格式：PNG, JPG, WEBP (512px+)",
    sourceImage: "源数据缓冲",
    startOver: "系统重置",
    readyDownload: "输出就绪",
    readyDownloadDesc: (format: string, count: number) => `文件类型: .${format.toLowerCase()} // 图层: ${count} // 优化目标: ${format}`,
    downloadButton: (format: string) => `下载 .${format} 文件`,
    generatedLayers: "图层预览",
    processing: "处理中...",
    layersCount: (count: number) => `数量: ${count}`,
    footerCopyright: "全本地离线处理。",
    author: "开发: houxiaohou",
    email: "联系: itxysh@gmail.com",
    github: "GITHUB: github.com/itxys",
    privacy: "隐私协议",
    terms: "服务条款",
    errorImage: "错误：无效的文件类型",
    errorGen: "错误：生成失败",
    layerType: "32位",
    settingsTitle: "系统配置",
    providerLabel: "服务提供商",
    apiKeyLabel: "访问密钥",
    apiKeyPlaceholder: "输入密钥...",
    apiKeyHelp: "默认密钥激活中 (仅限 Gemini)",
    providerGemini: "GOOGLE_GEMINI_2.5",
    providerOpenAI: "OPENAI_DALLE_3",
    providerDoubao: "字节跳动_DOUBAO",
    providerQwen: "阿里云_QWEN"
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
  const [showSettings, setShowSettings] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>({ provider: 'gemini', apiKey: '' });

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
      const result = await generateIcon(prompt, aiConfig);
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
    <div className="min-h-screen bg-zinc-950 text-zinc-300 flex flex-col selection:bg-orange-500/30 selection:text-orange-200">
      
      {/* Top Decoration Line */}
      <div className="h-1 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 w-full shadow-[0_0_10px_rgba(234,88,12,0.5)]"></div>

      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-600 flex items-center justify-center text-black shadow-[0_0_10px_rgba(234,88,12,0.3)]">
              <Disc size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-widest text-zinc-100 uppercase leading-none">{t.appTitle}</span>
              <span className="text-[10px] tracking-[0.2em] text-orange-500 font-bold mt-1">V1.0.4 // STABLE</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="flex items-center bg-zinc-950 p-1 border border-zinc-800">
              <button
                onClick={() => setActiveTab(AppTab.CONVERT)}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border border-transparent ${
                  activeTab === AppTab.CONVERT 
                    ? 'bg-zinc-800 text-orange-500 border-zinc-700' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                {t.navConvert}
              </button>
              <div className="w-px h-4 bg-zinc-800 mx-1"></div>
              <button
                onClick={() => setActiveTab(AppTab.GENERATE)}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border border-transparent ${
                  activeTab === AppTab.GENERATE 
                    ? 'bg-zinc-800 text-orange-500 border-zinc-700' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                <Sparkles size={12} />
                <span>{t.navGenerate}</span>
              </button>
            </nav>

            <button 
              onClick={toggleLanguage}
              className="px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-orange-500 hover:bg-zinc-900 transition-colors border border-zinc-800 uppercase tracking-widest"
            >
              [ 中 / 英 ]
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full relative">
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-6 text-zinc-800/50 text-9xl font-bold -z-10 select-none pointer-events-none opacity-20">DATA</div>
        <div className="absolute top-1/2 left-0 w-px h-32 bg-zinc-800/50"></div>
        <div className="absolute top-1/2 right-0 w-px h-32 bg-zinc-800/50"></div>

        {error && (
          <div className="mb-8">
            <Alert type="error" message={error} />
          </div>
        )}

        {/* GENERATE TAB */}
        {activeTab === AppTab.GENERATE && (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-l-2 border-orange-600 pl-4">
              <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">{t.aiTitle}</h1>
              <p className="text-zinc-500 text-sm font-medium tracking-wide mt-2">:: {t.aiDesc}</p>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800 relative overflow-hidden flex flex-col group">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-orange-500"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-orange-500"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-orange-500"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-orange-500"></div>
              
              {/* Toolbar Header for Settings */}
              <div className="flex items-center justify-between p-2 border-b border-zinc-800 bg-zinc-950/80">
                <div className="flex items-center gap-2 px-2">
                   <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                   <span className="text-[10px] uppercase tracking-widest text-zinc-500">MODULE_STATUS: ONLINE</span>
                </div>
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={`px-3 py-1 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider border ${showSettings ? 'bg-zinc-800 text-orange-400 border-zinc-700' : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-800'}`}
                >
                  <Settings size={12} />
                  <span>{t.settingsTitle}</span>
                  {showSettings ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Settings Panel */}
                {showSettings && (
                  <div className="p-4 bg-zinc-950 border border-zinc-800 animate-in fade-in slide-in-from-top-2 relative">
                    <div className="absolute -top-3 left-3 bg-zinc-950 px-2 text-[10px] text-orange-500 font-bold uppercase tracking-wider border border-zinc-800">
                       // SYSTEM_CONFIG
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Cpu size={12} /> {t.providerLabel}
                        </label>
                        <select 
                          value={aiConfig.provider}
                          onChange={(e) => setAiConfig(prev => ({ ...prev, provider: e.target.value as any }))}
                          className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 uppercase font-mono rounded-none"
                        >
                          <option value="gemini">{t.providerGemini}</option>
                          <option value="openai">{t.providerOpenAI}</option>
                          <option value="doubao">{t.providerDoubao}</option>
                          <option value="qwen">{t.providerQwen}</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Key size={12} /> {t.apiKeyLabel}
                        </label>
                        <input
                          type="password"
                          value={aiConfig.apiKey}
                          onChange={(e) => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                          placeholder={t.apiKeyPlaceholder}
                          className="w-full bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 font-mono rounded-none"
                        />
                      </div>
                    </div>
                    {aiConfig.provider === 'gemini' && (
                      <p className="text-[10px] text-zinc-600 mt-2 italic font-mono">&gt; {t.apiKeyHelp}</p>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                   <div className="flex gap-0 border border-zinc-700 p-1 bg-zinc-950">
                      <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t.aiPlaceholder}
                        className="flex-1 bg-transparent border-none px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-0 font-mono text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                      />
                      <Button 
                        onClick={handleGenerate} 
                        isLoading={isGenerating} 
                        disabled={!prompt.trim()}
                        icon={<Zap size={16} />}
                        className="px-6 border-l border-zinc-800"
                      >
                        {t.aiButton}
                      </Button>
                   </div>
                   <div className="flex justify-between items-center text-[10px] text-zinc-600 font-mono uppercase">
                      <span>{t.aiPoweredBy}</span>
                      <span className="animate-pulse">{isGenerating ? '>> EXECUTING...' : '>> AWAITING INPUT'}</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONVERT TAB */}
        {activeTab === AppTab.CONVERT && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Upload Section */}
            {!sourceImage && (
              <div className="max-w-xl mx-auto text-center space-y-8">
                 <div className="border-l-2 border-orange-600 pl-4 text-left">
                  <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">{t.convertTitle}</h1>
                  <p className="text-zinc-500 text-sm font-medium tracking-wide mt-2">:: {t.convertDesc}</p>
                </div>
                
                {/* Format Selection (Initial) */}
                 <div className="flex justify-center gap-0 border border-zinc-800 bg-zinc-900/50 p-1 w-fit mx-auto">
                   <button
                     onClick={() => setFormat('ICO')}
                     className={`flex items-center gap-3 px-8 py-3 transition-all border ${
                       format === 'ICO' 
                       ? 'bg-zinc-800 border-orange-500 text-orange-500' 
                       : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'
                     }`}
                   >
                     <Monitor size={18} />
                     <div className="text-left leading-none">
                       <div className="font-bold text-sm tracking-wider">{t.formatWindows}</div>
                       <div className="text-[10px] opacity-70 mt-1">.ICO</div>
                     </div>
                   </button>
                   <div className="w-px bg-zinc-800 my-2"></div>
                   <button
                     onClick={() => setFormat('ICNS')}
                     className={`flex items-center gap-3 px-8 py-3 transition-all border ${
                       format === 'ICNS' 
                       ? 'bg-zinc-800 border-orange-500 text-orange-500' 
                       : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'
                     }`}
                   >
                     <Apple size={18} />
                      <div className="text-left leading-none">
                       <div className="font-bold text-sm tracking-wider">{t.formatMac}</div>
                       <div className="text-[10px] opacity-70 mt-1">.ICNS</div>
                     </div>
                   </button>
                 </div>

                <div 
                  className="border-2 border-dashed border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-900/30 bg-zinc-900/10 p-12 transition-all cursor-pointer group relative overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="absolute top-0 right-0 p-2 opacity-30 group-hover:opacity-100 transition-opacity">
                    <FileCode className="text-orange-500" size={24}/>
                  </div>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept="image/png,image/jpeg,image/webp" 
                    className="hidden" 
                  />
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-zinc-900 group-hover:bg-orange-500/20 group-hover:text-orange-500 flex items-center justify-center transition-colors border border-zinc-700 group-hover:border-orange-500/50">
                      <Upload size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-zinc-200 group-hover:text-orange-400 transition-colors uppercase tracking-wider">&gt;&gt; {t.uploadClick}</p>
                      <p className="text-xs text-zinc-500 font-mono">{t.uploadDesc}</p>
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
                  <div className="bg-zinc-900/40 p-1 border border-zinc-800">
                    <div className="bg-zinc-950 p-4 border border-zinc-800/50 relative">
                      <div className="absolute -top-2.5 left-2 bg-zinc-950 px-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider border border-zinc-800 flex items-center gap-2">
                        <ImageIcon size={10} /> {t.sourceImage}
                      </div>
                      
                      <div className="aspect-square bg-[url('https://bg-patterns.netlify.app/bg-zinc-950-check.svg')] bg-zinc-900/50 border border-zinc-800 flex items-center justify-center p-4 relative overflow-hidden group mt-2">
                        <img src={sourceImage} alt="Source" className="max-w-full max-h-full object-contain shadow-2xl drop-shadow-2xl image-render-pixel" />
                         <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm border-2 border-orange-500 m-4">
                            <Button variant="ghost" onClick={resetState} icon={<RefreshCcw size={16}/>} className="text-orange-500 hover:text-orange-400 hover:bg-transparent">
                              {t.startOver}
                            </Button>
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Format Switcher in results */}
                  <div className="flex border border-zinc-800 bg-zinc-950">
                     <button
                        onClick={() => handleFormatChange('ICO')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-all border-r border-zinc-800 ${
                          format === 'ICO' ? 'bg-zinc-800 text-orange-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                        }`}
                     >
                        <Monitor size={14} /> {t.formatWindows}
                     </button>
                     <button
                        onClick={() => handleFormatChange('ICNS')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                          format === 'ICNS' ? 'bg-zinc-800 text-orange-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                        }`}
                     >
                        <Apple size={14} /> {t.formatMac}
                     </button>
                  </div>

                  <div className="bg-zinc-900/20 p-6 border border-zinc-800 border-l-4 border-l-orange-500">
                     <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">{t.readyDownload}</h3>
                     <p className="text-zinc-500 text-xs font-mono mb-4 leading-relaxed">
                       {t.readyDownloadDesc(format, layers.length)}
                     </p>
                     <Button 
                        onClick={handleDownload} 
                        className="w-full" 
                        disabled={!outputUrl || isProcessing}
                        icon={<Download size={16} />}
                      >
                        {t.downloadButton(format)}
                      </Button>
                  </div>
                </div>

                {/* Right: Generated Sizes */}
                <div className="lg:col-span-8 space-y-4">
                   <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                     <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                       <Layers size={20} className="text-orange-500" />
                       {t.generatedLayers}
                       {isProcessing && <span className="text-xs font-mono text-orange-500 animate-pulse">:: {t.processing}</span>}
                     </h3>
                     <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-1 uppercase tracking-wider font-mono">{t.layersCount(layers.length)}</span>
                   </div>

                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {layers.map((layer) => (
                        <div key={layer.size} className="bg-zinc-950 border border-zinc-800 p-3 flex flex-col items-center gap-3 transition-all hover:border-orange-500/50 group relative">
                          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-zinc-800 rounded-full group-hover:bg-orange-500"></div>
                          
                          <div className="w-full aspect-square bg-zinc-900/50 border border-zinc-900 flex items-center justify-center p-2 relative overflow-hidden">
                             {/* Grid Lines */}
                             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                             
                             <img src={layer.url} alt={`${layer.size}x${layer.size}`} className="relative z-10 max-w-full max-h-full object-contain image-render-pixel" />
                          </div>
                          <div className="text-center w-full">
                            <div className="flex items-center justify-between border-t border-zinc-800 pt-2 mt-1">
                                <p className="text-xs font-bold text-zinc-300 font-mono">{layer.size}x{layer.size}</p>
                                <p className="text-[9px] text-zinc-600 uppercase tracking-wider">{t.layerType}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {layers.length === 0 && isProcessing && Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-zinc-950 border border-zinc-800 p-4 animate-pulse opacity-50">
                          <div className="w-full aspect-square bg-zinc-900 mb-3"></div>
                          <div className="h-2 bg-zinc-900 w-1/2 mx-auto"></div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      <footer className="border-t border-zinc-900 py-6 mt-auto bg-zinc-950 text-[10px] font-mono uppercase tracking-wider">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-600">
           <div className="flex flex-col md:flex-row gap-2 md:gap-8 items-center text-center md:text-left">
             <p>&copy; {new Date().getFullYear()} {t.appTitle}. {t.footerCopyright}</p>
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5 hover:text-orange-500 transition-colors cursor-help">
                  <User size={12} />
                  <span>{t.author}</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-orange-500 transition-colors cursor-help">
                  <Mail size={12} />
                  <span>{t.email}</span>
                </div>
                <a href="https://github.com/itxys" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-orange-500 transition-colors">
                  <Github size={12} />
                  <span>{t.github}</span>
                </a>
             </div>
           </div>
           
           <div className="flex gap-4">
             <a href="#" className="hover:text-zinc-300 transition-colors">{t.privacy}</a>
             <span className="text-zinc-800">|</span>
             <a href="#" className="hover:text-zinc-300 transition-colors">{t.terms}</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;