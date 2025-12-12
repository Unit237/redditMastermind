"use client";

import React from "react";
import { FileText, Users, Hash, TrendingUp } from "lucide-react";
import { SetupConfig, Persona, TargetQuery } from "@/types";

type SetupFormProps = {
  config: SetupConfig;
  setConfig: (config: SetupConfig) => void;
  onGenerate: () => void;
  loading?: boolean;
};

export default function SetupForm({
  config,
  setConfig,
  onGenerate,
  loading = false,
}: SetupFormProps) {
  const addPersona = () => {
    setConfig({
      ...config,
      personas: [
        ...config.personas,
        {
          username: "",
          name: "",
          background: "",
          attitude: "",
          tone: "",
          style: "",
        },
      ],
    });
  };

  const removePersona = (index: number) => {
    if (config.personas.length > 1) {
      setConfig({
        ...config,
        personas: config.personas.filter((_, i) => i !== index),
      });
    }
  };

  const updatePersona = (
    index: number,
    field: keyof Persona,
    value: string
  ) => {
    const updated = [...config.personas];
    updated[index] = { ...updated[index], [field]: value };
    setConfig({ ...config, personas: updated });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 space-y-6">

    {/* Company Info */}
<div className="bg-white rounded-lg border shadow-sm p-6">
  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
    <FileText className="w-5 h-5 text-orange-500" />
    Company Information
  </h2>

  <div className="space-y-4">
    {/* Name + Website */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Name
        </label>
        <input
          value={config.companyName}
          onChange={(e) =>
            setConfig({ ...config, companyName: e.target.value })
          }
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Website
        </label>
        <input
          value={config.website}
          onChange={(e) =>
            setConfig({ ...config, website: e.target.value })
          }
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>
    </div>

    {/* Description */}
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700">
        Description
      </label>
      <textarea
        value={config.description}
        onChange={(e) =>
          setConfig({ ...config, description: e.target.value })
        }
        rows={4}
        className="w-full border rounded px-3 py-2 text-sm"
      />
    </div>

    {/* Posts per week */}
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700">
        Posts per week
      </label>
      <input
        type="number"
        min={1}
        max={20}
        value={config.postsPerWeek}
        onChange={(e) =>
          setConfig({
            ...config,
            postsPerWeek: parseInt(e.target.value) || 1,
          })
        }
        className="w-24 border rounded px-3 py-2 text-sm"
      />
    </div>
  </div>
</div>


      {/* Personas */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            Personas
          </h2>

          <button
            onClick={addPersona}
            className="text-sm text-orange-500 hover:text-orange-600 font-medium"
          >
            + Add Persona
          </button>
        </div>

        {config.personas.length < 2 && (
          <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-md mb-4 border border-yellow-200">
            <strong>Note:</strong> You need at least 2 personas to generate comments (one to post, others to reply).
          </div>
        )}

        <div className="space-y-4">
          {config.personas.map((persona, idx) => (
            <div key={idx} className="bg-gray-50 border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold">
                  Persona {idx + 1}
                </h3>

                {config.personas.length > 1 && (
                  <button
                    onClick={() => removePersona(idx)}
                    className="text-xs text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <input
                  placeholder="Username *"
                  value={persona.username}
                  onChange={(e) =>
                    updatePersona(idx, "username", e.target.value)
                  }
                  className="w-full border rounded px-3 py-2 text-sm"
                />

                <input
                  placeholder="Name *"
                  value={persona.name}
                  onChange={(e) =>
                    updatePersona(idx, "name", e.target.value)
                  }
                  className="w-full border rounded px-3 py-2 text-sm"
                />

                <textarea
                  placeholder="Background *"
                  value={persona.background}
                  onChange={(e) =>
                    updatePersona(idx, "background", e.target.value)
                  }
                  rows={2}
                  className="w-full border rounded px-3 py-2 text-sm"
                />

                <div className="grid grid-cols-3 gap-3">
                  <input
                    placeholder="Attitude (optional)"
                    value={persona.attitude || ""}
                    onChange={(e) =>
                      updatePersona(idx, "attitude", e.target.value)
                    }
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <input
                    placeholder="Tone (optional)"
                    value={persona.tone || ""}
                    onChange={(e) =>
                      updatePersona(idx, "tone", e.target.value)
                    }
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <input
                    placeholder="Style (optional)"
                    value={persona.style || ""}
                    onChange={(e) =>
                      updatePersona(idx, "style", e.target.value)
                    }
                    className="border rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subreddits */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Hash className="w-5 h-5 text-orange-500" />
          Subreddits
        </h2>

        <textarea
          value={config.subreddits}
          onChange={(e) =>
            setConfig({ ...config, subreddits: e.target.value })
          }
          rows={6}
          className="w-full border rounded px-3 py-2 text-sm font-mono"
        />
      </div>

      {/* Target Queries */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            ChatGPT Queries to Target
          </h2>
          <button
            onClick={() => {
              const nextId = `K${config.targetQueries.length + 1}`;
              setConfig({
                ...config,
                targetQueries: [
                  ...config.targetQueries,
                  { keyword_id: nextId, keyword: "" },
                ],
              });
            }}
            className="text-sm text-orange-500 hover:text-orange-600 font-medium"
          >
            + Add Keyword
          </button>
        </div>

        <div className="space-y-3">
          {config.targetQueries.map((query, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-16">
                <input
                  value={query.keyword_id}
                  onChange={(e) => {
                    const updated = [...config.targetQueries];
                    updated[idx] = { ...updated[idx], keyword_id: e.target.value.toUpperCase() };
                    setConfig({ ...config, targetQueries: updated });
                  }}
                  className="w-full border rounded px-2 py-2 text-sm font-mono text-center bg-gray-50"
                  placeholder="K1"
                />
              </div>
              <div className="flex-1">
                <input
                  value={query.keyword}
                  onChange={(e) => {
                    const updated = [...config.targetQueries];
                    updated[idx] = { ...updated[idx], keyword: e.target.value };
                    setConfig({ ...config, targetQueries: updated });
                  }}
                  placeholder="Enter keyword phrase..."
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              {config.targetQueries.length > 1 && (
                <button
                  onClick={() => {
                    const updated = config.targetQueries.filter((_, i) => i !== idx);
                    // Re-number remaining queries
                    const renumbered = updated.map((q, i) => ({
                      ...q,
                      keyword_id: `K${i + 1}`,
                    }));
                    setConfig({ ...config, targetQueries: renumbered });
                  }}
                  className="text-xs text-red-500 hover:text-red-600 px-2 py-1"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg"
      >
        {loading ? 'Generating Calendar...' : 'Generate Content Calendar'}
      </button>
    </div>
  );
}
