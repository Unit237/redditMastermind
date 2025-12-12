"use client";

import React from 'react';
import { Calendar, Settings, FileText } from 'lucide-react';

type HeaderProps = {
  activeTab: 'setup' | 'calendar';
  setActiveTab: (tab: 'setup' | 'calendar') => void;
};

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <div className="bg-white border-b px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Reddit MasterMind</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'setup'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Setup
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'calendar'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Content Calendar
          </button>
        </div>
      </div>
    </div>
  );
}