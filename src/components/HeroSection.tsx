import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mic, Brain, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroBackground from '@/assets/hero-background.jpg';

const HeroSection = () => {
  const { t } = useLanguage();

  // ✅ SAFE: features is now defined
  const features = [
  {
    icon: Mic,
    title: t('hero.feature.voiceTitle', 'Voice-first Screening'),
    desc: t(
      'hero.feature.voiceDesc',
      'Early identification using natural speech patterns.'
    ),
  },
  {
    icon: Brain,
    title: t('hero.feature.aiTitle', 'AI-powered Analysis'),
    desc: t(
      'hero.feature.aiDesc',
      'AI insights to detect learning differences early.'
    ),
  },
  {
    icon: Sparkles,
    title: t('hero.feature.supportTitle', 'Personalized Support'),
    desc: t(
      'hero.feature.supportDesc',
      'Tailored guidance for parents and teachers.'
    ),
  },
];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBackground}
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-secondary/80 to-accent-foreground/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Floating blobs */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-accent/30 blur-xl rounded-full animate-pulse" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-primary/20 blur-2xl rounded-full animate-pulse delay-150" />
        <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-accent-foreground/20 blur-xl rounded-full animate-pulse delay-300" />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
          <span className="text-primary-foreground font-medium tracking-widest text-sm uppercase">
            {t('hero.tagline')}
          </span>
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
          {t('hero.title')}
        </h1>

        <p className="text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto mb-10">
          {t('hero.description')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/learn-more">
            <Button size="lg" className="bg-card text-foreground hover:bg-card/90 group">
              {t('nav.learnMore')}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20"
            onClick={() =>
              document
                .getElementById('role-selection')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <Mic className="mr-2 h-5 w-5" />
            {t('nav.getStarted')}
          </Button>
        </div>

        {/* ✅ Feature Cards (now SAFE) */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="
                bg-purple-900/25
                backdrop-blur-md
                rounded-xl
                p-6
                border border-white/10
                shadow-lg
              "
            >
              <feature.icon className="h-10 w-10 text-white mx-auto mb-4" />

              <h3 className="text-white font-semibold mb-2 text-center">
                {feature.title}
              </h3>

              <p className="text-white/85 text-sm text-center">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
