"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { Download, Archive, Trash2Icon, Eye } from "lucide-react"; // Added Eye icon
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
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [currentPreviewContent, setCurrentPreviewContent] = useState<{ name: string; output: string; } | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    const res = await fetch("/api/submissions");
    const data: Submission[] = await res.json();
    data.sort(
      (a: Submission, b: Submission) =>
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
                      <div className="flex items-center"> {/* Wrapper for buttons, gap removed */}
                        <Button 
                          variant="ghost"
                          size="icon" 
                          onClick={() => {
                            setCurrentPreviewContent({ name: file.title, output: file.content });
                            setIsPreviewModalOpen(true);
                          }}
                          title={`Preview ${file.title}`}
                          className="text-gray-400 hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon" 
                          onClick={() => {
                            const blob = new Blob([file.content], { type: "text/markdown;charset=utf-8" });
                            saveAs(blob, file.name);
                          }}
                          title={`Download ${file.name}`}
                          className="text-gray-400 hover:text-white"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {currentPreviewContent && (
        <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
          <DialogContent className="sm:max-w-7xl bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-blue-400">Preview: {currentPreviewContent.name}</DialogTitle>
              <DialogDescription className="text-gray-400">
                Review the generated content below.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 max-h-[60vh] overflow-y-auto p-1 bg-gray-800 rounded-md">
              {/* Apply prose classes to a wrapper div */}
              <div className="prose prose-sm prose-invert max-w-none p-3">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {currentPreviewContent.output}
                </ReactMarkdown>
              </div>
            </div>
            <DialogFooter className="mt-6 sm:justify-end">
              <Button 
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(currentPreviewContent.output);
                    alert("Content copied to clipboard!"); // Or use a toast notification
                  } catch (err) {
                    console.error('Failed to copy: ', err);
                    alert("Failed to copy content.");
                  }
                }}
                className="border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:text-white"
              >
                Copy Content
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="secondary" className="bg-gray-700 hover:bg-gray-600">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}