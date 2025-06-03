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
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    const res = await fetch("/api/submissions");
    const data = await res.json();
    data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setSubmissions(data);
  };

  const parseGeneratedOutput = (
    output: string,
    templates: Submission["selectedTemplates"],
    featureName: string
  ) => {
    const sections = output
      .split(/^#\s+/gm)
      .map((s) => s.trim())
      .filter(Boolean);
  
    const files: { name: string; content: string; title: string }[] = [];
  
    const templateMap = new Map(
      templates.map((t) => [t.name.toLowerCase(), { id: t.id, name: t.name }])
    );
  
    for (const raw of sections) {
      const [titleLine, ...rest] = raw.split("\n");
      const titleText = titleLine.trim();
      const body = rest.join("\n").trim();
  
      let matched = [...templateMap.entries()].find(([key]) =>
        titleText.toLowerCase() === key
      );
  
      if (!matched) {
        matched = [...templateMap.entries()].find(([key]) =>
          titleText.toLowerCase().includes(key)
        );
      }
  
      const templateId = matched?.[1]?.id || `unknown-${Date.now()}`;
      const templateName = matched?.[1]?.name || titleText || "unknown";
  
      const filename = `${featureName.toLowerCase().replace(/\s+/g, "-")}_${templateId}.md`;
  
      files.push({
        name: filename,
        content: `# ${titleText}\n\n${body}`,
        title: templateName,
      });
    }
  
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

  const handleDeleteFiles = async (id: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this submission?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "DELETE",
      });

      fetchSubmissions();      
    } 
    catch (err) {
      console.error("Failed to delete submission:", err);
    }
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
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteFiles(id)}
                >
                  Delete Submission
                </Button>
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