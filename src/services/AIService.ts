/**
 * AI Service for Intelligent RCA Features
 * Provides: Summary Generation, Anomaly Detection, Pattern Recognition
 */

import { RCAGraph, TimelineEvent, AgentInsight, RCANode } from '@types/index';

export interface AISummary {
  incidentId: string;
  summary: string;
  keyFindings: string[];
  rootCauses: string[];
  impactAnalysis: string;
  recommendedActions: string[];
  confidence: number;
  generatedAt: Date;
}

export interface Anomaly {
  id: string;
  type: 'metric' | 'pattern' | 'timing' | 'relationship';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedNodes: string[];
  timestamp: Date;
  score: number; // 0-100
  evidence: string[];
}

export interface Pattern {
  id: string;
  type: 'recurring-failure' | 'cascade' | 'bottleneck' | 'correlation';
  description: string;
  frequency: number;
  nodes: string[];
  confidence: number;
  recommendation: string;
}

export class AIService {
  /**
   * Generate AI-powered incident summary
   */
  static generateIncidentSummary(
    graph: RCAGraph,
    timeline: TimelineEvent[],
    insights: AgentInsight[]
  ): AISummary {
    // Analyze graph structure
    const rootCauses = graph.nodes.filter(n => n.type === 'root-cause');
    const criticalNodes = graph.nodes.filter(n => n.severity === 'critical');

    // Extract key findings from insights
    const keyFindings = insights
      .filter(i => i.type === 'finding' && i.confidence > 70)
      .map(i => i.content)
      .slice(0, 5);

    // Generate summary using pattern analysis
    const summary = this.generateNarrativeSummary(graph, timeline, insights);

    // Extract root causes
    const rootCauseDescriptions = rootCauses.map(rc => rc.label);

    // Analyze impact
    const impactAnalysis = this.analyzeImpact(graph, timeline);

    // Generate recommendations
    const recommendedActions = this.generateRecommendations(graph, insights);

    return {
      incidentId: graph.incidentId,
      summary,
      keyFindings,
      rootCauses: rootCauseDescriptions,
      impactAnalysis,
      recommendedActions,
      confidence: this.calculateConfidence(graph, insights),
      generatedAt: new Date(),
    };
  }

  /**
   * Detect anomalies in RCA data
   */
  static detectAnomalies(
    graph: RCAGraph,
    timeline: TimelineEvent[],
    historicalData?: RCAGraph[]
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // 1. Timing anomalies
    const timingAnomalies = this.detectTimingAnomalies(timeline);
    anomalies.push(...timingAnomalies);

    // 2. Structural anomalies in graph
    const structuralAnomalies = this.detectStructuralAnomalies(graph);
    anomalies.push(...structuralAnomalies);

    // 3. Metric anomalies
    const metricAnomalies = this.detectMetricAnomalies(graph.nodes);
    anomalies.push(...metricAnomalies);

    // 4. Pattern deviations (if historical data available)
    if (historicalData && historicalData.length > 0) {
      const patternAnomalies = this.detectPatternDeviations(graph, historicalData);
      anomalies.push(...patternAnomalies);
    }

    return anomalies.sort((a, b) => b.score - a.score);
  }

  /**
   * Recognize patterns across incidents
   */
  static recognizePatterns(
    currentGraph: RCAGraph,
    historicalGraphs: RCAGraph[]
  ): Pattern[] {
    const patterns: Pattern[] = [];

    // 1. Recurring failure patterns
    const recurringFailures = this.findRecurringFailures(currentGraph, historicalGraphs);
    patterns.push(...recurringFailures);

    // 2. Cascade patterns
    const cascades = this.findCascadePatterns(currentGraph);
    patterns.push(...cascades);

    // 3. Bottleneck patterns
    const bottlenecks = this.findBottlenecks(currentGraph);
    patterns.push(...bottlenecks);

    // 4. Correlation patterns
    const correlations = this.findCorrelations(currentGraph, historicalGraphs);
    patterns.push(...correlations);

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  // Private helper methods

  private static generateNarrativeSummary(
    graph: RCAGraph,
    timeline: TimelineEvent[],
    insights: AgentInsight[]
  ): string {
    const startTime = new Date(Math.min(...timeline.map(e => new Date(e.timestamp).getTime())));
    const endTime = new Date(Math.max(...timeline.map(e => new Date(e.timestamp).getTime())));
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60);

    const rootCauses = graph.nodes.filter(n => n.type === 'root-cause');
    const services = graph.nodes.filter(n => n.type === 'service');

    let summary = `Incident spanning ${duration} minutes affecting ${services.length} service(s). `;

    if (rootCauses.length > 0) {
      summary += `Root cause identified as: ${rootCauses[0].label}. `;
    }

    const criticalEvents = timeline.filter(e => e.severity === 'critical');
    if (criticalEvents.length > 0) {
      summary += `${criticalEvents.length} critical event(s) detected. `;
    }

    const highConfidenceInsights = insights.filter(i => i.confidence >= 80);
    if (highConfidenceInsights.length > 0) {
      summary += `Analysis completed with ${highConfidenceInsights.length} high-confidence finding(s).`;
    }

    return summary;
  }

  private static analyzeImpact(graph: RCAGraph, timeline: TimelineEvent[]): string {
    const affectedServices = graph.nodes.filter(n => n.type === 'service').length;
    const criticalSeverityCount = graph.nodes.filter(n => n.severity === 'critical').length;

    let impact = `${affectedServices} service(s) affected. `;

    if (criticalSeverityCount > 0) {
      impact += `${criticalSeverityCount} component(s) in critical state. `;
    }

    const errorEvents = timeline.filter(e => e.type === 'alert' || e.type === 'incident');
    impact += `${errorEvents.length} alert(s) triggered during incident.`;

    return impact;
  }

  private static generateRecommendations(graph: RCAGraph, insights: AgentInsight[]): string[] {
    const recommendations: string[] = [];

    // Extract recommendations from insights
    const recommendationInsights = insights.filter(i => i.type === 'recommendation');
    recommendations.push(...recommendationInsights.map(i => i.content));

    // Add generic recommendations based on patterns
    const rootCauses = graph.nodes.filter(n => n.type === 'root-cause');
    if (rootCauses.length > 0) {
      rootCauses.forEach(rc => {
        recommendations.push(`Implement monitoring for ${rc.label} to prevent recurrence`);
      });
    }

    // Add circuit breaker recommendation if cascade detected
    const hasMultipleFailures = graph.nodes.filter(n => n.status === 'error').length > 3;
    if (hasMultipleFailures) {
      recommendations.push('Consider implementing circuit breaker patterns to prevent cascading failures');
    }

    return recommendations.slice(0, 5);
  }

  private static calculateConfidence(graph: RCAGraph, insights: AgentInsight[]): number {
    // Base confidence on having root causes identified
    let confidence = graph.nodes.some(n => n.type === 'root-cause') ? 70 : 40;

    // Boost confidence with high-confidence insights
    const avgInsightConfidence = insights.length > 0
      ? insights.reduce((sum, i) => sum + (i.confidence || 50), 0) / insights.length
      : 50;

    confidence = (confidence + avgInsightConfidence) / 2;

    // Cap between 0-100
    return Math.max(0, Math.min(100, Math.round(confidence)));
  }

  private static detectTimingAnomalies(timeline: TimelineEvent[]): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Detect events happening too close together (< 1 second)
    for (let i = 1; i < timeline.length; i++) {
      const timeDiff = new Date(timeline[i].timestamp).getTime() -
                      new Date(timeline[i-1].timestamp).getTime();

      if (timeDiff < 1000 && timeline[i].type === timeline[i-1].type) {
        anomalies.push({
          id: `timing-${i}`,
          type: 'timing',
          severity: 'medium',
          description: `Rapid succession of ${timeline[i].type} events (${timeDiff}ms apart)`,
          affectedNodes: [],
          timestamp: new Date(timeline[i].timestamp),
          score: 65,
          evidence: [`${timeline[i-1].title}`, `${timeline[i].title}`],
        });
      }
    }

    return anomalies;
  }

  private static detectStructuralAnomalies(graph: RCAGraph): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Detect nodes with no connections
    const isolatedNodes = graph.nodes.filter(node => {
      const hasIncoming = graph.edges.some(e => e.target === node.id);
      const hasOutgoing = graph.edges.some(e => e.source === node.id);
      return !hasIncoming && !hasOutgoing;
    });

    if (isolatedNodes.length > 0) {
      anomalies.push({
        id: 'isolated-nodes',
        type: 'relationship',
        severity: 'low',
        description: `${isolatedNodes.length} isolated node(s) with no relationships`,
        affectedNodes: isolatedNodes.map(n => n.id),
        timestamp: new Date(),
        score: 50,
        evidence: isolatedNodes.map(n => n.label),
      });
    }

    // Detect cycles in graph
    const hasCycle = this.detectCycles(graph);
    if (hasCycle) {
      anomalies.push({
        id: 'graph-cycle',
        type: 'relationship',
        severity: 'high',
        description: 'Circular dependency detected in root cause graph',
        affectedNodes: [],
        timestamp: new Date(),
        score: 85,
        evidence: ['Circular reference may indicate incorrect analysis'],
      });
    }

    return anomalies;
  }

  private static detectMetricAnomalies(nodes: RCANode[]): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Detect nodes with very low confidence
    const lowConfidenceNodes = nodes.filter(n => (n.confidence || 100) < 30);
    if (lowConfidenceNodes.length > 0) {
      anomalies.push({
        id: 'low-confidence',
        type: 'metric',
        severity: 'medium',
        description: `${lowConfidenceNodes.length} node(s) with low confidence (<30%)`,
        affectedNodes: lowConfidenceNodes.map(n => n.id),
        timestamp: new Date(),
        score: 60,
        evidence: lowConfidenceNodes.map(n => `${n.label}: ${n.confidence}%`),
      });
    }

    return anomalies;
  }

  private static detectPatternDeviations(
    currentGraph: RCAGraph,
    historicalGraphs: RCAGraph[]
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Compare node count with historical average
    const avgNodeCount = historicalGraphs.reduce((sum, g) => sum + g.nodes.length, 0) / historicalGraphs.length;
    const deviation = Math.abs(currentGraph.nodes.length - avgNodeCount) / avgNodeCount;

    if (deviation > 0.5) { // 50% deviation
      anomalies.push({
        id: 'size-deviation',
        type: 'pattern',
        severity: deviation > 1 ? 'high' : 'medium',
        description: `Graph size deviates ${Math.round(deviation * 100)}% from historical average`,
        affectedNodes: [],
        timestamp: new Date(),
        score: Math.min(90, 50 + deviation * 40),
        evidence: [`Current: ${currentGraph.nodes.length} nodes`, `Average: ${Math.round(avgNodeCount)} nodes`],
      });
    }

    return anomalies;
  }

  private static findRecurringFailures(
    currentGraph: RCAGraph,
    historicalGraphs: RCAGraph[]
  ): Pattern[] {
    const patterns: Pattern[] = [];

    // Find nodes that appear in multiple incidents
    const nodeLabels = currentGraph.nodes.map(n => n.label);
    const recurringNodes = nodeLabels.filter(label => {
      const occurrences = historicalGraphs.filter(g =>
        g.nodes.some(n => n.label === label)
      ).length;
      return occurrences >= 2;
    });

    if (recurringNodes.length > 0) {
      patterns.push({
        id: 'recurring-failures',
        type: 'recurring-failure',
        description: `${recurringNodes.length} component(s) involved in multiple incidents`,
        frequency: recurringNodes.length,
        nodes: recurringNodes,
        confidence: 80,
        recommendation: 'Prioritize fixes for these recurring failure points',
      });
    }

    return patterns;
  }

  private static findCascadePatterns(graph: RCAGraph): Pattern[] {
    const patterns: Pattern[] = [];

    // Find chains of failures (A -> B -> C)
    const errorNodes = graph.nodes.filter(n => n.status === 'error');
    if (errorNodes.length >= 3) {
      // Check if they form a chain
      const chain = this.findLongestChain(graph, errorNodes);
      if (chain.length >= 3) {
        patterns.push({
          id: 'cascade-pattern',
          type: 'cascade',
          description: `Cascade failure affecting ${chain.length} components`,
          frequency: 1,
          nodes: chain.map(n => n.id),
          confidence: 75,
          recommendation: 'Implement circuit breakers and rate limiting to prevent cascades',
        });
      }
    }

    return patterns;
  }

  private static findBottlenecks(graph: RCAGraph): Pattern[] {
    const patterns: Pattern[] = [];

    // Find nodes with many incoming edges (potential bottlenecks)
    const incomingCounts = new Map<string, number>();
    graph.edges.forEach(edge => {
      incomingCounts.set(edge.target, (incomingCounts.get(edge.target) || 0) + 1);
    });

    const bottlenecks = Array.from(incomingCounts.entries())
      .filter(([_, count]) => count >= 3)
      .map(([nodeId, count]) => {
        const node = graph.nodes.find(n => n.id === nodeId);
        return { nodeId, count, label: node?.label || nodeId };
      });

    if (bottlenecks.length > 0) {
      patterns.push({
        id: 'bottleneck-pattern',
        type: 'bottleneck',
        description: `${bottlenecks.length} component(s) identified as potential bottlenecks`,
        frequency: bottlenecks.length,
        nodes: bottlenecks.map(b => b.nodeId),
        confidence: 70,
        recommendation: 'Scale or optimize bottleneck components to improve resilience',
      });
    }

    return patterns;
  }

  private static findCorrelations(
    currentGraph: RCAGraph,
    historicalGraphs: RCAGraph[]
  ): Pattern[] {
    // Simplified correlation detection
    // In production, use statistical correlation analysis
    return [];
  }

  private static detectCycles(graph: RCAGraph): boolean {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const hasCycleDFS = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const outgoingEdges = graph.edges.filter(e => e.source === nodeId);
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          if (hasCycleDFS(edge.target)) return true;
        } else if (recStack.has(edge.target)) {
          return true;
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        if (hasCycleDFS(node.id)) return true;
      }
    }

    return false;
  }

  private static findLongestChain(graph: RCAGraph, errorNodes: RCANode[]): RCANode[] {
    // Simple chain detection - find longest path through error nodes
    let longestChain: RCANode[] = [];

    const findChainFrom = (node: RCANode, currentChain: RCANode[]): void => {
      const newChain = [...currentChain, node];
      if (newChain.length > longestChain.length) {
        longestChain = newChain;
      }

      const outgoing = graph.edges.filter(e => e.source === node.id);
      for (const edge of outgoing) {
        const targetNode = errorNodes.find(n => n.id === edge.target);
        if (targetNode && !currentChain.includes(targetNode)) {
          findChainFrom(targetNode, newChain);
        }
      }
    };

    errorNodes.forEach(node => findChainFrom(node, []));
    return longestChain;
  }
}
