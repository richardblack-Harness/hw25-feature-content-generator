"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import PromptTemplates from "@/components/prompt-templates";
import type { PromptTemplate } from "@/types/prompt";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import dynamic from "next/dynamic";

const Confetti = dynamic(() => import("react-confetti"), {
  ssr: false,
});

export default function FeatureForm() {
  const [featureName, setFeatureName] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [selectedTemplates, setSelectedTemplates] = useState<PromptTemplate[]>(
    []
  );
  const [contextPrompt, setContextPrompt] = useState("");
  const [keyBenefits, setKeyBenefits] = useState("");
  const [featureFlagEnabled, setFeatureFlagEnabled] = useState(false);
  const [featureFlag, setFeatureFlag] = useState("");
  const [releaseVersion, setReleaseVersion] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [realWorldUseCase, setRealWorldUseCase] = useState("");
  const [competitorResources, setCompetitorResources] = useState("");
  const [demoVideo, setDemoVideo] = useState<File | null>(null);
  const [knownLimitations, setKnownLimitations] = useState("");
  const [generatedContent, setGeneratedContent] = useState<
    { name: string; output: string }[]
  >([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const teamIdRef = useRef<string>(uuidv4());
  const router = useRouter();
  const [isBeta, setIsBeta] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Automatically enable feature flag if Beta is selected
    setFeatureFlagEnabled(isBeta);
  }, [isBeta]);

  const validateInputs = () => {
    const newErrors: { [key: string]: string } = {};

    if (featureFlagEnabled && !featureFlag.trim()) {
      newErrors.featureFlag = "Please provide a feature flag.";
    }
    if (featureFlag && !/^[A-Z_]+$/.test(featureFlag)) {
      newErrors.featureFlag =
        "Feature flag must be in all caps and one word, no spaces.";
    }

    return newErrors;
  };

  const requiredFields = () => {
    for (const template of selectedTemplates) {
      if (
        template.id === "se_handover" &&
        (!realWorldUseCase.trim() || !competitorResources.trim())
      ) {
        throw new Error(
          "SE Handover requires Real World Use Case and Competitor Resources."
        );
      }
    }
  };

  const handleGenerateContent = async () => {
    setGeneratedContent([]);
    const validationErrors = validateInputs();
    if (!featureName || !featureDescription || selectedTemplates.length === 0) {
      alert("Feature Name, Description and a Template are required.");
      return;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    } else {
      setErrors({});
    }

    try {
      requiredFields();
    } catch (err) {
      alert(err);
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureName,
          featureDescription,
          keyBenefits,
          featureFlag: featureFlagEnabled ? featureFlag : "",
          releaseVersion,
          releaseDate,
          realWorldUseCase,
          competitorResources,
          knownLimitations,
          demoVideoName: demoVideo?.name || null,
          contextPrompt,
          templates: selectedTemplates,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate content");

      const enrichedTemplates = selectedTemplates.map((template) => ({
        ...template,
        generatedOutput: data.outputs?.[template.name] || "Missing content",
      }));

      // Create a for loop that iterates over enrichedTemplates
      for (const template of enrichedTemplates) {
        setGeneratedContent((prev) => [...prev, { name: template.name, output: template.generatedOutput }]); // Update the generatedContent state with each template.generatedOutput
      }

      const saveRes = await fetch("/api/save-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature: {
            name: featureName,
            description: featureDescription,
            keyBenefits,
            featureFlag: featureFlagEnabled ? featureFlag : "",
            releaseVersion,
            releaseDate,
            realWorldUseCase,
            competitorResources,
            knownLimitations,
            demoVideoName: demoVideo?.name || null,
          },
          selectedTemplates: enrichedTemplates,
          contextPrompt,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save submission");
      setShowDialog(true);
      setFeatureName("");
      setFeatureDescription("");
      setKeyBenefits("");
      setFeatureFlag("");
      setFeatureFlagEnabled(false);
      setReleaseVersion("");
      setReleaseDate("");
      setRealWorldUseCase("");
      setCompetitorResources("");
      setDemoVideo(null);
      setKnownLimitations("");
      setContextPrompt("");
      setSelectedTemplates([]);
    } catch (err) {
      console.error(err);
      setGeneratedContent([
        { name: "Error", output: "An error occurred. Try again." },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFeedback = (contentId: string, isPositive: boolean) => {
    setFeedbackStatus(prev => ({
      ...prev,
      [contentId]: isPositive
    }));
  };

  return (
    <div className="space-y-8 max-w-screen-xl mx-auto w-full px-4">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">Feature Details</h2>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end md:gap-4">
              <div className="flex-1">
                <Label htmlFor="feature-name">Feature Name *</Label>
                <Input
                  id="feature-name"
                  placeholder="Enter feature name"
                  className="mt-1 bg-gray-800 border-gray-700"
                  value={featureName}
                  onChange={(e) => setFeatureName(e.target.value)}
                  required
                />
              </div>

              <div className="w-full md:w-[100px]">
                <Label htmlFor="is-beta" className="block m-1 text-sm">
                  Beta?
                </Label>
                <div className="relative">
                  <select
                    id="is-beta"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 h-10 appearance-none"
                    value={isBeta ? "yes" : "no"}
                    onChange={(e) => setIsBeta(e.target.value === "yes")}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-white">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="feature-description">Feature Description*</Label>
              <Textarea
                id="feature-description"
                placeholder="Describe the feature and its benefits"
                className="mt-1 bg-gray-800 border-gray-700 min-h-[100px]"
                value={featureDescription}
                onChange={(e) => setFeatureDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="key-benefits">Key Benefits</Label>
              <Textarea
                id="key-benefits"
                placeholder="List the key benefits of this feature"
                className="mt-1 bg-gray-800 border-gray-700 min-h-[80px]"
                value={keyBenefits}
                onChange={(e) => setKeyBenefits(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col justify-end h-full">
                <div className="flex items-center mb-1">
                  <Label htmlFor="feature-flag-toggle" className="mb-0 mr-2">
                    Feature Flag Enabled?
                  </Label>
                  <input
                    type="checkbox"
                    id="feature-flag-toggle"
                    checked={featureFlagEnabled}
                    onChange={() => setFeatureFlagEnabled(!featureFlagEnabled)}
                    className="accent-blue-600"
                    style={{ marginTop: 2 }}
                  />
                </div>
                <Input
                  id="feature-flag"
                  placeholder="Enter feature flag name or ID"
                  className="bg-gray-800 border-gray-700"
                  value={featureFlag}
                  onChange={(e) => setFeatureFlag(e.target.value)}
                  disabled={!featureFlagEnabled}
                />
                {errors.featureFlag && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.featureFlag}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="release-version">Release Version</Label>
                <Input
                  id="release-version"
                  placeholder="e.g. 1.0.0"
                  className="mt-1 bg-gray-800 border-gray-700"
                  value={releaseVersion}
                  onChange={(e) => setReleaseVersion(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="release-date">Release Date</Label>
                <Input
                  id="release-date"
                  type="date"
                  className="mt-1 bg-gray-800 border-gray-700"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="real-world-use-case">Real-world Use Case</Label>
              <Textarea
                id="real-world-use-case"
                placeholder="Describe a real-world scenario where this feature is used"
                className="mt-1 bg-gray-800 border-gray-700 min-h-[80px]"
                value={realWorldUseCase}
                onChange={(e) => setRealWorldUseCase(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="competitor-resources">Competitor Resources</Label>
              <Textarea
                id="competitor-resources"
                placeholder="Links or details about competitor resources"
                className="mt-1 bg-gray-800 border-gray-700 min-h-[80px]"
                value={competitorResources}
                onChange={(e) => setCompetitorResources(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="demo-video">Demo Video</Label>
              <Input
                id="demo-video"
                type="file"
                accept="video/*"
                className="mt-1 bg-gray-800 border-gray-700"
                onChange={(e) => setDemoVideo(e.target.files?.[0] || null)}
              />
              {demoVideo && (
                <p className="text-sm text-gray-400 mt-1">
                  Selected: {demoVideo.name}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="known-limitations">Known Limitations</Label>
              <Textarea
                id="known-limitations"
                placeholder="Describe any known limitations of this feature"
                className="mt-1 bg-gray-800 border-gray-700 min-h-[80px]"
                value={knownLimitations}
                onChange={(e) => setKnownLimitations(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <Tabs defaultValue="templates">
            <TabsContent value="templates">
              <PromptTemplates
                selectedTemplates={selectedTemplates}
                onSelectionChange={setSelectedTemplates}
              />
            </TabsContent>
          </Tabs>
          <div className="mt-6">
            <Label htmlFor="context-prompt">Context Prompt</Label>
            <Textarea
              id="context-prompt"
              placeholder="Add context about the purpose of the generated content (e.g., feature stage, target audience, tone)"
              className="mt-1 bg-gray-800 border-gray-700 min-h-[100px]"
              value={contextPrompt}
              onChange={(e) => setContextPrompt(e.target.value)}
            />
          </div>
          <Button
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
            onClick={handleGenerateContent}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Content"}
          </Button>
        </CardContent>
      </Card>

      {generatedContent.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Generated Content</h2>
            {generatedContent.map((item, index) => {
              const contentId = `${item.name}-${index}`;
              return (
                <div key={contentId} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold">{item.name}</h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleFeedback(contentId, true)}
                        className={`p-2 rounded-full transition-colors ${
                          feedbackStatus[contentId] === true
                            ? "bg-green-600 text-white"
                            : "hover:bg-gray-700"
                        }`}
                        disabled={feedbackStatus[contentId] !== undefined}
                        title="Thumbs Up"
                      >
                        <ThumbsUp className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleFeedback(contentId, false)}
                        className={`p-2 rounded-full transition-colors ${
                          feedbackStatus[contentId] === false
                            ? "bg-red-600 text-white"
                            : "hover:bg-gray-700"
                        }`}
                        disabled={feedbackStatus[contentId] !== undefined}
                        title="Thumbs Down"
                      >
                        <ThumbsDown className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-md whitespace-pre-wrap">
                    {item.output}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Content Generated</DialogTitle>
            <DialogDescription>
              Your content has been saved. What would you like to do next?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Stay Here
            </Button>
            <Button onClick={() => router.push("/submissions")}>
              Go to Submissions
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
