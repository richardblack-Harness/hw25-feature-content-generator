import FeatureForm from "@/components/feature-form"
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar/>
      <div className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center">
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
          <img src="/Canary.png" alt="Our-lucky-purple-shirt-canary" width={200} height={200} className="text-blue-500"/>
          <div className="flex flex-col w-full md:w-auto items-center justify-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4">Feature Content Generator</h1>
            <p className="text-lg text-center text-gray-400 max-w-3xl">
              Create compelling content for upcoming Harness features using AI-powered templates
            </p>
          </div>
        </div>
        <FeatureForm />
      </div>
    </main>
  )
}
