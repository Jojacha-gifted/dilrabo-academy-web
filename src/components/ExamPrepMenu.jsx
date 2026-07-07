const examPrepOptions = [
  {
    key: 'ielts',
    title: 'IELTS Preparation',
    description: 'Academic listening, reading, writing, and speaking practice for target band growth.',
    detailsHref: '/general-english-and-mathematics.html#exam-prep',
    assessmentHref: '/diagnostic/ielts',
  },
  {
    key: 'sat',
    title: 'SAT Digital Prep',
    description: 'Digital SAT math, evidence-based reading, pacing, and adaptive test strategy.',
    detailsHref: '/general-english-and-mathematics.html#exam-prep',
    assessmentHref: '/diagnostic/sat',
  },
  {
    key: 'cefr',
    title: 'CEFR Level Prep',
    description: 'Structured English progress from foundation levels toward confident certification readiness.',
    detailsHref: '/general-english-and-mathematics.html#exam-prep',
    assessmentHref: '/diagnostic/cefr',
  },
]

function ExamPrepMenu({ isOpen, onClose, onShowDetails, onTakeAssessment }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="exam-prep-menu" role="dialog" aria-modal="true" aria-labelledby="exam-prep-menu-title">
      <button className="exam-prep-menu__backdrop" type="button" onClick={onClose} aria-label="Close exam preparation menu" />

      <div className="exam-prep-menu__dialog">
        <button className="exam-prep-menu__close" type="button" onClick={onClose} aria-label="Close exam preparation menu">
          Close
        </button>

        <p className="exam-prep-menu__eyebrow">ExamPrepMenu</p>
        <h2 id="exam-prep-menu-title">Choose an exam preparation path</h2>

        <div className="exam-prep-menu__grid">
          {examPrepOptions.map((option) => (
            <article className="exam-prep-menu__card" key={option.key}>
              <h3>{option.title}</h3>
              <p>{option.description}</p>

              <div className="exam-prep-menu__actions">
                <a
                  href={option.detailsHref}
                  onClick={(event) => {
                    if (!onShowDetails) return
                    event.preventDefault()
                    onShowDetails(option.key)
                  }}
                >
                  Details
                </a>
                <a
                  href={option.assessmentHref}
                  onClick={(event) => {
                    if (!onTakeAssessment) return
                    event.preventDefault()
                    onTakeAssessment(option.key)
                  }}
                >
                  Take Assessment
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ExamPrepMenu