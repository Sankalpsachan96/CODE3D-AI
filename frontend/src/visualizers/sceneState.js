export const FALLBACK_SCENE_STATE = {
  type: 'array',
  values: [12, 7, 19, 3, 15],
  activeIndex: null,
  label: 'Execution ready',
  focusInfo: 'Waiting for the next executable step.',
};

export function resolveSceneState(dataStructureState, { showFallback = true } = {}) {
  if (dataStructureState) return dataStructureState;
  return showFallback ? FALLBACK_SCENE_STATE : null;
}
