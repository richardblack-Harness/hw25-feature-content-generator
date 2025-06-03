// /components/add-template-form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AddTemplateFormProps {
  onAdd: (template: {
    id: string;
    name: string;
    description: string;
    prompt: string;
  }) => void;
  onClose: () => void;
}

export default function AddTemplateForm({ onAdd, onClose }: AddTemplateFormProps) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (!id || !name || !description || !prompt) return;
    onAdd({ id, name, description, prompt });
    onClose();
  };

  return (
    <div className="bg-gray-900 border border-gray-700 p-4 rounded-md mt-6">
      <h3 className="text-xl font-bold mb-4">New Template</h3>
      <Input
        placeholder="Template ID (e.g., marketing)"
        className="mb-3 bg-gray-800 border-gray-700"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <Input
        placeholder="Template Name"
        className="mb-3 bg-gray-800 border-gray-700"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Textarea
        placeholder="Description"
        className="mb-3 bg-gray-800 border-gray-700"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Textarea
        placeholder="Prompt"
        className="mb-3 bg-gray-800 border-gray-700 min-h-[150px]"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Add Template</Button>
      </div>
    </div>
  );
}
