# Icon格式转化器-Windows,MacOS多尺寸图标一键转格式

[English](#english) | [中文](#chinese)

---

<a name="english"></a>
## 🇬🇧 English

**Icon Format Converter** (Icon格式转化器) is a professional-grade web application designed to convert images into multi-size icons for **Windows (.ico)** and **macOS (.icns)**. It features built-in AI capabilities powered by Google Gemini to generate professional icon assets from text prompts.

### ✨ Key Features

*   **Multi-Platform Support**:
    *   **Windows (.ico)**: Automatically generates sizes: 256x256, 128x128, 64x64, 48x48, 32x32, 16x16.
    *   **macOS (.icns)**: Automatically generates sizes: 1024x1024, 512x512, 256x256, 128x128, 64x64, 32x32, 16x16.
*   **AI-Powered Generation**: Integrated with **Google Gemini 2.5 Flash** to create unique, vector-style app icons from simple text descriptions.
*   **Privacy First**: Image conversion processing is done entirely **client-side** (in your browser) using the Canvas API. Your source images are never uploaded to a server (except when using the AI generation feature, where the prompt is sent to Google API).
*   **Modern UI**: A sleek, dark-themed interface built with React and Tailwind CSS.
*   **Real-time Preview**: Inspect every generated size layer before downloading.

### 🛠 Tech Stack

*   **Frontend**: React 19, TypeScript
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **AI SDK**: Google GenAI SDK (`@google/genai`)
*   **Image Processing**: HTML5 Canvas API & Blob manipulation

### 🚀 Getting Started

1.  **Clone the repository** (or download source files).
2.  **API Key Configuration**:
    To use the AI generation features, you need a Google Gemini API Key.
    *   Obtain a key from [Google AI Studio](https://aistudio.google.com/).
    *   Ensure `process.env.API_KEY` is configured in your build environment or `.env` file.
3.  **Run the application**:
    This project uses ES Modules and CDN imports. You can serve it using any static file server (e.g., `serve`, `http-server`, or VS Code Live Server).

### 📖 Usage

1.  **Convert an Image**:
    *   Upload a PNG, JPG, or WEBP image (recommended size: 512x512px or larger).
    *   Select the target format: **Windows (.ico)** or **macOS (.icns)**.
    *   Review the generated layers and click "Download".
2.  **Generate with AI**:
    *   Switch to the "AI Generate" tab.
    *   Enter a description (e.g., "A futuristic blue rocket ship, minimalist flat design").
    *   Click "Generate". The result will be automatically loaded for conversion.

---

<a name="chinese"></a>
## 🇨🇳 中文

**Icon格式转化器-Windows,MacOS多尺寸图标一键转格式** 是一款专业级的 Web 应用程序，旨在将图片转换为适用于 **Windows (.ico)** 和 **macOS (.icns)** 的多尺寸图标文件。它内置了由 Google Gemini 驱动的 AI 功能，可以通过文本提示词生成高质量的图标素材。

### ✨ 主要功能

*   **多平台支持**:
    *   **Windows (.ico)**: 自动生成尺寸：256x256, 128x128, 64x64, 48x48, 32x32, 16x16。
    *   **macOS (.icns)**: 自动生成尺寸：1024x1024, 512x512, 256x256, 128x128, 64x64, 32x32, 16x16。
*   **AI 智能生成**: 集成 **Google Gemini 2.5 Flash** 模型，通过简单的文字描述即可创建独特的矢量风格应用图标。
*   **隐私优先**: 图片格式转换完全在 **客户端（浏览器）** 通过 Canvas API 完成。您的原始图片不会上传到服务器（使用 AI 生成功能除外，提示词需发送至 Google API）。
*   **现代 UI 设计**: 基于 React 和 Tailwind CSS 构建的流畅深色主题界面。
*   **实时预览**: 在下载前检查每一个生成的尺寸图层。

### 🛠 技术栈

*   **前端**: React 19, TypeScript
*   **样式**: Tailwind CSS
*   **图标库**: Lucide React
*   **AI SDK**: Google GenAI SDK (`@google/genai`)
*   **图像处理**: HTML5 Canvas API & Blob 操作

### 🚀 以此开始

1.  **获取代码**: 克隆仓库或下载源文件。
2.  **配置 API Key**:
    要使用 AI 生成功能，您需要一个 Google Gemini API Key。
    *   前往 [Google AI Studio](https://aistudio.google.com/) 获取密钥。
    *   确保在构建环境或 `.env` 文件中配置了 `process.env.API_KEY`。
3.  **运行应用**:
    本项目使用 ES Modules 和 CDN 引入依赖。您可以使用任何静态文件服务器运行它（例如 `serve`, `http-server` 或 VS Code Live Server）。

### 📖 使用指南

1.  **转换图片**:
    *   上传一张 PNG, JPG 或 WEBP 图片（建议尺寸：512x512px 或更大）。
    *   选择目标格式：**Windows (.ico)** 或 **macOS (.icns)**。
    *   预览生成的各个图层，然后点击“下载”。
2.  **AI 生成**:
    *   切换到 "AI Generate" (AI 生成) 标签页。
    *   输入描述（例如：“一个极简风格的蓝色火箭图标”）。
    *   点击 "Generate"。生成的结果将自动加载并准备进行格式转换。