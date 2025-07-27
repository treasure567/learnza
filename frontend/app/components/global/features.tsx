import { Card } from "../ui";

const features = [
  {
    title: "Interactive Learning System",
    description:
      "Engage with intelligent modules featuring animations, voice support, and sign language integration.",
    icon: "🎓",
  },
  {
    title: "Accessibility for All",
    description:
      "Support for hearing impaired, visually impaired, and neurodiverse learners through AI-powered tools.",
    icon: "♿",
  },
  {
    title: "Blockchain Credentials",
    description:
      "Store and verify your certificates securely on the blockchain, making them tamper-proof and instantly verifiable.",
    icon: "🔐",
  },
  {
    title: "Learn-to-Earn Rewards",
    description:
      "Earn tokens for completing modules and maintaining consistent participation in your learning journey.",
    icon: "💰",
  },
  {
    title: "Cultural Inclusion",
    description:
      "Learn in your preferred language with support for Yoruba, Igbo, Hausa, and other local languages.",
    icon: "🌍",
  },
  {
    title: "Progress Tracking",
    description:
      "Monitor your learning journey with detailed analytics and performance insights.",
    icon: "📊",
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-gradient-to-b from-light to-light-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            Empowering Features
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Our platform combines cutting-edge technology with inclusive design
            to make learning accessible and rewarding for everyone.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index}>
              <div
                className="p-6 space-y-4"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-text">
                  {feature.title}
                </h3>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
