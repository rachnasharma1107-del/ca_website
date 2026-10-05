export default function Hero() {
  return (
    <section className="hero-corporate" aria-label="Praveen Aggarwal & Co. Hero">
      <div className="hero-video-container">
        <video
          className="hero-video-media"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src="/download (1).mp4" type="video/mp4" />
          Your browser does not support video playback.
        </video>
        {/* Only Bottom Fade Gradient */}
        <div className="hero-overlay-gradient" />
      </div>

      <div className="hero-content-wrapper">
        <div className="container">
          <header className="hero-header">
            <h1 className="hero-title">
              <span className="text-orange">Praveen Aggarwal</span> &amp; Co.
            </h1>
            <p className="hero-description">
              We live by the core principle that accuracy and trust build lasting financial leadership.
              Hence, we strive to deliver comprehensive tax, audit, and advisory solutions driven by precision,
              integrity, and sustainable growth.
            </p>
          </header>
        </div>
      </div>
    </section>
  );
}