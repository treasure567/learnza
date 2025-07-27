import { Button } from "../ui";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8" data-aos="fade-right">
            <h1 className="text-4xl md:text-6xl font-bold text-text">
              <span className="text-primary">Inclusive</span> Learning for{" "}
              <span className="text-accent">Everyone</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
              Experience the future of education with our blockchain-powered
              platform. Learn, earn, and secure your credentials - all in one
              place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="default" size="lg">
                Start Learning
              </Button>
              <Button variant="secondary" size="lg">
                Learn More
              </Button>
            </div>
            <div className="flex items-center gap-8 text-text-secondary">
              <div>
                <h4 className="text-2xl font-bold text-primary">10K+</h4>
                <p>Active Learners</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-accent">50+</h4>
                <p>Courses</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-secondary">100%</h4>
                <p>Accessible</p>
              </div>
            </div>
          </div>

          <div className="relative" data-aos="fade-left">
            <div className="relative aspect-square max-w-[500px] mx-auto">
              <Image
                src="/images/hero-illustration.svg"
                alt="Inclusive Learning Illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
            {/* Feature Highlights */}
            <div
              className="absolute -right-4 top-1/4 bg-light p-4 rounded-xl shadow-lg"
              data-aos="fade-left"
              data-aos-delay="200"
            >
              <p className="text-text font-medium">Sign Language Support</p>
            </div>
            <div
              className="absolute -left-4 top-2/3 bg-light p-4 rounded-xl shadow-lg"
              data-aos="fade-right"
              data-aos-delay="300"
            >
              <p className="text-text font-medium">Voice Interaction</p>
            </div>
            <div
              className="absolute right-8 bottom-0 bg-light p-4 rounded-xl shadow-lg"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <p className="text-text font-medium">Blockchain Credentials</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
