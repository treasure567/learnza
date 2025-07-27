"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { Button } from "./components/ui";

// Floating 3D Elements Component
function FloatingElements() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 bg-gradient-to-r from-primary via-secondary to-accent rounded-full opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 100 - 50, 0],
            scale: [1, 1.5, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Holographic Card Component
function HolographicCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: 45 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay }}
      whileHover={{
        scale: 1.05,
        rotateY: 5,
        boxShadow: "0 30px 60px rgba(42, 157, 143, 0.3)",
      }}
      className={`relative bg-gradient-to-br from-light/10 to-light/5 backdrop-blur-xl border border-primary/20 rounded-3xl p-8 
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/20 before:via-secondary/20 before:to-accent/20 
        before:opacity-0 before:transition-opacity before:duration-500 before:rounded-3xl
        hover:before:opacity-100 overflow-hidden ${className}`}
      style={{
        background:
          "linear-gradient(135deg, rgba(241, 250, 238, 0.1) 0%, rgba(42, 157, 143, 0.05) 100%)",
        boxShadow:
          "0 8px 32px rgba(42, 157, 143, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Holographic shine effect */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
        transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
      />
      {children}
    </motion.div>
  );
}

// Neural Network Background
function NeuralNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const nodes = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }));

    function animate() {
      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x >= canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y >= canvas.height) node.vy *= -1;

        // Draw connections
        nodes.slice(i + 1).forEach((otherNode) => {
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx?.strokeStyle = `rgba(42, 157, 143, ${0.3 - distance / 500})`;
            ctx?.lineWidth = 1;
            ctx?.beginPath();
            ctx?.moveTo(node.x, node.y);
            ctx?.lineTo(otherNode.x, otherNode.y);
            ctx?.stroke();
          }
        });

        // Draw node
        ctx?.fillStyle = "rgba(42, 157, 143, 0.6)";
        ctx?.beginPath();
        ctx?.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx?.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-30"
    />
  );
}

// Hero Section with 3D Effects
function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <motion.section
      ref={containerRef}
      style={{ y, opacity, scale }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Dynamic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark via-primary/20 to-secondary/30" />

      {/* Animated geometric shapes */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 200 + 50}px`,
              height: `${Math.random() * 200 + 50}px`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="w-full h-full bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-sm" />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="space-y-6"
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none">
              <span
                className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent
                drop-shadow-2xl animate-pulse"
              >
                IILCB
              </span>
              <span className="block text-4xl md:text-6xl lg:text-7xl text-light mt-4 font-light tracking-wider">
                The Future of Learning
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-xl md:text-2xl text-light/80 max-w-4xl mx-auto leading-relaxed"
            >
              Experience revolutionary{" "}
              <span className="text-accent font-semibold">
                blockchain-powered education
              </span>{" "}
              with
              <span className="text-secondary font-semibold">
                {" "}
                AI-driven accessibility
              </span>
              ,
              <span className="text-primary font-semibold">
                {" "}
                cultural inclusion
              </span>
              , and
              <span className="text-accent font-semibold">
                {" "}
                learn-to-earn rewards
              </span>
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <Button
              variant="primary"
              size="lg"
              className="text-xl px-12 py-6 bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary
                transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-accent/50"
            >
              🚀 Start Learning Now
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="text-xl px-12 py-6 bg-gradient-to-r from-secondary/90 to-secondary hover:from-secondary hover:to-secondary/80
                transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-secondary/50"
            >
              🎓 Explore Courses
            </Button>
          </motion.div>

          {/* Stats with glow effects */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16 max-w-6xl mx-auto"
          >
            {[
              { number: "50K+", label: "Active Learners", icon: "👥" },
              { number: "200+", label: "Courses", icon: "📚" },
              { number: "100%", label: "Accessible", icon: "♿" },
              { number: "24/7", label: "AI Support", icon: "🤖" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.1, rotateY: 10 }}
                className="text-center group"
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent
                  group-hover:drop-shadow-glow transition-all duration-300"
                >
                  {stat.number}
                </div>
                <div className="text-light/70 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

// Features with Impossible Layouts
function FeaturesSection() {
  const features = [
    {
      title: "🎯 AI-Powered Accessibility",
      description:
        "Revolutionary computer vision and NLP that adapts to hearing, visual, and cognitive differences",
      icon: "🤖",
      color: "from-primary to-primary-300",
    },
    {
      title: "🔗 Blockchain Credentials",
      description:
        "Tamper-proof certificates stored on-chain with instant employer verification",
      icon: "⛓️",
      color: "from-accent to-accent-300",
    },
    {
      title: "💰 Learn-to-Earn Economy",
      description:
        "Earn cryptocurrency for completing modules, maintaining streaks, and community participation",
      icon: "💎",
      color: "from-secondary to-secondary-300",
    },
    {
      title: "🌍 Cultural Inclusion",
      description:
        "Native support for Yoruba, Igbo, Hausa, sign language, and cultural learning contexts",
      icon: "🗣️",
      color: "from-primary-300 to-accent-200",
    },
    {
      title: "🎮 Gamified Learning",
      description:
        "Interactive 3D modules with voice, animation, and gesture-based learning experiences",
      icon: "🎯",
      color: "from-accent-200 to-secondary-200",
    },
    {
      title: "📊 Progress Analytics",
      description:
        "AI-driven insights for learners, sponsors, and educators with automated micro-grants",
      icon: "📈",
      color: "from-secondary-300 to-primary-200",
    },
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background with moving gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-light via-light-200 to-light-100" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            <span className="bg-gradient-to-r from-dark via-primary to-accent bg-clip-text text-transparent">
              Impossible Features
            </span>
          </h2>
          <p className="text-2xl text-text-secondary max-w-4xl mx-auto leading-relaxed">
            Pushing the boundaries of what's possible in educational technology
          </p>
        </motion.div>

        {/* Asymmetric grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const layouts = [
              "lg:col-span-8", // Large card
              "lg:col-span-4", // Small card
              "lg:col-span-6", // Medium card
              "lg:col-span-6", // Medium card
              "lg:col-span-4", // Small card
              "lg:col-span-8", // Large card
            ];

            return (
              <HolographicCard
                key={index}
                delay={index * 0.2}
                className={`${layouts[index]} ${
                  index % 2 === 0 ? "lg:row-span-2" : ""
                } group`}
              >
                <div className="space-y-6">
                  <div
                    className={`text-6xl ${
                      index === 0 ? "md:text-8xl" : "md:text-7xl"
                    }`}
                  >
                    {feature.icon}
                  </div>

                  <h3
                    className={`font-bold text-text ${
                      index === 0
                        ? "text-3xl md:text-4xl"
                        : "text-xl md:text-2xl"
                    }`}
                  >
                    {feature.title}
                  </h3>

                  <p
                    className={`text-text-secondary leading-relaxed ${
                      index === 0 ? "text-lg md:text-xl" : "text-base"
                    }`}
                  >
                    {feature.description}
                  </p>

                  {/* Glowing button for larger cards */}
                  {(index === 0 || index === 5) && (
                    <Button
                      variant="primary"
                      className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary
                        transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/50"
                    >
                      Learn More →
                    </Button>
                  )}
                </div>

                {/* Dynamic background elements */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 rounded-3xl 
                  group-hover:opacity-10 transition-opacity duration-500`}
                />
              </HolographicCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Interactive Demo Section
function DemoSection() {
  const [activeDemo, setActiveDemo] = useState(0);

  const demos = [
    {
      title: "🎤 Voice Learning Interface",
      description:
        "Experience hands-free learning with advanced speech recognition",
      visual: "🎵",
    },
    {
      title: "👋 Sign Language Recognition",
      description:
        "AI-powered camera that understands and responds to sign language",
      visual: "👋",
    },
    {
      title: "🏆 Blockchain Certificates",
      description: "Watch your achievements get minted as NFTs in real-time",
      visual: "🏆",
    },
    {
      title: "💰 Token Rewards",
      description:
        "Earn cryptocurrency for every completed lesson and milestone",
      visual: "💰",
    },
  ];

  return (
    <section className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark-200 to-dark" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-black text-light mb-8">
            Interactive <span className="text-accent">Demo</span>
          </h2>
          <p className="text-xl text-light/80 max-w-3xl mx-auto">
            Experience the future of inclusive learning technology
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          {/* Demo Controls */}
          <div className="space-y-6">
            {demos.map((demo, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveDemo(index)}
                whileHover={{ scale: 1.02, x: 10 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${
                  activeDemo === index
                    ? "bg-gradient-to-r from-primary/20 to-accent/20 border-primary shadow-lg shadow-primary/20"
                    : "bg-light/5 border-light/20 hover:border-primary/50"
                }`}
              >
                <h3 className="text-xl font-bold text-light mb-2">
                  {demo.title}
                </h3>
                <p className="text-light/70">{demo.description}</p>
              </motion.button>
            ))}
          </div>

          {/* Demo Visual */}
          <motion.div
            key={activeDemo}
            initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8 }}
            className="relative aspect-square max-w-md mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-3xl blur-xl" />
            <div
              className="relative bg-gradient-to-br from-light/10 to-light/5 backdrop-blur-xl 
              border border-primary/30 rounded-3xl p-12 flex items-center justify-center
              shadow-2xl shadow-primary/20"
            >
              <div className="text-9xl animate-bounce">
                {demos[activeDemo].visual}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Stats with Floating Elements
function StatsSection() {
  const stats = [
    {
      number: "1M+",
      label: "Lines of Code",
      subtext: "AI-powered accessibility engine",
    },
    {
      number: "99.9%",
      label: "Uptime",
      subtext: "Blockchain infrastructure reliability",
    },
    {
      number: "150+",
      label: "Countries",
      subtext: "Global accessibility reach",
    },
    {
      number: "$2M+",
      label: "Earned",
      subtext: "Total learner rewards distributed",
    },
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-light-100 to-light" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 100, rotateX: 90 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{
                scale: 1.05,
                rotateY: 10,
                boxShadow: "0 20px 40px rgba(42, 157, 143, 0.2)",
              }}
              className="text-center group cursor-pointer"
            >
              <div
                className="relative bg-gradient-to-br from-light to-light-200 rounded-3xl p-8 
                border border-primary/10 hover:border-primary/30 transition-all duration-500
                shadow-lg hover:shadow-2xl hover:shadow-primary/10"
              >
                {/* Floating icon */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-4xl mb-4"
                >
                  {index === 0 && "⚡"}
                  {index === 1 && "🛡️"}
                  {index === 2 && "🌍"}
                  {index === 3 && "💎"}
                </motion.div>

                <div
                  className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary to-accent 
                  bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300"
                >
                  {stat.number}
                </div>

                <div className="text-xl font-semibold text-text mb-2">
                  {stat.label}
                </div>

                <div className="text-sm text-text-secondary">
                  {stat.subtext}
                </div>

                {/* Glowing background */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Call to Action with Futuristic Elements
function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-dark via-primary/30 to-accent/20" />

      {/* Animated particles */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-light rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-center max-w-5xl mx-auto"
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-light mb-8 leading-none">
            Ready to Change
            <span className="block bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
              Everything?
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-light/80 mb-12 leading-relaxed">
            Join the revolution in inclusive education. Start learning, earning,
            and building your future today.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-16">
            <Button
              variant="primary"
              size="lg"
              className="text-xl px-16 py-8 bg-gradient-to-r from-secondary to-accent hover:from-accent hover:to-secondary
                transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-secondary/50
                border border-secondary/50 hover:border-accent/50"
            >
              🚀 Launch Your Journey
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="text-xl px-16 py-8 bg-light/10 hover:bg-light/20 text-light border border-light/30
                transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-light/20"
            >
              📚 Browse Courses
            </Button>
          </div>

          {/* Final stats row */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-light"
          >
            <div>
              <div className="text-3xl font-bold text-secondary mb-2">
                🎓 Learn
              </div>
              <div className="text-light/70">Accessible for everyone</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                💰 Earn
              </div>
              <div className="text-light/70">Cryptocurrency rewards</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">
                🔐 Secure
              </div>
              <div className="text-light/70">Blockchain credentials</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Main Page Component
export default function Page() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Background Effects */}
      <NeuralNetwork />
      <FloatingElements />

      {/* Sections */}
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <StatsSection />
      <CTASection />

      {/* Custom styles for glow effects */}
      <style jsx global>{`
        .drop-shadow-glow {
          filter: drop-shadow(0 0 20px rgba(42, 157, 143, 0.8));
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float:nth-child(even) {
          animation-delay: 3s;
        }
      `}</style>
    </main>
  );
}
