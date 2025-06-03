import FeatureForm from "@/components/feature-form"
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar/>
      <div className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mt-8 mb-4">Feature Content Generator</h1>
        <p className="text-lg text-center text-gray-400 mb-12 max-w-3xl mx-auto">
          Create compelling content for upcoming Harness features using AI-powered templates
        </p>
        <FeatureForm />
      </div>
    </main>
  )
}
