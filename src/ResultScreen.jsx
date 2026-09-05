// ResultScreen.jsx
export default function ResultScreen({ correctCount, bandScore, bandDescription, onRestart, onClose }) {
  return (
    <section className="ielts-assessment__complete-result-screen">
      <span>IELTS Listening complete</span>
      <h3>{correctCount} / 40</h3>
      <p className="result-screen__band">Band Score: {bandScore.toFixed(1)}</p>
      <p className="result-screen__description">{bandDescription}</p> {/* Add this line */}
      
      <div className="ielts-assessment__footer-result-screen-actions">
        <button onClick={onRestart}>Restart Exam</button>
        <button onClick={onClose}>Close</button>
      </div>
    </section>
  );
}