function AudioPlayer({ src, title = 'Audio lesson' }) {
  if (!src) {
    return null
  }

  return (
    <div className="audio-player">
      <div className="audio-player__meta">
        <span className="audio-player__label">Listening audio</span>
        <strong>{title}</strong>
      </div>
      <audio className="audio-player__controls" controls preload="metadata">
        <source src={src} />
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}

export default AudioPlayer
