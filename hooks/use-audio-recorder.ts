import { useCallback, useEffect, useRef, useState } from 'react'

interface UseAudioRecorderReturn {
  audioUrl: string | null
  audioBlob: Blob | null
  isRecording: boolean
  startRecording: () => Promise<void>
  stopRecording: () => Promise<Blob | null>
  clearRecording: () => void
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const blobUrlRef = useRef<string | null>(null)
  const stopResolverRef = useRef<((blob: Blob | null) => void) | null>(null)

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
      recorderRef.current?.stream.getTracks().forEach((track) => track.stop())
      stopResolverRef.current?.(null)
    }
  }, [])

  const setRecordingBlob = useCallback((blob: Blob): Blob => {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)

    const url = URL.createObjectURL(blob)
    blobUrlRef.current = url
    setAudioBlob(blob)
    setAudioUrl(url)
    return blob
  }, [])

  const startRecording = useCallback(async () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
      setAudioUrl(null)
    }
    setAudioBlob(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setRecordingBlob(blob)
        setIsRecording(false)
        stream.getTracks().forEach((track) => track.stop())
        stopResolverRef.current?.(blob)
        stopResolverRef.current = null
      }

      recorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
    } catch (err) {
      setIsRecording(false)
      throw err
    }
  }, [setRecordingBlob])

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state !== 'recording') return null

    return new Promise((resolve) => {
      stopResolverRef.current = resolve
      recorder.stop()
      recorderRef.current = null
    })
  }, [])

  const clearRecording = useCallback(() => {
    recorderRef.current?.stream.getTracks().forEach((track) => track.stop())
    recorderRef.current = null
    chunksRef.current = []
    stopResolverRef.current?.(null)
    stopResolverRef.current = null
    setIsRecording(false)

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    setAudioBlob(null)
    setAudioUrl(null)
  }, [])

  return {
    audioUrl,
    audioBlob,
    isRecording,
    startRecording,
    stopRecording,
    clearRecording,
  }
}
