import { useState } from 'react';

export default function App() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate registration submission
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 text-gray-800">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="text-xl font-bold text-indigo-600">BuildWise</div>
        <div className="space-x-4 hidden md:block">
          <a href="#features" className="hover:text-indigo-600 transition duration-200">Features</a>
          <a href="#how-it-works" className="hover:text-indigo-600 transition duration-200">How It Works</a>
          <a href="#faq" className="hover:text-indigo-600 transition duration-200">FAQ</a>
        </div>
        <button className="md:hidden text-gray-600 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col-reverse md:flex-row items-center gap-12">
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Simplify Building Compliance with Instant NCC Guidance
          </h1>
          <p className="text-lg text-gray-600">
            Ask questions about building requirements and get accurate National Construction Code details instantly.
            Register now for free and be the first to access upcoming AI-powered tools.
          </p>
          <form onSubmit={handleSubmit} className="mt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isSubmitted}
                className={`px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                  isSubmitted ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
              <button
                type="submit"
                disabled={isSubmitted || isLoading}
                className={`px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition ${
                  (isSubmitted || isLoading) ? 'cursor-not-allowed opacity-70' : ''
                }`}
              >
                {isLoading ? 'Registering...' : isSubmitted ? 'Registered!' : 'Register Now for Free'}
              </button>
            </div>
          </form>
          <p className="text-sm text-gray-500 mt-2">
            No cost — just powerful compliance tools at your fingertips.
          </p>
        </div>
        <div className="md:w-1/2">
          <img
            src="https://picsum.photos/id/1019/600/400 "
            alt="Building Compliance Assistant Concept"
            className="rounded-lg shadow-xl object-cover w-full h-auto"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose BuildWise?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard
              title="Instant NCC Guidance"
              description="Ask simple building-related questions and receive immediate, accurate National Construction Code guidelines."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <FeatureCard
              title="AI-Powered Interpretation (Coming Soon)"
              description="Soon you'll be able to upload technical documents and our AI will explain them in plain language."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
            />
            <FeatureCard
              title="Smart Compliance Tools"
              description="Access intuitive tools that streamline your workflow and reduce time spent on regulatory research."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <StepCard number="1" title="Ask a Question" description="Type in any building code query like 'What are the fire rating requirements for external walls?'" />
            <StepCard number="2" title="Get Instant Answers" description="Receive clear, accurate NCC guidelines tailored to your specific question." />
            <StepCard number="3" title="Explore AI Integration" description="Upload technical documents and let our AI explain them in plain language (coming soon)." />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Using BuildWise Today</h2>
          <p className="text-lg mb-6">
            Join thousands of professionals who are already simplifying their compliance process — completely free.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              disabled={isSubmitted}
              className={`px-4 py-3 rounded-md text-gray-800 focus:ring-2 focus:ring-indigo-300 outline-none transition ${
                isSubmitted ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
            <button
              type="submit"
              disabled={isSubmitted || isLoading}
              className={`px-6 py-3 bg-white text-indigo-600 font-semibold rounded-md hover:bg-gray-100 transition ${
                (isSubmitted || isLoading) ? 'cursor-not-allowed opacity-70' : ''
              }`}
            >
              {isLoading ? 'Registering...' : isSubmitted ? 'Thanks for joining!' : 'Register Now for Free'}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 text-center text-sm text-gray-600">
        <p>&copy; 2025 BuildWise. All rights reserved.</p>
        <p className="mt-2">
          <a href="#" className="hover:underline">Privacy Policy</a> | 
          <a href="#" className="hover:underline ml-2">Terms of Service</a>
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, icon }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center transition hover:shadow-lg">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center transition hover:shadow-lg">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 text-lg font-bold mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
