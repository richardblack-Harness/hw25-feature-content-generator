"use client";

import { useState, useRef } from "react";
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

export default function FeatureForm() {
  const [featureName, setFeatureName] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [selectedTemplates, setSelectedTemplates] = useState<PromptTemplate[]>([]);
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
  const [generatedContent, setGeneratedContent] = useState<{ name: string; output: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamEmails, setTeamEmails] = useState("");
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const teamIdRef = useRef<string>(uuidv4());

  const validateInputs = () => {
    const errors: { [key: string]: string } = {};
    if (featureFlagEnabled && !featureFlag.trim()) {
      errors.featureFlag = "Please provide a feature flag.";
    }
    if (featureFlag && !/^[A-Z_]+$/.test(featureFlag)) {
      errors.featureFlag = "Feature flag must be in all caps and one word, no spaces.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (teamEmails.trim() && !teamEmails.match(emailRegex)) {
      errors.teamEmails = "Please enter a valid email address.";
    }
    return errors;
  };

  const requiredFields = () => {
    for (const template of selectedTemplates) {
      if (template.id === "se_handover" && (!realWorldUseCase.trim() || !competitorResources.trim())) {
        throw new Error("SE Handover requires Real World Use Case and Competitor Resources.");
      }
    }
  };

  const handleGenerateContent = async () => {
    if (!featureName || !featureDescription || selectedTemplates.length === 0) {
      alert("Feature Name, Description and a Template are required.");
      return;
    }

    const errors = validateInputs();
    if (Object.keys(errors).length > 0) {
      alert(Object.values(errors).join("\n"));
      return;
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

      const saveRes = await fetch("/api/save-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team: {
            id: teamIdRef.current,
            name: teamName,
            emails: teamEmails.split(",").map((e) => e.trim()),
          },
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
      setTeamName("");
      setTeamEmails("");
      setGeneratedContent([]);
    } catch (err) {
      console.error(err);
      setGeneratedContent([{ name: "Error", output: "An error occurred. Try again." }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-screen-xl mx-auto w-full px-4">
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">Team Details</h2>
          <div className="space-y-6">
            <div>
              <Label htmlFor="team-name">Team Name</Label>
              <Input id="team-name" placeholder="e.g. DevRel Team" className="mt-1 bg-gray-800 border-gray-700" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="team-emails">Team Emails</Label>
              <Textarea id="team-emails" placeholder="Comma-separated email addresses" className="mt-1 bg-gray-800 border-gray-700 min-h-[60px]" value={teamEmails} onChange={(e) => setTeamEmails(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">Feature Details</h2>
          <div className="space-y-6">
            <div>
              <Label htmlFor="feature-name">Feature Name *</Label>
              <Input id="feature-name" placeholder="Enter feature name" className="mt-1 bg-gray-800 border-gray-700" value={featureName} onChange={(e) => setFeatureName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="feature-description">Feature Description*</Label>
              <Textarea id="feature-description" placeholder="Describe the feature and its benefits" className="mt-1 bg-gray-800 border-gray-700 min-h-[100px]" value={featureDescription} onChange={(e) => setFeatureDescription(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="key-benefits">Key Benefits</Label>
              <Textarea id="key-benefits" placeholder="List the key benefits of this feature" className="mt-1 bg-gray-800 border-gray-700 min-h-[80px]" value={keyBenefits} onChange={(e) => setKeyBenefits(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col justify-end h-full">
                <div className="flex items-center mb-1">
                  <Label htmlFor="feature-flag-toggle" className="mb-0 mr-2">Feature Flag Enabled?</Label>
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
              </div>
              <div>
                <Label htmlFor="release-version">Release Version</Label>
                <Input id="release-version" placeholder="e.g. 1.0.0" className="mt-1 bg-gray-800 border-gray-700" value={releaseVersion} onChange={(e) => setReleaseVersion(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="release-date">Release Date</Label>
                <Input id="release-date" type="date" className="mt-1 bg-gray-800 border-gray-700" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="real-world-use-case">Real-world Use Case</Label>
              <Textarea id="real-world-use-case" placeholder="Describe a real-world scenario where this feature is used" className="mt-1 bg-gray-800 border-gray-700 min-h-[80px]" value={realWorldUseCase} onChange={(e) => setRealWorldUseCase(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="competitor-resources">Competitor Resources</Label>
              <Textarea id="competitor-resources" placeholder="Links or details about competitor resources" className="mt-1 bg-gray-800 border-gray-700 min-h-[80px]" value={competitorResources} onChange={(e) => setCompetitorResources(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="demo-video">Demo Video</Label>
              <Input id="demo-video" type="file" accept="video/*" className="mt-1 bg-gray-800 border-gray-700" onChange={(e) => setDemoVideo(e.target.files?.[0] || null)} />
              {demoVideo && <p className="text-sm text-gray-400 mt-1">Selected: {demoVideo.name}</p>}
            </div>
            <div>
              <Label htmlFor="known-limitations">Known Limitations</Label>
              <Textarea id="known-limitations" placeholder="Describe any known limitations of this feature" className="mt-1 bg-gray-800 border-gray-700 min-h-[80px]" value={knownLimitations} onChange={(e) => setKnownLimitations(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <Tabs defaultValue="templates">
            <TabsContent value="templates">
              <PromptTemplates selectedTemplates={selectedTemplates} onSelectionChange={setSelectedTemplates} />
            </TabsContent>
          </Tabs>
          <div className="mt-6">
            <Label htmlFor="context-prompt">Context Prompt</Label>
            <Textarea id="context-prompt" placeholder="Add context about the purpose of the generated content (e.g., feature stage, target audience, tone)" className="mt-1 bg-gray-800 border-gray-700 min-h-[100px]" value={contextPrompt} onChange={(e) => setContextPrompt(e.target.value)} />
          </div>
          <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700" onClick={handleGenerateContent} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Content"}
          </Button>
        </CardContent>
      </Card>

      {generatedContent.length > 0 && ( // Check if there's actually content
  <Card className="bg-gray-900 border-gray-800 lg:col-span-2">
    <CardContent className="p-6">
      <h2 className="text-2xl font-bold mb-4">Generated Content</h2>
      {generatedContent.map((item, index) => (
        <div key={index} className="mb-6"> {/* Add a key for each item in the list */}
          <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
          <div className="bg-gray-800 p-4 rounded-md whitespace-pre-wrap">
            {item.output}
          </div>
        </div>
      ))}
      <div className="flex justify-end mt-4">
        {/* Your Copy and Save buttons can remain here, or you might want them per item */}
        <Button variant="outline" className="mr-2">Copy All</Button> {/* Example */}
        <Button className="bg-blue-600 hover:bg-blue-700">Save All</Button> {/* Example */}
      </div>
    </CardContent>
  </Card>
)}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Content Generated</DialogTitle>
            <DialogDescription>Your content has been saved. What would you like to do next?</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Stay Here</Button>
            <Button onClick={() => router.push("/submissions")}>Go to Submissions</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
