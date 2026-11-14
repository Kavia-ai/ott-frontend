import { useEffect, useRef, useState } from 'react';
import { ottApi } from './api';

const image = (name) => `/images/${name}`;
const genres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Horror'];
const devices = [['Smartphones', 'phone'], ['Tablet', 'tablet'], ['Smart TV', 'tv'], ['Laptops', 'laptop'], ['Gaming Consoles', 'console'], ['VR Headsets', 'vr']];
const questions = [
  ['What is StreamVibe?', 'StreamVibe is a streaming service that allows you to watch movies and shows on demand.'],
  ['How much does StreamVibe cost?', 'See the pricing section for the available monthly plans.'],
  ['What content is available on StreamVibe?', 'Explore a wide variety of movies and shows, including action, adventure, comedy, drama, and horror.'],
  ['How can I watch StreamVibe?', 'Watch on your smartphone, tablet, smart TV, laptop, gaming console, or VR headset.'],
  ['How do I sign up for StreamVibe?', 'Use Sign up to create an account, or choose a plan to get started.'],
  ['What is the StreamVibe free trial?', 'You can select a plan and record a simulated free trial.'],
  ['How do I contact StreamVibe customer support?', 'The support form is a frontend demo and does not send messages.'],
  ['What are the StreamVibe payment methods?', 'Payment methods are not specified in this frontend demo.'],
];
function Icon({ name, ...props }) {
  return <img className="icon" src={image(`${name}.svg`)} alt="" aria-hidden="true" {...props} />;
}

function Modal({ title, kind, plan, trial, session, onClose, onProfileUpdated }) {
  const ref = useRef(null);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState(kind === 'login' ? 'login' : 'signup');
  useEffect(() => {
    ref.current.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);
  return (
    <dialog ref={ref} className="modal" onCancel={(event) => { if (isSubmitting) event.preventDefault(); else onClose(); }} onClick={(event) => { if (!isSubmitting && event.target === ref.current) onClose(); }} aria-labelledby="modal-title">
      <button className="close-button" aria-label="Close dialog" disabled={isSubmitting} onClick={onClose}>×</button>
      <h2 id="modal-title">{kind === 'support' || plan ? title : authMode === 'login' ? 'Log in' : 'Sign up'}</h2>
      {sent ? <div role="status"><p>{kind === 'support' ? 'This is a preview; your question was not sent.' : plan ? `Your ${trial ? 'free trial' : 'subscription'} to the ${plan.name} plan is active.` : 'You are signed in.'}</p><button className="button primary" onClick={onClose}>Done</button></div> :
        <form onSubmit={async (event) => {
          event.preventDefault();
          if (kind === 'support') { setSent(true); return; }
          setError('');
          setIsSubmitting(true);
          const form = new FormData(event.currentTarget);
          try {
            let currentSession = session;
            if (!currentSession) {
              const credentials = { email: form.get('email'), password: form.get('password') };
              const result = authMode === 'login'
                ? await ottApi.login(credentials)
                : await ottApi.register({ ...credentials, display_name: form.get('displayName').trim() });
              currentSession = { token: result.access_token, profile: null };
              onProfileUpdated(currentSession);
              const profile = await ottApi.getMe(currentSession.token);
              currentSession = { ...currentSession, profile };
              onProfileUpdated(currentSession);
            }
            if (plan) {
              await ottApi.checkout(currentSession.token, { plan_slug: plan.slug, start_trial: trial });
              const profile = await ottApi.getMe(currentSession.token);
              onProfileUpdated({ ...currentSession, profile });
            }
            setSent(true);
          } catch (requestError) {
            if (requestError.status === 401 && session) onProfileUpdated(null);
            setError(requestError.message);
          } finally {
            setIsSubmitting(false);
          }
        }}>
          <p>{kind === 'support' ? 'Preview the support form. Your question will not be sent or saved.' : plan ? `${session ? 'Confirm' : 'Sign in or create an account'} to ${trial ? 'start a free trial' : 'select'} the ${plan.name} plan. Checkout is simulated; no payment is taken.` : 'Sign in or create an account to manage your profile.'}</p>
          {kind !== 'support' && !session && <>{authMode === 'signup' && <><label htmlFor="displayName">Display name</label><input id="displayName" name="displayName" type="text" maxLength="100" placeholder="Your name" required autoFocus /></>}<label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required autoFocus={authMode === 'login'} /><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} minLength="8" maxLength="128" placeholder="At least 8 characters" required /></>}
          {kind === 'support' && <><label htmlFor="email">Email address</label><input id="email" name="email" type="email" placeholder="you@example.com" required autoFocus /></>}
          {kind === 'support' && <><label htmlFor="question">Your question</label><textarea id="question" rows="4" required placeholder="How can we help?" /></>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Please wait…' : kind === 'support' ? 'Try Demo' : plan && session ? (trial ? 'Start Free Trial' : 'Choose Plan') : authMode === 'login' ? 'Log in' : 'Sign up'}</button>
          {kind !== 'support' && !session && <button className="auth-switch" type="button" disabled={isSubmitting} onClick={() => { setError(''); setAuthMode(authMode === 'login' ? 'signup' : 'login'); }}>{authMode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}</button>}
        </form>}
    </dialog>
  );
}

/** Responsive StreamVibe landing page based on the supplied Figma home frame. */
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [yearly, setYearly] = useState(false);
  const [modal, setModal] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [notifications, setNotifications] = useState(false);
  const [slide, setSlide] = useState(0);
  const [plans, setPlans] = useState([]);
  const [plansError, setPlansError] = useState('');
  const [plansLoading, setPlansLoading] = useState(true);
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('streamvibe-session')); } catch { return null; }
  });
  const sessionRef = useRef(session);
  const [sessionError, setSessionError] = useState('');
  const genreRef = useRef(null);
  const startPlan = (slug = 'basic', trial = false) => {
    const plan = plans.find((item) => item.slug === slug);
    if (!plan) {
      setModal(null);
      setPlansError('Plans are unavailable. Please reload the page and try again.');
      window.location.hash = 'pricing';
      return;
    }
    setModal({ title: `${plan.name} Plan — ${trial ? 'Free Trial' : 'Monthly'}`, kind: 'signup', plan, trial });
  };
  useEffect(() => {
    let active = true;
    ottApi.getPlans().then((result) => {
      if (active) setPlans(result);
    }).catch(() => {
      if (active) setPlansError('Could not load plans. Check your connection and reload.');
    }).finally(() => {
      if (active) setPlansLoading(false);
    });
    return () => { active = false; };
  }, []);
  const updateSession = (nextSession) => {
    sessionRef.current = nextSession;
    if (nextSession) localStorage.setItem('streamvibe-session', JSON.stringify(nextSession));
    else localStorage.removeItem('streamvibe-session');
    setSession(nextSession);
    setSessionError('');
  };
  useEffect(() => {
    if (!session?.token) return;
    let active = true;
    ottApi.getMe(session.token).then((profile) => {
      if (active && sessionRef.current === session) {
        const nextSession = { token: session.token, profile };
        sessionRef.current = nextSession;
        localStorage.setItem('streamvibe-session', JSON.stringify(nextSession));
        setSession(nextSession);
        setSessionError('');
      }
    }).catch((error) => {
      if (!active || sessionRef.current !== session) return;
      if (error.status === 401) {
        sessionRef.current = null;
        localStorage.removeItem('streamvibe-session');
        setSession(null);
        setSessionError('Your session expired. Please log in again.');
      } else {
        setSessionError('Could not refresh your profile. Check your connection and reload.');
      }
    });
    return () => { active = false; };
  }, [session?.token]);
  const profile = session?.profile;
  const move = (direction) => {
    const next = (slide + direction + genres.length) % genres.length;
    setSlide(next);
    genreRef.current.children[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };
  const navLinks = [['Home', '#home'], ['Movies & Shows', '#categories'], ['Support', '#faq'], ['Subscriptions', '#pricing']];
  return (
    <>
      <header className="navbar">
        <a href="#home" aria-label="StreamVibe home"><img className="logo" src={image('logo.svg')} alt="StreamVibe" /></a>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
          {navLinks.map(([label, href], index) => <a key={label} className={index === 0 ? 'active' : ''} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
        </nav>
        <div className="header-actions">
          {profile && <a className="profile-summary" href="#profile" aria-label="View your profile">{profile.subscription?.emoji || '👤'} <span>{profile.display_name}</span>{profile.subscription?.is_trial && <b>Trial</b>}</a>}
          {session ? <button className="button secondary" onClick={() => updateSession(null)}>Log out</button> : <><button className="button secondary" onClick={() => setModal({ title: 'Log in', kind: 'login' })}>Log in</button><button className="button primary" onClick={() => setModal({ title: 'Sign up', kind: 'signup' })}>Sign up</button></>}
          <button className="icon-button" aria-label="Search categories" aria-expanded={searchOpen} onClick={() => { setSearchOpen(!searchOpen); setNotifications(false); }}><Icon name="search" /></button>
          <button className="icon-button" aria-label="Notifications" aria-expanded={notifications} onClick={() => { setNotifications(!notifications); setSearchOpen(false); }}><Icon name="bell" /></button>
          <button className="menu-button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>
        {searchOpen && <div className="header-popover"><label htmlFor="search">Search categories</label><input id="search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search movies by genre…" /><div className="search-results">{genres.filter((name) => name.toLowerCase().includes(query.toLowerCase())).map((name) => <a key={name} href="#categories" onClick={() => { setSearchOpen(false); setModal({ title: `${name} movies & shows`, kind: 'browse', genre: name }); }}>{name} <span>→</span></a>)}{!genres.some((name) => name.toLowerCase().includes(query.toLowerCase())) && <p>No categories found.</p>}</div></div>}
        {notifications && <div className="header-popover" role="status"><h3>You’re all caught up</h3><p>New releases and updates will appear here.</p></div>}
      </header>

      <main>
        {sessionError && <p className="session-notice" role="alert">{sessionError}</p>}
        <section className="hero" id="home" aria-labelledby="hero-title">
          <img className="hero-art" src={image('hero-composition.png')} alt="" fetchPriority="high" />
          <div className="hero-copy">
            <h1 id="hero-title">The Best Streaming Experience</h1>
            <p>StreamVibe is the best streaming experience for watching your favorite movies and shows on demand, anytime, anywhere. With StreamVibe, you can enjoy a wide variety of content, including the latest blockbusters, classic movies, popular TV shows, and more. You can also create your own watchlists, so you can easily find the content you want to watch.</p>
            <a className="button primary watch-button" href="#categories"><Icon name="play" />Start Watching Now</a>
          </div>
        </section>

        <div className="content">
          <section id="categories" className="section categories">
            <div className="section-heading"><div><h2>Explore our wide variety of categories</h2><p>Whether you're looking for a comedy to make you laugh, a drama to make you think, or a documentary to learn something new</p></div>
              <div className="carousel-controls"><button className="arrow-button" aria-label="Previous category" onClick={() => move(-1)}><Icon name="left" /></button><div className="indicators" aria-hidden="true">{[0, 1, 2, 3].map((item) => <span key={item} className={slide % 4 === item ? 'selected' : ''} />)}</div><button className="arrow-button" aria-label="Next category" onClick={() => move(1)}><Icon name="right" /></button></div>
            </div>
            <div className="genre-grid" ref={genreRef}>
              {genres.map((name) => <button className="genre-card" key={name} onClick={() => setModal({ title: `${name} movies & shows`, kind: 'browse', genre: name })}><img src={image(`${name.toLowerCase()}.png`)} alt={`${name} movie poster collection`} loading="lazy" /><span>{name}<Icon name="right" /></span></button>)}
            </div>
          </section>

          <section id="devices" className="section">
            <div className="section-heading device-heading"><div><h2>We Provide you streaming experience across various devices.</h2><p>With StreamVibe, you can enjoy your favorite movies and TV shows anytime, anywhere. Our platform is designed to be compatible with a wide range of devices, ensuring that you never miss a moment of entertainment.</p></div></div>
            <div className="device-grid">{devices.map(([name, icon]) => <article className="device-card" key={name}><div className="device-title"><span className="device-icon"><Icon name={icon} /></span><h3>{name}</h3></div><p>StreamVibe is optimized for both Android and iOS smartphones. Download our app from the Google Play Store or the Apple App Store</p></article>)}</div>
          </section>

          <section id="faq" className="section">
            <div className="section-heading"><div><h2>Frequently Asked Questions</h2><p>Got questions? We've got answers! Check out our FAQ section to find answers to the most common questions about StreamVibe.</p></div><button className="button primary" onClick={() => setModal({ title: 'Ask a Question', kind: 'support' })}>Ask a Question</button></div>
            <div className="faq-grid">{[0, 1].map((column) => <div key={column}>{questions.slice(column * 4, column * 4 + 4).map(([question, answer], offset) => { const index = column * 4 + offset; return <article className="faq-item" key={question}><button className="faq-question" aria-expanded={openFaq === index} aria-controls={`answer-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)}><span className="faq-number">{String(index + 1).padStart(2, '0')}</span><span className="faq-text">{question}</span><span className="faq-symbol" aria-hidden="true">{openFaq === index ? '−' : '+'}</span></button><div className="faq-answer" id={`answer-${index}`} hidden={openFaq !== index}><p>{answer}</p></div></article>; })}</div>)}</div>
          </section>

          <section id="pricing" className="section">
            <div className="section-heading"><div><h2>Choose the plan that's right for you</h2><p>Join StreamVibe and select from our flexible subscription options tailored to suit your viewing preferences. Get ready for non-stop entertainment!</p></div><div className="billing-tabs" aria-label="Billing period"><button className={!yearly ? 'active' : ''} aria-pressed={!yearly} onClick={() => setYearly(false)}>Monthly</button><button className={yearly ? 'active' : ''} aria-pressed={yearly} onClick={() => setYearly(true)}>Yearly</button></div></div>
            {plansLoading && <p role="status">Loading plans…</p>}
            {plansError && <p className="form-error" role="alert">{plansError}</p>}
            <div className="plan-grid">{plans.map((plan) => <article className="plan-card" key={plan.slug}><div><h3>{plan.name} Plan</h3><p>{plan.description}</p></div><p className="price">{yearly ? <span>Yearly pricing unavailable</span> : <>${plan.monthly_price}<span>/month</span></>}</p><div className="plan-actions"><button className="button secondary" disabled={yearly} onClick={() => startPlan(plan.slug, true)}>Start Free Trial</button><button className="button primary" disabled={yearly} onClick={() => startPlan(plan.slug)}>Choose Plan</button></div></article>)}</div>
          </section>

          {profile && <section className="profile-card section" id="profile" aria-labelledby="profile-title"><div><p className="eyebrow">Your profile</p><h2 id="profile-title">{profile.subscription?.emoji || '👤'} {profile.display_name}</h2><p>{profile.email}</p></div>{profile.subscription ? <div className="profile-plan"><strong>{profile.subscription.plan_name} Plan</strong>{profile.subscription.is_trial && <span className="trial-pill">Trial</span>}<p>{profile.subscription.is_trial ? 'Your free trial is active.' : 'Your subscription is active.'}</p></div> : <p>No plan selected yet.</p>}</section>}

          <section className="trial-banner" aria-labelledby="trial-title"><img className="trial-art" src={image('trial.png')} alt="" loading="lazy" /><div><h2 id="trial-title">Start your free trial today!</h2><p>This is a simulated trial; no payment is taken.</p></div><button className="button primary" onClick={() => startPlan('basic', true)}>Start a Free Trial</button></section>
        </div>
      </main>
      <footer>
        <div className="footer-links">
          {[['Home', ['Categories', 'Devices', 'Pricing', 'FAQ']], ['Movies', ['Genres', 'Trending', 'New Release', 'Popular']], ['Shows', ['Genres', 'Trending', 'New Release', 'Popular']], ['Support', ['Contact Us']], ['Subscription', ['Plans', 'Features']]].map(([title, links]) => <div key={title}><h3>{title}</h3>{links.map((label) => <a key={label} href={label === 'Devices' || label === 'Features' ? '#devices' : label === 'FAQ' || label === 'Contact Us' ? '#faq' : label === 'Pricing' || label === 'Plans' ? '#pricing' : '#categories'}>{label}</a>)}</div>)}
          <div><h3>Connect With Us</h3><div className="social-links">{['facebook', 'twitter', 'linkedin'].map((name) => <a key={name} href={`https://${name === 'twitter' ? 'x' : name}.com`} target="_blank" rel="noreferrer" aria-label={name}><Icon name={name} /></a>)}</div></div>
        </div>
        <div className="footer-bottom"><span>©2023 streamvib, All Rights Reserved</span><div>{['Terms of Use', 'Privacy Policy', 'Cookie Policy'].map((label) => <button key={label} onClick={() => setModal({ title: label, kind: 'policy' })}>{label}</button>)}</div></div>
      </footer>
      {modal && (modal.kind === 'browse' || modal.kind === 'policy' ? <InfoDialog modal={modal} onClose={() => setModal(null)} onTrial={() => startPlan('basic', true)} /> : <Modal key={modal.title} {...modal} session={session} onClose={() => setModal(null)} onProfileUpdated={updateSession} />)}
    </>
  );
}

function InfoDialog({ modal, onClose, onTrial }) {
  const ref = useRef(null);
  useEffect(() => { ref.current.showModal(); }, []);
  return <dialog ref={ref} className="modal" onCancel={onClose} onClick={(event) => { if (event.target === ref.current) onClose(); }} aria-labelledby="info-title"><button className="close-button" aria-label="Close dialog" onClick={onClose}>×</button><h2 id="info-title">{modal.title}</h2>{modal.kind === 'browse' ? <><img className="browse-art" src={image(`${modal.genre.toLowerCase()}.png`)} alt={`${modal.genre} poster collection`} /><p>This is a preview of the {modal.genre.toLowerCase()} category. Streaming is not connected in this demo.</p><button className="button primary" onClick={onTrial}>Start Free Trial</button></> : <p>{modal.title} content is not provided in this demo. Accounts and simulated subscriptions are stored by the server.</p>}</dialog>;
}
