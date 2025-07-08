import React from 'react';
import './LandingOne.css';

const features = [
  {
    icon: '/resources/search.svg',
    title: 'Precision NCC Filtering (J1, J2, J3, J9)',
    desc: 'Quickly filter and identify relevant sections of the National Electrical Code (NCC) based on your project (J1, J2, J3, J7, J9), allowing you to focus on project-specific information.'
  },
  {
    icon: '/resources/file.svg',
    title: 'Project-Specific Metering Samples',
    desc: 'Access a library of actual samples tailored to your project specifications, offering tailored examples for metering and saving you time and effort.'
  },
  {
    icon: '/resources/ailanding.svg',
    title: 'AI-Powered Complete Metering Solutions (MVP)',
    desc: 'Leverage our AI-powered solution to generate complete metering solutions for your projects, including Bill of Materials (BOM) and required designs. This feature is currently in MVP stage for testing. Our final goal is to provide a comprehensive solution including smart device programming.'
  }
];

const howItWorks = [
  {
    icon: '/resources/pen.svg',
    title: 'Become a member',
    desc: 'Sign up for free and start a project .'
  },
  {
    icon: '/resources/tick.svg',
    title: 'AI Analysis',
    desc: 'An analysis of the project SLD - Single Line Diagram - and electrical specification will be performed by ecoInsight AI.'
  },
  {
    icon: '/resources/file.svg',
    title: 'Tailored Design',
    desc: 'An immediate engineering plan for comprehensive energy monitoring has been developed..'
  }
];

const currentCoverage = [
  {
    module: 'NCC Core Filtering',
    description: 'Filters NCC sections J1, J2, J3, and J9 to show only project-relevant clauses.',
    status: 'Complete',
    statusType: 'complete'
  },
  {
    module: 'Project Samples',
    description: 'Provides project-specific sample designs and diagrams for energy monitoring (solar, EV, battery).',
    status: 'Complete',
    statusType: 'complete'
  },
  {
    module: 'AI Solution Design',
    description: 'Generates a complete, custom metering solution, including Bill of Materials (BOM) and system architecture.',
    status: 'MVP / Beta',
    statusType: 'mvp'
  }
];

export default function Landing() {
  return (
    <div className="landing-root">
      <header className="landing-header">
        <div className="landing-logo-title">
          <img src="/resources/Logo.png" alt="ecoInsight Logo" className="landing-logo" />
          <span className="landing-title">ecoInsight</span>
        </div>
        <nav className="landing-nav">
          <a href="https://ecoinsight.com.au" target="_blank" rel="noopener noreferrer">Our Research</a>
          <a href="/presentation">Building Sustainability</a>
          <a href="/prototype">Prototype</a>
        </nav>
        <div className="landing-auth">
          <a href="/login" className="landing-signin">Sign In</a>
          <a href="/register" className="landing-signup">Create an account</a>
        </div>
      </header>
      <section className="landing-hero" style={{
        backgroundImage: `url('/resources/landinghearoBG.jpg'), linear-gradient(180deg, #fff 60%, #F0F2F5 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '928px',
        minHeight: '480px',
        margin: '0 auto',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '712px',
          padding: '24px',
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <h1 style={{
            fontFamily: 'Inter',
            fontWeight: 900,
            fontSize: '48px',
            lineHeight: '1.25em',
            letterSpacing: '-4.17%',
            color: '#000000',
            textAlign: 'center',
            margin: 0,
            width: '100%'
          }}>From Code to Complete Design.</h1>
          <p style={{
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '1.5em',
            color: '#000000',
            textAlign: 'center',
            margin: 0,
            width: '100%'
          }}>
            Our mission is to improve energy-related workflows in construction environments, reduce errors, and ensure that all standards are met.
          </p>
        </div>
      </section>
      <section className="landing-features">
        <div className="landing-features-header">
          <h2>Key Features</h2>
          <p className="landing-features-description">
            EcoInsight aims to simplify and automate the Energy Efficiency compliance process with a comprehensive suite of tools.
          </p>
        </div>
        <div className="landing-features-list">
          {features.map((f, i) => (
            <div className="landing-feature" key={i}>
              <img src={f.icon} alt="" className="landing-feature-icon" />
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="landing-how">
        <h2>How It Works</h2>
        <div className="landing-how-container">
          {howItWorks.map((h, i) => (
            <div className="landing-how-step" key={i}>
              <div className="landing-how-step-icon-container">
                <img src={h.icon} alt="" className="landing-how-icon" />
              </div>
              <div className="landing-how-step-content">
                <h3>{h.title}</h3>
                <p>{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="landing-coverage">
        <h2>Current Coverage</h2>
        <div className="landing-coverage-table">
          <div className="landing-coverage-header">
            <div className="landing-coverage-cell landing-coverage-header-cell">Module / NCC Section</div>
            <div className="landing-coverage-cell landing-coverage-header-cell">Description</div>
            <div className="landing-coverage-cell landing-coverage-header-cell">Feature Coverage</div>
          </div>
          <div className="landing-coverage-body">
            {currentCoverage.map((item, i) => (
              <div className="landing-coverage-row" key={i}>
                <div className="landing-coverage-cell landing-coverage-module">{item.module}</div>
                <div className="landing-coverage-cell landing-coverage-description">{item.description}</div>
                <div className="landing-coverage-cell landing-coverage-status">
                  <div className={`landing-coverage-badge ${item.statusType === 'mvp' ? 'landing-coverage-badge-mvp' : 'landing-coverage-badge-complete'}`}>
                    {item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="landing-footer">
        <div className="landing-footer-links">
          <a href="https://ecoinsight.com.au" target="_blank" rel="noopener noreferrer">Our Research</a>          
        </div>
        <div className="landing-footer-copyright">
          <span>© 2023 ecoInsight. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
} 