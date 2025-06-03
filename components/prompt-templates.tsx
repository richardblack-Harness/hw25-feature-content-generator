"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { templateMeta } from "@/data/icons";
import { FileText, Plus } from "lucide-react";
import type { PromptTemplate } from "@/types/prompt";

interface PromptTemplatesProps {
  selectedTemplates: PromptTemplate[];
  onSelectionChange: (templates: PromptTemplate[]) => void;
}

export default function PromptTemplates({
  selectedTemplates,
  onSelectionChange,
}: PromptTemplatesProps) {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    prompt: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/prompts");
        const data = await res.json();

        const enrichedTemplates = data.map((t: any) => {
          let color = "bg-gray-500/10 text-gray-500";
        
          switch (t.id) {
            case "announcement":
              color = "bg-green-500/10 text-green-500";
              break;
            case "blog":
              color = "bg-blue-500/10 text-blue-500";
              break;
            case "newsletter":
              color = "bg-orange-500/10 text-orange-500";
              break;
            case "release_notes":
              color = "bg-yellow-500/10 text-yellow-500";
              break;
            case "se_handover":
              color = "bg-pink-500/10 text-pink-500";
              break;
            case "tech_doc":
              color = "bg-sky-500/10 text-sky-500";
              break;
          }
        
          const IconComponent = templateMeta[t.id]?.icon ?? FileText;
        
          return {
            ...t,
            icon: <IconComponent className="h-5 w-5" />,
            color,
          };
        });

        setTemplates(enrichedTemplates);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  const handleToggleSelect = (template: PromptTemplate) => {
    const isSelected = selectedTemplates.some((t) => t.id === template.id);
    if (isSelected) {
      onSelectionChange(selectedTemplates.filter((t) => t.id !== template.id));
    } else {
      onSelectionChange([...selectedTemplates, template]);
    }
  };

const handleAddNewTemplate = async () => {
  if (isAddingTemplate) return; // Prevent multiple submissions

  setIsAddingTemplate(true);

  const { name, description, prompt } = newTemplate;
  if (!name || !prompt) {
    setIsAddingTemplate(false);
    return;
  }

  const id = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Check if a template with the same name already exists
  if (templates.some((t) => t.id === id)) {
    alert("A template with this name already exists.");
    setIsAddingTemplate(false);
    return;
  }

  await fetch(`/api/prompts/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description, prompt }),
  });

  const IconComponent = templateMeta[id]?.icon ?? FileText;

  const newEntry: PromptTemplate = {
    id,
    name,
    description,
    icon: <IconComponent className="h-5 w-5" />,
    color: templateMeta[id]?.color ?? "bg-gray-500/10 text-gray-500",
    isCustom: true,
  };

  setTemplates((prev) => [...prev, newEntry]);
  setNewTemplate({ name: "", description: "", prompt: "" });
  setShowAddForm(false);

  setIsAddingTemplate(false); // Reset the flag after completion
};

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Available Templates</h3>
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
                setNewTemplate({ ...newTemplate, description: e.target.value })
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
              <Button className="bg-blue-600" onClick={handleAddNewTemplate}>
                Save Template
              </Button>
            </div>
          </div>
        </Card>
      )}

      <p className="text-sm text-gray-400 mb-4">
        Select templates to add them to your project
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {templates.map((template) => {
          const isSelected = selectedTemplates.some(
            (t) => t.id === template.id
          );
          return (
            <Card
              key={template.id}
              className={`bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer ${
                isSelected ? "ring-2 ring-green-500 border-green-500" : ""
              }`}
              onClick={() => handleToggleSelect(template)}
            >
              <div className="p-4 flex items-start space-x-3">
                <div className={`p-2 rounded-md ${template.color}`}>
                  {template.icon}
                </div>
                <div>
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-gray-400">
                    {template.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
