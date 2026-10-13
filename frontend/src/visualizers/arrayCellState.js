/**
 * Resolve the semantic visual state of one array cell from a trace snapshot.
 * Kept pure so compare/swap rendering can be regression-tested without WebGL.
 */
export function getArrayCellState(state = {}, index) {
  const comparedIndices = Array.isArray(state.comparedIndices) ? state.comparedIndices : [];
  const swappedIndices = Array.isArray(state.swappedIndices) ? state.swappedIndices : [];
  const sortedIndices = Array.isArray(state.sortedIndices) ? state.sortedIndices : [];
  return {
    active: Number.isInteger(state.activeIndex) && state.activeIndex === index,
    comparing: comparedIndices.includes(index),
    swapping: swappedIndices.includes(index),
    sorted: sortedIndices.includes(index),
  };
}
