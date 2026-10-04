import React from 'react';
import { getVisualizerComponent, visualizerRegistry } from './visualizerRegistry';
const FALLBACK_VALUES = [12, 7, 19, 3, 15];
export default function DsaSceneDispatcher({ dataStructureState, isXRayMode = false, onSelectElement = null }) {
  const state = dataStructureState || { type: 'array', values: FALLBACK_VALUES, activeIndex: null, label: 'Execution ready', focusInfo: 'Waiting for the next executable step.' };
  const rawType = String(state.type || 'array').toLowerCase().replace(/_/g, '-');
  if (rawType === 'universal-execution' || rawType === 'registers' || rawType === 'universal' || (state.variables && Object.keys(state.variables).length > 0 && (!state.values || state.values.length === 0))) {
    const UniversalVis = visualizerRegistry.universal;
    return <UniversalVis dataStructureState={state} isXRayMode={isXRayMode} onSelectElement={onSelectElement} />;
  }
  const VisualizerComponent = getVisualizerComponent(rawType) || visualizerRegistry.array;
  return <VisualizerComponent dataStructureState={state} isXRayMode={isXRayMode} onSelectElement={onSelectElement} />;
}
export { visualizerRegistry };
