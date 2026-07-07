import { useEffect, useRef } from 'react'

function AudioPlayer({ src, title = 'Audio lesson', startTime = 0, endTime = null }) {
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return undefined
    }

    const segmentStart = Number.isFinite(startTime) ? startTime : 0
    const segmentEnd = Number.isFinite(endTime) ? endTime : null

    function syncToSegmentStart() {
      if (audio.currentTime < segmentStart || (segmentEnd && audio.currentTime >= segmentEnd)) {
        audio.currentTime = segmentStart
      }
    }

    function stopAtSegmentEnd() {
      if (segmentEnd && audio.currentTime >= segmentEnd) {
        audio.pause()
        audio.currentTime = segmentEnd
      }
    }

    audio.addEventListener('loadedmetadata', syncToSegmentStart)
    audio.addEventListener('play', syncToSegmentStart)
    audio.addEventListener('timeupdate', stopAtSegmentEnd)
    audio.load()

    return () => {
      audio.removeEventListener('loadedmetadata', syncToSegmentStart)
      audio.removeEventListener('play', syncToSegmentStart)
      audio.removeEventListener('timeupdate', stopAtSegmentEnd)
    }
  }, [src, startTime, endTime])

  if (!src) {
    return null
  }

  return (
    <div className="audio-player">
      <div className="audio-player__meta">
        <span className="audio-player__label">Listening audio</span>
        <strong>{title}</strong>
      </div>
      <audio
        ref={audioRef}
        className="audio-player__controls"
        controls
        preload="metadata"
        key={`${src}-${startTime}-${endTime ?? 'end'}`}
      >
        <source src={src} />
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}

export default AudioPlayer
