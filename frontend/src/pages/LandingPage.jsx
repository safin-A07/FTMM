import { Link } from 'react-router-dom';
import { FiZap, FiUsers, FiClock, FiMapPin, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

const LandingPage = () => {
    const features = [
        { icon: <FiZap />, title: 'Instant Join', desc: 'One tap to join a match. No more WhatsApp chaos.' },
        { icon: <FiUsers />, title: 'Auto Teams', desc: 'Balanced teams generated automatically. Fair every time.' },
        { icon: <FiClock />, title: 'Live Countdown', desc: 'Real-time match countdown so you\'re never late.' },
        { icon: <FiMapPin />, title: 'Location Aware', desc: 'Find nearby turfs and share your live location.' },
    ];

    const steps = [
        'Register your account',
        'Browse upcoming matches',
        'Join with one click',
        'Get your team assignment',
        'Show up and play!',
    ];

    return (
        <div className="min-h-screen bg-dark-800 overflow-x-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-6 md:px-12 py-5 fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/5">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-display font-bold neon-text">⚽ TURF</span>
                    <span className="text-xl font-display font-bold text-white">MGR</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="text-sm font-semibold bg-[#16A34A] text-black px-4 py-2 rounded-lg hover:bg-[#22C55E] transition-all neon-glow"
                    >
                        Get Started
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
                {/* Background Effect */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#16A34A]/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
                </div>

                <div className="relative text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-[#16A34A]/20 text-sm text-[#16A34A] mb-6">
                        <span className="w-2 h-2 bg-[#16A34A] rounded-full animate-pulse"></span>
                        Replace WhatsApp coordination forever
                    </div>

                    <h1 className="font-display font-bold text-5xl md:text-7xl text-white leading-tight mb-6">
                        GAME<br />
                        <span className="neon-text">ON.</span><br />
                        TONIGHT.
                    </h1>

                    <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
                        The smartest way to organize amateur football matches.
                        Join games, track teams, and coordinate in real-time.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/register"
                            className="flex items-center gap-2 bg-[#16A34A] text-black font-bold text-lg px-8 py-4 rounded-xl neon-glow hover:bg-[#22C55E] transition-all duration-200 w-full sm:w-auto justify-center"
                        >
                            Start Playing Free <FiArrowRight />
                        </Link>
                        <Link
                            to="/login"
                            className="flex items-center gap-2 glass-card border border-white/10 text-white font-semibold text-lg px-8 py-4 rounded-xl hover:border-white/20 transition-all w-full sm:w-auto justify-center"
                        >
                            Sign In
                        </Link>
                    </div>

                    <p className="text-gray-600 text-sm mt-6">Free to use · No credit card required · Mobile-first</p>
                </div>
            </section>

            {/* Features */}
            <section className="px-6 md:px-12 py-20">
                <div className="max-w-5xl mx-auto">
                    <h2 className="font-display font-bold text-3xl md:text-4xl text-center text-white mb-3">
                        Everything you need to run a match
                    </h2>
                    <p className="text-gray-500 text-center mb-12">Built for the pitch, not the office.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {features.map((f, i) => (
                            <div key={i} className="glass-card rounded-2xl p-6 hover:border-[#16A34A]/20 transition-all group">
                                <div className="w-10 h-10 rounded-xl bg-[#16A34A]/10 flex items-center justify-center text-[#16A34A] text-xl mb-4 group-hover:bg-[#16A34A]/20 transition-colors">
                                    {f.icon}
                                </div>
                                <h3 className="font-display font-semibold text-white text-lg mb-2">{f.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="px-6 md:px-12 py-20 bg-dark-700/50">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-10">
                        How it works
                    </h2>
                    <div className="space-y-4 text-left">
                        {steps.map((step, i) => (
                            <div key={i} className="flex items-center gap-4 glass-card rounded-xl p-4">
                                <div className="w-8 h-8 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A] font-bold text-sm shrink-0">
                                    {i + 1}
                                </div>
                                <span className="text-gray-300">{step}</span>
                                <FiCheckCircle className="text-[#16A34A] ml-auto shrink-0" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-20 text-center">
                <div className="max-w-xl mx-auto">
                    <h2 className="font-display font-bold text-4xl text-white mb-4">
                        Ready to <span className="neon-text">play?</span>
                    </h2>
                    <p className="text-gray-500 mb-8">Join thousands of players already on TurfMgr.</p>
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 bg-[#16A34A] text-black font-bold text-lg px-10 py-4 rounded-xl neon-glow hover:bg-[#22C55E] transition-all"
                    >
                        Create Free Account <FiArrowRight />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 px-6 py-8 text-center text-gray-600 text-sm">
                <p>© 2024 TurfMgr · Built by Safin Hossain for the beautiful game</p>
            </footer>
        </div>
    );
};

export default LandingPage;
