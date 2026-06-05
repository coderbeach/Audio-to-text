# 🎤 VaniScribe — Indian Accent AI Voice Transcriber

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5 Badge">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3 Badge">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript Badge">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite Badge">
  <img src="https://img.shields.io/badge/Google_Gemini-8E75C2?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Gemini Badge">
</p>

**VaniScribe** (वाणीScribe) is a premium, glassmorphic web application optimized specifically for converting voice recordings, audio messages, and uploaded audio files into highly accurate text. It is custom-tailored to handle the subtle acoustic patterns, pronunciations, vocabulary, shorthand units (e.g. *Lakhs* and *Crores*), and bilingual code-switching (e.g. *Hinglish*) typical of **Indian English and regional languages**.

---
## 🌐 Live Demo

🔗 audio-to-text-eight-beta.vercel.app

Explore the platform using the demo credentials provided below.

## 🌟 Key Features

*   **🎤 Real-Time Dictation (Free Mode):** Powered by the browser's native `SpeechRecognition` API (Web Speech API). Get instant, zero-latency streaming text directly from your microphone.
*   **🧠 Advanced Indian Accent AI Refiner:** Integrates with the Google Gemini API to polish transcriptions. It automatically corrects phonetically misheard Indian names, locations, and units (e.g. confusing "crore" with "crow", "lakh" with "lack", "Aadhaar", or local names like "Nisarga" and "Ananya").
*   **📁 Drag & Drop File Uploads:** Upload pre-recorded audio messages (`.mp3`, `.wav`, `.m4a`, `.ogg`, `.webm` up to 20MB). Transcribe the entire file using Gemini's native multimodal audio understanding.
*   **💬 Hinglish & Regional Translators:** Speak in Hindi, Hinglish, or regional languages (Tamil, Telugu, Bengali, Kannada, Marathi, etc.) and translate the transcription into standard English with one click.
*   **🌊 Dynamic Audio Waveform:** A Canvas-based visualizer that utilizes the Web Audio API to draw real-time fluid waves reacting directly to the pitch and volume of your spoken voice.
*   **💾 Professional Export Panel:**
    *   **TXT:** Download raw transcripts instantly.
    *   **SRT:** Download timed subtitle files automatically calculated from transcription text breaks.
    *   **Read Aloud:** Text-to-Speech (TTS) reader with natural-sounding Indian accent voice sets.

---

## 🛠️ Technology Stack

*   **Frontend Structure:** Semantic HTML5
*   **Styling & UI:** Vanilla CSS3 (Custom properties, dark mode first theme, HSL palette, CSS glassmorphism, responsive grid)
*   **Logic & Web APIs:** Vanilla JavaScript ES6 (Web Audio API, Canvas API, MediaRecorder, Web Speech API, LocalStorage configurations)
*   **AI Engine:** Google Gemini Developer REST API (`gemini-2.0-flash`)
*   **Dev Server:** Vite

---

## 🚀 Local Installation & Quickstart

Modern web browsers enforce strict security rules that disable microphone access (`getUserMedia` and `SpeechRecognition`) on unsecure contexts. Therefore, double-clicking the static `index.html` file from a local folder (`file://`) will block microphone permissions. 

Use the local Vite server to serve the page securely on `http://localhost`:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/coderbeach/Audio-to-text.git
    cd Audio-to-text
    ```
2.  **Install development server dependencies:**
    ```bash
    npm install
    ```
3.  **Launch the local dev server:**
    ```bash
    npm run dev
    ```
4.  **Open the application:**
    Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

---

## 🔑 Activating Advanced AI Features

To unlock file upload transcriptions, translation, and smart accent refinement, you can use a **Gemini API Key**:

1.  Go to **[Google AI Studio](https://aistudio.google.com/)** and sign in.
2.  Click **Create API Key**.
3.  Copy your key.
4.  Open VaniScribe, click the **Settings Gear Icon** in the top right, paste your key, and click **Save Configurations**.

> [!NOTE]
> **Privacy First:** Your API key is stored locally in your browser's private storage (`localStorage`) and sent directly to Google's API endpoints. No proxy servers, relays, or databases are used, ensuring your voice data remains completely private.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
