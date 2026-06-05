# VaniScribe | Indian Accent AI Voice Transcriber

VaniScribe is a premium, glassmorphic web application optimized specifically for converting voice recordings, audio messages, and audio files into highly accurate text. It is designed to navigate the subtle nuances, vocabulary, slang, numbers (e.g., Lakhs and Crores), and speech variations typical of **Indian English and regional accents/languages** (Hinglish, Hindi, Tamil, Telugu, Kannada, etc.).

---

## 🌟 Core Features

1. **Hybrid Speech Architecture:**
   - **Real-Time Dictation (Free Mode):** Uses the browser's native **Web Speech API** (`SpeechRecognition`) for instant, zero-latency streaming text directly from your microphone. Highly responsive.
   - **High-Fidelity AI Uploads (Premium Mode):** Upload custom audio files (`.mp3`, `.wav`, `.m4a`, `.ogg`, `.webm`) directly. VaniScribe converts the file and streams it directly to the Gemini API (`gemini-2.0-flash` or `gemini-1.5-pro`) for zero-error acoustic transcription.
2. **Indian Accent AI Refiner:**
   - A dedicated **AI Refine** button. Spoken dictations containing colloquial expressions, formatting quirks, or typical accent mishearings (e.g., confusing "crore" with "crow" or "Rahul" with "rawhide") are instantly polished into correct spelling, proper sentence structure, and precise punctuation.
3. **Context Keyword Hints:**
   - Enter custom keywords or names (e.g., "Nisarga", "Aadhaar", "INR") in the context inputs. VaniScribe passes these context tokens directly to the AI, ensuring perfect spelling of rare terms and local names.
4. **Hinglish & Regional Translators:**
   - Directly translate bilingual scripts (like Hinglish - Hindi written with English characters, or direct Devanagari Hindi) into clean, standard English.
5. **Interactive Audio Visualizer:**
   - Web Audio API canvas visualizer displaying a fluid sound wave reacting to your spoken voice in real-time.
6. **Polished Export Suite:**
   - Clipboard Copy with one click.
   - Read Aloud (Text-To-Speech) utilizing native Indian voice sets.
   - File downloads: Download text transcripts (`.txt`) or standard subtitle block files (`.srt`).

---

## 🚀 Setting Up Locally

To comply with modern browser security standards, microphone permissions (`getUserMedia` and `SpeechRecognition`) are strictly limited to secure contexts (`https://` or `http://localhost`). Double-clicking a static HTML file from your hard drive (`file://` protocol) will block microphone access in most browsers.

VaniScribe includes a local **Vite dev server** to serve the application on `http://localhost` instantly:

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)

### Steps to Run
1. Open your terminal and navigate to the `vani-scribe` directory:
   ```bash
   cd vani-scribe
   ```
2. Install the lightweight developer dependency (Vite):
   ```bash
   npm install
   ```
3. Boot the development server:
   ```bash
   npm run dev
   ```
4. Click the link shown in your terminal (usually `http://localhost:5173`) to launch VaniScribe!

---

## 🔑 Activating Premium AI Features

To unlock file uploads and AI Refinement, you will need a **Gemini API Key**:
1. Visit **[Google AI Studio](https://aistudio.google.com/)** and sign in.
2. Click **Create API Key**.
3. Copy the key, open VaniScribe, click the **Settings Gear Icon** in the top right, paste your key, and click **Save Configurations**.
4. *Note:* Your key is stored strictly in your browser's private local storage (`localStorage`) and is sent directly to Google's API endpoints. No server logs or third-party relays are used.
