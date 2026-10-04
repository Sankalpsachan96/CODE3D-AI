package com.code3d.model;

import java.util.List;
import java.util.Map;

public class DataStructureState {
    private String type; // array, matrix, linkedlist, stack, queue, tree, sorting, searching, recursion
    private String name;
    private List<Object> values;
    private List<List<Object>> matrix;
    private Integer activeIndex;
    private Integer previousIndex;
    private List<Integer> comparedIndices;
    private List<Integer> swappedIndices;
    private List<Integer> sortedIndices;
    private List<Map<String, Object>> nodes;
    private List<Map<String, Object>> callStack;
    private Integer comparisons;
    private Integer swaps;
    private Map<String, Object> pointers;
    private Map<String, Object> window;
    private Map<String, Object> hashTable;
    private Map<String, Object> waterVolume;
    private List<Object> trappedWater;
    private List<Object> dpValues;
    private List<Map<String, Object>> slots;
    private Boolean targetFound;
    private Integer parentIndex;
    private String heapType;
    private Object target;
    private String label;
    private String focusInfo;

    public DataStructureState() {}

    public List<Object> getTrappedWater() { return trappedWater; }
    public void setTrappedWater(List<Object> trappedWater) { this.trappedWater = trappedWater; }

    public List<Object> getDpValues() { return dpValues; }
    public void setDpValues(List<Object> dpValues) { this.dpValues = dpValues; }

    public List<Map<String, Object>> getSlots() { return slots; }
    public void setSlots(List<Map<String, Object>> slots) { this.slots = slots; }

    public Boolean getTargetFound() { return targetFound; }
    public void setTargetFound(Boolean targetFound) { this.targetFound = targetFound; }

    public Map<String, Object> getWaterVolume() { return waterVolume; }
    public void setWaterVolume(Map<String, Object> waterVolume) { this.waterVolume = waterVolume; }

    public Integer getParentIndex() { return parentIndex; }
    public void setParentIndex(Integer parentIndex) { this.parentIndex = parentIndex; }

    public String getHeapType() { return heapType; }
    public void setHeapType(String heapType) { this.heapType = heapType; }

    public Map<String, Object> getWindow() { return window; }
    public void setWindow(Map<String, Object> window) { this.window = window; }

    public Map<String, Object> getHashTable() { return hashTable; }
    public void setHashTable(Map<String, Object> hashTable) { this.hashTable = hashTable; }

    public Object getTarget() { return target; }
    public void setTarget(Object target) { this.target = target; }

    // Getters and Setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<Object> getValues() { return values; }
    public void setValues(List<Object> values) { this.values = values; }

    public List<List<Object>> getMatrix() { return matrix; }
    public void setMatrix(List<List<Object>> matrix) { this.matrix = matrix; }

    public Integer getActiveIndex() { return activeIndex; }
    public void setActiveIndex(Integer activeIndex) { this.activeIndex = activeIndex; }

    public Integer getPreviousIndex() { return previousIndex; }
    public void setPreviousIndex(Integer previousIndex) { this.previousIndex = previousIndex; }

    public List<Integer> getComparedIndices() { return comparedIndices; }
    public void setComparedIndices(List<Integer> comparedIndices) { this.comparedIndices = comparedIndices; }

    public List<Integer> getSwappedIndices() { return swappedIndices; }
    public void setSwappedIndices(List<Integer> swappedIndices) { this.swappedIndices = swappedIndices; }

    public List<Integer> getSortedIndices() { return sortedIndices; }
    public void setSortedIndices(List<Integer> sortedIndices) { this.sortedIndices = sortedIndices; }

    public List<Map<String, Object>> getNodes() { return nodes; }
    public void setNodes(List<Map<String, Object>> nodes) { this.nodes = nodes; }

    public List<Map<String, Object>> getCallStack() { return callStack; }
    public void setCallStack(List<Map<String, Object>> callStack) { this.callStack = callStack; }

    public Integer getComparisons() { return comparisons; }
    public void setComparisons(Integer comparisons) { this.comparisons = comparisons; }

    public Integer getSwaps() { return swaps; }
    public void setSwaps(Integer swaps) { this.swaps = swaps; }

    public Map<String, Object> getPointers() { return pointers; }
    public void setPointers(Map<String, Object> pointers) { this.pointers = pointers; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getFocusInfo() { return focusInfo; }
    public void setFocusInfo(String focusInfo) { this.focusInfo = focusInfo; }
}
