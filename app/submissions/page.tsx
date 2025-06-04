"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { Download, Archive, Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  feature: {
    name: string;
  };
  timestamp: string;
  selectedTemplates: {
    id: string;
    name: string;
    generatedOutput?: string;
  }[];
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    const res = await fetch("/api/submissions");
    const data = await res.json();
    data.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setSubmissions(data);
  };

  const parseGeneratedOutput = (
    templates: Submission["selectedTemplates"],
    featureName: string
  ) => {
    return templates
      .filter((t) => !!t.generatedOutput)
      .map((template) => {
        const id = template.id;
        const title =
          template.name ||
          id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        const filename = `${featureName
          .toLowerCase()
          .replace(/\s+/g, "-")}_${id}.md`;

        return {
          name: filename,
          content: template.generatedOutput!.trim(),
          title,
        };
      });
  };

  const handleDownloadAll = async (
    files: { name: string; content: string }[],
    zipName: string
  ) => {
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
      setDeletingId(id);
      await fetch(`/api/submissions/${id}`, {
        method: "DELETE",
      });
      fetchSubmissions();
    } catch (err) {
      console.error("Failed to delete submission:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-10 space-y-6">
        <h1 className="text-3xl font-bold">Feature Content Submissions</h1>
        {submissions.map((submission) => {
          const { id, feature, timestamp, selectedTemplates } = submission;
          const dateStr = format(new Date(timestamp), "MMMM do, yyyy");
          const files = parseGeneratedOutput(selectedTemplates, feature.name);

          return (
            <Card key={id} className="bg-gray-900 border border-gray-800 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{feature.name}</h2>
                  <p className="text-sm text-gray-400">
                    Submitted on {dateStr}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownloadAll(
                        files,
                        `${feature.name
                          .toLowerCase()
                          .replace(/\s+/g, "-")}-submission.zip`
                      )
                    }
                  >
                    <Archive className="w-4 h-4 mr-1" />
                    Download All
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteFiles(id)}
                    title="Delete Submission"
                    disabled={deletingId === id}
                  >
                    <Trash2Icon
                      className={cn("h-4 w-4", {
                        "animate-pulse": deletingId === id,
                      })}
                    />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
                {files.map((file) => (
                  <Card
                    key={file.name}
                    className="bg-gray-800 border border-gray-700 px-3 py-2 flex items-center justify-between h-[50px]"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-white font-medium">
                        {file.title}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          const blob = new Blob([file.content], {
                            type: "text/markdown;charset=utf-8",
                          });
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