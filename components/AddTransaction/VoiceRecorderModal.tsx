import React, { useEffect, useState } from 'react'
import { Modal, Text, TouchableOpacity, View, ActivityIndicator, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { File } from 'expo-file-system'
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio'
import { Mic, Square, Sparkles, X, AlertCircle, Volume2 } from 'lucide-react-native'
import {
  extractTransactionFromVoice,
  ExtractedTransaction,
} from '@/lib/services/extractTransaction'
import { toast } from '@/store/useToastStore'
import { RadarRing, WaveBar } from './VoiceVisualizer'

type Status = 'idle' | 'recording' | 'processing' | 'error'

export function VoiceRecorderModal({
  visible,
  onClose,
  onExtracted,
}: {
  visible: boolean
  onClose: () => void
  onExtracted: (result: ExtractedTransaction) => void
}) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const [status, setStatus] = useState<Status>('idle')
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!visible) {
      setStatus('idle')
      setSeconds(0)
      return
    }
    ;(async () => {
      try {
        if (Platform.OS !== 'web') {
          const { granted } = await requestRecordingPermissionsAsync()
          if (!granted) {
            setStatus('error')
            return
          }
          await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true })
        }
      } catch (err) {
        console.warn('Microphone permission check error:', err)
      }
    })()
  }, [visible])

  useEffect(() => {
    if (status !== 'recording') return
    const interval = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [status])

  const startRecording = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    try {
      setSeconds(0)
      await recorder.prepareToRecordAsync()
      recorder.record()
      setStatus('recording')
    } catch (err) {
      console.error('Failed to start recording:', err)
      toast.error('Could not access microphone')
      setStatus('error')
    }
  }

  const stopRecording = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {})
    setStatus('processing')
    try {
      await recorder.stop()
      const uri = recorder.uri
      if (!uri) throw new Error('No recording captured')

      let base64 = ''
      let mimeType = 'audio/m4a'

      if (Platform.OS === 'web') {
        const res = await fetch(uri)
        const blob = await res.blob()
        mimeType = blob.type || 'audio/webm'
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const dataUrl = reader.result as string
            const pureBase64 = dataUrl.includes('base64,') ? dataUrl.split('base64,')[1] : dataUrl
            resolve(pureBase64)
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      } else {
        const file = new File(uri)
        base64 = await file.base64()
      }

      const result = await extractTransactionFromVoice(base64, mimeType)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
      toast.success('Voice log parsed with AI!')
      onExtracted(result)
      onClose()
    } catch (err) {
      console.error('Voice extraction failed:', err)
      toast.error("Couldn't understand audio. Please try again.")
      setStatus('error')
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/60">
        <View className="overflow-hidden rounded-t-[36px] border-t border-white/10 bg-[#0F121C]">
          <LinearGradient
            colors={['#171D2E', '#0B0D14']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            className="px-6 pb-10 pt-4"
          >
            {/* Modal Drag Handle */}
            <View className="mb-4 items-center">
              <View className="h-1.5 w-12 rounded-full bg-white/20" />
            </View>

            {/* Header: Badge & Close */}
            <View className="mb-6 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2 rounded-full border border-[#00E599]/30 bg-[#00E599]/10 px-3 py-1.5">
                <Sparkles size={13} color="#00E599" />
                <Text className="text-[11px] font-bold tracking-wider text-[#00E599]">
                  AI VOICE LOG
                </Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                disabled={status === 'processing'}
                className="h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5"
              >
                <X size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {status === 'error' ? (
              <View className="items-center py-6">
                <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-[#FF4D6D]/15">
                  <AlertCircle size={28} color="#FF4D6D" />
                </View>
                <Text className="text-base font-bold text-white">Audio Capture Failed</Text>
                <Text className="mb-6 mt-2 max-w-xs text-center text-xs text-slate-400">
                  Please check your microphone permissions and try speaking again.
                </Text>
                <TouchableOpacity
                  onPress={() => setStatus('idle')}
                  className="rounded-2xl bg-white/10 px-6 py-3"
                >
                  <Text className="text-xs font-bold uppercase tracking-wider text-white">
                    Try Again
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="items-center">
                {/* Dynamic Title */}
                <Text className="text-center text-lg font-black tracking-tight text-white">
                  {status === 'recording'
                    ? 'Listening…'
                    : status === 'processing'
                      ? 'AI is parsing your speech…'
                      : 'Tell me about a transaction'}
                </Text>

                {/* Subtitle / Timer */}
                {status === 'recording' ? (
                  <View className="mb-6 mt-2 flex-row items-center gap-2 rounded-full border border-[#FF4D6D]/30 bg-[#FF4D6D]/10 px-3 py-1">
                    <View className="h-2 w-2 rounded-full bg-[#FF4D6D]" />
                    <Text className="text-xs font-bold text-[#FF4D6D]">
                      REC {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
                    </Text>
                  </View>
                ) : status === 'processing' ? (
                  <View className="mb-6 mt-2 flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="#00E599" />
                    <Text className="text-xs font-medium text-slate-400">
                      Extracting amount, category & merchant...
                    </Text>
                  </View>
                ) : (
                  <Text className="mb-6 mt-1.5 text-center text-xs text-slate-400">
                    Tap the microphone and speak naturally
                  </Text>
                )}

                {/* Soundwave Visualizer Bars */}
                <View className="mb-6 h-12 flex-row items-center justify-center">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <WaveBar key={i} index={i} isRecording={status === 'recording'} />
                  ))}
                </View>

                {/* Mic Action Orb */}
                <View className="relative mb-6 h-28 w-28 items-center justify-center">
                  <RadarRing delay={0} active={status === 'recording'} />
                  <RadarRing delay={600} active={status === 'recording'} />

                  <TouchableOpacity
                    onPress={status === 'recording' ? stopRecording : startRecording}
                    disabled={status === 'processing'}
                    activeOpacity={0.8}
                    className="items-center justify-center"
                  >
                    <LinearGradient
                      colors={
                        status === 'recording' ? ['#FF4D6D', '#FF758F'] : ['#00E599', '#00B4D8']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="h-20 w-20 items-center justify-center rounded-full shadow-2xl shadow-[#00E599]/40"
                    >
                      {status === 'processing' ? (
                        <ActivityIndicator color="#08090D" size="small" />
                      ) : status === 'recording' ? (
                        <Square size={26} color="#08090D" fill="#08090D" />
                      ) : (
                        <Mic size={30} color="#08090D" strokeWidth={2.5} />
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Action Label */}
                <Text className="mb-6 text-xs font-bold uppercase tracking-wider text-slate-400">
                  {status === 'recording'
                    ? 'Tap to Stop & Process'
                    : status === 'processing'
                      ? 'Analyzing...'
                      : 'Tap to Start Speaking'}
                </Text>

                {/* Example prompts */}
                <View className="w-full rounded-2xl border border-white/5 bg-white/[0.03] p-3.5">
                  <View className="mb-2 flex-row items-center gap-1.5">
                    <Volume2 size={13} color="#94A3B8" />
                    <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Try saying
                    </Text>
                  </View>
                  <Text className="text-xs italic text-slate-300">
                    &ldquo;Spent 450 taka on groceries at Shwapno yesterday&rdquo;
                  </Text>
                  <Text className="mt-1 text-xs italic text-slate-300">
                    &ldquo;Received 12000 salary into bank account&rdquo;
                  </Text>
                </View>
              </View>
            )}
          </LinearGradient>
        </View>
      </View>
    </Modal>
  )
}
