import React, { useState, Suspense } from 'react';
import { Activity, Clock, MessageSquare, Lightbulb, Wrench, Download } from 'lucide-react';

// Use lazy-loaded components
import {
  LazyRCAGraphViewer,
  LazyTimelineViewer,
  LazyChatInterface,
  LazyInsightsPanel,
  LazyRemediationViewer,
  LazyWrapper
} from '@components/LazyComponents';

// Use React Query hooks
import {
  useRCAGraph,
  useTimeline,
  useChatSession,
  useSendMessage,
  useInsights,
  useRemediationPlan,
  useUpdateStepStatus
} from '@api/queries';

// Import search and export features
import { GraphSearch } from '@components/GraphSearch';
import {
  exportGraphAsPNG,
  exportGraphAsSVG,
  exportGraphAsJSON
} from '@utils/graphExport';

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
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<Set<string>>(new Set());

  // Use React Query hooks with proper return values
  const { data: graph, isLoading: graphLoading } = useRCAGraph(selectedIncident);
  const { data: timeline, isLoading: timelineLoading } = useTimeline(selectedIncident);
  const { data: chatSession } = useChatSession(selectedIncident);
  const { mutate: sendMessage, isPending: sending } = useSendMessage(selectedIncident);
  const { data: insightStream, isLoading: insightsLoading } = useInsights(selectedIncident);
  const { data: plan, isLoading: remediationLoading } = useRemediationPlan(selectedIncident);
  const { mutate: updateStepStatus } = useUpdateStepStatus(selectedIncident);

  const messages = chatSession?.messages || [];
  const insights = insightStream?.insights || [];
  const isLive = insightStream?.isLive || false;

  const tabs = [
    { id: 'graph', label: 'RCA Graph', icon: Activity },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
    { id: 'remediation', label: 'Remediation', icon: Wrench },
  ] as const;

  // Export handlers
  const handleExportPNG = async () => {
    const element = document.querySelector('[data-export-target="graph"]') as HTMLElement;
    if (element) {
      await exportGraphAsPNG(element, `rca-graph-${selectedIncident}.png`);
    }
  };

  const handleExportSVG = async () => {
    const element = document.querySelector('[data-export-target="graph"]') as HTMLElement;
    if (element) {
      await exportGraphAsSVG(element, `rca-graph-${selectedIncident}.svg`);
    }
  };

  const handleExportJSON = () => {
    if (graph) {
      exportGraphAsJSON(graph, `rca-graph-${selectedIncident}.json`);
    }
  };

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
                aria-label="Select incident"
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
        <div className="flex gap-2 pt-6 border-b border-adapt-border" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-adapt-bg-secondary text-adapt-primary border-t-2 border-x-2 border-adapt-primary'
                    : 'text-adapt-text-secondary hover:text-adapt-text-primary hover:bg-adapt-bg-secondary/50'
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-6">
        {activeTab === 'graph' && (
          <div className="space-y-4" role="tabpanel" id="panel-graph">
            {graphLoading ? (
              <div className="flex items-center justify-center h-[600px] bg-adapt-bg-secondary rounded-lg">
                <div className="text-center">
                  <Activity className="animate-spin mx-auto mb-4 text-adapt-primary" size={48} />
                  <p className="text-adapt-text-secondary">Loading RCA graph...</p>
                </div>
              </div>
            ) : graph ? (
              <>
                {/* Graph Header with Export Buttons */}
                <div className="bg-adapt-bg-secondary rounded-lg border border-adapt-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-adapt-text-primary mb-2">
                        {graph.metadata.title}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-adapt-text-secondary">
                        <span>Status: <span className="text-adapt-primary font-semibold">{graph.metadata.status}</span></span>
                        <span>Nodes: {graph.nodes.length}</span>
                        <span>Edges: {graph.edges.length}</span>
                        {highlightedNodeIds.size > 0 && (
                          <span>Filtered: {highlightedNodeIds.size}</span>
                        )}
                      </div>
                    </div>

                    {/* Export Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleExportPNG}
                        className="flex items-center gap-2 px-3 py-2 bg-adapt-bg-tertiary hover:bg-adapt-bg-primary border border-adapt-border rounded-lg text-sm text-adapt-text-primary transition-colors"
                        aria-label="Export as PNG"
                      >
                        <Download size={16} />
                        PNG
                      </button>
                      <button
                        onClick={handleExportSVG}
                        className="flex items-center gap-2 px-3 py-2 bg-adapt-bg-tertiary hover:bg-adapt-bg-primary border border-adapt-border rounded-lg text-sm text-adapt-text-primary transition-colors"
                        aria-label="Export as SVG"
                      >
                        <Download size={16} />
                        SVG
                      </button>
                      <button
                        onClick={handleExportJSON}
                        className="flex items-center gap-2 px-3 py-2 bg-adapt-bg-tertiary hover:bg-adapt-bg-primary border border-adapt-border rounded-lg text-sm text-adapt-text-primary transition-colors"
                        aria-label="Export as JSON"
                      >
                        <Download size={16} />
                        JSON
                      </button>
                    </div>
                  </div>
                </div>

                {/* Search Component */}
                <GraphSearch nodes={graph.nodes} onFilterChange={setHighlightedNodeIds} />

                {/* Graph Viewer with Export Target */}
                <div data-export-target="graph">
                  <LazyWrapper name="RCA Graph">
                    <LazyRCAGraphViewer
                      graph={graph}
                      config={{ height: '700px' }}
                      onNodeClick={(nodeId) => console.log('Node clicked:', nodeId)}
                      highlightedNodes={highlightedNodeIds}
                    />
                  </LazyWrapper>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-adapt-text-muted">
                No graph data available
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div role="tabpanel" id="panel-timeline">
            {timelineLoading ? (
              <div className="flex items-center justify-center h-[600px] bg-adapt-bg-secondary rounded-lg">
                <div className="text-center">
                  <Clock className="animate-spin mx-auto mb-4 text-adapt-primary" size={48} />
                  <p className="text-adapt-text-secondary">Loading timeline...</p>
                </div>
              </div>
            ) : timeline ? (
              <LazyWrapper name="Timeline">
                <LazyTimelineViewer
                  timeline={timeline}
                  config={{ enableFilters: true }}
                  onEventClick={(event) => console.log('Event clicked:', event)}
                />
              </LazyWrapper>
            ) : (
              <div className="text-center py-12 text-adapt-text-muted">
                No timeline data available
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto" role="tabpanel" id="panel-chat">
            <LazyWrapper name="Chat Interface">
              <LazyChatInterface
                messages={messages}
                onSendMessage={(message) => sendMessage(message)}
                isLoading={sending}
                config={{ showTimestamps: true }}
              />
            </LazyWrapper>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="max-w-4xl mx-auto" role="tabpanel" id="panel-insights">
            {insightsLoading ? (
              <div className="flex items-center justify-center h-[600px] bg-adapt-bg-secondary rounded-lg">
                <div className="text-center">
                  <Lightbulb className="animate-pulse mx-auto mb-4 text-adapt-primary" size={48} />
                  <p className="text-adapt-text-secondary">Loading insights...</p>
                </div>
              </div>
            ) : (
              <LazyWrapper name="Insights Panel">
                <LazyInsightsPanel insights={insights} isLive={isLive} />
              </LazyWrapper>
            )}
          </div>
        )}

        {activeTab === 'remediation' && (
          <div role="tabpanel" id="panel-remediation">
            {remediationLoading ? (
              <div className="flex items-center justify-center h-[600px] bg-adapt-bg-secondary rounded-lg">
                <div className="text-center">
                  <Wrench className="animate-spin mx-auto mb-4 text-adapt-primary" size={48} />
                  <p className="text-adapt-text-secondary">Loading remediation plan...</p>
                </div>
              </div>
            ) : plan ? (
              <LazyWrapper name="Remediation Viewer">
                <LazyRemediationViewer
                  plan={plan}
                  onStepStatusChange={(stepId, status) =>
                    updateStepStatus({ stepId, status })
                  }
                />
              </LazyWrapper>
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
            Built with React, TypeScript, Tailwind CSS, ReactFlow & React Query
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
