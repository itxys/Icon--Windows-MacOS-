# Icon格式转化器-Windows,MacOS多尺寸图标一键转格式

[中文](#chinese) | [English](#english)

---

<a name="chinese"></a>
## 🇨🇳 中文

**Icon格式转化器** 是一款专业级的 Web 应用程序，旨在将图片转换为适用于 **Windows (.ico)** 和 **macOS (.icns)** 的多尺寸图标文件。

本工具不仅支持本地图片转换，还集成了多种主流 **AI 绘画模型**，支持用户配置自己的 API Key 来生成高质量的图标素材。

### ✨ 主要功能

*   **多平台图标转换**:
    *   **Windows (.ico)**: 自动生成尺寸：256x256, 128x128, 64x64, 48x48, 32x32, 16x16。
    *   **macOS (.icns)**: 自动生成尺寸：1024x1024, 512x512, 256x256, 128x128, 64x64, 32x32, 16x16。
*   **多模型 AI 智能生成**: 支持多种顶级 AI 服务商，通过文本描述生成矢量风格图标：
    *   **Google Gemini**: 使用 Gemini 2.5 Flash Image 模型（支持默认 Key 或自定义 Key）。
    *   **OpenAI**: 支持 DALL-E 3 模型。
    *   **火山引擎 (Doubao)**: 支持字节跳动豆包 Image Pro 模型。
    *   **阿里云 (Qwen)**: 支持通义万相 (Wanx) 模型（包含异步任务轮询处理）。
*   **自定义 API 设置**: 用户可以在界面中直接输入自己的 API Key，灵活切换不同的 AI 服务提供商。
*   **隐私优先**: 
    *   **格式转换**: 图片格式转换完全在 **客户端（浏览器）** 通过 Canvas API 完成，原始图片不会上传。
    *   **AI 生成**: 仅将提示词发送至您选择的 AI 服务商接口。
*   **现代 UI 设计**: 基于 React 19 和 Tailwind CSS 构建的流畅深色主题界面，支持中英双语切换。

### 🛠 技术栈

*   **前端框架**: React 19, TypeScript
*   **样式库**: Tailwind CSS
*   **图标库**: Lucide React
*   **AI 集成**: 
    *   Google GenAI SDK (`@google/genai`)
    *   Fetch API (用于 OpenAI, Volcano Engine, Alibaba Cloud)
*   **图像处理**: HTML5 Canvas API & Blob 操作

### 🚀 使用指南

1.  **转换本地图片**:
    *   点击上传区域，选择一张 PNG, JPG 或 WEBP 图片（建议 512x512px 以上）。
    *   选择目标格式：**Windows (.ico)** 或 **macOS (.icns)**。
    *   预览生成的各个尺寸图层，点击“下载”即可获取最终文件。
2.  **使用 AI 生成**:
    *   切换到 **"AI生成图标"** 标签页。
    *   点击右上角的 **"AI 设置"** 展开配置面板。
    *   选择服务提供商（如 Gemini, OpenAI, Doubao, Qwen）。
    *   输入对应的 **API Key**。
    *   在输入框中描述您想要的图标（例如：“一个极简风格的蓝色火箭图标”），点击生成。
    *   生成成功后，应用会自动跳转到转换页面供您下载。

### 👤 作者信息

*   **作者**: houxiaohou
*   **邮箱**: itxysh@gmail.com

---

<a name="english"></a>
## 🇬🇧 English

**Icon Format Converter** is a professional-grade web application designed to convert images into multi-size icons for **Windows (.ico)** and **macOS (.icns)**. 

Beyond local conversion, it integrates with multiple leading **AI Image Models**, allowing users to configure their own API Keys to generate professional icon assets from text prompts.

### ✨ Key Features

*   **Multi-Platform Conversion**:
    *   **Windows (.ico)**: Automatically generates sizes: 256x256, 128x128, 64x64, 48x48, 32x32, 16x16.
    *   **macOS (.icns)**: Automatically generates sizes: 1024x1024, 512x512, 256x256, 128x128, 64x64, 32x32, 16x16.
*   **Multi-Provider AI Generation**: Generate vector-style icons using top-tier AI providers:
    *   **Google Gemini**: Powered by Gemini 2.5 Flash Image (Default or Custom Key).
    *   **OpenAI**: Powered by DALL-E 3.
    *   **Volcano Engine (Doubao)**: Powered by ByteDance's Doubao Image Pro.
    *   **Alibaba Cloud (Qwen)**: Powered by Tongyi Wanx (includes async polling logic).
*   **Custom API Settings**: Easily switch providers and input your own API Key directly in the UI.
*   **Privacy First**: 
    *   **Conversion**: Image processing is done entirely **client-side** (in browser) using Canvas API.
    *   **AI Generation**: Only prompts are sent to the selected AI provider.
*   **Modern UI**: Sleek, dark-themed interface built with React 19 and Tailwind CSS, featuring bilingual support (English/Chinese).

### 🛠 Tech Stack

*   **Frontend**: React 19, TypeScript
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **AI Integration**: 
    *   Google GenAI SDK (`@google/genai`)
    *   Fetch API (for OpenAI, Volcano Engine, Alibaba Cloud)
*   **Image Processing**: HTML5 Canvas API & Blob manipulation

### 📖 Usage

1.  **Convert Local Image**:
    *   Upload a PNG, JPG, or WEBP image (Recommended: 512x512px+).
    *   Select target format: **Windows (.ico)** or **macOS (.icns)**.
    *   Preview generated layers and click "Download".
2.  **Generate with AI**:
    *   Switch to the **"AI Generate"** tab.
    *   Click **"AI Settings"** to open the configuration panel.
    *   Select a provider (Gemini, OpenAI, Doubao, Qwen).
    *   Enter your **API Key**.
    *   Type a description (e.g., "A futuristic blue rocket ship, minimalist flat design") and click Generate.
    *   Once generated, the app automatically switches to the conversion view for download.

### 👤 Author

*   **Author**: houxiaohou
*   **Email**: itxysh@gmail.com
