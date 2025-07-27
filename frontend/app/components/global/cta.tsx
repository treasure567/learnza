import { Button } from "../ui";

export default function CTA() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="bg-dark rounded-3xl overflow-hidden">
          <div className="p-8 md:p-16 text-center" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-light mb-6">
              Start Your Learning Journey Today
            </h2>
            <p className="text-light/80 text-lg max-w-2xl mx-auto mb-8">
              Join thousands of learners who are already benefiting from our
              inclusive, blockchain-powered educational platform. Start
              learning, earning, and growing with us.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="lg">
                Get Started Now
              </Button>
              <Button variant="secondary" size="lg">
                View Courses
              </Button>
            </div>
            <div className="mt-12 grid md:grid-cols-3 gap-8 text-light">
              <div>
                <h4 className="text-2xl font-bold text-accent mb-2">
                  Secure Credentials
                </h4>
                <p className="text-light/70">
                  Your certificates stored safely on blockchain
                </p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-secondary mb-2">
                  Learn & Earn
                </h4>
                <p className="text-light/70">
                  Get rewarded for your learning progress
                </p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-primary mb-2">
                  Inclusive Learning
                </h4>
                <p className="text-light/70">
                  Accessible to everyone, everywhere
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
