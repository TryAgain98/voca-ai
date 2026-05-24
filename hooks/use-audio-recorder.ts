import { useCallback, useEffect, useRef, useState } from 'react'

interface UseAudioRecorderReturn {
  audioUrl: string | null
  isRecording: boolean
  startRecording: () => Promise<void>
  stopRecording: () => void
  clearRecording: () => void
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const blobUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    }
  }, [])

  const startRecording = useCallback(async () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
      setAudioUrl(null)
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        blobUrlRef.current = url
        setAudioUrl(url)
        stream.getTracks().forEach((track) => track.stop())
      }

      recorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
    } catch {
      // Mic permission denied or not supported — speech recognition continues regardless
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop()
    }
    recorderRef.current = null
    setIsRecording(false)
  }, [])

  const clearRecording = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    setAudioUrl(null)
  }, [])

  return {
    audioUrl,
    isRecording,
    startRecording,
    stopRecording,
    clearRecording,
  }
}
