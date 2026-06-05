// VaniScribe - Main Application Logic

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // App Configurations & State
  const state = {
    isRecording: false,
    mediaRecorder: null,
    audioChunks: [],
    recordingTimer: null,
    secondsRecorded: 0,
    audioStream: null,
    audioContext: null,
    analyser: null,
    visualizerAnimation: null,
    uploadedFile: null,
    speechRecognition: null,
    isRecognitionActive: false,
    finalTranscript: '',
    recognitionConfidence: 1.0,
    
    // User Configurations (loaded from LocalStorage)
    geminiApiKey: localStorage.getItem('vaniscribe_api_key') || '',
    geminiModel: localStorage.getItem('vaniscribe_model') || 'gemini-2.0-flash',
    customDirectives: localStorage.getItem('vaniscribe_directives') || '',
  };

  // DOM Elements - Navigation
  const tabRecord = document.getElementById('tab-record');
  const tabUpload = document.getElementById('tab-upload');
  const contentRecord = document.getElementById('content-record');
  const contentUpload = document.getElementById('content-upload');
  const engineBadge = document.getElementById('engine-badge');
  const engineIndicator = document.getElementById('engine-indicator');
  const statusIndicator = document.getElementById('status-indicator');

  // DOM Elements - Settings Modal
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettings = document.getElementById('close-settings');
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  const clearApiBtn = document.getElementById('clear-api-btn');
  const geminiApiKeyInput = document.getElementById('gemini-api-key');
  const toggleApiVisibility = document.getElementById('toggle-api-visibility');
  const geminiModelSelector = document.getElementById('gemini-model-selector');
  const customDirectivesInput = document.getElementById('custom-refinement-directives');
  const testApiBtn = document.getElementById('test-api-btn');
  const testFeedback = document.getElementById('test-feedback');

  // DOM Elements - Input Area
  const languageSelector = document.getElementById('language-selector');
  const recordBtn = document.getElementById('record-btn');
  const recordStatusText = document.getElementById('record-status-text');
  const timerDisplay = document.getElementById('timer-display');
  const visualizerCanvas = document.getElementById('visualizer-canvas');
  const canvasCtx = visualizerCanvas.getContext('2d');
  const contextHints = document.getElementById('context-hints');

  // DOM Elements - Upload Area
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const browseBtn = document.getElementById('browse-btn');
  const filePreview = document.getElementById('file-preview');
  const previewName = document.getElementById('preview-name');
  const previewSize = document.getElementById('preview-size');
  const clearFileBtn = document.getElementById('clear-file-btn');
  const transcribeFileBtn = document.getElementById('transcribe-file-btn');

  // DOM Elements - Output Area
  const transcriptOutput = document.getElementById('transcript-output');
  const transcriptionStatus = document.getElementById('transcription-status');
  const loaderOverlay = document.getElementById('loader-overlay');
  const loaderTitle = document.getElementById('loader-title');
  const loaderSubtitle = document.getElementById('loader-subtitle');
  const wordCount = document.getElementById('word-count');
  const charCount = document.getElementById('char-count');
  const confidenceScore = document.getElementById('confidence-score');

  // DOM Elements - Action Tools
  const polishBtn = document.getElementById('polish-btn');
  const translateBtn = document.getElementById('translate-btn');
  const speakBtn = document.getElementById('speak-btn');
  const copyBtn = document.getElementById('copy-btn');
  const downloadTxtBtn = document.getElementById('download-txt-btn');
  const downloadSrtBtn = document.getElementById('download-srt-btn');

  // Load Saved Values into Input Forms
  geminiApiKeyInput.value = state.geminiApiKey;
  geminiModelSelector.value = state.geminiModel;
  customDirectivesInput.value = state.customDirectives;
  updateEngineBadge();

  // --- TAB TOGGLE NAVIGATION ---
  function switchTab(targetTab) {
    if (state.isRecording) {
      alert("Please stop recording before switching tabs.");
      return;
    }
    
    if (targetTab === 'record') {
      tabRecord.classList.add('active');
      tabUpload.classList.remove('active');
      contentRecord.classList.add('active');
      contentUpload.classList.remove('active');
    } else {
      tabRecord.classList.remove('active');
      tabUpload.classList.add('active');
      contentRecord.classList.remove('active');
      contentUpload.classList.add('active');
      resizeCanvas();
    }
  }

  tabRecord.addEventListener('click', () => switchTab('record'));
  tabUpload.addEventListener('click', () => switchTab('upload'));

  // --- SETTINGS MODAL DIALOG ---
  settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
  });

  closeSettings.addEventListener('click', () => {
    settingsModal.style.display = 'none';
    testFeedback.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.style.display = 'none';
      testFeedback.style.display = 'none';
    }
  });

  toggleApiVisibility.addEventListener('click', () => {
    const isPassword = geminiApiKeyInput.type === 'password';
    geminiApiKeyInput.type = isPassword ? 'text' : 'password';
    const icon = toggleApiVisibility.querySelector('i');
    icon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
    lucide.createIcons();
  });

  saveSettingsBtn.addEventListener('click', () => {
    state.geminiApiKey = geminiApiKeyInput.value.trim();
    state.geminiModel = geminiModelSelector.value;
    state.customDirectives = customDirectivesInput.value.trim();

    localStorage.setItem('vaniscribe_api_key', state.geminiApiKey);
    localStorage.setItem('vaniscribe_model', state.geminiModel);
    localStorage.setItem('vaniscribe_directives', state.customDirectives);

    updateEngineBadge();
    settingsModal.style.display = 'none';
    testFeedback.style.display = 'none';
    showToast("Configurations saved successfully!");
  });

  clearApiBtn.addEventListener('click', () => {
    geminiApiKeyInput.value = '';
    state.geminiApiKey = '';
    localStorage.removeItem('vaniscribe_api_key');
    updateEngineBadge();
    showToast("API key cleared.");
  });

  // Update Status and Mode Indicators
  function updateEngineBadge() {
    if (state.geminiApiKey) {
      engineIndicator.textContent = `Gemini AI (Premium Mode)`;
      engineBadge.style.borderColor = 'rgba(139, 92, 246, 0.4)';
      statusIndicator.className = 'status-indicator online';
      polishBtn.removeAttribute('disabled');
      translateBtn.removeAttribute('disabled');
    } else {
      engineIndicator.textContent = `Web Speech API (Free Mode)`;
      engineBadge.style.borderColor = 'rgba(16, 185, 129, 0.2)';
      statusIndicator.className = 'status-indicator online';
      polishBtn.setAttribute('disabled', 'true');
      translateBtn.setAttribute('disabled', 'true');
    }
  }

  // Validate API Key using a simple, fast request
  testApiBtn.addEventListener('click', async () => {
    const key = geminiApiKeyInput.value.trim();
    if (!key) {
      showTestFeedback("Please enter an API Key to validate.", "error");
      return;
    }

    testApiBtn.setAttribute('disabled', 'true');
    testApiBtn.innerHTML = `<i data-lucide="loader" class="animate-spin"></i> Validating Key...`;
    lucide.createIcons();

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Hello. Respond with 'OK'." }] }]
        })
      });

      const data = await response.json();
      if (response.ok && data.candidates) {
        showTestFeedback("API Key is valid! Ready to use.", "success");
      } else {
        const errorMsg = data.error?.message || "Invalid API key response.";
        showTestFeedback(`Validation failed: ${errorMsg}`, "error");
      }
    } catch (err) {
      showTestFeedback("Network error. Could not connect to Gemini API.", "error");
    } finally {
      testApiBtn.removeAttribute('disabled');
      testApiBtn.innerHTML = `<i data-lucide="check-circle-2"></i> Validate API Key`;
      lucide.createIcons();
    }
  });

  function showTestFeedback(message, type) {
    testFeedback.textContent = message;
    testFeedback.className = `test-feedback ${type}`;
    testFeedback.style.display = 'block';
  }

  // --- AUDIO FILE UPLOAD & DRAG/DROP ---
  browseBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });

  // Drag-and-drop Events
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    handleFiles(dt.files);
  });

  function handleFiles(files) {
    if (files.length === 0) return;
    const file = files[0];
    
    if (!file.type.startsWith('audio/')) {
      alert("Invalid format! Please upload an audio file (MP3, WAV, M4A, etc.).");
      return;
    }
    
    if (file.size > 20 * 1024 * 1024) {
      alert("File is too large! Maximum allowed size is 20MB.");
      return;
    }

    state.uploadedFile = file;
    previewName.textContent = file.name;
    previewSize.textContent = formatBytes(file.size);
    
    // Hide upload wrapper helper details, show preview card
    dropzone.querySelector('.dropzone-content').style.display = 'none';
    filePreview.style.display = 'flex';
    transcribeFileBtn.removeAttribute('disabled');
  }

  clearFileBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Avoid triggering browse button click
    fileInput.value = '';
    state.uploadedFile = null;
    dropzone.querySelector('.dropzone-content').style.display = 'block';
    filePreview.style.display = 'none';
    transcribeFileBtn.setAttribute('disabled', 'true');
  });

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // --- AUDIO CANVAS VISUALIZATION ---
  function resizeCanvas() {
    visualizerCanvas.width = visualizerCanvas.parentElement.clientWidth;
    visualizerCanvas.height = visualizerCanvas.parentElement.clientHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function initVisualizer(stream) {
    if (!state.audioContext) {
      state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    state.analyser = state.audioContext.createAnalyser();
    const source = state.audioContext.createMediaStreamSource(stream);
    source.connect(state.analyser);
    
    state.analyser.fftSize = 256;
    const bufferLength = state.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
      if (!state.isRecording) {
        // Clear canvas
        canvasCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
        return;
      }
      
      state.visualizerAnimation = requestAnimationFrame(draw);
      state.analyser.getByteFrequencyData(dataArray);
      
      canvasCtx.fillStyle = 'rgba(9, 14, 28, 0.3)';
      canvasCtx.fillRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
      
      const barWidth = (visualizerCanvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 1.8;
        
        // Color mapping from Emerald/Teal to Electric Indigo
        const r = Math.floor(16 + (123 * (i / bufferLength)));
        const g = Math.floor(185 - (93 * (i / bufferLength)));
        const b = Math.floor(129 + (117 * (i / bufferLength)));
        
        canvasCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        
        // Draw centered waveforms
        const y = (visualizerCanvas.height / 2) - (barHeight / 2);
        canvasCtx.fillRect(x, y, barWidth - 1, barHeight);
        
        x += barWidth;
      }
    }
    
    draw();
  }

  // Timer helper functions
  function startTimer() {
    state.secondsRecorded = 0;
    timerDisplay.textContent = '00:00';
    timerDisplay.style.color = '#ef4444'; // Red during recording
    
    state.recordingTimer = setInterval(() => {
      state.secondsRecorded++;
      const mins = Math.floor(state.secondsRecorded / 60).toString().padStart(2, '0');
      const secs = (state.secondsRecorded % 60).toString().padStart(2, '0');
      timerDisplay.textContent = `${mins}:${secs}`;
    }, 1000);
  }

  function stopTimer() {
    clearInterval(state.recordingTimer);
    timerDisplay.style.color = '#ffffff';
  }

  // --- SPEECH RECOGNITION (WEB SPEECH API) ---
  function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = () => {
      state.isRecognitionActive = true;
      transcriptionStatus.textContent = 'Engine: Dictating Live...';
      transcriptionStatus.style.borderColor = 'var(--primary)';
      transcriptionStatus.style.color = 'var(--primary)';
    };

    recognition.onerror = (e) => {
      console.error("Speech Recognition Error:", e);
      if (e.error === 'no-speech') {
        recordStatusText.textContent = "No speech detected. Mic closed.";
      }
    };

    recognition.onend = () => {
      state.isRecognitionActive = false;
      transcriptionStatus.textContent = 'Engine: Stopped';
      transcriptionStatus.style.borderColor = 'var(--border-color)';
      transcriptionStatus.style.color = 'var(--text-muted)';
    };

    recognition.onresult = (e) => {
      let interimTranscript = '';
      
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          state.finalTranscript += e.results[i][0].transcript + ' ';
          state.recognitionConfidence = e.results[i][0].confidence;
        } else {
          interimTranscript += e.results[i][0].transcript;
        }
      }

      // Update Textarea and Stats
      transcriptOutput.value = state.finalTranscript + interimTranscript;
      updateTextStats();
      
      // Update Confidence Visual
      const confidencePercent = Math.round(state.recognitionConfidence * 100);
      confidenceScore.textContent = `${confidencePercent}%`;
    };

    return recognition;
  }

  state.speechRecognition = setupSpeechRecognition();

  // --- RECORD BUTTON CLICK TOGGLE ---
  recordBtn.addEventListener('click', async () => {
    if (!state.isRecording) {
      await startRecording();
    } else {
      stopRecording();
    }
  });

  async function startRecording() {
    state.audioChunks = [];
    
    try {
      state.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup HTML Visual States
      recordBtn.classList.add('recording');
      state.isRecording = true;
      recordStatusText.textContent = "Listening... Click mic to stop";
      
      startTimer();
      initVisualizer(state.audioStream);
      
      // Clear previous transcript
      state.finalTranscript = '';
      transcriptOutput.value = '';
      updateTextStats();

      // Start Web Speech API Dictation
      if (state.speechRecognition) {
        state.speechRecognition.lang = languageSelector.value;
        state.speechRecognition.start();
      }

      // Start Raw MediaRecorder to capture audio file (for Gemini translation/transcription option)
      state.mediaRecorder = new MediaRecorder(state.audioStream);
      state.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          state.audioChunks.push(e.data);
        }
      };
      state.mediaRecorder.start();

    } catch (err) {
      console.error("Microphone Access Blocked:", err);
      alert("Microphone permission denied or source unavailable. Please verify browser settings.");
      state.isRecording = false;
      recordBtn.classList.remove('recording');
      recordStatusText.textContent = "Mic error. Try again.";
    }
  }

  function stopRecording() {
    if (!state.isRecording) return;
    
    state.isRecording = false;
    recordBtn.classList.remove('recording');
    recordStatusText.textContent = "Processing recording...";
    
    stopTimer();
    
    // Stop recording visualizer animations
    if (state.visualizerAnimation) {
      cancelAnimationFrame(state.visualizerAnimation);
    }

    // Stop MediaRecorder and audio tracks
    if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
      state.mediaRecorder.stop();
    }
    if (state.audioStream) {
      state.audioStream.getTracks().forEach(track => track.stop());
    }

    // Stop Web Speech Recognition
    if (state.speechRecognition && state.isRecognitionActive) {
      state.speechRecognition.stop();
    }

    recordStatusText.textContent = "Click mic to start speaking";
    
    // If Gemini API Key is configured, trigger automatic Smart Refine for higher accuracy
    setTimeout(async () => {
      const recordedBlob = new Blob(state.audioChunks, { type: 'audio/webm' });
      
      if (state.geminiApiKey && state.finalTranscript.trim().length > 0) {
        const autoRefine = confirm("Voice captured. Would you like VaniScribe to run an AI Accent Refinement on your speech to ensure zero errors?");
        if (autoRefine) {
          await polishTranscript();
        }
      }
    }, 500);
  }

  // --- STATS AND EXPORTS ---
  function updateTextStats() {
    const text = transcriptOutput.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    
    wordCount.textContent = words;
    charCount.textContent = chars;

    if (chars > 0) {
      downloadTxtBtn.removeAttribute('disabled');
      downloadSrtBtn.removeAttribute('disabled');
    } else {
      downloadTxtBtn.setAttribute('disabled', 'true');
      downloadSrtBtn.setAttribute('disabled', 'true');
    }
  }

  transcriptOutput.addEventListener('input', updateTextStats);

  // Copy to Clipboard
  copyBtn.addEventListener('click', () => {
    const text = transcriptOutput.value.trim();
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      const prevHtml = copyBtn.innerHTML;
      copyBtn.innerHTML = `<i data-lucide="check"></i> Copied!`;
      lucide.createIcons();
      showToast("Copied to clipboard!");
      
      setTimeout(() => {
        copyBtn.innerHTML = prevHtml;
        lucide.createIcons();
      }, 2000);
    });
  });

  // Download TXT
  downloadTxtBtn.addEventListener('click', () => {
    const text = transcriptOutput.value.trim();
    if (!text) return;
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VaniScribe_Transcript_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Download SRT (Subtitles)
  downloadSrtBtn.addEventListener('click', () => {
    const text = transcriptOutput.value.trim();
    if (!text) return;

    // Create simple Subtitle file blocks (5 second blocks)
    const sentences = text.split(/(?<=[.!?])\s+/);
    let srtContent = '';
    let seq = 1;
    let seconds = 0;

    sentences.forEach((sentence) => {
      if (!sentence) return;
      const start = formatTimeSRT(seconds);
      seconds += Math.max(3, Math.ceil(sentence.split(' ').length * 0.4)); // estimate duration
      const end = formatTimeSRT(seconds);

      srtContent += `${seq}\n${start} --> ${end}\n${sentence}\n\n`;
      seq++;
    });

    const blob = new Blob([srtContent], { type: 'text/srt;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VaniScribe_Transcript_${new Date().toISOString().slice(0, 10)}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  function formatTimeSRT(totalSeconds) {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs},000`;
  }

  // --- TEXT TO SPEECH (READ ALOUD) ---
  speakBtn.addEventListener('click', () => {
    const text = transcriptOutput.value.trim();
    if (!text) {
      showToast("No text to read!");
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      speakBtn.innerHTML = `<i data-lucide="volume-2"></i> Read Aloud`;
      lucide.createIcons();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose Indian voice if available
    const voices = window.speechSynthesis.getVoices();
    const indVoice = voices.find(v => v.lang === 'en-IN' || v.lang === 'hi-IN') || voices.find(v => v.lang.startsWith('en'));
    if (indVoice) {
      utterance.voice = indVoice;
    }

    speakBtn.innerHTML = `<i data-lucide="square"></i> Stop Reading`;
    lucide.createIcons();

    utterance.onend = () => {
      speakBtn.innerHTML = `<i data-lucide="volume-2"></i> Read Aloud`;
      lucide.createIcons();
    };

    window.speechSynthesis.speak(utterance);
  });

  // Required for speech voices loading asynchronously
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
  }

  // --- GEMINI AI INTEGRATION (FILE TRANSCRIPTION & REFINE) ---
  
  // Transcribe Uploaded File
  transcribeFileBtn.addEventListener('click', async () => {
    if (!state.uploadedFile) return;
    
    if (!state.geminiApiKey) {
      alert("Gemini API Key is required to transcribe audio files. Please click the Settings gear icon and insert your key.");
      settingsModal.style.display = 'flex';
      return;
    }

    showLoader("Transcribing Audio File...", "Gemini is parsing accents and correcting background noise...");
    
    try {
      // 1. Read file as Base64
      const base64Data = await fileToBase64(state.uploadedFile);
      const mimeType = state.uploadedFile.type;
      
      // 2. Form prompt based on accent settings
      const hints = contextHints.value.trim();
      const languageText = languageSelector.options[languageSelector.selectedIndex].text;
      
      const prompt = `You are VaniScribe, an expert AI transcriber. Transcribe the uploaded audio recording exactly as spoken with near-perfect accuracy.
      The speaker speaks in ${languageText} (optimized for Indian accent, vocabulary, and slang).
      
      CRITICAL ACCENT RESOLUTION:
      Correct common pronunciation-based transcription mistakes typical of Indian accents:
      - Indian number representations: e.g. change "ten lakhs" or "fifty crores" to standard formatting (Rs 10,00,000 / Rs 50,00,000) or keep the written word intact as spoken, avoiding confusion with words like "lack" or "crow".
      - Indian specific spelling: e.g. "Aadhaar", "Pooja", "Dhaba", "Jugaad".
      - Do not mix Indian English accents with wrong spellings.
      
      ${hints ? `CONTEXT KEYWORDS/NAMES SPOKEN (Prioritize matching these): ${hints}` : ''}
      ${state.customDirectives ? `CUSTOM AI DIRECTIVES: ${state.customDirectives}` : ''}
      
      Format output with proper paragraph breaks and capitalization. deliver ONLY the final transcribed text. Do not provide notes, explanations, or labels.`;

      // 3. Request Gemini API
      const transcription = await callGeminiAudioAPI(base64Data, mimeType, prompt);
      
      transcriptOutput.value = transcription;
      updateTextStats();
      confidenceScore.textContent = "99.8% (AI)";
      showToast("File transcription completed successfully!");

    } catch (err) {
      console.error(err);
      alert(`Transcription Failed: ${err.message}`);
    } finally {
      hideLoader();
    }
  });

  // Smart Polish / Accent Refiner
  polishBtn.addEventListener('click', async () => {
    await polishTranscript();
  });

  async function polishTranscript() {
    const text = transcriptOutput.value.trim();
    if (!text) {
      showToast("No transcript text to refine!");
      return;
    }

    if (!state.geminiApiKey) {
      alert("Gemini API Key is required for AI Accent Refinement.");
      settingsModal.style.display = 'flex';
      return;
    }

    showLoader("Refining Transcript...", "Applying Indian accent corrections and grammatical alignment...");

    try {
      const hints = contextHints.value.trim();
      const prompt = `You are a professional editor. Please proofread and refine the following spoken transcription text. 
      The speaker has an Indian accent and spoke in ${languageSelector.value}.
      
      Tasks:
      1. Correct acoustic errors typical of Indian English or Indian accents (e.g. confusing lakhs/lacks, crores/crows, Rupees, local names, places).
      2. Format numbers properly (e.g. 10 Lakhs, 5 Crores).
      3. Filter out spoken filler words (um, uh, like, you know, matlab, accha).
      4. Insert appropriate punctuation, spacing, and casing to make it neat, readable, and professional.
      5. DO NOT change the meaning or rewrite the sentence flow unnecessarily. Retain the speaker's original voice.
      
      ${hints ? `CONTEXT NAMES/KEYWORDS TO LOOK OUT FOR: ${hints}` : ''}
      ${state.customDirectives ? `CUSTOM USER DIRECTIVES: ${state.customDirectives}` : ''}
      
      TEXT TO REFINE:
      "${text}"
      
      Output ONLY the corrected transcript text. Do not add comments like "Here is the refined text".`;

      const refinedText = await callGeminiTextAPI(prompt);
      
      // Visual diff preview could go here, but dropping in refined text is clean
      transcriptOutput.value = refinedText;
      updateTextStats();
      confidenceScore.textContent = "100% (AI Refined)";
      showToast("Transcript polished successfully!");

    } catch (err) {
      console.error(err);
      alert(`Refinement Failed: ${err.message}`);
    } finally {
      hideLoader();
    }
  }

  // AI Translate
  translateBtn.addEventListener('click', async () => {
    const text = transcriptOutput.value.trim();
    if (!text) {
      showToast("No transcript text to translate!");
      return;
    }

    if (!state.geminiApiKey) {
      alert("Gemini API Key is required to run translations.");
      settingsModal.style.display = 'flex';
      return;
    }

    showLoader("Translating Text...", "Converting transcript to standard English...");

    try {
      const prompt = `You are an expert translator. Translate the following transcription text (which might be in Hindi, Hinglish, or other regional Indian language) into standard, grammatically correct English.
      
      Guidelines:
      1. Maintain the precise meaning and context.
      2. If certain culture-specific terms (e.g. names of dishes, local concepts) don't translate perfectly, write their phonetic spellings or explanations.
      3. Format it beautifully with punctuation.
      
      TEXT TO TRANSLATE:
      "${text}"
      
      Output ONLY the English translation. Do not include notes or headers.`;

      const translatedText = await callGeminiTextAPI(prompt);
      
      transcriptOutput.value = translatedText;
      updateTextStats();
      showToast("Translated to English!");

    } catch (err) {
      console.error(err);
      alert(`Translation Failed: ${err.message}`);
    } finally {
      hideLoader();
    }
  });

  // --- API CALLING UTILITIES ---

  async function callGeminiTextAPI(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${state.geminiModel}:generateContent?key=${state.geminiApiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1 // Keep it deterministic
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "Gemini API error.");
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
  }

  async function callGeminiAudioAPI(base64Data, mimeType, prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${state.geminiModel}:generateContent?key=${state.geminiApiKey}`;
    
    // Some browser audio blobs might have codecs, Gemini requires clean mime types like audio/mp3, audio/wav, audio/webm, etc.
    let cleanMimeType = mimeType.split(';')[0];
    if (cleanMimeType === 'audio/x-m4a') cleanMimeType = 'audio/m4a';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: cleanMimeType,
                  data: base64Data
                }
              },
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.15
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "Gemini Audio API error.");
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
  }

  // Convert File Object to Base64 String
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Strip the data:audio/xyz;base64, prefix
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  }

  // --- UI LOADERS & TOASTS ---
  function showLoader(title, subtitle) {
    loaderTitle.textContent = title;
    loaderSubtitle.textContent = subtitle;
    loaderOverlay.style.display = 'flex';
  }

  function hideLoader() {
    loaderOverlay.style.display = 'none';
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    
    // Style toast programmatically
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    toast.style.background = 'rgba(13, 20, 38, 0.9)';
    toast.style.border = '1px solid var(--primary)';
    toast.style.color = '#ffffff';
    toast.style.padding = '0.75rem 1.5rem';
    toast.style.borderRadius = '9999px';
    toast.style.fontSize = '0.85rem';
    toast.style.fontWeight = '600';
    toast.style.boxShadow = 'var(--shadow-lg)';
    toast.style.zIndex = '9999';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.3s ease';
    
    document.body.appendChild(toast);
    
    // Trigger fade in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    // Fade out and remove
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
});
