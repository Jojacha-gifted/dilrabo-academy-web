import { useEffect, useState } from 'react'
import centerImg from './assets/center.jpeg'
import campusImg from './assets/image0.jpeg'
import studentsImg from './assets/image1.jpeg'
import digitalImg from './assets/image3.jpeg'
import founderImg from './assets/photo.jpg'
import libraryImg from './assets/str.jpeg'
import studentImg from './assets/student.jpeg'
import './App.css'

const HOME_PATH = '/'
const COURSE_PATH = '/general-english-and-mathematics'

const curriculum = [
  {
    title: 'English Foundations',
    text: 'Build grammar accuracy, sharpen vocabulary, and practice confident speaking through guided discussion and feedback.',
  },
  {
    title: 'Mathematics Mastery',
    text: 'Strengthen arithmetic, algebra, geometry, and problem-solving with step-by-step coaching and weekly drills.',
  },
  {
    title: 'Integrated Practice',
    text: 'Combine language and logic through presentations, quizzes, and collaborative tasks that mirror real classroom success.',
  },
]

const materials = [
  {
    label: 'PDF Guide',
    title: 'Grammar Starter Pack',
    text: 'A placeholder bundle for key rules, sentence patterns, and everyday usage notes.',
  },
  {
    label: 'Worksheet Set',
    title: 'Math Skills Workbook',
    text: 'Practice sheets for core operations, problem-solving routines, and exam warm-ups.',
  },
  {
    label: 'Study Planner',
    title: 'Revision Roadmap',
    text: 'A downloadable guide for structuring weekly review sessions and tracking progress.',
  },
]

const testimonials = [
  {
    name: 'Aziza R.',
    role: 'General English Student',
    quote:
      'The lessons feel energetic and organised. I became much more confident speaking in class and solving math tasks under time pressure.',
    image: studentImg,
  },
  {
    name: 'Murod N.',
    role: 'Parent of a Grade 8 Student',
    quote:
      'Dilrabo Academy gives clear progress updates and practical homework. We noticed stronger discipline and better classroom results very quickly.',
    image: studentsImg,
  },
  {
    name: 'Sevara T.',
    role: 'Foundation Programme Student',
    quote:
      'The teachers explain difficult topics simply. The study materials and revision support helped me stay consistent every week.',
    image: founderImg,
  },
]

function readPath() {
  return window.location.pathname
}

function App() {
  const [path, setPath] = useState(readPath())

  useEffect(() => {
    const handlePopState = () => {
      setPath(readPath())
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    document.title =
      path === COURSE_PATH
        ? 'General English and Mathematics | Dilrabo Academy'
        : 'Dilrabo Academy'

    if (window.location.hash) {
      const targetId = window.location.hash.slice(1)
      requestAnimationFrame(() => {
        document.getElementById(targetId)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      })
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [path])

  function navigate(nextPath, sectionId) {
    const nextUrl = sectionId ? `${nextPath}#${sectionId}` : nextPath

    window.history.pushState({}, '', nextUrl)
    setPath(nextPath)

    if (nextPath === path && sectionId) {
      requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      })
    }
  }

  if (path === COURSE_PATH) {
    return <CoursePage navigate={navigate} />
  }

  return <HomePage navigate={navigate} />
}

function HomePage({ navigate }) {
  return (
    <div className="page-shell">
      <header className="site-header">
        <button className="brand-mark" type="button" onClick={() => navigate(HOME_PATH)}>
          <span className="brand-mark__badge">DA</span>
          <span>
            <strong>Dilrabo Academy</strong>
            <small>Premium learning for ambitious students</small>
          </span>
        </button>

        <nav className="site-nav" aria-label="Primary navigation">
          <button type="button" onClick={() => navigate(HOME_PATH, 'programs')}>
            Programs
          </button>
          <button type="button" onClick={() => navigate(HOME_PATH, 'why-us')}>
            Why Us
          </button>
          <button type="button" onClick={() => navigate(HOME_PATH, 'contact')}>
            Contact
          </button>
        </nav>
      </header>

      <main>
        <section className="hero-grid section">
          <div className="hero-copy reveal">
            <span className="eyebrow">Featured learning path</span>
            <h1>General English and Mathematics designed for steady, visible progress.</h1>
            <p className="hero-text">
              Dilrabo Academy blends strong language instruction with practical math
              coaching so students grow more fluent, analytical, and prepared for the
              next academic level.
            </p>
            <div className="hero-actions">
              <button
                type="button"
                className="button button--primary"
                onClick={() => navigate(COURSE_PATH)}
              >
                Explore the Programme
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => navigate(HOME_PATH, 'contact')}
              >
                Contact Us
              </button>
            </div>
            <div className="highlights-row">
              <div>
                <strong>Small-group focus</strong>
                <span>Personal attention and weekly feedback</span>
              </div>
              <div>
                <strong>Balanced curriculum</strong>
                <span>English fluency paired with math confidence</span>
              </div>
              <div>
                <strong>Modern environment</strong>
                <span>Motivating spaces built for active learning</span>
              </div>
            </div>
          </div>

          <div className="hero-visual reveal">
            <div className="hero-card hero-card--large">
              <img src={campusImg} alt="Dilrabo Academy campus" />
            </div>
            <div className="hero-card hero-card--floating">
              <img src={centerImg} alt="Modern classroom at Dilrabo Academy" />
            </div>
            <div className="hero-note">
              <span>Now highlighted</span>
              <strong>General English and Mathematics</strong>
              <button
                type="button"
                className="inline-link"
                onClick={() => navigate(COURSE_PATH)}
              >
                View dedicated page
              </button>
            </div>
          </div>
        </section>

        <section id="programs" className="section reveal">
          <div className="section-heading">
            <span className="eyebrow">Programmes</span>
            <h2>Choose a path that fits the way your student learns best.</h2>
          </div>

          <div className="program-grid">
            <article className="program-card program-card--featured">
              <span className="program-tag">Most requested</span>
              <h3>General English and Mathematics</h3>
              <p>
                A dedicated pathway for students who need stronger communication,
                sharper problem-solving, and structured study habits.
              </p>
              <ul className="bullet-list">
                <li>Speaking, grammar, reading, and writing practice</li>
                <li>Core mathematics concepts with guided exercises</li>
                <li>Study materials, progress support, and revision routines</li>
              </ul>
              <button
                type="button"
                className="button button--primary"
                onClick={() => navigate(COURSE_PATH)}
              >
                Open Dedicated Page
              </button>
            </article>

            <article className="program-card">
              <h3>Focused Study Support</h3>
              <p>
                Academic reinforcement sessions that help students stay organised and
                improve classroom performance.
              </p>
            </article>

            <article className="program-card">
              <h3>Digital Learning Culture</h3>
              <p>
                Engaging resources, guided practice, and modern delivery methods that
                keep learners motivated.
              </p>
            </article>
          </div>
        </section>

        <section id="why-us" className="section reveal">
          <div className="section-heading">
            <span className="eyebrow">Why Dilrabo Academy</span>
            <h2>Professional presentation, practical teaching, and a warm atmosphere.</h2>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <img src={libraryImg} alt="Books and laptop representing blended learning" />
              <h3>Structured learning journey</h3>
              <p>
                Students move through clear lesson goals, guided practice, and review
                checkpoints that keep improvement visible.
              </p>
            </article>

            <article className="feature-card">
              <img src={digitalImg} alt="Digital e-learning tools" />
              <h3>Modern academic tools</h3>
              <p>
                Lessons are supported by practical worksheets, digital materials, and
                revision resources that extend learning beyond the classroom.
              </p>
            </article>

            <article className="feature-card">
              <img src={studentsImg} alt="Happy students giving thumbs up" />
              <h3>Positive student experience</h3>
              <p>
                A motivating environment helps learners participate more, ask better
                questions, and build confidence step by step.
              </p>
            </article>
          </div>
        </section>

        <section id="contact" className="section reveal">
          <div className="cta-panel">
            <div>
              <span className="eyebrow">Admissions</span>
              <h2>Ready to learn more about Dilrabo Academy?</h2>
              <p>
                Explore the detailed course page or use this section as the academy’s
                contact touchpoint for your next admissions step.
              </p>
            </div>
            <div className="cta-panel__actions">
              <button
                type="button"
                className="button button--primary"
                onClick={() => navigate(COURSE_PATH)}
              >
                View Featured Programme
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => navigate(COURSE_PATH, 'course-cta')}
              >
                Contact Admissions
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function CoursePage({ navigate }) {
  return (
    <div className="page-shell page-shell--course">
      <header className="site-header">
        <button className="brand-mark" type="button" onClick={() => navigate(HOME_PATH)}>
          <span className="brand-mark__badge">DA</span>
          <span>
            <strong>Dilrabo Academy</strong>
            <small>General English and Mathematics</small>
          </span>
        </button>

        <nav className="site-nav" aria-label="Course navigation">
          <button type="button" onClick={() => navigate(HOME_PATH)}>
            Home
          </button>
          <button type="button" onClick={() => navigate(COURSE_PATH, 'materials')}>
            Study Materials
          </button>
          <button type="button" onClick={() => navigate(COURSE_PATH, 'testimonials')}>
            Happy Students
          </button>
        </nav>
      </header>

      <main>
        <section className="course-hero section">
          <div className="course-hero__copy reveal">
            <button
              type="button"
              className="back-link"
              onClick={() => navigate(HOME_PATH)}
            >
              Back to homepage
            </button>
            <span className="eyebrow">Dedicated course page</span>
            <h1>General English and Mathematics</h1>
            <p className="hero-text">
              A premium learning experience for students who want to communicate more
              clearly, think more logically, and build academic momentum in both
              subjects.
            </p>
            <div className="course-pill-row">
              <span>Interactive lessons</span>
              <span>Weekly progress practice</span>
              <span>Downloadable study support</span>
            </div>
            <div className="hero-actions">
              <button
                type="button"
                className="button button--primary"
                onClick={() => navigate(COURSE_PATH, 'course-cta')}
              >
                Enroll Now
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => navigate(COURSE_PATH, 'materials')}
              >
                View Materials
              </button>
            </div>
          </div>

          <div className="course-hero__visual reveal">
            <div className="course-image-stack">
              <img
                className="course-image-stack__main"
                src={centerImg}
                alt="Dilrabo Academy classroom"
              />
              <img
                className="course-image-stack__accent"
                src={studentImg}
                alt="Student studying and writing notes"
              />
            </div>
          </div>
        </section>

        <section className="section reveal">
          <div className="section-heading">
            <span className="eyebrow">About the programme</span>
            <h2>A curriculum built around fluency, precision, and steady progress.</h2>
          </div>

          <div className="about-layout">
            <article className="about-card">
              <p>
                This pathway is designed for students who need stronger English
                communication and dependable mathematics skills at the same time. Each
                module combines explanation, guided examples, class discussion, and
                practice routines that help students understand not just what to do,
                but why it works.
              </p>
              <p>
                Learners move through vocabulary development, grammar accuracy,
                reading comprehension, writing tasks, arithmetic confidence, algebraic
                reasoning, and problem-solving strategies in a sequence that feels
                coherent and manageable.
              </p>
            </article>

            <div className="curriculum-grid">
              {curriculum.map((item) => (
                <article key={item.title} className="curriculum-card">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="materials" className="section reveal">
          <div className="section-heading">
            <span className="eyebrow">Study materials</span>
            <h2>Prepared space for guides, worksheets, and downloadable support.</h2>
          </div>

          <div className="materials-grid">
            {materials.map((item) => (
              <article key={item.title} className="material-card">
                <span className="material-card__label">{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <button
                  type="button"
                  className="button button--ghost button--small"
                  onClick={() => navigate(COURSE_PATH, 'course-cta')}
                >
                  Request Access
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="testimonials" className="section reveal">
          <div className="section-heading">
            <span className="eyebrow">Our happy students</span>
            <h2>Social proof that makes the page feel trusted and lived-in.</h2>
          </div>

          <div className="testimonial-grid">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="testimonial-card">
                <div className="testimonial-card__person">
                  <img src={testimonial.image} alt={testimonial.name} />
                  <div>
                    <h3>{testimonial.name}</h3>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
                <blockquote>{testimonial.quote}</blockquote>
              </article>
            ))}
          </div>
        </section>

        <section id="course-cta" className="section reveal">
          <div className="cta-panel cta-panel--course">
            <div>
              <span className="eyebrow">Take the next step</span>
              <h2>Enroll now or get in touch to discuss the right starting point.</h2>
              <p>
                This call-to-action area is ready for your admissions workflow,
                contact form, or direct messaging details.
              </p>
            </div>
            <div className="cta-panel__actions">
              <button
                type="button"
                className="button button--primary"
                onClick={() => navigate(HOME_PATH, 'contact')}
              >
                Enroll Now
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => navigate(HOME_PATH)}
              >
                Back Home
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
