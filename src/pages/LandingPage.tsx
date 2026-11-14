// src/pages/LandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  BarChart2,
  Workflow,
  Sparkles,
  Globe,
  Smartphone,
  Mail,
  Megaphone,
  CheckCircle2,
  Database,
  Lock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enterprise Synthetic Data Architecture</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] text-balance">
                Generate Realistic Customer Journeys.{' '}
                <span className="text-indigo-600">Test Smarter.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Create realistic synthetic omnichannel customer data to test personalization models,
                understand customer behaviour, and simulate retail journeys without depending on
                limited real-world customer data.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/register"
                  className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center gap-2"
                >
                  <span>Start Generating</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#features"
                  className="px-6 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Explore Features
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Privacy Compliant & Synthetic</span>
                </div>
                <div className="flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-indigo-600" />
                  <span>Markov Probabilistic Transitions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-sky-600" />
                  <span>Gemini AI Grounded Insights</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Graphic */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden bg-slate-900 group">
                <img
                  src="/src/assets/images/journeysynth_hero_visual_1794498078721.jpg"
                  alt="Omnichannel customer journey simulation visual"
                  className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <p className="text-xs font-mono uppercase tracking-wider text-indigo-300">
                      Multi-Touchpoint Attribution
                    </p>
                    <p className="text-sm font-semibold">Web · Mobile App · Email · Paid Ad Touchpoints</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. About JourneySynth AI */}
      <section id="about" className="py-20 border-b border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              About the Platform
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Bridging the Data Void for Modern Retail Engineering
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              JourneySynth AI produces high-fidelity, interconnected synthetic customer event streams.
              Instead of naive isolated records, each customer exhibits consistent browsing patterns,
              cart interactions, channel switches, and realistic purchase decisions governed by stateful
              Markov probability models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Workflow className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">State-Based Simulation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                13 distinct customer journey states ranging from ad impressions to product revisits,
                cart additions, checkout completions, and drop-off churn.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Ground-Truth Products</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Built-in synthetic retail catalog across 7 key retail categories ensuring realistic SKU,
                brand, and price continuity across customer sessions.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Gemini Intelligence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated qualitative analysis of drop-offs, personalized recommendation suggestions,
                and fictional AI shopper persona synthesis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem We Solve */}
      <section id="problem" className="py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">
                The Core Bottleneck
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Why Real Retail Journey Data Fails Model Validation
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Engineering teams building recommender systems, cart abandonment predictors, and
                omnichannel attribution tools routinely face severe data scarcity during development.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                  <Lock className="w-4 h-4" />
                  <span>Privacy & GDPR Restrictions</span>
                </div>
                <p className="text-xs text-slate-600">
                  Sharing customer PII, raw browsing sessions, and purchase histories creates legal and
                  compliance risk across testing environments.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                  <Database className="w-4 h-4" />
                  <span>Cold Start in New Stores</span>
                </div>
                <p className="text-xs text-slate-600">
                  New retail sites and newly launched apps lack historical log depth required to train
                  and stress-test recommendation models.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <BarChart2 className="w-4 h-4" />
                  <span>Omnichannel Siloing</span>
                </div>
                <p className="text-xs text-slate-600">
                  Ad tracking, email platforms, web analytics, and mobile apps are fragmented, making
                  end-to-end journey stitching difficult.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <Cpu className="w-4 h-4" />
                  <span>Non-Reproducible Datasets</span>
                </div>
                <p className="text-xs text-slate-600">
                  Production data changes constantly, preventing deterministic benchmarking of ML
                  improvements under identical baseline seeds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Key Features */}
      <section id="features" className="py-20 border-b border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Engine Capabilities
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Designed for Data Science & Retail Architecture
            </h2>
            <p className="text-sm text-slate-600">
              Everything required to generate, inspect, analyze, and export synthetic customer journeys.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Markov Probability Simulation',
                desc: 'Configure custom probabilities for cart abandonment, purchase intent, ad clicks, and product revisits.',
                icon: Workflow,
              },
              {
                title: '6 Distinct Shopper Segments',
                desc: 'Simulate high-intent buyers, browsing window-shoppers, cart-abandoners, discount-seekers, and returning customers.',
                icon: Layers,
              },
              {
                title: 'Visual Customer Timeline',
                desc: 'Explore any customer journey as an interactive chronological day-by-day sequence of omnichannel actions.',
                icon: BarChart2,
              },
              {
                title: 'Gemini AI Behavioral Reports',
                desc: 'Generate grounded drop-off audits and optimization recommendations directly from real stored journey metrics.',
                icon: Sparkles,
              },
              {
                title: 'Customer Persona Synthesis',
                desc: 'Transform raw event sequences into rich fictional shopper archetypes for qualitative user research.',
                icon: Cpu,
              },
              {
                title: 'Instant CSV & JSON Export',
                desc: 'Download fully structured event datasets ready for Python, pandas, PyTorch, Scikit-learn, and SQL pipelines.',
                icon: Database,
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{f.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section id="how-it-works" className="py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Workflow
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              How JourneySynth AI Operates
            </h2>
            <p className="text-sm text-slate-600">From configuration to machine learning readiness in seconds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Define Parameters',
                desc: 'Select customer scale (10 to 1,000), omnichannel channels, product categories, and behavioral probabilities.',
              },
              {
                step: '02',
                title: 'Markov Execution',
                desc: 'Our TypeScript Markov engine simulates state transitions, product bindings, and chronological timestamps.',
              },
              {
                step: '03',
                title: 'Relational Persistence',
                desc: 'Customers, multi-day sessions, and itemized interactions are stored transactionally in the database.',
              },
              {
                step: '04',
                title: 'Analyze & Export',
                desc: 'Inspect conversion funnels, query Gemini AI for behavioral explanations, and export CSV/JSON files.',
              },
            ].map((s, i) => (
              <div key={i} className="space-y-3">
                <span className="text-2xl font-black text-indigo-600 font-mono">{s.step}</span>
                <h4 className="text-sm font-bold text-slate-900">{s.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Supported Channels */}
      <section id="channels" className="py-20 border-b border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Omnichannel Touchpoints
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Seamless Cross-Device Customer Simulation
            </h2>
            <p className="text-sm text-slate-600">
              Simulate realistic transitions as customers move across digital channels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Globe className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Website Storefront</h4>
              <p className="text-xs text-slate-500">
                Desktop e-commerce visits, category navigation, multi-item cart management, and checkout flows.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                <Smartphone className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Mobile Application</h4>
              <p className="text-xs text-slate-500">
                Native app sessions with fast revisit patterns, push-driven sessions, and in-app cart additions.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Email Marketing</h4>
              <p className="text-xs text-slate-500">
                Promotional sends, cart-recovery outreach, click-through attribution, and revisit triggers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Megaphone className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Paid Advertisements</h4>
              <p className="text-xs text-slate-500">
                Impression logs, paid search and social clicks, landing page routing, and acquisition cost analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Benefits */}
      <section className="py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Tangible Business Impact
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Accelerate Model Training Without Legal Constraints
              </h2>
            </div>

            <div className="space-y-4">
              {[
                'Safeguard customer privacy: zero PII or real-world consumer exposure.',
                'Deterministic seed configuration allows exact reproducibility for regression benchmarks.',
                'Test edge cases like 90% abandonment spikes or flash-sale demand spikes effortlessly.',
                'Pre-validate recommender algorithms prior to launching new retail storefronts.',
                'Train data science teams with rich, connected multi-session event schemas.',
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-slate-800">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Call to Action */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Generate Realistic Customer Journeys?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Configure custom parameters and synthesize thousands of connected retail journeys in
            seconds.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-lg transition-colors"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="py-8 bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>JourneySynth AI</span>
          </div>
          <p>© {new Date().getFullYear()} JourneySynth AI. Synthetic Omnichannel Journey Platform.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Enterprise SaaS</span>
            <span aria-hidden="true">·</span>
            <span>Markov Chain Simulation</span>
            <span aria-hidden="true">·</span>
            <span>Gemini AI Grounded</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
