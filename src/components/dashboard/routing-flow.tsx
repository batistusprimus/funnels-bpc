'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RoutingRule } from '@/types';

interface RoutingFlowProps {
  rules: RoutingRule[];
  onRuleClick?: (ruleId: string) => void;
}

// Custom node pour les règles
function RuleNode({ data }: { data: any }) {
  return (
    <Card className="p-4 min-w-[250px] border-2 hover:shadow-lg transition-shadow">
      <Handle type="target" position={Position.Top} />
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant={data.is_active ? 'default' : 'secondary'}>
            Priorité {data.priority}
          </Badge>
          {!data.is_active && <span className="text-xs text-muted-foreground">Inactive</span>}
        </div>
        
        <div className="font-semibold text-sm">{data.client_name || 'Sans nom'}</div>
        
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1">
            <span className="font-medium">{data.condition.field}</span>
            <span className="text-muted-foreground">{data.condition.operator}</span>
            <span className="font-medium">"{data.condition.value}"</span>
          </div>
          
          <div className="text-muted-foreground truncate">
            → {data.webhook_url}
          </div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
}

// Custom node pour le point de départ
function StartNode() {
  return (
    <Card className="p-4 min-w-[200px] bg-green-50 border-green-200">
      <div className="text-center">
        <div className="text-lg font-bold text-green-700">🚀 Lead entrant</div>
        <div className="text-xs text-muted-foreground mt-1">
          Vérifie les règles par priorité
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
}

// Custom node pour la règle par défaut
function DefaultNode() {
  return (
    <Card className="p-4 min-w-[200px] bg-yellow-50 border-yellow-200">
      <Handle type="target" position={Position.Top} />
      <div className="text-center">
        <div className="text-lg font-bold text-yellow-700">⚠️ Aucune règle</div>
        <div className="text-xs text-muted-foreground mt-1">
          Lead non routé
        </div>
      </div>
    </Card>
  );
}

const nodeTypes: NodeTypes = {
  rule: RuleNode,
  start: StartNode,
  default: DefaultNode,
};

export function RoutingFlow({ rules, onRuleClick }: RoutingFlowProps) {
  // Créer les nodes
  const nodes: Node[] = useMemo(() => {
    const activeRules = rules
      .filter((r) => r.is_active)
      .sort((a, b) => a.priority - b.priority);
    
    const nodeList: Node[] = [
      {
        id: 'start',
        type: 'start',
        position: { x: 250, y: 0 },
        data: {},
      },
    ];
    
    // Ajouter les règles
    activeRules.forEach((rule, index) => {
      nodeList.push({
        id: rule.id,
        type: 'rule',
        position: { x: 250, y: 150 + index * 200 },
        data: {
          ...rule,
          priority: rule.priority,
          is_active: rule.is_active,
          client_name: rule.client_name,
          webhook_url: rule.webhook_url,
          condition: rule.condition,
        },
      });
    });
    
    // Ajouter le node par défaut
    nodeList.push({
      id: 'default',
      type: 'default',
      position: { x: 250, y: 150 + activeRules.length * 200 },
      data: {},
    });
    
    return nodeList;
  }, [rules]);

  // Créer les edges
  const edges: Edge[] = useMemo(() => {
    const activeRules = rules
      .filter((r) => r.is_active)
      .sort((a, b) => a.priority - b.priority);
    
    const edgeList: Edge[] = [];
    
    if (activeRules.length > 0) {
      // Start → première règle
      edgeList.push({
        id: 'start-first',
        source: 'start',
        target: activeRules[0].id,
        animated: true,
        label: 'vérifie',
      });
      
      // Règles entre elles
      for (let i = 0; i < activeRules.length - 1; i++) {
        edgeList.push({
          id: `rule-${i}`,
          source: activeRules[i].id,
          target: activeRules[i + 1].id,
          animated: false,
          label: 'sinon',
          style: { stroke: '#94a3b8' },
        });
      }
      
      // Dernière règle → default
      edgeList.push({
        id: 'last-default',
        source: activeRules[activeRules.length - 1].id,
        target: 'default',
        animated: false,
        label: 'sinon',
        style: { stroke: '#94a3b8' },
      });
    } else {
      // Si aucune règle, connecter directement start → default
      edgeList.push({
        id: 'start-default',
        source: 'start',
        target: 'default',
        animated: true,
      });
    }
    
    return edgeList;
  }, [rules]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (node.type === 'rule' && onRuleClick) {
        onRuleClick(node.id);
      }
    },
    [onRuleClick]
  );

  return (
    <Card className="h-[600px] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>
    </Card>
  );
}

