import React, { useState } from 'react';
import { RCAGraphViewer } from '@components/Graph';
import { TimelineViewer } from '@components/Timeline';
import { ChatInterface } from '@components/Chat';
import { InsightsPanel } from '@components/InsightsPanel';
import { RemediationViewer } from '@components/Remediation';
import { useRCAGraph } from '@hooks/useRCAGraph';
import { useTimeline } from '@hooks/useTimeline';
import { useChat } from '@hooks/useChat';
import { useInsights } from '@hooks/useInsights';
import { useRemediation } from '@hooks/useRemediation';
import { Activity, Clock, MessageSquare, Lightbulb, Wrench } from 'lucide-react';

const INCIDENTS = [
  {
    id: 'inc-001',
    name: 'Database Connection Pool Exhaustion',
    description: 'Critical production incident affecting user authentication',
  },
];

function App() {
  const [selectedIncident, setSelectedIncident] = useState('inc-001');
  const [activeTab, setActiveTab] = useState<'graph' | 'timeline' | 'chat' | 'insights' | 'remediation'>('graph');

  const { graph, loading: graphLoading } = useRCAGraph(selectedIncident);
  const { timeline, loading: timelineLoading } = useTimeline(selectedIncident);
  const { messages, sending, sendMessage } = useChat(selectedIncident);
  const { insights, isLive, loading: insightsLoading } = useInsights(selectedIncident, true);
  const { plan, updateStepStatus, loading: remediationLoading } = useRemediation(selectedIncident);

  const tabs = [
    { id: 'graph', label: 'RCA Graph', icon: Activity },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
    { id: 'remediation', label: 'Remediation', icon: Wrench },
  ] as const;

  return (
    <div className="min-h-screen bg-adapt-bg-primary">
      {/* Header */}
      <header className="bg-adapt-bg-secondary border-b border-adapt-border">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-adapt-text-primary">
                ADAPT-UI Demo
              </h1>
              <p className="text-sm text-adapt-text-secondary mt-1">
                Agentic RCA Visualization & AI Assistant Toolkit
              </p>
            </div>

            {/* Incident Selector */}
            <div>
              <label className="block text-xs text-adapt-text-muted mb-2">
                Select Incident
              </label>
              <select
                value={selectedIncident}
                onChange={(e) => setSelectedIncident(e.target.value)}
                className="bg-adapt-bg-tertiary border border-adapt-border rounded-lg px-4 py-2 text-adapt-text-primary"
              >
                {INCIDENTS.map((incident) => (
                  <option key={incident.id} value={incident.id}>
                    {incident.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-[1800px] mx-auto px-6">
        <div className="flex gap-2 pt-6 border-b border-adapt-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-adapt-bg-secondary text-adapt-primary border-t-2 border-x-2 border-adapt-primary'
                    : 'text-adapt-text-secondary hover:text-adapt-text-primary hover:bg-adapt-bg-secondary/50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-6">
        {activeTab === 'graph' && (
          <div className="space-y-4">
            {graphLoading ? (
              <div className="flex items-center justify-center h-[600px] bg-adapt-bg-secondary rounded-lg">
                <div className="text-center">
                  <Activity className="animate-spin mx-auto mb-4 text-adapt-primary" size={48} />
                  <p className="text-adapt-text-secondary">Loading RCA graph...</p>
                </div>
              </div>
            ) : graph ? (
              <>
                <div className="bg-adapt-bg-secondary rounded-lg border border-adapt-border p-4">
                  <h2 className="text-xl font-semibold text-adapt-text-primary mb-2">
                    {graph.metadata.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-adapt-text-secondary">
                    <span>Status: <span className="text-adapt-primary font-semibold">{graph.metadata.status}</span></span>
                    <span>Nodes: {graph.nodes.length}</span>
                    <span>Edges: {graph.edges.length}</span>
                  </div>
                </div>
                <RCAGraphViewer
                  graph={graph}
                  config={{ height: '700px' }}
                  onNodeClick={(nodeId) => console.log('Node clicked:', nodeId)}
                />
              </>
            ) : (
              <div className="text-center py-12 text-adapt-text-muted">
                No graph data available
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div>
            {timelineLoading ? (
              <div className="flex items-center justify-center h-[600px] bg-adapt-bg-secondary rounded-lg">
                <div className="text-center">
                  <Clock className="animate-spin mx-auto mb-4 text-adapt-primary" size={48} />
                  <p className="text-adapt-text-secondary">Loading timeline...</p>
                </div>
              </div>
            ) : timeline ? (
              <TimelineViewer
                timeline={timeline}
                config={{ enableFilters: true }}
                onEventClick={(event) => console.log('Event clicked:', event)}
              />
            ) : (
              <div className="text-center py-12 text-adapt-text-muted">
                No timeline data available
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <ChatInterface
              messages={messages}
              onSendMessage={sendMessage}
              isLoading={sending}
              config={{ showTimestamps: true }}
            />
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="max-w-4xl mx-auto">
            {insightsLoading ? (
              <div className="flex items-center justify-center h-[600px] bg-adapt-bg-secondary rounded-lg">
                <div className="text-center">
                  <Lightbulb className="animate-pulse mx-auto mb-4 text-adapt-primary" size={48} />
                  <p className="text-adapt-text-secondary">Loading insights...</p>
                </div>
              </div>
            ) : (
              <InsightsPanel insights={insights} isLive={isLive} />
            )}
          </div>
        )}

        {activeTab === 'remediation' && (
          <div>
            {remediationLoading ? (
              <div className="flex items-center justify-center h-[600px] bg-adapt-bg-secondary rounded-lg">
                <div className="text-center">
                  <Wrench className="animate-spin mx-auto mb-4 text-adapt-primary" size={48} />
                  <p className="text-adapt-text-secondary">Loading remediation plan...</p>
                </div>
              </div>
            ) : plan ? (
              <RemediationViewer
                plan={plan}
                onStepStatusChange={updateStepStatus}
              />
            ) : (
              <div className="text-center py-12 text-adapt-text-muted">
                No remediation plan available
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-[1800px] mx-auto px-6 py-8 mt-12 border-t border-adapt-border">
        <div className="text-center text-sm text-adapt-text-muted">
          <p>ADAPT-UI: Agentic RCA Visualization & AI Assistant Toolkit</p>
          <p className="mt-2">
            Built with React, TypeScript, Tailwind CSS, and ReactFlow
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
