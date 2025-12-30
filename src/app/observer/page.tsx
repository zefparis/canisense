'use client';

import { useState, useRef, useEffect } from 'react';
import { AnalysisPipeline } from '../../analysis/pipeline';
import { AnalysisConfig, Signal, UserFeedback } from '../../analysis/types';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useCameraStream } from '../../hooks/useCameraStream';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type AnalysisResult = {
  state: 'Calme' | 'Excité' | 'Stressé' | 'Mixte';
  explanation: string;
  confidence: 'Faible' | 'Moyen' | 'Élevé';
};

export default function Observer() {
  const [status, setStatus] = useState<'ready' | 'analyzing' | 'done'>('ready');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [pipeline, setPipeline] = useState<AnalysisPipeline | null>(null);
  const [chartData, setChartData] = useState<any>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { stream, devices, currentDeviceId, error, isLoading, requestCamera, switchCamera, stopCamera } = useCameraStream();

  const config: AnalysisConfig = {
    enableDebug: debugMode,
    activeEngines: [
      'globalMovement', 'bodyPosture', 'tail', 'ears', 'headGaze',
      'soundActivity', 'vocalSignature', 'rhythm',
      'temporalVariation', 'accumulation', 'recovery', 'transition',
      'timeOfDay', 'sessionDuration', 'recentHistory', 'baseline'
    ],
    fusionWeights: {}
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [stream]);

  const startAnalysis = async () => {
    try {
      await requestCamera();

      // Setup audio
      if (stream) {
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const analyser = audioContext.createAnalyser();
        analyserRef.current = analyser;
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

      }
      const newPipeline = new AnalysisPipeline(config);
      setPipeline(newPipeline);
      setStatus('analyzing');

      // Capture at 5 FPS
      intervalRef.current = setInterval(async () => {
        if (videoRef.current && canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            const videoSignal: Signal = {
              type: 'video',
              data: { imageData, width: canvas.width, height: canvas.height },
              timestamp: Date.now()
            };
            await newPipeline.processSignal(videoSignal);
          }
        }

        // Audio processing
        if (analyserRef.current && audioContextRef.current) {
          const bufferLength = analyserRef.current.frequencyBinCount;
          const buffer = new Float32Array(bufferLength);
          analyserRef.current.getFloatTimeDomainData(buffer);
          const audioBuffer = audioContextRef.current.createBuffer(1, bufferLength, audioContextRef.current.sampleRate);
          audioBuffer.getChannelData(0).set(buffer);

          const audioSignal: Signal = {
            type: 'audio',
            data: { buffer: audioBuffer, sampleRate: audioContextRef.current.sampleRate },
            timestamp: Date.now()
          };
          await newPipeline.processSignal(audioSignal);
        }

        // Update charts if debug
        if (debugMode && newPipeline) {
          const metrics = newPipeline.getAllMetrics();
          const labels = metrics.map(m => new Date(m.timestamp).toLocaleTimeString());
          const datasets = [
            {
              label: 'Activation',
              data: metrics.filter(m => m.name.includes('activation')).map(m => m.value),
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
              label: 'Tension',
              data: metrics.filter(m => m.name.includes('tension')).map(m => m.value),
              borderColor: 'rgb(54, 162, 235)',
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
            },
          ];
          setChartData({ labels, datasets });
        }
      }, 200); // 5 FPS

    } catch (err) {
      console.error('Error starting analysis:', err);
      alert('Erreur d\'accès à la caméra/micro. Vérifiez les permissions.');
    }
  };

  const stopAnalysis = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    stopCamera();
    if (audioContextRef.current) audioContextRef.current.close();
    if (pipeline) {
      const analysis = pipeline.getAnalysis();
      const newResult: AnalysisResult = {
        state: analysis.syntheticState as 'Calme' | 'Excité' | 'Stressé' | 'Mixte',
        explanation: analysis.explanation,
        confidence: analysis.confidence > 0.7 ? 'Élevé' : analysis.confidence > 0.4 ? 'Moyen' : 'Faible'
      };
      setResult(newResult);
      // Save to history
      const historyAnalysis = {
        date: new Date().toLocaleString('fr-FR'),
        state: newResult.state,
        explanation: newResult.explanation,
      };
      const history = JSON.parse(localStorage.getItem('canisense_history') || '[]');
      history.push(historyAnalysis);
      localStorage.setItem('canisense_history', JSON.stringify(history));
    }
    setStatus('done');
  };

  const submitFeedback = (correct: boolean, comment?: string) => {
    if (result) {
      const feedback: UserFeedback = {
        analysisId: Date.now().toString(),
        timestamp: Date.now(),
        correct,
        comment
      };
      const feedbacks = JSON.parse(localStorage.getItem('canisense_feedbacks') || '[]');
      feedbacks.push(feedback);
      localStorage.setItem('canisense_feedbacks', JSON.stringify(feedbacks));
      alert('Feedback enregistré. Merci!');
    }
  };

  const statusText = {
    ready: 'Prêt à analyser',
    analyzing: 'Analyse en cours…',
    done: 'Analyse terminée',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center sm:text-3xl sm:mb-8">Observer ton chien</h1>
        <div className="bg-slate-800 rounded-lg p-4 mb-6 text-center sm:p-6 sm:mb-8">
          <div className="bg-slate-700 h-48 rounded-lg flex items-center justify-center mb-4 sm:h-64 relative">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover rounded-lg" />
            <canvas ref={canvasRef} className="hidden" />
            {!stream && <p className="text-gray-400 absolute">Aperçu caméra</p>}
          </div>
          {devices.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Caméra</label>
              <select
                value={currentDeviceId || ''}
                onChange={(e) => switchCamera(e.target.value)}
                className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white"
              >
                {devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {error && <p className="text-red-400 mb-4">{error}</p>}
          <p className="text-base mb-4 sm:text-lg">{statusText[status]}</p>
          {status === 'ready' && (
            <div className="space-y-4">
              <button
                onClick={startAnalysis}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium sm:px-6 sm:py-3"
              >
                Démarrer l'analyse
              </button>
              <br />
              <button
                onClick={() => setDebugMode(!debugMode)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
              >
                {debugMode ? 'Désactiver Debug' : 'Activer Debug'}
              </button>
            </div>
          )}
          {status === 'analyzing' && (
            <button
              onClick={stopAnalysis}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium sm:px-6 sm:py-3"
            >
              Arrêter l'analyse
            </button>
          )}
        </div>
        {result && (
          <div className="bg-slate-800 rounded-lg p-4 sm:p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 sm:text-xl">Résultat de l’analyse</h2>
            <p className="mb-2"><strong>État détecté :</strong> {result.state}</p>
            <p className="mb-2">{result.explanation}</p>
            <p><strong>Niveau de confiance :</strong> {result.confidence}</p>
            <div className="mt-4 space-x-2">
              <button onClick={() => submitFeedback(true)} className="bg-green-600 px-4 py-2 rounded">Correct</button>
              <button onClick={() => submitFeedback(false)} className="bg-red-600 px-4 py-2 rounded">Incorrect</button>
            </div>
          </div>
        )}
        {debugMode && pipeline && (
          <div className="bg-slate-800 rounded-lg p-4 mt-6 sm:p-6 space-y-4">
            <h2 className="text-lg font-semibold">Debug - Métriques</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pipeline.getAllMetrics().map((metric, index) => (
                <div key={index} className="text-sm">
                  <strong>{metric.name}:</strong> {metric.value.toFixed(2)} {metric.unit} (fiabilité: {metric.reliability})
                </div>
              ))}
            </div>
            {chartData.labels && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Graphiques temps réel</h3>
                <Line data={chartData} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
