import React from 'react';
import './LandingTwo.css';

export default function LandingTwo() {
  return (
    <div className="landing-two-root">
      {/* Header from LandingOne.js */}
      <header className="landing-header">
        <div className="landing-logo-title">
          <img src="/resources/Logo.png" alt="ecoInsight Logo" className="landing-logo" />
          <span className="landing-title">ecoInsight</span>
        </div>
        <nav className="landing-nav">
          <a href="https://ecoinsight.com.au" target="_blank" rel="noopener noreferrer">Our Research</a>
          <a href="/presentation">Building Sustainability</a>
        </nav>
        <div className="landing-auth">
          <a href="/login" className="landing-signin">Sign In</a>
          <a href="/register" className="landing-signup">Create an account</a>
        </div>
      </header>

      {/* Main content container */}
      <div className="landing-two-container">
        <div className="landing-two-content">
          {/* Hero Section */}
          <div className="landing-two-hero">
            <div className="landing-two-hero-content">
              <h1 className="landing-two-hero-title">
                Closing the Building Energy Gap
              </h1>
              <h2 className="landing-two-hero-subtitle">
                An independent project seeking expert feedback on an early-stage MVP designed to bridge the gap between designed and operational energy performance.
              </h2>
            </div>
          </div>

          {/* Problem Section */}
          <h2 className="landing-two-section-title">Problem</h2>
          <p className="landing-two-section-text">
            Project teams must navigate a fragmented landscape of disconnected stakeholders, incompatible technologies, and data that remains siloed across electrical, IT, and management teams. This creates significant financial risks due to high investment costs and uncertain ROI, making it nearly impossible to bridge the gap between design promises and real-world operational performance.
          </p>

          {/* Prototype Section */}
          <h2 className="landing-two-section-title">Our Prototype: A Modular Toolkit for Building Performance</h2>
          <p className="landing-two-section-text">
            We are developing a toolkit of practical solutions to simplify energy performance at every stage of a building's lifecycle. Each tool is designed to solve a specific, complex problem and can be used on its own or with the others.
          </p>

          {/* Toolkit Section */}
          <h2 className="landing-two-section-title">Toolkit</h2>
          
          {/* AI for Metering Design */}
          <div className="landing-two-toolkit-item">
            <div className="landing-two-toolkit-content">
              <div className="landing-two-toolkit-text">
                <h3 className="landing-two-toolkit-title">AI for Metering Design</h3>
                <p className="landing-two-toolkit-description">
                  For engineers facing the new challenge of designing what is essentially an IT network for energy metering. This AI-driven tool removes the guesswork, translating project needs into a compliant and constructible design.
                </p>
                <a href="/" className="landing-two-toolkit-button">
                  ncc.ecoinsight.com.au
                </a>
              </div>
              <div className="landing-two-toolkit-image">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvh7SO-s0IifnrtdFpWHEx3gwovAkoPI-FIa2FyxKhBhofL9ZD1H2Y9c_wEIlabujIj97Q7wU4AcDudWqghBrb4ULd5cDs0421iUQugfV8K7m678Eu6IUzrmuO0qv9l_Cb8XN5OfggFUThftjOaVxE0Lor2iuW9jt67WIy8c8grIqO5hPoRPmVmK-f7Fk2-jmuNezLtyQsVOSvqH5HWZDR2f_sIo91ktcvQ-HuM-QkpW7raumaIuULqLhyZpEgSxhL4lVF07TEYm0" 
                  alt="AI Metering Design" 
                />
              </div>
            </div>
          </div>

          {/* Simple On-Site EMS */}
          <div className="landing-two-toolkit-item">
            <div className="landing-two-toolkit-content">
              <div className="landing-two-toolkit-text">
                <h3 className="landing-two-toolkit-title">Simple On-Site EMS</h3>
                <p className="landing-two-toolkit-description">
                  A ready-to-use Energy Management System (EMS) designed for the field. Built on professional SCADA principles, it features a streamlined setup process that simplifies the complex task of on-site meter communication, making it easy to capture reliable, real-world energy data. It can be used as a standalone system.
                </p>
                <a href="https://ecoems.com.au" target="_blank" rel="noopener noreferrer" className="landing-two-toolkit-button">
                  ecoems.com.au
                </a>
              </div>
              <div className="landing-two-toolkit-image">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9DFaa7JRJJO83sm4G152vS8ztbKDgELtOjc0nNVJi1KqLWefxsjGP2oXz3xa6PuiQkosxBHX3yOD9RNbIzT0tAOawAurvkTrnjW1Rnr2j6FiysI4-xEd4HSzQXmQue_XgQNln8dwiO58bO-AdzdSTkLx9yHa8jiDTVfbolvBEntHCUpeeneZaX17LdEmF7i3SkfHijfPE7fUHxHQXQMTG3dyDVc1leaLdb5Qx9HFyKKAO3xAMe1LOjZSq2fgT8ddMd8F1wYF-8cY" 
                  alt="Simple On-Site EMS" 
                />
              </div>
            </div>
          </div>

          {/* Clear Cloud Monitoring */}
          <div className="landing-two-toolkit-item">
            <div className="landing-two-toolkit-content">
              <div className="landing-two-toolkit-text">
                <h3 className="landing-two-toolkit-title">Clear Cloud Monitoring</h3>
                <p className="landing-two-toolkit-description">
                  This web-based platform connects to your field data, providing a single, user-friendly dashboard for all stakeholders. It turns complex operational data into clear performance insights.
                </p>
                <a href="https://iot.ecoinsight.com.au" target="_blank" rel="noopener noreferrer" className="landing-two-toolkit-button">
                  iot.ecoinsight.com.au
                </a>
              </div>
              <div className="landing-two-toolkit-image">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKk_MgSabxH8G8CsXAH23Y8lpLkE9qc9qpe4kWutYgiR334XXsQPrdEEkZbTrK6Pm5uyWOerxuoXgRmyg-6HIJabq74SPpb4Du4YZEC7xT6A9TcBiuUdyMm1tlxn3FGRmDKu_f0S-gpyq5EWYPk-HMHSVDZy4kt0faGoi9qwRpwzw53RgWnM3BAkRq1VnLEl5zKdhB31yGc0gJuDWOD_LEa-ZLyogfkxYXCdNWhm298yMqynHYJGn2vnpsjTBs6tmMms2gTRacSv0" 
                  alt="Clear Cloud Monitoring" 
                />
              </div>
            </div>
          </div>

          {/* Vision Section */}
          <h2 className="landing-two-section-title">Vision</h2>
          <p className="landing-two-section-text">
            Our vision is to see our collaboration with industry experts result in open and trusted technologies that move the entire industry forward—from uncertain design predictions to confident, measurable outcomes in building performance and sustainability.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="landing-two-footer">
        <div className="landing-two-footer-content">
          <div className="landing-two-footer-links">
            <a href="#" className="landing-two-footer-link">Privacy Policy</a>
            <a href="#" className="landing-two-footer-link">Terms of Service</a>
          </div>
          <p className="landing-two-footer-copyright">@2024 EcoInsight. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 