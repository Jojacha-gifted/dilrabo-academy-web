function ResultScreen({ correctCount, totalQuestions = 40, bandScore, bandDescription, onRestart, onClose }) {
  return (
    <section className="ielts-assessment__complete result-screen">
      <span>IELTS Listening complete</span>
      <h3>{correctCount}/{totalQuestions}</h3>
      <p className="result-screen__band">Band Score: {bandScore.toFixed(1)}</p>
      <p className="result-screen__descriptor">Level Description: {bandDescription}</p>
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