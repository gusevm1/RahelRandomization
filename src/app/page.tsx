'use client';

import { useState, useEffect } from 'react';
import {
  ExperimentData,
  generateExperimentData,
  loadFromFirestore,
  saveToFirestore,
  clearFirestore,
  loadFromLocalStorage,
  addParticipant,
  removeParticipant,
  regenerateParticipant,
} from '@/lib/randomization';
import ExperimentForm from '@/components/ExperimentForm';
import ParticipantCard from '@/components/ParticipantCard';
import ExportButtons from '@/components/ExportButtons';
import SummaryStats from '@/components/SummaryStats';
import ThemeToggle from '@/components/ThemeToggle';
import PasswordGate from '@/components/PasswordGate';

export default function Home() {
  const [experimentData, setExperimentData] = useState<ExperimentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from Firestore on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Try Firestore first
        const firestoreData = await loadFromFirestore();
        if (firestoreData) {
          setExperimentData(firestoreData);
        } else {
          // Fallback to localStorage if Firestore is empty
          const localData = loadFromLocalStorage();
          if (localData) {
            setExperimentData(localData);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to localStorage on error
        const localData = loadFromLocalStorage();
        if (localData) {
          setExperimentData(localData);
        }
      }
      setIsInitialized(true);
    }
    loadData();
  }, []);

  // Save to Firestore whenever data changes
  useEffect(() => {
    if (isInitialized && experimentData) {
      saveToFirestore(experimentData).catch(console.error);
    }
  }, [experimentData, isInitialized]);

  const handleGenerate = (participants: number) => {
    setIsLoading(true);
    setTimeout(() => {
      try {
        const data = generateExperimentData(participants);
        setExperimentData(data);
      } catch (error) {
        console.error('Error generating experiment data:', error);
      } finally {
        setIsLoading(false);
      }
    }, 100);
  };

  const handleClear = async () => {
    try {
      await clearFirestore();
    } catch (error) {
      console.error('Error clearing data:', error);
    }
    setExperimentData(null);
  };

  const handleAddParticipant = () => {
    if (experimentData) {
      const updatedData = addParticipant(experimentData);
      setExperimentData(updatedData);
    }
  };

  const handleRemoveParticipant = (recordId: number) => {
    if (experimentData) {
      const updatedData = removeParticipant(experimentData, recordId);
      setExperimentData(updatedData);
    }
  };

  const handleRegenerateParticipant = (recordId: number) => {
    if (experimentData) {
      const updatedData = regenerateParticipant(experimentData, recordId);
      setExperimentData(updatedData);
    }
  };

  // Show nothing until initialized to prevent hydration mismatch
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <PasswordGate>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-card-foreground">
                  Compressibility Study
                </h1>
                <p className="text-sm text-muted-foreground">
                  Ultrasonographic Validation Experiment
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {experimentData && <ExportButtons data={experimentData} onClear={handleClear} />}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form Section */}
        <section className="mb-8">
          <ExperimentForm
            onGenerate={handleGenerate}
            isLoading={isLoading}
            hasExistingData={experimentData !== null}
          />
        </section>

        {/* Results Section */}
        {experimentData && (
          <>
            {/* Summary Stats */}
            <section className="mb-8">
              <SummaryStats data={experimentData} />
            </section>

            {/* Participants List */}
            <section>
              <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-lg font-semibold text-card-foreground">
                    Participant Randomizations ({experimentData.participants.length})
                  </h2>

                  {/* Add Participant Button */}
                  <button
                    onClick={handleAddParticipant}
                    disabled={experimentData.participants.length >= 50}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm ${
                      experimentData.participants.length >= 50
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {experimentData.participants.length >= 50 ? 'Max 50 Participants' : 'Add Participant'}
                  </button>
                </div>

                {/* Participant Cards */}
                <div className="space-y-4">
                  {experimentData.participants.map((participant) => (
                    <ParticipantCard
                      key={participant.recordId}
                      participant={participant}
                      onRemove={handleRemoveParticipant}
                      onRegenerate={handleRegenerateParticipant}
                    />
                  ))}
                </div>

                {experimentData.participants.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-muted-foreground mb-4">
                      No participants yet.
                    </p>
                    <button
                      onClick={handleAddParticipant}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium text-sm transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add First Participant
                    </button>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* Empty State */}
        {!experimentData && !isLoading && (
          <section className="bg-card rounded-lg shadow-sm border border-border p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Ready to Generate Randomization
              </h3>
              <p className="text-muted-foreground mb-6">
                Enter the number of participants above and click
                &quot;Generate Randomization&quot; to create the experiment assignment.
              </p>
              <div className="bg-muted/30 rounded-lg p-4 text-left text-sm">
                <h4 className="font-medium text-card-foreground mb-2">
                  Experiment Design:
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>3 identical sessions per participant</li>
                  <li>2 modalities: Ultrasound &amp; Palpation</li>
                  <li>2 model types: Ball (4 spheres) &amp; Balloon (4 pressure points)</li>
                  <li>5 repetitions per model (cycle structure)</li>
                  <li>80 measurements per session = 240 total</li>
                </ul>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-muted-foreground">
            Ultrasonographic Compressibility Measurements Validation Study
          </p>
        </div>
      </footer>
    </div>
    </PasswordGate>
  );
}
