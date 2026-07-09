import { calculateListeningBand } from './ieltsScoring.js'

function getBandDescriptor(bandScore) {
  if (bandScore >= 9) return 'Expert user'
  if (bandScore >= 8) return 'Very good user'
  if (bandScore >= 7) return 'Good user'
  if (bandScore >= 6) return 'Competent user'
  if (bandScore >= 5) return 'Modest user'
  if (bandScore >= 4) return 'Limited user'
  if (bandScore >= 3) return 'Extremely limited user'
  if (bandScore >= 2) return 'Intermittent user'
  return 'Non-user'
}

function ResultScreen({ correctCount, totalQuestions = 40, onRestart, onClose }) {
  const bandScore = calculateListeningBand(correctCount)
  const bandDescriptor = getBandDescriptor(bandScore)

  return (
    <section className="ielts-assessment__complete result-screen">
      <span>IELTS Listening complete</span>
      <h3>{correctCount}/{totalQuestions}</h3>
      <p className="result-screen__band">Band Score: {bandScore.toFixed(1)}</p>
      <p className="result-screen__descriptor">{bandDescriptor}</p>
      <p>
        Your Listening result has been calculated from all submitted parts. Review the score and continue with the next IELTS preparation step.
      </p>

      <div className="ielts-assessment__footer result-screen__actions">
        <span>Full listening exam</span>
        <div>
          <button type="button" onClick={onRestart}>Restart Exam</button>
          <button type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    </section>
  )
}

export default ResultScreen