"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { Download, Archive } from "lucide-react";

interface Submission {
  id: string;
  feature: {
    name: string;
  };
  timestamp: string;
  generatedOutput: string;
  selectedTemplates: { id: string; name: string }[];
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const res = await fetch("/api/submissions");
      const data = await res.json();
      setSubmissions(data);
    };

    fetchSubmissions();
  }, []);

  const parseGeneratedOutput = (
    output: string,
    templates: Submission["selectedTemplates"],
    featureName: string
  ) => {
    const sections = output.split("---");
    const files: { name: string; content: string; title: string }[] = [];

    sections.forEach((section) => {
      const titleMatch = section.match(/^# (.+)/m);
      const title = titleMatch ? titleMatch[1].trim() : "unknown";
      const template = templates.find((t) =>
        title.toLowerCase().includes(t.name.toLowerCase())
      );
      const templateId = template?.id || "unknown";
      const filename = `${featureName.toLowerCase().replace(/\s+/g, "-")}_${templateId}.md`;
      files.push({
        name: filename,
        content: section.trim(),
        title: template?.name || "unknown",
      });
    });

    return files;
  };

  const handleDownloadAll = async (files: { name: string; content: string }[], zipName: string) => {
    const zip = new JSZip();
    files.forEach((file) => {
      zip.file(file.name, file.content);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, zipName);
  };

  return (
    <>
      <Navbar />
      <div className="container py-10 space-y-6">
        {submissions.map((submission) => {
          const { id, feature, timestamp, generatedOutput, selectedTemplates } = submission;
          const dateStr = format(new Date(timestamp), "MMMM do, yyyy");
          const files = parseGeneratedOutput(generatedOutput, selectedTemplates, feature.name);

          return (
            <Card key={id} className="bg-gray-900 border border-gray-800 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{feature.name}</h2>
                  <p className="text-sm text-gray-400">Submitted on {dateStr}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDownloadAll(
                      files,
                      `${feature.name.toLowerCase().replace(/\s+/g, "-")}-submission.zip`
                    )
                  }
                >
                  <Archive className="w-4 h-4 mr-1" />
                  Download All
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {files.map((file) => (
                  <Card
                    key={file.name}
                    className="bg-gray-800 border border-gray-700 p-4 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-white font-medium">{file.title}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          const blob = new Blob([file.content], { type: "text/markdown;charset=utf-8" });
                          saveAs(blob, file.name);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}