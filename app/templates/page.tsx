"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { templateMeta } from "@/data/icons";
import { cn } from "@/lib/utils";
import { PencilIcon, FileText, Trash2Icon, Plus } from "lucide-react";
import Navbar from "@/components/navbar";

interface TemplateData {
  id: string;
  name: string;
  description: string;
  prompt: string;
  currentPrompt: string;
  isExpanded: boolean;
  isEditing: boolean;
  icon: React.ReactNode;
  color: string;
  isOverridden?: boolean;
}

function generateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const DEFAULT_IDS = [
  "blog",
  "se_handover",
  "tech_doc",
  "announcement",
  "release_notes",
  "newsletter",
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    prompt: "",
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      const res = await fetch("/api/prompts");
      const data = await res.json();
      setTemplates(
        data.map((t: any) => {
          const meta = templateMeta[t.id] ?? {
            icon: FileText,
            color: "bg-gray-500/10 text-gray-500",
          };

          return {
            ...t,
            icon: <meta.icon className="h-6 w-6" />,
            color: meta.color,
            isExpanded: false,
            isEditing: false,
            currentPrompt: t.prompt,
            isOverridden: !!t.updated,
          };
        })
      );
      setLoading(false);
    };

    fetchTemplates();
  }, []);

  const toggleEdit = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, isExpanded: true, isEditing: true } : t
      )
    );
  };

  const cancelEdit = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              isEditing: false,
              isExpanded: false,
              currentPrompt: t.prompt,
            }
          : t
      )
    );
  };

  const savePrompt = async (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (!template) return;

    const updatedPrompt = template.currentPrompt;

    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              prompt: updatedPrompt,
              isEditing: false,
              isExpanded: false,
              isOverridden:
                DEFAULT_IDS.includes(id) && updatedPrompt !== t.prompt,
            }
          : t
      )
    );

    try {
      const res = await fetch(`/api/prompts/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          prompt: updatedPrompt,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
    } catch (err) {
      console.error("❌ Failed to save template:", err);
    }
  };

  const resetPrompt = async (id: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              currentPrompt: t.prompt,
              isOverridden: false,
            }
          : t
      )
    );

    try {
      const res = await fetch(`/api/prompts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to revert");
    } catch (err) {
      console.error("❌ Failed to revert to default:", err);
    }
  };

  const updatePrompt = (id: string, newPrompt: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              currentPrompt: newPrompt,
              isOverridden:
                DEFAULT_IDS.includes(t.id) && newPrompt !== t.prompt,
            }
          : t
      )
    );
  };

  const handleDeleteTemplate = async (id: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this template?"
    );
    if (!confirmDelete) return;

    setDeletingId(id); // 👈 mark as loading

    try {
      const res = await fetch(`/api/prompts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("❌ Failed to delete template:", err);
      alert("Failed to delete. Try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddTemplate = async () => {
    if (isAddingTemplate) return; // 👈 Prevent double-clicks
    const { name, description, prompt } = newTemplate;
    if (!name || !prompt) return;

    const id = generateId(name);

    // 👇 Prevent duplicates
    if (templates.some((t) => t.id === id)) {
      alert("A template with this name already exists.");
      return;
    }

    setIsAddingTemplate(true);

    try {
      await fetch(`/api/prompts/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, prompt }),
      });

      const meta = templateMeta[id] ?? {
        icon: FileText,
        color: "bg-gray-500/10 text-gray-500",
      };

      setTemplates((prev) => [
        ...prev,
        {
          id,
          name,
          description,
          prompt,
          currentPrompt: prompt,
          isExpanded: false,
          isEditing: false,
          icon: <meta.icon className="h-6 w-6" />,
          color: meta.color,
        },
      ]);

      setNewTemplate({ name: "", description: "", prompt: "" });
      setShowAddForm(false);
    } catch (err) {
      console.error("❌ Failed to add template:", err);
    } finally {
      setIsAddingTemplate(false);
    }
  };

  const customTemplates = templates.filter((t) => !DEFAULT_IDS.includes(t.id));
  const defaultTemplates = templates.filter((t) => DEFAULT_IDS.includes(t.id));

  const renderTemplateCard = (template: TemplateData) => {
    const hasChanges = template.currentPrompt !== template.prompt;

    return (
      <Card
        key={template.id}
        className={cn("bg-gray-900 border-gray-800 p-4 rounded-md w-full")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-md ${template.color}`}>
              {template.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{template.name}</h3>
              <p className="text-sm text-gray-400">{template.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!template.isEditing && (
              <Button
                variant="ghost"
                onClick={() => toggleEdit(template.id)}
                title="Edit Template"
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
            )}
            {!DEFAULT_IDS.includes(template.id) && (
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-700"
                onClick={() => handleDeleteTemplate(template.id)}
                title="Delete Template"
                disabled={deletingId === template.id}
              >
                <Trash2Icon
                  className={cn("h-4 w-4", {
                    "animate-pulse": deletingId === template.id,
                  })}
                />
              </Button>
            )}
          </div>
        </div>

        {template.isExpanded && (
          <div className="mt-4 space-y-4">
            <Textarea
              className="bg-gray-800 border-gray-700 min-h-[200px]"
              value={template.currentPrompt}
              onChange={(e) => updatePrompt(template.id, e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              {DEFAULT_IDS.includes(template.id) && hasChanges && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resetPrompt(template.id)}
                >
                  Revert to Default
                </Button>
              )}
              <Button variant="outline" onClick={() => cancelEdit(template.id)}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => savePrompt(template.id)}
              >
                Save Template
              </Button>
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <>
      <Navbar />
      <div className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Prompt Templates</h1>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => setShowAddForm((prev) => !prev)}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Template
          </Button>
        </div>

        {showAddForm && (
          <Card className="bg-gray-900 border-blue-500 border p-4 rounded-md mb-6">
            <div className="space-y-4">
              <input
                placeholder="Name"
                className="w-full bg-gray-800 border-gray-700 p-2 rounded"
                value={newTemplate.name}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, name: e.target.value })
                }
              />
              <input
                placeholder="Description"
                className="w-full bg-gray-800 border-gray-700 p-2 rounded"
                value={newTemplate.description}
                onChange={(e) =>
                  setNewTemplate({
                    ...newTemplate,
                    description: e.target.value,
                  })
                }
              />
              <Textarea
                placeholder="Prompt content"
                className="bg-gray-800 border-gray-700 min-h-[100px]"
                value={newTemplate.prompt}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, prompt: e.target.value })
                }
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewTemplate({ name: "", description: "", prompt: "" });
                    setShowAddForm(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600"
                  onClick={handleAddTemplate}
                  disabled={isAddingTemplate}
                >
                  {isAddingTemplate ? "Saving..." : "Save Template"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-4 mb-10">
          {customTemplates.map(renderTemplateCard)}
        </div>

        {defaultTemplates.length > 0 && (
          <div className="mt-8 border-t-4 border-gray-700 pt-6">
            <h2 className="text-sm text-gray-400 uppercase tracking-widest mb-4">
              Default Templates
            </h2>
            <div className="space-y-4">
              {defaultTemplates.map(renderTemplateCard)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
