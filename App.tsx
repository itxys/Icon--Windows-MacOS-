
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Image as ImageIcon, RefreshCcw, Layers, Monitor, Apple, Disc, FileCode, Github, Mail, User, Sparkles, Zap, Wand2, X, ArrowRightLeft, ExternalLink, History, Trash2 } from 'lucide-react';
import { generateIconLayers, createIcoFile, createIcnsFile } from './utils/icoGenerator';
import { IconLayer, IconFormat, AppTab, GeneratedImage } from './types';
import { Button } from './components/Button';
import { Alert } from './components/Alert';
import { generateIcon as aiGenerateService } from './services/geminiService';

type Language = 'zh' | 'en';

const STORAGE_KEY = 'icon_gen_pro_ai_history';

const STYLE_PRESETS = [
  { id: '3d', name: '3D Render', nameZh: '3D 渲染', prompt: '3D claymation style, soft lighting, occlusion rendering' },
  { id: 'flat', name: 'Flat Design', nameZh: '极简扁平', prompt: 'Modern flat design, minimalist, bold colors, simple shapes' },
  { id: 'glass', name: 'Glassmorphism', nameZh: '玻璃拟态', prompt: 'Glassmorphism style, frosted glass, translucency, vibrant background' },
  { id: 'neon', name: 'Cyber Neon', nameZh: '赛博霓虹', prompt: 'Cyberpunk neon style, glowing lines, dark futuristic background' },
  { id: 'pixel', name: 'Pixel Art', nameZh: '像素艺术', prompt: 'Retro 8-bit pixel art style, game boy aesthetic' },
  { id: 'realistic', name: 'Photorealistic', nameZh: '写实摄影', prompt: 'Highly detailed, photorealistic, cinematic macro photography' }
];

const translations = {
  en: {
    appTitle: "ICON_GEN_PRO",
    convertTab: "LOCAL_CONVERT",
    aiTab: "AI_CREATOR",
    convertTitle: "IMG_TO_ICON_MODULE",
    aiTitle: "AI_CREATION_LAB",
    convertDesc: "Convert raster graphics to multi-size Windows/macOS format. Local processing.",
    aiDesc: "Generate professional icons using Gemini 2.5 AI. Pure creativity.",
    aiInputPlaceholder: "Describe your icon (e.g., 'A majestic eagle wearing VR headset')...",
    generateBtn: "GENERATE_NEW",
    generating: "AI_THINKING...",
    styleTitle: "STYLE_PRESET",
    historyTitle: "HISTORY_ARCHIVE",
    historyDesc: "Select an asset to process or download. Saved locally.",
    modalTitle: "SELECT_PROTOCOL",
    actionConvert: "TRANSFER_TO_CONVERTER",
    actionDownload: "SAVE_SOURCE_IMAGE",
    formatWindows: "WINDOWS",
    formatMac: "MACOS",
    uploadClick: "INITIALIZE_UPLOAD",
    uploadDesc: "SUPPORTED: PNG, JPG, WEBP (512px+)",
    sourceImage: "SOURCE_BUFFER",
    startOver: "RESET_SYSTEM",
    readyDownload: "OUTPUT_READY",
    readyDownloadDesc: (format: string, count: number) => `FILE_TYPE: .${format.toLowerCase()} // LAYERS: ${count} // PLATFORM: ${format}`,
    downloadButton: (format: string) => `DOWNLOAD .${format}`,
    generatedLayers: "LAYER_PREVIEW",
    processing: "PROCESSING...",
    layersCount: (count: number) => `COUNT: ${count}`,
    footerCopyright: "ALL_SYSTEMS_OPERATIONAL. PRIVACY_ENFORCED.",
    author: "DEV: houxiaohou",
    email: "CONTACT: itxysh@gmail.com",
    github: "GITHUB: github.com/itxys",
    errorImage: "ERR: INVALID_FILE_TYPE",
    errorAI: "ERR: GENERATION_FAILED",
    layerType: "32-BIT",
    emptyHistory: "NO_ASSETS_GENERATED_YET",
    clearHistory: "PURGE_HISTORY"
  },
  zh: {
    appTitle: "图标大师 PRO",
    convertTab: "本地转换",
    aiTab: "AI 创作",
    convertTitle: "图片转图标模块",
    aiTitle: "AI 创意实验室",
    convertDesc: "将图片转换为多尺寸 Windows (.ICO) 和 macOS (.ICNS) 格式。全本地处理。",
    aiDesc: "使用 Gemini 2.5 AI 生成专业级图标。创意无限。",
    aiInputPlaceholder: "描述你想要的图标（例如：'一只戴着VR眼镜的雄鹰'）...",
    generateBtn: "生成新图标",
    generating: "AI 正在思考...",
    styleTitle: "选择艺术风格",
    historyTitle: "创作历史存档",
    historyDesc: "选择一个生成的素材进行转换或下载。已自动保存在本地。",
    modalTitle: "选择操作协议",
    actionConvert: "传输至转换模块",
    actionDownload: "保存原始图片",
    formatWindows: "WINDOWS",
    formatMac: "MACOS",
    uploadClick: "初始化上传",
    uploadDesc: "支持格式：PNG, JPG, WEBP (建议 512px+)",
    sourceImage: "源图片预览",
    startOver: "重置系统",
    readyDownload: "转换完成",
    readyDownloadDesc: (format: string, count: number) => `文件类型: .${format.toLowerCase()} // 包含尺寸: ${count} 层 // 适配平台: ${format}`,
    downloadButton: (format: string) => `下载 .${format} 图标`,
    generatedLayers: "生成的图层预览",
    processing: "正在转换尺寸...",
    layersCount: (count: number) => `层数: ${count}`,
    footerCopyright: "系统运行正常。所有操作均本地加密处理。",
    author: "开发: houxiaohou",
    email: "联系: itxysh@gmail.com",
    github: "GITHUB: github.com/itxys",
    errorImage: "错误：不支持的文件类型",
    errorAI: "错误：生成图标失败",
    layerType: "32位真彩色",
    emptyHistory: "暂无生成的素材存档",
    clearHistory: "清空存档"
  }
};

const LOADING_MESSAGES = [
  "Initializing neural patterns...",
  "Pixel array alignment in progress...",
  "Rendering creative vectors...",
  "Optimizing lighting shaders...",
  "Finalizing icon buffer..."
];

const App = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('CONVERT');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [layers, setLayers] = useState<IconLayer[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<IconFormat>('ICO');
  const [lang, setLang] = useState<Language>('zh');
  
  // AI States
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(STYLE_PRESETS[0]);
  const [aiHistory, setAiHistory] = useState<GeneratedImage[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<GeneratedImage | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  // Load history from localStorage on initial mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setAiHistory(parsed);
      } catch (e) {
        console.error("Failed to load history from localStorage", e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (aiHistory.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(aiHistory));
    }
  }, [aiHistory]);

  // Loading message rotator
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 1500);
    } else {
      setLoadingMsgIdx(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const resetState = () => {
    if (outputUrl && outputUrl.startsWith('blob:')) URL.revokeObjectURL(outputUrl);
    layers.forEach(l => { if (l.url.startsWith('blob:')) URL.revokeObjectURL(l.url); });
    setSourceImage(null);
    setLayers([]);
    setOutputUrl(null);
    setError(null);
  };

  const processImage = async (url: string, targetFormat: IconFormat = format) => {
    setIsProcessing(true);
    setError(null);
    try {
      const generatedLayers = await generateIconLayers(url, targetFormat);
      setLayers(generatedLayers);

      let blob: Blob;
      if (targetFormat === 'ICO') {
        blob = await createIcoFile(generatedLayers);
      } else {
        blob = await createIcnsFile(generatedLayers);
      }
      
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
    if (sourceImage) {
      if (outputUrl && outputUrl.startsWith('blob:')) URL.revokeObjectURL(outputUrl);
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

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      const generatedUrl = await aiGenerateService(aiPrompt, selectedStyle.prompt);
      const newImage: GeneratedImage = {
        id: Math.random().toString(36).substr(2, 9),
        url: generatedUrl,
        prompt: aiPrompt,
        timestamp: Date.now()
      };
      const updatedHistory = [newImage, ...aiHistory];
      setAiHistory(updatedHistory);
      
      // Auto-preview the newest generation
      resetState();
      setSourceImage(generatedUrl);
      await processImage(generatedUrl, format);
    } catch (err: any) {
      setError(err.message || t.errorAI);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleActionConvert = (item: GeneratedImage) => {
    resetState();
    setSourceImage(item.url);
    setActiveTab('CONVERT');
    processImage(item.url, format);
    setSelectedHistoryItem(null);
  };

  const handleActionDownload = (item: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = item.url;
    link.download = `ai_icon_${item.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSelectedHistoryItem(null);
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

  const clearHistory = () => {
    if (window.confirm(lang === 'zh' ? '确定要清空所有历史存档吗？' : 'Are you sure you want to purge history?')) {
      setAiHistory([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'zh' ? 'en' : 'zh');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 flex flex-col selection:bg-orange-500/30 selection:text-orange-200">
      
      <div className="h-1 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 w-full shadow-[0_0_10px_rgba(234,88,12,0.5)]"></div>

      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-600 flex items-center justify-center text-black shadow-[0_0_15px_rgba(234,88,12,0.4)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              <Disc size={24} strokeWidth={2.5} className="group-hover:rotate-180 transition-transform duration-700" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-widest text-zinc-100 uppercase leading-none">{t.appTitle}</span>
              <span className="text-[10px] tracking-[0.2em] text-orange-500 font-bold mt-1">V2.2.0 // PERSISTENT_ARCHIVE</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-zinc-950 p-1 border border-zinc-800 rounded-sm">
            <button 
              onClick={() => setActiveTab('CONVERT')}
              className={`px-4 py-1.5 text-xs font-bold transition-all uppercase tracking-widest ${activeTab === 'CONVERT' ? 'bg-zinc-800 text-orange-500 shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {t.convertTab}
            </button>
            <button 
              onClick={() => setActiveTab('AI')}
              className={`px-4 py-1.5 text-xs font-bold transition-all uppercase tracking-widest flex items-center gap-2 ${activeTab === 'AI' ? 'bg-zinc-800 text-orange-500 shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Sparkles size={12} />
              {t.aiTab}
            </button>
          </div>

          <button 
            onClick={toggleLanguage}
            className="px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-orange-500 hover:bg-zinc-900 transition-colors border border-zinc-800 uppercase tracking-widest"
          >
            [ {lang.toUpperCase()} ]
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full relative">
        <div className="absolute top-0 right-6 text-zinc-800/10 text-9xl font-bold -z-10 select-none pointer-events-none">{activeTab.slice(0, 4)}</div>

        {error && (
          <div className="mb-8">
            <Alert type="error" message={error} />
          </div>
        )}

        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* TAB 1: LOCAL CONVERTER */}
          {activeTab === 'CONVERT' && (
            <>
              {!sourceImage ? (
                <div className="max-w-xl mx-auto text-center space-y-8 mt-12">
                  <div className="border-l-2 border-orange-600 pl-4 text-left">
                    <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">{t.convertTitle}</h1>
                    <p className="text-zinc-500 text-sm font-medium tracking-wide mt-2">:: {t.convertDesc}</p>
                  </div>
                  
                  <div className="flex justify-center gap-0 border border-zinc-800 bg-zinc-900/50 p-1 w-fit mx-auto">
                    <button
                      onClick={() => setFormat('ICO')}
                      className={`flex items-center gap-3 px-8 py-3 transition-all border ${
                        format === 'ICO' 
                        ? 'bg-zinc-800 border-orange-500 text-orange-500 shadow-[0_0_10px_rgba(234,88,12,0.15)]' 
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
                        ? 'bg-zinc-800 border-orange-500 text-orange-500 shadow-[0_0_10px_rgba(234,88,12,0.15)]' 
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
                    className="border-2 border-dashed border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-900/30 bg-zinc-900/10 p-16 transition-all cursor-pointer group relative overflow-hidden"
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
              ) : (
                <ConverterView 
                  sourceImage={sourceImage} 
                  layers={layers} 
                  isProcessing={isProcessing} 
                  format={format} 
                  setFormat={handleFormatChange} 
                  resetState={resetState} 
                  handleDownload={handleDownload} 
                  outputUrl={outputUrl} 
                  t={t}
                />
              )}
            </>
          )}

          {/* TAB 2: AI CREATOR */}
          {activeTab === 'AI' && (
            <div className="space-y-16">
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="border-l-2 border-orange-600 pl-4">
                  <h1 className="text-3xl font-bold text-white tracking-tighter uppercase flex items-center gap-3">
                    <Wand2 className="text-orange-500" />
                    {t.aiTitle}
                  </h1>
                  <p className="text-zinc-500 text-sm font-medium tracking-wide mt-2">:: {t.aiDesc}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-6">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-amber-600 rounded-sm blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                      <textarea 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder={t.aiInputPlaceholder}
                        className="w-full h-48 bg-zinc-900 border border-zinc-800 p-6 text-zinc-200 focus:outline-none focus:border-orange-500 transition-all font-mono text-sm leading-relaxed resize-none relative z-10"
                      />
                      <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                        <Button 
                          onClick={handleAIGenerate} 
                          disabled={!aiPrompt.trim() || isGenerating}
                          isLoading={isGenerating}
                          icon={<Sparkles size={16} />}
                          className="shadow-lg shadow-orange-950/20"
                        >
                          {isGenerating ? t.generating : t.generateBtn}
                        </Button>
                      </div>
                    </div>

                    {isGenerating && (
                      <div className="p-4 bg-zinc-900/50 border border-zinc-800 font-mono text-[10px] space-y-1 overflow-hidden h-24">
                        <p className="text-orange-500 font-bold tracking-widest">&gt; SYSTEM_AI_INITIATED</p>
                        <p className="text-zinc-600 animate-pulse">&gt; {LOADING_MESSAGES[loadingMsgIdx]}</p>
                        <div className="w-full h-1 bg-zinc-800 mt-2 overflow-hidden">
                            <div className="h-full bg-orange-600 animate-[loading-bar_3s_infinite]" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Zap size={14} className="text-orange-500" />
                      {t.styleTitle}
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {STYLE_PRESETS.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedStyle(style)}
                          className={`text-left px-4 py-3 border transition-all flex flex-col group ${
                            selectedStyle.id === style.id 
                            ? 'bg-zinc-800 border-orange-500 text-orange-500 shadow-md' 
                            : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                          }`}
                        >
                          <span className="text-xs font-bold uppercase tracking-wider">{lang === 'zh' ? style.nameZh : style.name}</span>
                          <span className="text-[9px] font-mono opacity-50 mt-1 truncate">{style.prompt.slice(0, 30)}...</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI HISTORY ARCHIVE */}
              <div className="border-t border-zinc-900 pt-12 space-y-8">
                 <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-4">
                       <History className="text-zinc-600" />
                       <div>
                          <h2 className="text-xl font-bold text-zinc-100 uppercase tracking-tight">{t.historyTitle}</h2>
                          <p className="text-zinc-600 text-[10px] font-mono tracking-widest mt-0.5">:: {t.historyDesc}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       {aiHistory.length > 0 && (
                          <button 
                             onClick={clearHistory}
                             className="text-[10px] text-zinc-600 hover:text-red-500 transition-colors uppercase font-bold tracking-wider flex items-center gap-1.5 px-2 py-1 border border-zinc-800 hover:border-red-900"
                          >
                             <Trash2 size={12} />
                             {t.clearHistory}
                          </button>
                       )}
                       <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-3 py-1 font-mono">{aiHistory.length} ASSETS_CACHED</span>
                    </div>
                 </div>

                 {aiHistory.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-zinc-900/10 border border-dashed border-zinc-800 rounded-sm">
                       <ImageIcon size={48} className="text-zinc-800 mb-4 opacity-30" />
                       <p className="text-zinc-700 text-xs font-mono uppercase tracking-[0.2em]">{t.emptyHistory}</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                       {aiHistory.map((item) => (
                          <div 
                             key={item.id} 
                             onClick={() => setSelectedHistoryItem(item)}
                             className="group relative bg-zinc-900 border border-zinc-800 p-2 cursor-pointer hover:border-orange-500/50 transition-all hover:-translate-y-1 duration-300"
                          >
                             <div className="aspect-square bg-zinc-950 flex items-center justify-center overflow-hidden border border-zinc-800 group-hover:border-orange-950 transition-colors">
                                <img src={item.url} alt={item.prompt} className="max-w-full max-h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                             </div>
                             <div className="mt-2 flex items-center justify-between">
                                <span className="text-[9px] font-mono text-zinc-600 truncate max-w-[80%] uppercase">{item.prompt}</span>
                                <Sparkles size={8} className="text-orange-500/50" />
                             </div>
                             
                             <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-orange-600 p-1 rounded-bl-sm">
                                   <Zap size={10} className="text-black" />
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* SELECTION MODAL */}
      {selectedHistoryItem && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div 
               className="bg-zinc-950 border border-zinc-800 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
               onClick={(e) => e.stopPropagation()}
            >
               <div className="border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                     <span className="font-bold text-sm uppercase tracking-widest">{t.modalTitle}</span>
                  </div>
                  <button onClick={() => setSelectedHistoryItem(null)} className="text-zinc-500 hover:text-white transition-colors">
                     <X size={20} />
                  </button>
               </div>

               <div className="p-8 space-y-8">
                  <div className="flex justify-center">
                     <div className="w-48 h-48 bg-zinc-900 border-2 border-zinc-800 p-2 shadow-2xl relative group">
                        <img src={selectedHistoryItem.url} alt="Selection" className="w-full h-full object-contain" />
                        <div className="absolute bottom-2 right-2 text-[8px] font-mono bg-black/60 px-1 text-zinc-500">ID: {selectedHistoryItem.id}</div>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <button 
                        onClick={() => handleActionConvert(selectedHistoryItem)}
                        className="w-full group flex items-center gap-4 bg-zinc-900 border border-zinc-800 hover:border-orange-500 p-5 transition-all text-left"
                     >
                        <div className="w-12 h-12 flex-shrink-0 bg-zinc-950 border border-zinc-800 group-hover:border-orange-900 flex items-center justify-center text-zinc-500 group-hover:text-orange-500 transition-colors">
                           <ArrowRightLeft size={24} />
                        </div>
                        <div>
                           <p className="font-bold text-xs text-zinc-100 uppercase tracking-wider">{t.actionConvert}</p>
                           <p className="text-[10px] text-zinc-600 mt-1 uppercase font-mono tracking-tight">{lang === 'zh' ? '加载到转换模块生成 ICO/ICNS' : 'Load into transformation module for ICO/ICNS'}</p>
                        </div>
                     </button>

                     <button 
                        onClick={() => handleActionDownload(selectedHistoryItem)}
                        className="w-full group flex items-center gap-4 bg-zinc-900 border border-zinc-800 hover:border-blue-500 p-5 transition-all text-left"
                     >
                        <div className="w-12 h-12 flex-shrink-0 bg-zinc-950 border border-zinc-800 group-hover:border-blue-900 flex items-center justify-center text-zinc-500 group-hover:text-blue-500 transition-colors">
                           <ExternalLink size={24} />
                        </div>
                        <div>
                           <p className="font-bold text-xs text-zinc-100 uppercase tracking-wider">{t.actionDownload}</p>
                           <p className="text-[10px] text-zinc-600 mt-1 uppercase font-mono tracking-tight">{lang === 'zh' ? '直接下载原始 PNG 图片' : 'Download source PNG image directly'}</p>
                        </div>
                     </button>
                  </div>
               </div>

               <div className="bg-zinc-900/30 p-4 border-t border-zinc-800 flex justify-center">
                  <p className="text-[9px] font-mono text-zinc-700 tracking-[0.3em] uppercase">SYSTEM_ACTION_PENDING</p>
               </div>
            </div>
         </div>
      )}
      
      <footer className="border-t border-zinc-900 py-8 mt-auto bg-zinc-950 text-[10px] font-mono uppercase tracking-wider">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-zinc-600">
           <div className="flex flex-col md:flex-row gap-4 md:gap-12 items-center text-center md:text-left">
             <div className="flex flex-col">
               <p>&copy; {new Date().getFullYear()} {t.appTitle}</p>
               <p className="text-orange-900/50 mt-1">{t.footerCopyright}</p>
             </div>
             <div className="flex items-center gap-8 border-l border-zinc-900 pl-8">
                <div className="flex items-center gap-1.5 hover:text-orange-500 transition-colors cursor-help group">
                  <User size={12} className="group-hover:scale-110 transition-transform" />
                  <span>{t.author}</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-orange-500 transition-colors cursor-help group">
                  <Mail size={12} className="group-hover:scale-110 transition-transform" />
                  <span>{t.email}</span>
                </div>
                <a href="https://github.com/itxys" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-orange-500 transition-colors group">
                  <Github size={12} className="group-hover:scale-110 transition-transform" />
                  <span>{t.github}</span>
                </a>
             </div>
           </div>
           
           <div className="flex gap-6 items-center">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-zinc-800">::</span>
             <a href="#" className="hover:text-zinc-300 transition-colors">API_STATUS: OK</a>
           </div>
        </div>
      </footer>
      
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
};

// Subcomponent for the converter logic to keep App.tsx cleaner
const ConverterView = ({ sourceImage, layers, isProcessing, format, setFormat, resetState, handleDownload, outputUrl, t }: any) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in zoom-in-95 duration-500">
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
        
        <div className="flex border border-zinc-800 bg-zinc-950 shadow-lg">
           <button
              onClick={() => setFormat('ICO')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-all border-r border-zinc-800 ${
                format === 'ICO' ? 'bg-zinc-800 text-orange-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
              }`}
           >
              <Monitor size={14} /> {t.formatWindows}
           </button>
           <button
              onClick={() => setFormat('ICNS')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                format === 'ICNS' ? 'bg-zinc-800 text-orange-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
              }`}
           >
              <Apple size={14} /> {t.formatMac}
           </button>
        </div>

        <div className="bg-zinc-900/20 p-6 border border-zinc-800 border-l-4 border-l-orange-500 shadow-xl">
           <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">{t.readyDownload}</h3>
           <p className="text-zinc-500 text-xs font-mono mb-4 leading-relaxed">
             {t.readyDownloadDesc(format, layers.length)}
           </p>
           <Button 
              onClick={handleDownload} 
              className="w-full h-12" 
              disabled={!outputUrl || isProcessing}
              icon={<Download size={18} />}
            >
              {t.downloadButton(format)}
            </Button>
        </div>
      </div>

      <div className="lg:col-span-8 space-y-4">
         <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
           <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-tight">
             <Layers size={20} className="text-orange-500" />
             {t.generatedLayers}
             {isProcessing && <span className="text-xs font-mono text-orange-500 animate-pulse ml-4">:: {t.processing}</span>}
           </h3>
           <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-1 uppercase tracking-wider font-mono">{t.layersCount(layers.length)}</span>
         </div>

         <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {layers.map((layer: IconLayer) => (
              <div key={layer.size} className="bg-zinc-950 border border-zinc-800 p-3 flex flex-col items-center gap-3 transition-all hover:border-orange-500/50 group relative hover:-translate-y-1 duration-300">
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-zinc-800 rounded-full group-hover:bg-orange-500 shadow-[0_0_5px_rgba(234,88,12,0.5)]"></div>
                
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                  <button
                    onClick={(e) => {
                       e.stopPropagation();
                       const link = document.createElement('a');
                       link.href = layer.url;
                       link.download = `icon_${layer.size}x${layer.size}.png`;
                       document.body.appendChild(link);
                       link.click();
                       document.body.removeChild(link);
                    }}
                    className="p-2 bg-orange-600 text-black hover:bg-orange-500 rounded-sm transition-colors shadow-lg"
                    title="Download PNG"
                  >
                    <Download size={16} />
                  </button>
                </div>
                
                <div className="w-full aspect-square bg-zinc-900/50 border border-zinc-900 flex items-center justify-center p-2 relative overflow-hidden">
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
  );
};

export default App;
