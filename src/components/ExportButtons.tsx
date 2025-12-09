'use client';

import { ExperimentData, exportToJSON, flattenForExcel, clearLocalStorage } from '@/lib/randomization';

interface ExportButtonsProps {
  data: ExperimentData | null;
  onClear: () => void;
}

export default function ExportButtons({ data, onClear }: ExportButtonsProps) {
  if (!data) return null;

  const handleExportJSON = () => {
    const json = exportToJSON(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const flatData = flattenForExcel(data);

    const headers = [
      'Participant ID',
      'Random Seed',
      'Session',
      'Modality',
      'Modality Order',
      'Model Type',
      'Model Type Order',
      'Repetition',
      'Model Position',
      'Model ID',
      'Model Name',
      'Measurement Number',
    ];

    const rows = flatData.map(row => [
      row.participantId,
      row.randomSeed,
      row.session,
      row.modality,
      row.modalityOrder,
      row.modelType,
      row.modelTypeOrder,
      row.repetition,
      row.modelPosition,
      row.modelId,
      row.modelName,
      row.measurementNumber,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportSummary = () => {
    const summaryLines = [
      '# Experiment Randomization Summary',
      '',
      `Generated: ${new Date(data.generatedAt).toLocaleString()}`,
      '',
      '## Participant Counts',
      `- Total: ${data.summary.totalParticipants}`,
      '',
      '## Measurement Counts',
      `- Per Session: ${data.summary.measurementsPerSession}`,
      `- Per Participant: ${data.summary.measurementsPerParticipant}`,
      `- Total: ${data.summary.totalMeasurements}`,
      '',
      '## Participant Randomization Details',
      '',
    ];

    for (const participant of data.participants) {
      const session = participant.sessions[0];
      summaryLines.push(`### Participant #${participant.recordId}`);
      summaryLines.push(`- Random Seed: ${participant.randomSeed}`);
      summaryLines.push(`- Modality Order: ${session.modalityOrder.join(' → ')}`);
      summaryLines.push(`- Model Type Order: ${session.modelTypeOrder.join(' → ')}`);
      summaryLines.push(`- Ball Sphere Order: ${session.ballSphereOrder.join(' → ')}`);
      summaryLines.push(`- Balloon Point Order: ${session.balloonPointOrder.join(' → ')}`);
      summaryLines.push('');
    }

    const blob = new Blob([summaryLines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment_summary_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the saved data? This cannot be undone.')) {
      clearLocalStorage();
      onClear();
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleExportJSON}
        className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg font-medium text-sm transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        JSON
      </button>

      <button
        onClick={handleExportCSV}
        className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg font-medium text-sm transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        CSV
      </button>

      <button
        onClick={handleExportSummary}
        className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg font-medium text-sm transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Summary
      </button>

      <button
        onClick={handleClear}
        className="flex items-center gap-2 px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg font-medium text-sm transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Clear
      </button>
    </div>
  );
}
