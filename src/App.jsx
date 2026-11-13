import { useEffect, useRef, useState } from 'react';

const image = (name) => `/images/${name}`;
const genres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Horror'];
const devices = [['Smartphones', 'phone'], ['Tablet', 'tablet'], ['Smart TV', 'tv'], ['Laptops', 'laptop'], ['Gaming Consoles', 'console'], ['VR Headsets', 'vr']];
const questions = [
  ['What is StreamVibe?', 'StreamVibe is a streaming service that allows you to watch movies and shows on demand.'],
  ['How much does StreamVibe cost?', 'Plans start at $9.99 per month. Choose Basic, Standard, or Premium to suit your viewing preferences.'],
  ['What content is available on StreamVibe?', 'Explore a wide variety of movies and shows, including action, adventure, comedy, drama, and horror.'],
  ['How can I watch StreamVibe?', 'Watch on your smartphone, tablet, smart TV, laptop, gaming console, or VR headset.'],
  ['How do I sign up for StreamVibe?', 'Signup is not connected in this frontend demo.'],
  ['What is the StreamVibe free trial?', 'Free-trial details are not available in this frontend demo.'],
  ['How do I contact StreamVibe customer support?', 'The support form is a frontend demo and does not send messages.'],
  ['What are the StreamVibe payment methods?', 'Payment methods are not specified in this frontend demo.'],
];
const plans = [
  ['Basic', 'Enjoy an extensive library of movies and shows, featuring a range of content, including recently released titles.', '9.99'],
  ['Standard', 'Access to a wider selection of movies and shows, including most new releases and exclusive content', '12.99'],
  ['Premium', 'Access to a widest selection of movies and shows, including all new releases and Offline Viewing', '14.99'],
];

function Icon({ name, ...props }) {
  return <img className="icon" src={image(`${name}.svg`)} alt="" aria-hidden="true" {...props} />;
}

function Modal({ title, kind, onClose }) {
  const ref = useRef(null);
  const [sent, setSent] = useState(false);
  useEffect(() => {
    ref.current.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);
  return (
    <dialog ref={ref} className="modal" onCancel={onClose} onClick={(event) => { if (event.target === ref.current) onClose(); }} aria-labelledby="modal-title">
      <button className="close-button" aria-label="Close dialog" onClick={onClose}>×</button>
      <h2 id="modal-title">{title}</h2>
      {sent ? <div role="status"><p>This is a frontend demo. Your information was not saved or sent, and no account or payment was created.</p><button className="button primary" onClick={onClose}>Done</button></div> :
        <form onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
          <p>{kind === 'support' ? 'Preview the support form. Your question will not be sent or saved.' : 'Preview the signup form. Your email will not be sent or saved.'}</p>
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" placeholder="you@example.com" required autoFocus />
          {kind === 'support' && <><label htmlFor="question">Your question</label><textarea id="question" rows="4" required placeholder="How can we help?" /></>}
          <button className="button primary" type="submit">Try Demo</button>
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
  const genreRef = useRef(null);
  const startTrial = (plan = '') => setModal({ title: plan ? `${plan} Plan — ${yearly ? 'Yearly' : 'Monthly'}` : 'Start your free trial', kind: 'signup' });
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
          <button className="icon-button" aria-label="Search categories" aria-expanded={searchOpen} onClick={() => { setSearchOpen(!searchOpen); setNotifications(false); }}><Icon name="search" /></button>
          <button className="icon-button" aria-label="Notifications" aria-expanded={notifications} onClick={() => { setNotifications(!notifications); setSearchOpen(false); }}><Icon name="bell" /></button>
          <button className="menu-button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>
        {searchOpen && <div className="header-popover"><label htmlFor="search">Search categories</label><input id="search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search movies by genre…" /><div className="search-results">{genres.filter((name) => name.toLowerCase().includes(query.toLowerCase())).map((name) => <a key={name} href="#categories" onClick={() => { setSearchOpen(false); setModal({ title: `${name} movies & shows`, kind: 'browse', genre: name }); }}>{name} <span>→</span></a>)}{!genres.some((name) => name.toLowerCase().includes(query.toLowerCase())) && <p>No categories found.</p>}</div></div>}
        {notifications && <div className="header-popover" role="status"><h3>You’re all caught up</h3><p>New releases and updates will appear here.</p></div>}
      </header>

      <main>
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
            <div className="plan-grid">{plans.map(([name, description, monthly]) => <article className="plan-card" key={name}><div><h3>{name} Plan</h3><p>{description}</p></div><p className="price">{yearly ? <span>Yearly pricing unavailable</span> : <>${monthly}<span>/month</span></>}</p><div className="plan-actions"><button className="button secondary" onClick={() => startTrial(name)}>Start Free Trial</button><button className="button primary" onClick={() => startTrial(name)}>Choose Plan</button></div></article>)}</div>
          </section>

          <section className="trial-banner" aria-labelledby="trial-title"><img className="trial-art" src={image('trial.png')} alt="" loading="lazy" /><div><h2 id="trial-title">Start your free trial today!</h2><p>This is a clear and concise call to action that encourages users to sign up for a free trial of StreamVibe.</p></div><button className="button primary" onClick={() => startTrial()}>Start a Free Trial</button></section>
        </div>
      </main>
      <footer>
        <div className="footer-links">
          {[['Home', ['Categories', 'Devices', 'Pricing', 'FAQ']], ['Movies', ['Genres', 'Trending', 'New Release', 'Popular']], ['Shows', ['Genres', 'Trending', 'New Release', 'Popular']], ['Support', ['Contact Us']], ['Subscription', ['Plans', 'Features']]].map(([title, links]) => <div key={title}><h3>{title}</h3>{links.map((label) => <a key={label} href={label === 'Devices' || label === 'Features' ? '#devices' : label === 'FAQ' || label === 'Contact Us' ? '#faq' : label === 'Pricing' || label === 'Plans' ? '#pricing' : '#categories'}>{label}</a>)}</div>)}
          <div><h3>Connect With Us</h3><div className="social-links">{['facebook', 'twitter', 'linkedin'].map((name) => <a key={name} href={`https://${name === 'twitter' ? 'x' : name}.com`} target="_blank" rel="noreferrer" aria-label={name}><Icon name={name} /></a>)}</div></div>
        </div>
        <div className="footer-bottom"><span>©2023 streamvib, All Rights Reserved</span><div>{['Terms of Use', 'Privacy Policy', 'Cookie Policy'].map((label) => <button key={label} onClick={() => setModal({ title: label, kind: 'policy' })}>{label}</button>)}</div></div>
      </footer>
      {modal && (modal.kind === 'browse' || modal.kind === 'policy' ? <InfoDialog modal={modal} onClose={() => setModal(null)} onTrial={() => startTrial()} /> : <Modal key={modal.title} {...modal} onClose={() => setModal(null)} />)}
    </>
  );
}

function InfoDialog({ modal, onClose, onTrial }) {
  const ref = useRef(null);
  useEffect(() => { ref.current.showModal(); }, []);
  return <dialog ref={ref} className="modal" onCancel={onClose} onClick={(event) => { if (event.target === ref.current) onClose(); }} aria-labelledby="info-title"><button className="close-button" aria-label="Close dialog" onClick={onClose}>×</button><h2 id="info-title">{modal.title}</h2>{modal.kind === 'browse' ? <><img className="browse-art" src={image(`${modal.genre.toLowerCase()}.png`)} alt={`${modal.genre} poster collection`} /><p>This is a preview of the {modal.genre.toLowerCase()} category. Streaming and signup are not connected in this demo.</p><button className="button primary" onClick={onTrial}>Start Free Trial</button></> : <p>This is a frontend demonstration. No account or payment information is collected by a server. {modal.title} content is not provided in the selected design.</p>}</dialog>;
}
