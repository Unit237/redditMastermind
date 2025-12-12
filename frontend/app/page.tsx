"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import SetupForm from '@/components/SetupForm';
import ContentCalendar from '@/components/ContentCalendar';
import { SetupConfig, CalendarOutput } from '@/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'setup' | 'calendar'>('setup');
  const [calendarData, setCalendarData] = useState<CalendarOutput | null>(null);
  const [allWeeks, setAllWeeks] = useState<CalendarOutput[]>([]); // Store all generated weeks
  const [loading, setLoading] = useState(false);
  const [loadingNextWeek, setLoadingNextWeek] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [config, setConfig] = useState<SetupConfig>({
    companyName: "",
    website: "",
    description: "",
    postsPerWeek: 5,
    personas: [
      { 
        username: "",
        name: "",
        background: "",
        attitude: "",
        tone: "",
        style: "" }
    ],
    subreddits: 'PowerPoint\nGoogleSlides\nconsulting\nmarketing\nentrepreneur\nstartups',
    targetQueries: [
      { keyword_id: 'K1', keyword: 'best ai presentation maker' },
      { keyword_id: 'K2', keyword: 'ai slide deck tool' },
      { keyword_id: 'K3', keyword: 'pitch deck generator' },
    ]
  });

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Parse subreddits (remove r/ prefix and split by newlines)
      const subreddits = config.subreddits
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(s => s.replace(/^r\//, ''));

      // Use target queries directly (already in correct format)
      const targetQueries = config.targetQueries
        .filter(q => q.keyword_id && q.keyword.trim().length > 0)
        .map(q => ({
          keyword_id: q.keyword_id.toUpperCase(),
          keyword: q.keyword.trim()
        }));

      // Transform personas to backend format (map name+background to info)
      const personas = config.personas.map(p => ({
        username: p.username,
        info: p.background || p.name || '', // Use background as info, fallback to name
        attitude: p.attitude || undefined,
        tone: p.tone || undefined,
        style: p.style || undefined,
      })).filter(p => p.username && p.info); // Filter out empty personas

      if (personas.length === 0) {
        throw new Error('At least one persona with username and background is required');
      }

      if (subreddits.length === 0) {
        throw new Error('At least one subreddit is required');
      }

      if (targetQueries.length === 0) {
        throw new Error('At least one target query is required. Please add at least one keyword.');
      }

      // Call backend API
      const response = await fetch(`${BACKEND_URL}/api/generate-week`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: {
            name: config.companyName,
            website: config.website || undefined,
            description: config.description,
          },
          personas,
          subreddits,
          targetQueries,
          postsPerWeek: config.postsPerWeek,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Add weekOffset to track this is week 0
      const weekData: CalendarOutput = { ...data, weekOffset: 0 };
      setCalendarData(weekData);
      setAllWeeks([weekData]); // Start with just the first week
      setActiveTab('calendar');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate calendar');
      console.error('Error generating calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNextWeek = async () => {
    setLoadingNextWeek(true);
    setError(null);
    
    try {
      // Validate that config exists (all inputs from initial setup are preserved)
      if (!config.companyName || !config.description) {
        throw new Error('Company information is missing. Please go back to Setup and generate the first week.');
      }

      // Parse subreddits (remove r/ prefix and split by newlines) - uses same input from config
      const subreddits = config.subreddits
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(s => s.replace(/^r\//, ''));

      // Use target queries directly (already in correct format) - uses same input from config
      const targetQueries = config.targetQueries
        .filter(q => q.keyword_id && q.keyword.trim().length > 0)
        .map(q => ({
          keyword_id: q.keyword_id.toUpperCase(),
          keyword: q.keyword.trim()
        }));

      // Transform personas to backend format - uses same input from config
      const personas = config.personas.map(p => ({
        username: p.username,
        info: p.background || p.name || '',
        attitude: p.attitude || undefined,
        tone: p.tone || undefined,
        style: p.style || undefined,
      })).filter(p => p.username && p.info);

      // Validate required inputs are present
      if (personas.length === 0) {
        throw new Error('No valid personas found. Please go back to Setup and configure personas.');
      }

      if (subreddits.length === 0) {
        throw new Error('No subreddits found. Please go back to Setup and configure subreddits.');
      }

      if (targetQueries.length === 0) {
        throw new Error('No target queries found. Please go back to Setup and configure keywords.');
      }

      // Calculate next week offset
      const nextWeekOffset = allWeeks.length; // 0 = first week, 1 = second week, etc.

      // Call backend API with weekOffset
      const response = await fetch(`${BACKEND_URL}/api/generate-week`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: {
            name: config.companyName,
            website: config.website || undefined,
            description: config.description,
          },
          personas,
          subreddits,
          targetQueries,
          postsPerWeek: config.postsPerWeek,
          weekOffset: nextWeekOffset,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const weekData: CalendarOutput = { ...data, weekOffset: nextWeekOffset };
      
      // Add to all weeks
      setAllWeeks([...allWeeks, weekData]);
      // Update current calendar data to show the latest week
      setCalendarData(weekData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate next week');
      console.error('Error generating next week:', err);
    } finally {
      setLoadingNextWeek(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 overflow-auto">
        {activeTab === 'setup' ? (
          <>
            {error && (
              <div className="max-w-5xl mx-auto py-4 px-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  <strong>Error:</strong> {error}
                </div>
              </div>
            )}
            <SetupForm 
              config={config} 
              setConfig={setConfig} 
              onGenerate={handleGenerate}
              loading={loading}
            />
          </>
        ) : (
          <ContentCalendar 
            data={calendarData} 
            allWeeks={allWeeks}
            onGenerateNextWeek={handleGenerateNextWeek}
            loadingNextWeek={loadingNextWeek}
          />
        )}
      </div>
    </div>
  );
}