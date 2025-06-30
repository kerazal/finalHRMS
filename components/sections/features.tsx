import { Shield, Users, Clock, Star, Home, CreditCard } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Verified Properties",
    description: "All properties are thoroughly verified and inspected for quality and safety.",
  },
  {
    icon: Users,
    title: "Trusted Community",
    description: "Join thousands of satisfied tenants and landlords in our trusted platform.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Round-the-clock customer support to help you with any questions or issues.",
  },
  {
    icon: Star,
    title: "Top Rated",
    description: "Highly rated by users for our exceptional service and user experience.",
  },
  {
    icon: Home,
    title: "Easy Management",
    description: "Streamlined property management tools for landlords and property managers.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Safe and secure payment processing with multiple payment options.",
  },
]

export function Features() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose RentEase?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We provide the best rental experience with cutting-edge features and unmatched service quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                <feature.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
