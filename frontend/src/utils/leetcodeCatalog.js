/**
 * CODE3D AI - LeetCode 1 to 300 Comprehensive Question Catalog
 * Curated flagship problems spanning all 14 foundational DSA Archetypes.
 * Each problem includes official LeetCode identifiers, problem statement,
 * default test driver datasets, and clean multi-language starter solutions.
 */

export const LEETCODE_CATEGORIES = [
  'All Categories',
  'Arrays & Hashing',
  'Two Pointers',
  'Binary Search',
  'Sliding Window',
  'Stack & Monotonic',
  'Linked Lists',
  'Trees & BST',
  'Heaps & Priority Queue',
  '2D Matrix & Grids',
  'Dynamic Programming',
  'Graphs',
];

export const LEETCODE_PROBLEMS = [
  // ==========================================
  // ARCHETYPE 1: TWO POINTERS & ARRAY SCANNING
  // ==========================================
  {
    id: 1,
    slug: 'two-sum',
    title: '1. Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    archetype: 'two-pointers',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    defaultInput: '2, 7, 11, 15',
    defaultTarget: 9,
    javaCode: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
    pythonCode: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in seen:
                return [seen[diff], i]
            seen[num] = i
        return []`,
  },
  {
    id: 11,
    slug: 'container-with-most-water',
    title: '11. Container With Most Water',
    difficulty: 'Medium',
    category: 'Two Pointers',
    archetype: 'two-pointers',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Find two lines that together with the x-axis form a container, such that the container contains the most water.',
    defaultInput: '1, 8, 6, 2, 5, 4, 8, 3, 7',
    defaultTarget: null,
    javaCode: `class Solution {
    public int maxArea(int[] height) {
        int left = 0, right = height.length - 1;
        int maxArea = 0;
        while (left < right) {
            int h = Math.min(height[left], height[right]);
            maxArea = Math.max(maxArea, h * (right - left));
            if (height[left] < height[right]) left++;
            else right--;
        }
        return maxArea;
    }
}`,
    pythonCode: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        l, r = 0, len(height) - 1
        res = 0
        while l < r:
            res = max(res, min(height[l], height[r]) * (r - l))
            if height[l] < height[r]:
                l += 1
            else:
                r -= 1
        return res`,
  },
  {
    id: 15,
    slug: '3sum',
    title: '15. 3Sum',
    difficulty: 'Medium',
    category: 'Two Pointers',
    archetype: 'two-pointers',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Return all triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
    defaultInput: '-1, 0, 1, 2, -1, -4',
    defaultTarget: 0,
    javaCode: `class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> res = new ArrayList<>();
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int l = i + 1, r = nums.length - 1;
            while (l < r) {
                int sum = nums[i] + nums[l] + nums[r];
                if (sum == 0) {
                    res.add(Arrays.asList(nums[i], nums[l], nums[r]));
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++; r--;
                } else if (sum < 0) l++;
                else r--;
            }
        }
        return res;
    }
}`,
    pythonCode: `class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        nums.sort()
        res = []
        for i in range(len(nums) - 2):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            l, r = i + 1, len(nums) - 1
            while l < r:
                s = nums[i] + nums[l] + nums[r]
                if s == 0:
                    res.append([nums[i], nums[l], nums[r]])
                    while l < r and nums[l] == nums[l + 1]: l += 1
                    while l < r and nums[r] == nums[r - 1]: r -= 1
                    l += 1; r -= 1
                elif s < 0:
                    l += 1
                else:
                    r -= 1
        return res`,
  },
  {
    id: 26,
    slug: 'remove-duplicates-from-sorted-array',
    title: '26. Remove Duplicates from Sorted Array',
    difficulty: 'Easy',
    category: 'Two Pointers',
    archetype: 'two-pointers',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Remove duplicates in-place such that each unique element appears only once, maintaining relative order.',
    defaultInput: '0, 0, 1, 1, 1, 2, 2, 3, 3, 4',
    defaultTarget: null,
    javaCode: `class Solution {
    public int removeDuplicates(int[] nums) {
        if (nums.length == 0) return 0;
        int k = 1;
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] != nums[i - 1]) {
                nums[k++] = nums[i];
            }
        }
        return k;
    }
}`,
    pythonCode: `class Solution:
    def removeDuplicates(self, nums: list[int]) -> int:
        if not nums: return 0
        k = 1
        for i in range(1, len(nums)):
            if nums[i] != nums[i - 1]:
                nums[k] = nums[i]
                k += 1
        return k`,
  },
  {
    id: 27,
    slug: 'remove-element',
    title: '27. Remove Element',
    difficulty: 'Easy',
    category: 'Two Pointers',
    archetype: 'two-pointers',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Remove all occurrences of val in nums in-place, returning the number of elements not equal to val.',
    defaultInput: '3, 2, 2, 3, 4, 3, 5',
    defaultTarget: 3,
    javaCode: `class Solution {
    public int removeElement(int[] nums, int val) {
        int k = 0;
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] != val) {
                nums[k++] = nums[i];
            }
        }
        return k;
    }
}`,
    pythonCode: `class Solution:
    def removeElement(self, nums: list[int], val: int) -> int:
        k = 0
        for i in range(len(nums)):
            if nums[i] != val:
                nums[k] = nums[i]
                k += 1
        return k`,
  },
  {
    id: 75,
    slug: 'sort-colors',
    title: '75. Sort Colors (Dutch National Flag)',
    difficulty: 'Medium',
    category: 'Two Pointers',
    archetype: 'two-pointers',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Sort objects colored red (0), white (1), or blue (2) in-place in a single pass using Dutch National Flag partitioning.',
    defaultInput: '2, 0, 2, 1, 1, 0',
    defaultTarget: null,
    javaCode: `class Solution {
    public void sortColors(int[] nums) {
        int low = 0, mid = 0, high = nums.length - 1;
        while (mid <= high) {
            if (nums[mid] == 0) {
                int tmp = nums[low]; nums[low++] = nums[mid]; nums[mid++] = tmp;
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                int tmp = nums[mid]; nums[mid] = nums[high]; nums[high--] = tmp;
            }
        }
    }
}`,
    pythonCode: `class Solution:
    def sortColors(self, nums: list[int]) -> None:
        low, mid, high = 0, 0, len(nums) - 1
        while mid <= high:
            if nums[mid] == 0:
                nums[low], nums[mid] = nums[mid], nums[low]
                low += 1; mid += 1
            elif nums[mid] == 1:
                mid += 1
            else:
                nums[mid], nums[high] = nums[high], nums[mid]
                high -= 1`,
  },
  {
    id: 88,
    slug: 'merge-sorted-array',
    title: '88. Merge Sorted Array',
    difficulty: 'Easy',
    category: 'Two Pointers',
    archetype: 'two-pointers',
    timeComplexity: 'O(m + n)',
    spaceComplexity: 'O(1)',
    description: 'Merge sorted array nums2 into nums1 in-place starting from back to prevent overwriting.',
    defaultInput: '1, 2, 3, 0, 0, 0',
    defaultTarget: null,
    javaCode: `class Solution {
    public void merge(int[] nums1, int m, int[] nums2, int n) {
        int i = m - 1, j = n - 1, k = m + n - 1;
        while (j >= 0) {
            if (i >= 0 && nums1[i] > nums2[j]) {
                nums1[k--] = nums1[i--];
            } else {
                nums1[k--] = nums2[j--];
            }
        }
    }
}`,
    pythonCode: `class Solution:
    def merge(self, nums1: list[int], m: int, nums2: list[int], n: int) -> None:
        i, j, k = m - 1, n - 1, m + n - 1
        while j >= 0:
            if i >= 0 and nums1[i] > nums2[j]:
                nums1[k] = nums1[i]
                i -= 1
            else:
                nums1[k] = nums2[j]
                j -= 1
            k -= 1`,
  },
  {
    id: 125,
    slug: 'valid-palindrome',
    title: '125. Valid Palindrome',
    difficulty: 'Easy',
    category: 'Two Pointers',
    archetype: 'two-pointers',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Determine if string is a palindrome, considering only alphanumeric characters and ignoring cases.',
    defaultInput: '1, 2, 3, 2, 1',
    defaultTarget: null,
    javaCode: `class Solution {
    public boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) return false;
            left++; right--;
        }
        return true;
    }
}`,
    pythonCode: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        l, r = 0, len(s) - 1
        while l < r:
            while l < r and not s[l].isalnum(): l += 1
            while l < r and not s[r].isalnum(): r -= 1
            if s[l].lower() != s[r].lower(): return False
            l += 1; r -= 1
        return True`,
  },
  {
    id: 167,
    slug: 'two-sum-ii-input-array-is-sorted',
    title: '167. Two Sum II - Input Array Is Sorted',
    difficulty: 'Medium',
    category: 'Two Pointers',
    archetype: 'two-pointers',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Find two numbers in 1-indexed sorted array that add up to target using converging left and right pointers.',
    defaultInput: '2, 7, 11, 15',
    defaultTarget: 9,
    javaCode: `class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int l = 0, r = numbers.length - 1;
        while (l < r) {
            int sum = numbers[l] + numbers[r];
            if (sum == target) return new int[]{l + 1, r + 1};
            else if (sum < target) l++;
            else r--;
        }
        return new int[]{};
    }
}`,
    pythonCode: `class Solution:
    def twoSum(self, numbers: list[int], target: int) -> list[int]:
        l, r = 0, len(numbers) - 1
        while l < r:
            s = numbers[l] + numbers[r]
            if s == target: return [l + 1, r + 1]
            elif s < target: l += 1
            else: r -= 1
        return []`,
  },
  {
    id: 283,
    slug: 'move-zeroes',
    title: '283. Move Zeroes',
    difficulty: 'Easy',
    category: 'Two Pointers',
    archetype: 'two-pointers',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Move all 0s to end of array while maintaining relative order of non-zero elements in-place.',
    defaultInput: '0, 1, 0, 3, 12',
    defaultTarget: null,
    javaCode: `class Solution {
    public void moveZeroes(int[] nums) {
        int slow = 0;
        for (int fast = 0; fast < nums.length; fast++) {
            if (nums[fast] != 0) {
                int tmp = nums[slow];
                nums[slow] = nums[fast];
                nums[fast] = tmp;
                slow++;
            }
        }
    }
}`,
    pythonCode: `class Solution:
    def moveZeroes(self, nums: list[int]) -> None:
        slow = 0
        for fast in range(len(nums)):
            if nums[fast] != 0:
                nums[slow], nums[fast] = nums[fast], nums[slow]
                slow += 1`,
  },

  // ==========================================
  // ARCHETYPE 2: BINARY SEARCH
  // ==========================================
  {
    id: 33,
    slug: 'search-in-rotated-sorted-array',
    title: '33. Search in Rotated Sorted Array',
    difficulty: 'Medium',
    category: 'Binary Search',
    archetype: 'binary-search',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'Search for target in sorted array rotated at an unknown pivot in O(log n) time.',
    defaultInput: '4, 5, 6, 7, 0, 1, 2',
    defaultTarget: 0,
    javaCode: `class Solution {
    public int search(int[] nums, int target) {
        int l = 0, r = nums.length - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] == target) return mid;
            if (nums[l] <= nums[mid]) {
                if (nums[l] <= target && target < nums[mid]) r = mid - 1;
                else l = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[r]) l = mid + 1;
                else r = mid - 1;
            }
        }
        return -1;
    }
}`,
    pythonCode: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        l, r = 0, len(nums) - 1
        while l <= r:
            mid = (l + r) // 2
            if nums[mid] == target: return mid
            if nums[l] <= nums[mid]:
                if nums[l] <= target < nums[mid]: r = mid - 1
                else: l = mid + 1
            else:
                if nums[mid] < target <= nums[r]: l = mid + 1
                else: r = mid - 1
        return -1`,
  },
  {
    id: 35,
    slug: 'search-insert-position',
    title: '35. Search Insert Position',
    difficulty: 'Easy',
    category: 'Binary Search',
    archetype: 'binary-search',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'Find target index or insertion position where target would be inserted in sorted order.',
    defaultInput: '1, 3, 5, 6',
    defaultTarget: 5,
    javaCode: `class Solution {
    public int searchInsert(int[] nums, int target) {
        int l = 0, r = nums.length - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) l = mid + 1;
            else r = mid - 1;
        }
        return l;
    }
}`,
    pythonCode: `class Solution:
    def searchInsert(self, nums: list[int], target: int) -> int:
        l, r = 0, len(nums) - 1
        while l <= r:
            mid = (l + r) // 2
            if nums[mid] == target: return mid
            elif nums[mid] < target: l = mid + 1
            else: r = mid - 1
        return l`,
  },
  {
    id: 74,
    slug: 'search-a-2d-matrix',
    title: '74. Search a 2D Matrix',
    difficulty: 'Medium',
    category: 'Binary Search',
    archetype: 'binary-search',
    timeComplexity: 'O(log(m × n))',
    spaceComplexity: 'O(1)',
    description: 'Search target in m × n matrix with row and column sorted properties by treating as 1D array.',
    defaultInput: '1, 3, 5, 7, 10, 11, 16, 20',
    defaultTarget: 3,
    javaCode: `class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        int m = matrix.length, n = matrix[0].length;
        int l = 0, r = m * n - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            int val = matrix[mid / n][mid % n];
            if (val == target) return true;
            else if (val < target) l = mid + 1;
            else r = mid - 1;
        }
        return false;
    }
}`,
    pythonCode: `class Solution:
    def searchMatrix(self, matrix: list[list[int]], target: int) -> bool:
        m, n = len(matrix), len(matrix[0])
        l, r = 0, m * n - 1
        while l <= r:
            mid = (l + r) // 2
            val = matrix[mid // n][mid % n]
            if val == target: return True
            elif val < target: l = mid + 1
            else: r = mid - 1
        return False`,
  },
  {
    id: 153,
    slug: 'find-minimum-in-rotated-sorted-array',
    title: '153. Find Minimum in Rotated Sorted Array',
    difficulty: 'Medium',
    category: 'Binary Search',
    archetype: 'binary-search',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'Find minimum element in rotated sorted array in O(log n) time.',
    defaultInput: '4, 5, 6, 7, 0, 1, 2',
    defaultTarget: null,
    javaCode: `class Solution {
    public int findMin(int[] nums) {
        int l = 0, r = nums.length - 1;
        while (l < r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] > nums[r]) l = mid + 1;
            else r = mid;
        }
        return nums[l];
    }
}`,
    pythonCode: `class Solution:
    def findMin(self, nums: list[int]) -> int:
        l, r = 0, len(nums) - 1
        while l < r:
            mid = (l + r) // 2
            if nums[mid] > nums[r]: l = mid + 1
            else: r = mid
        return nums[l]`,
  },
  {
    id: 704,
    slug: 'binary-search',
    title: '704. Binary Search',
    difficulty: 'Easy',
    category: 'Binary Search',
    archetype: 'binary-search',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'Find target value in ascending sorted array with logarithmic runtime and laser beacon highlighting.',
    defaultInput: '-1, 0, 3, 5, 9, 12',
    defaultTarget: 9,
    javaCode: `class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}`,
    pythonCode: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        l, r = 0, len(nums) - 1
        while l <= r:
            m = (l + r) // 2
            if nums[m] == target: return m
            elif nums[m] < target: l = m + 1
            else: r = m - 1
        return -1`,
  },

  // ==========================================
  // ARCHETYPE 3: KADANE'S & STOCK PROFIT
  // ==========================================
  {
    id: 53,
    slug: 'maximum-subarray',
    title: '53. Maximum Subarray (Kadane\'s Algorithm)',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    archetype: 'kadane',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Find contiguous subarray with largest sum using Kadane\'s optimal local/global running sum.',
    defaultInput: '-2, 1, -3, 4, -1, 2, 1, -5, 4',
    defaultTarget: null,
    javaCode: `class Solution {
    public int maxSubArray(int[] nums) {
        int maxSoFar = nums[0];
        int currMax = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currMax = Math.max(nums[i], currMax + nums[i]);
            maxSoFar = Math.max(maxSoFar, currMax);
        }
        return maxSoFar;
    }
}`,
    pythonCode: `class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        max_so_far = curr = nums[0]
        for x in nums[1:]:
            curr = max(x, curr + x)
            max_so_far = max(max_so_far, curr)
        return max_so_far`,
  },
  {
    id: 121,
    slug: 'best-time-to-buy-and-sell-stock',
    title: '121. Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    archetype: 'stock',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Maximize profit by choosing a single day to buy stock and a different day in future to sell.',
    defaultInput: '7, 1, 5, 3, 6, 4',
    defaultTarget: null,
    javaCode: `class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int p : prices) {
            if (p < minPrice) minPrice = p;
            else if (p - minPrice > maxProfit) maxProfit = p - minPrice;
        }
        return maxProfit;
    }
}`,
    pythonCode: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        min_p = float('inf')
        profit = 0
        for p in prices:
            if p < min_p: min_p = p
            elif p - min_p > profit: profit = p - min_p
        return profit`,
  },
  {
    id: 152,
    slug: 'maximum-product-subarray',
    title: '152. Maximum Product Subarray',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    archetype: 'kadane',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Find contiguous subarray within an array which has largest product, tracking both min and max.',
    defaultInput: '2, 3, -2, 4',
    defaultTarget: null,
    javaCode: `class Solution {
    public int maxProduct(int[] nums) {
        int max = nums[0], min = nums[0], ans = nums[0];
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] < 0) { int tmp = max; max = min; min = tmp; }
            max = Math.max(nums[i], max * nums[i]);
            min = Math.min(nums[i], min * nums[i]);
            ans = Math.max(ans, max);
        }
        return ans;
    }
}`,
    pythonCode: `class Solution:
    def maxProduct(self, nums: list[int]) -> int:
        cur_max, cur_min, res = nums[0], nums[0], nums[0]
        for x in nums[1:]:
            if x < 0: cur_max, cur_min = cur_min, cur_max
            cur_max = max(x, cur_max * x)
            cur_min = min(x, cur_min * x)
            res = max(res, cur_max)
        return res`,
  },
  {
    id: 238,
    slug: 'product-of-array-except-self',
    title: '238. Product of Array Except Self',
    difficulty: 'Medium',
    category: 'Arrays & Hashing',
    archetype: 'kadane',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Return array such that output[i] is equal to product of all elements of nums except nums[i] in O(n) time without division.',
    defaultInput: '1, 2, 3, 4',
    defaultTarget: null,
    javaCode: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] res = new int[n];
        res[0] = 1;
        for (int i = 1; i < n; i++) res[i] = res[i - 1] * nums[i - 1];
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            res[i] *= right;
            right *= nums[i];
        }
        return res;
    }
}`,
    pythonCode: `class Solution:
    def productExceptSelf(self, nums: list[int]) -> list[int]:
        n = len(nums)
        res = [1] * n
        for i in range(1, n):
            res[i] = res[i - 1] * nums[i - 1]
        right = 1
        for i in range(n - 1, -1, -1):
            res[i] *= right
            right *= nums[i]
        return res`,
  },

  // ==========================================
  // ARCHETYPE 4: SLIDING WINDOW
  // ==========================================
  {
    id: 3,
    slug: 'longest-substring-without-repeating-characters',
    title: '3. Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'Sliding Window',
    archetype: 'sliding-window',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(min(m, n))',
    description: 'Find length of longest substring without repeating characters using variable-length sliding window.',
    defaultInput: '1, 2, 3, 1, 2, 3, 4, 1',
    defaultTarget: null,
    javaCode: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        int[] last = new int[128];
        Arrays.fill(last, -1);
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.length(); right++) {
            if (last[s.charAt(right)] >= left) {
                left = last[s.charAt(right)] + 1;
            }
            last[s.charAt(right)] = right;
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`,
    pythonCode: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        seen = {}
        l = max_len = 0
        for r, c in enumerate(s):
            if c in seen and seen[c] >= l:
                l = seen[c] + 1
            seen[c] = r
            max_len = max(max_len, r - l + 1)
        return max_len`,
  },
  {
    id: 239,
    slug: 'sliding-window-maximum',
    title: '239. Sliding Window Maximum',
    difficulty: 'Hard',
    category: 'Sliding Window',
    archetype: 'sliding-window',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(k)',
    description: 'Find maximum element in sliding window of size k moving across array using monotonic deque in O(n).',
    defaultInput: '1, 3, -1, -3, 5, 3, 6, 7',
    defaultTarget: 3,
    javaCode: `class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        int n = nums.length;
        int[] res = new int[n - k + 1];
        Deque<Integer> dq = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            while (!dq.isEmpty() && dq.peekFirst() < i - k + 1) dq.pollFirst();
            while (!dq.isEmpty() && nums[dq.peekLast()] < nums[i]) dq.pollLast();
            dq.offerLast(i);
            if (i >= k - 1) res[i - k + 1] = nums[dq.peekFirst()];
        }
        return res;
    }
}`,
    pythonCode: `class Solution:
    def maxSlidingWindow(self, nums: list[int], k: int) -> list[int]:
        from collections import deque
        dq = deque()
        res = []
        for i, x in enumerate(nums):
            while dq and dq[0] < i - k + 1: dq.popleft()
            while dq and nums[dq[-1]] < x: dq.pop()
            dq.append(i)
            if i >= k - 1: res.append(nums[dq[0]])
        return res`,
  },

  // ==========================================
  // ARCHETYPE 5: STACKS & MONOTONIC
  // ==========================================
  {
    id: 20,
    slug: 'valid-parentheses',
    title: '20. Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack & Monotonic',
    archetype: 'stack',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Determine if input string of brackets \'()\', \'{}\', \'[]\' is valid with matching closures.',
    defaultInput: '10, 20, 30, 40',
    defaultTarget: null,
    javaCode: `class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`,
    pythonCode: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {')': '(', '}': '{', ']': '['}
        for char in s:
            if char in mapping:
                top = stack.pop() if stack else '#'
                if mapping[char] != top: return False
            else:
                stack.append(char)
        return not stack`,
  },
  {
    id: 155,
    slug: 'min-stack',
    title: '155. Min Stack',
    difficulty: 'Medium',
    category: 'Stack & Monotonic',
    archetype: 'stack',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(n)',
    description: 'Design stack that supports push, pop, top, and retrieving minimum element in constant time O(1).',
    defaultInput: '5, 2, 8, 1, 9',
    defaultTarget: null,
    javaCode: `class MinStack {
    private Stack<Integer> stack = new Stack<>();
    private Stack<Integer> minStack = new Stack<>();
    public void push(int val) {
        stack.push(val);
        if (minStack.isEmpty() || val <= minStack.peek()) minStack.push(val);
    }
    public void pop() {
        if (stack.pop().equals(minStack.peek())) minStack.pop();
    }
    public int top() { return stack.peek(); }
    public int getMin() { return minStack.peek(); }
}`,
    pythonCode: `class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []
    def push(self, val: int) -> None:
        self.stack.append(val)
        if not self.min_stack or val <= self.min_stack[-1]:
            self.min_stack.append(val)
    def pop(self) -> None:
        if self.stack.pop() == self.min_stack[-1]:
            self.min_stack.pop()
    def top(self) -> int:
        return self.stack[-1]
    def getMin(self) -> int:
        return self.min_stack[-1]`,
  },

  // ==========================================
  // ARCHETYPE 6: LINKED LISTS
  // ==========================================
  {
    id: 2,
    slug: 'add-two-numbers',
    title: '2. Add Two Numbers',
    difficulty: 'Medium',
    category: 'Linked Lists',
    archetype: 'linked-list',
    timeComplexity: 'O(max(m, n))',
    spaceComplexity: 'O(max(m, n))',
    description: 'Add two numbers represented by linked lists with digits stored in reverse order, returning sum as linked list.',
    defaultInput: '2, 4, 3, 5, 6, 4',
    defaultTarget: null,
    javaCode: `class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        int carry = 0;
        while (l1 != null || l2 != null || carry != 0) {
            int sum = carry;
            if (l1 != null) { sum += l1.val; l1 = l1.next; }
            if (l2 != null) { sum += l2.val; l2 = l2.next; }
            carry = sum / 10;
            curr.next = new ListNode(sum % 10);
            curr = curr.next;
        }
        return dummy.next;
    }
}`,
    pythonCode: `class Solution:
    def addTwoNumbers(self, l1: ListNode, l2: ListNode) -> ListNode:
        dummy = ListNode(0)
        curr, carry = dummy, 0
        while l1 or l2 or carry:
            v1 = l1.val if l1 else 0
            v2 = l2.val if l2 else 0
            carry, val = divmod(v1 + v2 + carry, 10)
            curr.next = ListNode(val)
            curr = curr.next
            l1 = l1.next if l1 else None
            l2 = l2.next if l2 else None
        return dummy.next`,
  },
  {
    id: 21,
    slug: 'merge-two-sorted-lists',
    title: '21. Merge Two Sorted Lists',
    difficulty: 'Easy',
    category: 'Linked Lists',
    archetype: 'linked-list',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(1)',
    description: 'Merge two sorted linked lists into one sorted list by splicing together nodes.',
    defaultInput: '1, 2, 4, 1, 3, 4',
    defaultTarget: null,
    javaCode: `class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) {
                curr.next = list1; list1 = list1.next;
            } else {
                curr.next = list2; list2 = list2.next;
            }
            curr = curr.next;
        }
        curr.next = list1 != null ? list1 : list2;
        return dummy.next;
    }
}`,
    pythonCode: `class Solution:
    def mergeTwoLists(self, l1: ListNode, l2: ListNode) -> ListNode:
        dummy = ListNode(0)
        curr = dummy
        while l1 and l2:
            if l1.val <= l2.val:
                curr.next, l1 = l1, l1.next
            else:
                curr.next, l2 = l2, l2.next
            curr = curr.next
        curr.next = l1 or l2
        return dummy.next`,
  },
  {
    id: 141,
    slug: 'linked-list-cycle',
    title: '141. Linked List Cycle',
    difficulty: 'Easy',
    category: 'Linked Lists',
    archetype: 'cycle-detection',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Determine if linked list has a cycle using Floyd\'s Tortoise and Hare (slow and fast pointers).',
    defaultInput: '3, 2, 0, -4',
    defaultTarget: null,
    javaCode: `class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }
}`,
    pythonCode: `class Solution:
    def hasCycle(self, head: ListNode) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast: return True
        return False`,
  },
  {
    id: 146,
    slug: 'lru-cache',
    title: '146. LRU Cache',
    difficulty: 'Medium',
    category: 'Linked Lists',
    archetype: 'linked-list',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(capacity)',
    description: 'Design data structure that follows Least Recently Used (LRU) cache eviction constraints in O(1).',
    defaultInput: '1, 2, 3, 4',
    defaultTarget: 3,
    javaCode: `class LRUCache extends LinkedHashMap<Integer, Integer> {
    private int capacity;
    public LRUCache(int capacity) {
        super(capacity, 0.75f, true);
        this.capacity = capacity;
    }
    public int get(int key) { return super.getOrDefault(key, -1); }
    public void put(int key, int value) { super.put(key, value); }
    @Override
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
        return size() > capacity;
    }
}`,
    pythonCode: `from collections import OrderedDict
class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = OrderedDict()
    def get(self, key: int) -> int:
        if key not in self.cache: return -1
        self.cache.move_to_end(key)
        return self.cache[key]
    def put(self, key: int, value: int) -> None:
        if key in self.cache: self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.cap: self.cache.popitem(last=False)`,
  },
  {
    id: 206,
    slug: 'reverse-linked-list',
    title: '206. Reverse Linked List',
    difficulty: 'Easy',
    category: 'Linked Lists',
    archetype: 'linked-list',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Reverse singly linked list iteratively by mutating next pointer links with prev, curr, and next.',
    defaultInput: '1, 2, 3, 4, 5',
    defaultTarget: null,
    javaCode: `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null, curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
}`,
    pythonCode: `class Solution:
    def reverseList(self, head: ListNode) -> ListNode:
        prev, curr = None, head
        while curr:
            next_node = curr.next
            curr.next = prev
            prev = curr
            curr = next_node
        return prev`,
  },

  // ==========================================
  // ARCHETYPE 7: TREES & BST
  // ==========================================
  {
    id: 94,
    slug: 'binary-tree-inorder-traversal',
    title: '94. Binary Tree Inorder Traversal',
    difficulty: 'Easy',
    category: 'Trees & BST',
    archetype: 'tree',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Return inorder traversal (Left, Root, Right) of binary tree values.',
    defaultInput: '1, 2, 3, 4, 5',
    defaultTarget: null,
    javaCode: `class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        helper(root, res);
        return res;
    }
    private void helper(TreeNode node, List<Integer> res) {
        if (node == null) return;
        helper(node.left, res);
        res.add(node.val);
        helper(node.right, res);
    }
}`,
    pythonCode: `class Solution:
    def inorderTraversal(self, root: TreeNode) -> list[int]:
        res = []
        def dfs(node):
            if not node: return
            dfs(node.left)
            res.append(node.val)
            dfs(node.right)
        dfs(root)
        return res`,
  },
  {
    id: 102,
    slug: 'binary-tree-level-order-traversal',
    title: '102. Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    category: 'Trees & BST',
    archetype: 'tree',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Return level order traversal (breadth-first search) of binary tree node values.',
    defaultInput: '3, 9, 20, 15, 7',
    defaultTarget: null,
    javaCode: `class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> res = new ArrayList<>();
        if (root == null) return res;
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        while (!q.isEmpty()) {
            int sz = q.size();
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < sz; i++) {
                TreeNode node = q.poll();
                level.add(node.val);
                if (node.left != null) q.add(node.left);
                if (node.right != null) q.add(node.right);
            }
            res.add(level);
        }
        return res;
    }
}`,
    pythonCode: `class Solution:
    def levelOrder(self, root: TreeNode) -> list[list[int]]:
        if not root: return []
        res, q = [], [root]
        while q:
            res.append([n.val for n in q])
            q = [child for n in q for child in (n.left, n.right) if child]
        return res`,
  },
  {
    id: 104,
    slug: 'maximum-depth-of-binary-tree',
    title: '104. Maximum Depth of Binary Tree',
    difficulty: 'Easy',
    category: 'Trees & BST',
    archetype: 'tree',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    description: 'Find maximum depth or number of nodes along longest path from root to leaf node.',
    defaultInput: '3, 9, 20, 15, 7',
    defaultTarget: null,
    javaCode: `class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }
}`,
    pythonCode: `class Solution:
    def maxDepth(self, root: TreeNode) -> int:
        if not root: return 0
        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))`,
  },
  {
    id: 226,
    slug: 'invert-binary-tree',
    title: '226. Invert Binary Tree',
    difficulty: 'Easy',
    category: 'Trees & BST',
    archetype: 'tree',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    description: 'Invert binary tree by recursively swapping left and right child pointers.',
    defaultInput: '4, 2, 7, 1, 3, 6, 9',
    defaultTarget: null,
    javaCode: `class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode tmp = root.left;
        root.left = invertTree(root.right);
        root.right = invertTree(tmp);
        return root;
    }
}`,
    pythonCode: `class Solution:
    def invertTree(self, root: TreeNode) -> TreeNode:
        if not root: return None
        root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)
        return root`,
  },

  // ==========================================
  // ARCHETYPE 8: DYNAMIC PROGRAMMING & RECURSION
  // ==========================================
  {
    id: 42,
    slug: 'trapping-rain-water',
    title: '42. Trapping Rain Water',
    difficulty: 'Hard',
    category: 'Dynamic Programming',
    archetype: 'trapping-water',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Calculate total volume of water retained between elevation bars using converging boundaries.',
    defaultInput: '0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1',
    defaultTarget: null,
    javaCode: `class Solution {
    public int trap(int[] height) {
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0, total = 0;
        while (left <= right) {
            if (height[left] <= height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else total += leftMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else total += rightMax - height[right];
                right--;
            }
        }
        return total;
    }
}`,
    pythonCode: `class Solution:
    def trap(self, height: list[int]) -> int:
        l, r = 0, len(height) - 1
        l_max = r_max = total = 0
        while l <= r:
            if height[l] <= height[r]:
                if height[l] >= l_max: l_max = height[l]
                else: total += l_max - height[l]
                l += 1
            else:
                if height[r] >= r_max: r_max = height[r]
                else: total += r_max - height[r]
                r -= 1
        return total`,
  },
  {
    id: 70,
    slug: 'climbing-stairs',
    title: '70. Climbing Stairs',
    difficulty: 'Easy',
    category: 'Dynamic Programming',
    archetype: 'dp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Count distinct ways to climb n stairs where each time you can climb 1 or 2 steps.',
    defaultInput: '1, 2, 3, 5, 8',
    defaultTarget: 5,
    javaCode: `class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int prev2 = 1, prev1 = 2;
        for (int i = 3; i <= n; i++) {
            int cur = prev1 + prev2;
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }
}`,
    pythonCode: `class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2: return n
        a, b = 1, 2
        for _ in range(3, n + 1):
            a, b = b, a + b
        return b`,
  },
  {
    id: 198,
    slug: 'house-robber',
    title: '198. House Robber',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    archetype: 'dp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Determine maximum amount of money you can rob tonight without alerting police (no two adjacent houses robbed).',
    defaultInput: '2, 7, 9, 3, 1',
    defaultTarget: null,
    javaCode: `class Solution {
    public int rob(int[] nums) {
        int prev2 = 0, prev1 = 0;
        for (int x : nums) {
            int tmp = Math.max(prev1, prev2 + x);
            prev2 = prev1;
            prev1 = tmp;
        }
        return prev1;
    }
}`,
    pythonCode: `class Solution:
    def rob(self, nums: list[int]) -> int:
        p2 = p1 = 0
        for x in nums:
            p2, p1 = p1, max(p1, p2 + x)
        return p1`,
  },
  {
    id: 300,
    slug: 'longest-increasing-subsequence',
    title: '300. Longest Increasing Subsequence (LIS)',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    archetype: 'dp',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(n)',
    description: 'Find length of longest strictly increasing subsequence using 1D dynamic programming table.',
    defaultInput: '10, 9, 2, 5, 3, 7, 101, 18',
    defaultTarget: null,
    javaCode: `class Solution {
    public int lengthOfLIS(int[] nums) {
        int n = nums.length;
        int[] dp = new int[n];
        Arrays.fill(dp, 1);
        int maxLIS = 1;
        for (int i = 1; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
            }
            maxLIS = Math.max(maxLIS, dp[i]);
        }
        return maxLIS;
    }
}`,
    pythonCode: `class Solution:
    def lengthOfLIS(self, nums: list[int]) -> int:
        dp = [1] * len(nums)
        for i in range(1, len(nums)):
            for j in range(i):
                if nums[j] < nums[i]:
                    dp[i] = max(dp[i], dp[j] + 1)
        return max(dp) if dp else 0`,
  },

  // ==========================================
  // ARCHETYPE 9: 2D MATRIX & GRIDS
  // ==========================================
  {
    id: 48,
    slug: 'rotate-image',
    title: '48. Rotate Image (Matrix 90° Clockwise)',
    difficulty: 'Medium',
    category: '2D Matrix & Grids',
    archetype: 'matrix',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Rotate n × n 2D matrix representing an image by 90 degrees clockwise in-place.',
    defaultInput: '1, 2, 3, 4, 5, 6, 7, 8, 9',
    defaultTarget: null,
    javaCode: `class Solution {
    public void rotate(int[][] matrix) {
        int n = matrix.length;
        for (int i = 0; i < n; i++) {
            for (int j = i; j < n; j++) {
                int tmp = matrix[i][j];
                matrix[i][j] = matrix[j][i];
                matrix[j][i] = tmp;
            }
        }
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n / 2; j++) {
                int tmp = matrix[i][j];
                matrix[i][j] = matrix[i][n - 1 - j];
                matrix[i][n - 1 - j] = tmp;
            }
        }
    }
}`,
    pythonCode: `class Solution:
    def rotate(self, matrix: list[list[int]]) -> None:
        n = len(matrix)
        for i in range(n):
            for j in range(i, n):
                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
        for row in matrix:
            row.reverse()`,
  },
  {
    id: 200,
    slug: 'number-of-islands',
    title: '200. Number of Islands',
    difficulty: 'Medium',
    category: '2D Matrix & Grids',
    archetype: 'matrix',
    timeComplexity: 'O(m × n)',
    spaceComplexity: 'O(m × n)',
    description: 'Count number of connected islands in binary grid (\'1\' = land, \'0\' = water) using Breadth/Depth First Search flood fill.',
    defaultInput: '1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1',
    defaultTarget: null,
    javaCode: `class Solution {
    public int numIslands(char[][] grid) {
        int count = 0;
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[0].length; c++) {
                if (grid[r][c] == '1') {
                    dfs(grid, r, c);
                    count++;
                }
            }
        }
        return count;
    }
    private void dfs(char[][] grid, int r, int c) {
        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != '1') return;
        grid[r][c] = '0';
        dfs(grid, r + 1, c); dfs(grid, r - 1, c);
        dfs(grid, r, c + 1); dfs(grid, r, c - 1);
    }
}`,
    pythonCode: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        if not grid: return 0
        count = 0
        def dfs(r, c):
            if r < 0 or r >= len(grid) or c < 0 or c >= len(grid[0]) or grid[r][c] != '1':
                return
            grid[r][c] = '0'
            dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1)
        for r in range(len(grid)):
            for c in range(len(grid[0])):
                if grid[r][c] == '1':
                    dfs(r, c)
                    count += 1
        return count`,
  },

  // ==========================================
  // ARCHETYPE 10: GRAPHS & TOPOLOGICAL SORT
  // ==========================================
  {
    id: 207,
    slug: 'course-schedule',
    title: '207. Course Schedule (DAG Cycle Detection)',
    difficulty: 'Medium',
    category: 'Graphs',
    archetype: 'graph',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    description: 'Determine if you can finish all courses given prerequisites using Kahn\'s in-degree queue or DFS cycle detection.',
    defaultInput: '0, 1, 1, 2, 1',
    defaultTarget: null,
    javaCode: `class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        int[] inDegree = new int[numCourses];
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
        for (int[] p : prerequisites) {
            adj.get(p[1]).add(p[0]);
            inDegree[p[0]]++;
        }
        Queue<Integer> q = new LinkedList<>();
        for (int i = 0; i < numCourses; i++) if (inDegree[i] == 0) q.add(i);
        int visited = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            visited++;
            for (int v : adj.get(u)) if (--inDegree[v] == 0) q.add(v);
        }
        return visited == numCourses;
    }
}`,
    pythonCode: `class Solution:
    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> bool:
        adj = [[] for _ in range(numCourses)]
        in_deg = [0] * numCourses
        for dest, src in prerequisites:
            adj[src].append(dest)
            in_deg[dest] += 1
        q = [i for i in range(numCourses) if in_deg[i] == 0]
        vis = 0
        while q:
            u = q.pop(0)
            vis += 1
            for v in adj[u]:
                in_deg[v] -= 1
                if in_deg[v] == 0: q.append(v)
        return vis == numCourses`,
  },
  {
    id: 208,
    slug: 'implement-trie-prefix-tree',
    title: '208. Implement Trie (Prefix Tree)',
    difficulty: 'Medium',
    category: 'Trees & BST',
    archetype: 'trie',
    timeComplexity: 'O(L)',
    spaceComplexity: 'O(N × L)',
    description: 'Implement prefix tree supporting insert, search, and startsWith operations in O(L) time.',
    defaultInput: '1, 2, 3, 4',
    defaultTarget: null,
    javaCode: `class Trie {
    private class Node {
        Node[] next = new Node[26];
        boolean isEnd = false;
    }
    private Node root = new Node();
    public void insert(String word) {
        Node curr = root;
        for (char c : word.toCharArray()) {
            if (curr.next[c - 'a'] == null) curr.next[c - 'a'] = new Node();
            curr = curr.next[c - 'a'];
        }
        curr.isEnd = true;
    }
    public boolean search(String word) {
        Node n = find(word);
        return n != null && n.isEnd;
    }
    public boolean startsWith(String prefix) {
        return find(prefix) != null;
    }
    private Node find(String s) {
        Node curr = root;
        for (char c : s.toCharArray()) {
            if (curr.next[c - 'a'] == null) return null;
            curr = curr.next[c - 'a'];
        }
        return curr;
    }
}`,
    pythonCode: `class Trie:
    def __init__(self):
        self.root = {}
    def insert(self, word: str) -> None:
        curr = self.root
        for c in word:
            if c not in curr: curr[c] = {}
            curr = curr[c]
        curr['#'] = True
    def search(self, word: str) -> bool:
        curr = self.root
        for c in word:
            if c not in curr: return False
            curr = curr[c]
        return '#' in curr
    def startsWith(self, prefix: str) -> bool:
        curr = self.root
        for c in prefix:
            if c not in curr: return False
            curr = curr[c]
        return True`,
  },
  {
    id: 215,
    slug: 'kth-largest-element-in-an-array',
    title: '215. Kth Largest Element in an Array',
    difficulty: 'Medium',
    category: 'Heaps & Priority Queue',
    archetype: 'heap',
    timeComplexity: 'O(n log k)',
    spaceComplexity: 'O(k)',
    description: 'Find kth largest element in an unsorted array using min-heap priority queue of size k.',
    defaultInput: '3, 2, 1, 5, 6, 4',
    defaultTarget: 2,
    javaCode: `class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        for (int x : nums) {
            minHeap.add(x);
            if (minHeap.size() > k) minHeap.poll();
        }
        return minHeap.peek();
    }
}`,
    pythonCode: `import heapq
class Solution:
    def findKthLargest(self, nums: list[int], k: int) -> int:
        return heapq.nlargest(k, nums)[-1]`,
  },
  {
    id: 217,
    slug: 'contains-duplicate',
    title: '217. Contains Duplicate',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    archetype: 'two-pointers',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Return true if any value appears at least twice in the array using hash set lookup.',
    defaultInput: '1, 2, 3, 1',
    defaultTarget: null,
    javaCode: `class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int x : nums) {
            if (!set.add(x)) return true;
        }
        return false;
    }
}`,
    pythonCode: `class Solution:
    def containsDuplicate(self, nums: list[int]) -> bool:
        return len(nums) != len(set(nums))`,
  },
  {
    id: 287,
    slug: 'find-the-duplicate-number',
    title: '287. Find the Duplicate Number (Floyd\'s Cycle)',
    difficulty: 'Medium',
    category: 'Linked Lists',
    archetype: 'cycle-detection',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Find the duplicate number in array of n + 1 integers between 1 and n without modifying array and using only O(1) space.',
    defaultInput: '1, 3, 4, 2, 2',
    defaultTarget: null,
    javaCode: `class Solution {
    public int findDuplicate(int[] nums) {
        int slow = nums[0], fast = nums[0];
        do {
            slow = nums[slow];
            fast = nums[nums[fast]];
        } while (slow != fast);
        fast = nums[0];
        while (slow != fast) {
            slow = nums[slow];
            fast = nums[fast];
        }
        return slow;
    }
}`,
    pythonCode: `class Solution:
    def findDuplicate(self, nums: list[int]) -> int:
        slow = fast = nums[0]
        while True:
            slow = nums[slow]
            fast = nums[nums[fast]]
            if slow == fast: break
        fast = nums[0]
        while slow != fast:
            slow = nums[slow]
            fast = nums[fast]
        return slow`,
  }
,
  {
  id: 5,
  slug: "longest-palindromic-substring",
  title: "5. Longest Palindromic Substring",
  difficulty: "Medium",
  category: "Two Pointers",
  archetype: "two-pointers",
  timeComplexity: "O(n²)",
  spaceComplexity: "O(1)",
  description: "Given a string s, return the longest palindromic substring in s using expand around center approach.",
  defaultInput: "1, 2, 3, 2, 1, 9",
  defaultTarget: null,
  javaCode: "class Solution {\n    public String longestPalindrome(String s) {\n        if (s == null || s.length() < 1) return \"\";\n        int start = 0, end = 0;\n        for (int i = 0; i < s.length(); i++) {\n            int len1 = expandAroundCenter(s, i, i);\n            int len2 = expandAroundCenter(s, i, i + 1);\n            int len = Math.max(len1, len2);\n            if (len > end - start) {\n                start = i - (len - 1) / 2;\n                end = i + len / 2;\n            }\n        }\n        return s.substring(start, end + 1);\n    }\n    private int expandAroundCenter(String s, int left, int right) {\n        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {\n            left--;\n            right++;\n        }\n        return right - left - 1;\n    }\n}",
  pythonCode: "class Solution:\n    def longestPalindrome(self, s: str) -> str:\n        res = \"\"\n        for i in range(len(s)):\n            # Odd length\n            l, r = i, i\n            while l >= 0 and r < len(s) and s[l] == s[r]:\n                if (r - l + 1) > len(res): res = s[l:r+1]\n                l -= 1; r += 1\n            # Even length\n            l, r = i, i + 1\n            while l >= 0 and r < len(s) and s[l] == s[r]:\n                if (r - l + 1) > len(res): res = s[l:r+1]\n                l -= 1; r += 1\n        return res"
},
  {
  id: 19,
  slug: "remove-nth-node-from-end-of-list",
  title: "19. Remove Nth Node From End of List",
  difficulty: "Medium",
  category: "Linked Lists",
  archetype: "linked-list",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "Given the head of a linked list, remove the nth node from the end of the list and return its head in one single pass.",
  defaultInput: "1, 2, 3, 4, 5",
  defaultTarget: 2,
  javaCode: "class Solution {\n    public ListNode removeNthFromEnd(ListNode head, int n) {\n        ListNode dummy = new ListNode(0);\n        dummy.next = head;\n        ListNode fast = dummy, slow = dummy;\n        for (int i = 0; i <= n; i++) {\n            fast = fast.next;\n        }\n        while (fast != null) {\n            fast = fast.next;\n            slow = slow.next;\n        }\n        slow.next = slow.next.next;\n        return dummy.next;\n    }\n}",
  pythonCode: "class Solution:\n    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:\n        dummy = ListNode(0, head)\n        fast = slow = dummy\n        for _ in range(n + 1):\n            fast = fast.next\n        while fast:\n            fast = fast.next\n            slow = slow.next\n        slow.next = slow.next.next\n        return dummy.next"
},
  {
  id: 22,
  slug: "generate-parentheses",
  title: "22. Generate Parentheses",
  difficulty: "Medium",
  category: "Stack & Monotonic",
  archetype: "recursion-backtracking",
  timeComplexity: "O(4ⁿ / √n)",
  spaceComplexity: "O(n)",
  description: "Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.",
  defaultInput: "3",
  defaultTarget: null,
  javaCode: "class Solution {\n    public List<String> generateParenthesis(int n) {\n        List<String> res = new ArrayList<>();\n        backtrack(res, new StringBuilder(), 0, 0, n);\n        return res;\n    }\n    private void backtrack(List<String> res, StringBuilder sb, int open, int close, int max) {\n        if (sb.length() == max * 2) {\n            res.add(sb.toString());\n            return;\n        }\n        if (open < max) {\n            sb.append('(');\n            backtrack(res, sb, open + 1, close, max);\n            sb.deleteCharAt(sb.length() - 1);\n        }\n        if (close < open) {\n            sb.append(')');\n            backtrack(res, sb, open, close + 1, max);\n            sb.deleteCharAt(sb.length() - 1);\n        }\n    }\n}",
  pythonCode: "class Solution:\n    def generateParenthesis(self, n: int) -> list[str]:\n        res = []\n        def backtrack(s, open_b, close_b):\n            if len(s) == 2 * n:\n                res.append(s)\n                return\n            if open_b < n:\n                backtrack(s + \"(\", open_b + 1, close_b)\n            if close_b < open_b:\n                backtrack(s + \")\", open_b, close_b + 1)\n        backtrack(\"\", 0, 0)\n        return res"
},
  {
  id: 23,
  slug: "merge-k-sorted-lists",
  title: "23. Merge k Sorted Lists",
  difficulty: "Hard",
  category: "Heaps & Priority Queue",
  archetype: "heap",
  timeComplexity: "O(N log k)",
  spaceComplexity: "O(k)",
  description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all into one sorted linked-list.",
  defaultInput: "1, 4, 5, 1, 3, 4, 2, 6",
  defaultTarget: null,
  javaCode: "class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        if (lists == null || lists.length == 0) return null;\n        PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);\n        for (ListNode node : lists) {\n            if (node != null) pq.add(node);\n        }\n        ListNode dummy = new ListNode(0);\n        ListNode curr = dummy;\n        while (!pq.isEmpty()) {\n            ListNode min = pq.poll();\n            curr.next = min;\n            curr = curr.next;\n            if (min.next != null) pq.add(min.next);\n        }\n        return dummy.next;\n    }\n}",
  pythonCode: "class Solution:\n    def mergeKLists(self, lists: list[Optional[ListNode]]) -> Optional[ListNode]:\n        heap = []\n        for i, l in enumerate(lists):\n            if l: heapq.heappush(heap, (l.val, i, l))\n        dummy = ListNode(0)\n        curr = dummy\n        while heap:\n            val, i, node = heapq.heappop(heap)\n            curr.next = node\n            curr = curr.next\n            if node.next:\n                heapq.heappush(heap, (node.next.val, i, node.next))\n        return dummy.next"
},
  {
  id: 34,
  slug: "find-first-and-last-position-of-element-in-sorted-array",
  title: "34. Find First and Last Position in Sorted Array",
  difficulty: "Medium",
  category: "Binary Search",
  archetype: "binary-search",
  timeComplexity: "O(log n)",
  spaceComplexity: "O(1)",
  description: "Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value.",
  defaultInput: "5, 7, 7, 8, 8, 10",
  defaultTarget: 8,
  javaCode: "class Solution {\n    public int[] searchRange(int[] nums, int target) {\n        int first = findBound(nums, target, true);\n        if (first == -1) return new int[]{-1, -1};\n        int last = findBound(nums, target, false);\n        return new int[]{first, last};\n    }\n    private int findBound(int[] nums, int target, boolean isFirst) {\n        int l = 0, r = nums.length - 1, ans = -1;\n        while (l <= r) {\n            int mid = l + (r - l) / 2;\n            if (nums[mid] == target) {\n                ans = mid;\n                if (isFirst) r = mid - 1;\n                else l = mid + 1;\n            } else if (nums[mid] < target) l = mid + 1;\n            else r = mid - 1;\n        }\n        return ans;\n    }\n}",
  pythonCode: "class Solution:\n    def searchRange(self, nums: list[int], target: int) -> list[int]:\n        def findBound(is_first):\n            l, r, ans = 0, len(nums) - 1, -1\n            while l <= r:\n                mid = (l + r) // 2\n                if nums[mid] == target:\n                    ans = mid\n                    if is_first: r = mid - 1\n                    else: l = mid + 1\n                elif nums[mid] < target: l = mid + 1\n                else: r = mid - 1\n            return ans\n        first = findBound(True)\n        if first == -1: return [-1, -1]\n        return [first, findBound(False)]"
},
  {
  id: 39,
  slug: "combination-sum",
  title: "39. Combination Sum",
  difficulty: "Medium",
  category: "Dynamic Programming",
  archetype: "recursion-backtracking",
  timeComplexity: "O(2^t)",
  spaceComplexity: "O(t)",
  description: "Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations where the chosen numbers sum to target.",
  defaultInput: "2, 3, 6, 7",
  defaultTarget: 7,
  javaCode: "class Solution {\n    public List<List<Integer>> combinationSum(int[] candidates, int target) {\n        List<List<Integer>> result = new ArrayList<>();\n        backtrack(candidates, target, 0, new ArrayList<>(), result);\n        return result;\n    }\n    private void backtrack(int[] nums, int remain, int start, List<Integer> curr, List<List<Integer>> result) {\n        if (remain == 0) {\n            result.add(new ArrayList<>(curr));\n            return;\n        }\n        for (int i = start; i < nums.length; i++) {\n            if (nums[i] <= remain) {\n                curr.add(nums[i]);\n                backtrack(nums, remain - nums[i], i, curr, result);\n                curr.remove(curr.size() - 1);\n            }\n        }\n    }\n}",
  pythonCode: "class Solution:\n    def combinationSum(self, candidates: list[int], target: int) -> list[list[int]]:\n        res = []\n        def dfs(i, cur, total):\n            if total == target:\n                res.append(cur.copy())\n                return\n            if i >= len(candidates) or total > target: return\n            cur.append(candidates[i])\n            dfs(i, cur, total + candidates[i])\n            cur.pop()\n            dfs(i + 1, cur, total)\n        dfs(0, [], 0)\n        return res"
},
  {
  id: 46,
  slug: "permutations",
  title: "46. Permutations",
  difficulty: "Medium",
  category: "Dynamic Programming",
  archetype: "recursion-backtracking",
  timeComplexity: "O(n * n!)",
  spaceComplexity: "O(n!)",
  description: "Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.",
  defaultInput: "1, 2, 3",
  defaultTarget: null,
  javaCode: "class Solution {\n    public List<List<Integer>> permute(int[] nums) {\n        List<List<Integer>> res = new ArrayList<>();\n        backtrack(nums, new boolean[nums.length], new ArrayList<>(), res);\n        return res;\n    }\n    private void backtrack(int[] nums, boolean[] used, List<Integer> curr, List<List<Integer>> res) {\n        if (curr.size() == nums.length) {\n            res.add(new ArrayList<>(curr));\n            return;\n        }\n        for (int i = 0; i < nums.length; i++) {\n            if (used[i]) continue;\n            used[i] = true;\n            curr.add(nums[i]);\n            backtrack(nums, used, curr, res);\n            curr.remove(curr.size() - 1);\n            used[i] = false;\n        }\n    }\n}",
  pythonCode: "class Solution:\n    def permute(self, nums: list[int]) -> list[list[int]]:\n        res = []\n        def backtrack(curr, remaining):\n            if not remaining:\n                res.append(curr)\n                return\n            for i in range(len(remaining)):\n                backtrack(curr + [remaining[i]], remaining[:i] + remaining[i+1:])\n        backtrack([], nums)\n        return res"
},
  {
  id: 49,
  slug: "group-anagrams",
  title: "49. Group Anagrams",
  difficulty: "Medium",
  category: "Arrays & Hashing",
  archetype: "two-pointers",
  timeComplexity: "O(n * k log k)",
  spaceComplexity: "O(n * k)",
  description: "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
  defaultInput: "10, 20, 30, 40",
  defaultTarget: null,
  javaCode: "class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        Map<String, List<String>> map = new HashMap<>();\n        for (String s : strs) {\n            char[] ca = s.toCharArray();\n            Arrays.sort(ca);\n            String key = String.valueOf(ca);\n            map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);\n        }\n        return new ArrayList<>(map.values());\n    }\n}",
  pythonCode: "class Solution:\n    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:\n        ans = collections.defaultdict(list)\n        for s in strs:\n            count = [0] * 26\n            for c in s: count[ord(c) - ord('a')] += 1\n            ans[tuple(count)].append(s)\n        return list(ans.values())"
},
  {
  id: 55,
  slug: "jump-game",
  title: "55. Jump Game",
  difficulty: "Medium",
  category: "Dynamic Programming",
  archetype: "kadane-stock",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "You are given an integer array nums. You are initially positioned at the array's first index. Return true if you can reach the last index.",
  defaultInput: "2, 3, 1, 1, 4",
  defaultTarget: null,
  javaCode: "class Solution {\n    public boolean canJump(int[] nums) {\n        int maxReach = 0;\n        for (int i = 0; i < nums.length; i++) {\n            if (i > maxReach) return false;\n            maxReach = Math.max(maxReach, i + nums[i]);\n            if (maxReach >= nums.length - 1) return true;\n        }\n        return true;\n    }\n}",
  pythonCode: "class Solution:\n    def canJump(self, nums: list[int]) -> bool:\n        goal = len(nums) - 1\n        for i in range(len(nums) - 1, -1, -1):\n            if i + nums[i] >= goal:\n                goal = i\n        return goal == 0"
},
  {
  id: 56,
  slug: "merge-intervals",
  title: "56. Merge Intervals",
  difficulty: "Medium",
  category: "Arrays & Hashing",
  archetype: "sorting",
  timeComplexity: "O(n log n)",
  spaceComplexity: "O(n)",
  description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals.",
  defaultInput: "1, 3, 2, 6, 8, 10, 15, 18",
  defaultTarget: null,
  javaCode: "class Solution {\n    public int[][] merge(int[][] intervals) {\n        if (intervals.length <= 1) return intervals;\n        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));\n        List<int[]> result = new ArrayList<>();\n        int[] curr = intervals[0];\n        result.add(curr);\n        for (int[] interval : intervals) {\n            if (curr[1] >= interval[0]) {\n                curr[1] = Math.max(curr[1], interval[1]);\n            } else {\n                curr = interval;\n                result.add(curr);\n            }\n        }\n        return result.toArray(new int[result.size()][]);\n    }\n}",
  pythonCode: "class Solution:\n    def merge(self, intervals: list[list[int]]) -> list[list[int]]:\n        intervals.sort(key=lambda x: x[0])\n        merged = []\n        for interval in intervals:\n            if not merged or merged[-1][1] < interval[0]:\n                merged.append(interval)\n            else:\n                merged[-1][1] = max(merged[-1][1], interval[1])\n        return merged"
},
  {
  id: 62,
  slug: "unique-paths",
  title: "62. Unique Paths",
  difficulty: "Medium",
  category: "Dynamic Programming",
  archetype: "dp",
  timeComplexity: "O(m * n)",
  spaceComplexity: "O(n)",
  description: "A robot is located at top-left corner of m x n grid. The robot can only move right or down. How many unique paths exist to bottom-right corner?",
  defaultInput: "3, 7",
  defaultTarget: null,
  javaCode: "class Solution {\n    public int uniquePaths(int m, int n) {\n        int[] dp = new int[n];\n        Arrays.fill(dp, 1);\n        for (int i = 1; i < m; i++) {\n            for (int j = 1; j < n; j++) {\n                dp[j] += dp[j - 1];\n            }\n        }\n        return dp[n - 1];\n    }\n}",
  pythonCode: "class Solution:\n    def uniquePaths(self, m: int, n: int) -> int:\n        row = [1] * n\n        for i in range(m - 1):\n            new_row = [1] * n\n            for j in range(1, n):\n                new_row[j] = new_row[j - 1] + row[j]\n            row = new_row\n        return row[-1]"
},
  {
  id: 64,
  slug: "minimum-path-sum",
  title: "64. Minimum Path Sum",
  difficulty: "Medium",
  category: "Dynamic Programming",
  archetype: "dp",
  timeComplexity: "O(m * n)",
  spaceComplexity: "O(1)",
  description: "Given a m x n grid filled with non-negative numbers, find a path from top left to bottom right, which minimizes the sum of all numbers along its path.",
  defaultInput: "1, 3, 1, 1, 5, 1, 4, 2, 1",
  defaultTarget: null,
  javaCode: "class Solution {\n    public int minPathSum(int[][] grid) {\n        int m = grid.length, n = grid[0].length;\n        for (int i = 0; i < m; i++) {\n            for (int j = 0; j < n; j++) {\n                if (i == 0 && j == 0) continue;\n                if (i == 0) grid[i][j] += grid[i][j - 1];\n                else if (j == 0) grid[i][j] += grid[i - 1][j];\n                else grid[i][j] += Math.min(grid[i - 1][j], grid[i][j - 1]);\n            }\n        }\n        return grid[m - 1][n - 1];\n    }\n}",
  pythonCode: "class Solution:\n    def minPathSum(self, grid: list[list[int]]) -> int:\n        m, n = len(grid), len(grid[0])\n        for r in range(m):\n            for c in range(n):\n                if r == 0 and c == 0: continue\n                elif r == 0: grid[r][c] += grid[r][c - 1]\n                elif c == 0: grid[r][c] += grid[r - 1][c]\n                else: grid[r][c] += min(grid[r - 1][c], grid[r][c - 1])\n        return grid[-1][-1]"
},
  {
  id: 72,
  slug: "edit-distance",
  title: "72. Edit Distance",
  difficulty: "Medium",
  category: "Dynamic Programming",
  archetype: "dp",
  timeComplexity: "O(m * n)",
  spaceComplexity: "O(m * n)",
  description: "Given two strings word1 and word2, return the minimum operations (insert, delete, replace) required to convert word1 to word2.",
  defaultInput: "5, 3",
  defaultTarget: null,
  javaCode: "class Solution {\n    public int minDistance(String word1, String word2) {\n        int m = word1.length(), n = word2.length();\n        int[][] dp = new int[m + 1][n + 1];\n        for (int i = 0; i <= m; i++) dp[i][0] = i;\n        for (int j = 0; j <= n; j++) dp[0][j] = j;\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {\n                    dp[i][j] = dp[i - 1][j - 1];\n                } else {\n                    dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));\n                }\n            }\n        }\n        return dp[m][n];\n    }\n}",
  pythonCode: "class Solution:\n    def minDistance(self, word1: str, word2: str) -> int:\n        m, n = len(word1), len(word2)\n        dp = [[0] * (n + 1) for _ in range(m + 1)]\n        for i in range(m + 1): dp[i][0] = i\n        for j in range(n + 1): dp[0][j] = j\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):\n                if word1[i-1] == word2[j-1]: dp[i][j] = dp[i-1][j-1]\n                else: dp[i][j] = 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])\n        return dp[m][n]"
},
  {
  id: 76,
  slug: "minimum-window-substring",
  title: "76. Minimum Window Substring",
  difficulty: "Hard",
  category: "Sliding Window",
  archetype: "sliding-window",
  timeComplexity: "O(m + n)",
  spaceComplexity: "O(k)",
  description: "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t is included.",
  defaultInput: "10, 20, 30, 40, 50",
  defaultTarget: null,
  javaCode: "class Solution {\n    public String minWindow(String s, String t) {\n        if (s.length() < t.length()) return \"\";\n        Map<Character, Integer> target = new HashMap<>();\n        for (char c : t.toCharArray()) target.put(c, target.getOrDefault(c, 0) + 1);\n        int l = 0, match = 0, minLen = Integer.MAX_VALUE, start = 0;\n        Map<Character, Integer> window = new HashMap<>();\n        for (int r = 0; r < s.length(); r++) {\n            char c = s.charAt(r);\n            window.put(c, window.getOrDefault(c, 0) + 1);\n            if (target.containsKey(c) && window.get(c).intValue() == target.get(c).intValue()) match++;\n            while (match == target.size()) {\n                if (r - l + 1 < minLen) {\n                    minLen = r - l + 1;\n                    start = l;\n                }\n                char leftChar = s.charAt(l);\n                window.put(leftChar, window.get(leftChar) - 1);\n                if (target.containsKey(leftChar) && window.get(leftChar) < target.get(leftChar)) match--;\n                l++;\n            }\n        }\n        return minLen == Integer.MAX_VALUE ? \"\" : s.substring(start, start + minLen);\n    }\n}",
  pythonCode: "class Solution:\n    def minWindow(self, s: str, t: str) -> str:\n        if not t or not s: return \"\"\n        dict_t = collections.Counter(t)\n        required = len(dict_t)\n        l, r = 0, 0\n        formed = 0\n        window_counts = {}\n        ans = float(\"inf\"), None, None\n        while r < len(s):\n            char = s[r]\n            window_counts[char] = window_counts.get(char, 0) + 1\n            if char in dict_t and window_counts[char] == dict_t[char]: formed += 1\n            while l <= r and formed == required:\n                if (r - l + 1) < ans[0]: ans = (r - l + 1, l, r)\n                window_counts[s[l]] -= 1\n                if s[l] in dict_t and window_counts[s[l]] < dict_t[s[l]]: formed -= 1\n                l += 1\n            r += 1\n        return \"\" if ans[0] == float(\"inf\") else s[ans[1] : ans[2] + 1]"
},
  {
  id: 78,
  slug: "subsets",
  title: "78. Subsets",
  difficulty: "Medium",
  category: "Dynamic Programming",
  archetype: "recursion-backtracking",
  timeComplexity: "O(n * 2ⁿ)",
  spaceComplexity: "O(n)",
  description: "Given an integer array nums of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets.",
  defaultInput: "1, 2, 3",
  defaultTarget: null,
  javaCode: "class Solution {\n    public List<List<Integer>> subsets(int[] nums) {\n        List<List<Integer>> result = new ArrayList<>();\n        backtrack(nums, 0, new ArrayList<>(), result);\n        return result;\n    }\n    private void backtrack(int[] nums, int index, List<Integer> current, List<List<Integer>> result) {\n        result.add(new ArrayList<>(current));\n        for (int i = index; i < nums.length; i++) {\n            current.add(nums[i]);\n            backtrack(nums, i + 1, current, result);\n            current.remove(current.size() - 1);\n        }\n    }\n}",
  pythonCode: "class Solution:\n    def subsets(self, nums: list[int]) -> list[list[int]]:\n        res = []\n        def dfs(i, cur):\n            if i >= len(nums):\n                res.append(cur.copy())\n                return\n            cur.append(nums[i])\n            dfs(i + 1, cur)\n            cur.pop()\n            dfs(i + 1, cur)\n        dfs(0, [])\n        return res"
},
  {
  id: 79,
  slug: "word-search",
  title: "79. Word Search",
  difficulty: "Medium",
  category: "2D Matrix & Grids",
  archetype: "matrix-2d",
  timeComplexity: "O(N * 3^L)",
  spaceComplexity: "O(L)",
  description: "Given an m x n grid of characters board and a string word, return true if word exists in the grid.",
  defaultInput: "4, 4",
  defaultTarget: null,
  javaCode: "class Solution {\n    public boolean exist(char[][] board, String word) {\n        for (int r = 0; r < board.length; r++) {\n            for (int c = 0; c < board[0].length; c++) {\n                if (dfs(board, word, r, c, 0)) return true;\n            }\n        }\n        return false;\n    }\n    private boolean dfs(char[][] b, String w, int r, int c, int idx) {\n        if (idx == w.length()) return true;\n        if (r < 0 || c < 0 || r >= b.length || c >= b[0].length || b[r][c] != w.charAt(idx)) return false;\n        char temp = b[r][c];\n        b[r][c] = '#';\n        boolean found = dfs(b, w, r+1, c, idx+1) || dfs(b, w, r-1, c, idx+1) || dfs(b, w, r, c+1, idx+1) || dfs(b, w, r, c-1, idx+1);\n        b[r][c] = temp;\n        return found;\n    }\n}",
  pythonCode: "class Solution:\n    def exist(self, board: list[list[str]], word: str) -> bool:\n        ROWS, COLS = len(board), len(board[0])\n        def dfs(r, c, i):\n            if i == len(word): return True\n            if (r < 0 or c < 0 or r >= ROWS or c >= COLS or board[r][c] != word[i]): return False\n            temp = board[r][c]\n            board[r][c] = \"#\"\n            res = (dfs(r+1, c, i+1) or dfs(r-1, c, i+1) or dfs(r, c+1, i+1) or dfs(r, c-1, i+1))\n            board[r][c] = temp\n            return res\n        for r in range(ROWS):\n            for c in range(COLS):\n                if dfs(r, c, 0): return True\n        return False"
},
  {
  id: 84,
  slug: "largest-rectangle-in-histogram",
  title: "84. Largest Rectangle in Histogram",
  difficulty: "Hard",
  category: "Stack & Monotonic",
  archetype: "monotonic-stack",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  description: "Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return area of largest rectangle.",
  defaultInput: "2, 1, 5, 6, 2, 3",
  defaultTarget: null,
  javaCode: "class Solution {\n    public int largestRectangleArea(int[] heights) {\n        Stack<Integer> stack = new Stack<>();\n        int maxArea = 0;\n        int n = heights.length;\n        for (int i = 0; i <= n; i++) {\n            int h = (i == n) ? 0 : heights[i];\n            while (!stack.isEmpty() && h < heights[stack.peek()]) {\n                int height = heights[stack.pop()];\n                int width = stack.isEmpty() ? i : i - stack.peek() - 1;\n                maxArea = Math.max(maxArea, height * width);\n            }\n            stack.push(i);\n        }\n        return maxArea;\n    }\n}",
  pythonCode: "class Solution:\n    def largestRectangleArea(self, heights: list[int]) -> int:\n        stack = []\n        max_area = 0\n        for i, h in enumerate(heights):\n            start = i\n            while stack and stack[-1][1] > h:\n                idx, height = stack.pop()\n                max_area = max(max_area, height * (i - idx))\n                start = idx\n            stack.append((start, h))\n        for i, h in stack:\n            max_area = max(max_area, h * (len(heights) - i))\n        return max_area"
},
  {
  id: 98,
  slug: "validate-binary-search-tree",
  title: "98. Validate Binary Search Tree",
  difficulty: "Medium",
  category: "Trees & BST",
  archetype: "tree-bst",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST). Every node on left must be smaller and right must be greater.",
  defaultInput: "5, 1, 4, null, null, 3, 6",
  defaultTarget: null,
  javaCode: "class Solution {\n    public boolean isValidBST(TreeNode root) {\n        return validate(root, null, null);\n    }\n    private boolean validate(TreeNode node, Integer low, Integer high) {\n        if (node == null) return true;\n        if ((low != null && node.val <= low) || (high != null && node.val >= high)) return false;\n        return validate(node.left, low, node.val) && validate(node.right, node.val, high);\n    }\n}",
  pythonCode: "class Solution:\n    def isValidBST(self, root: Optional[TreeNode]) -> bool:\n        def valid(node, left, right):\n            if not node: return True\n            if not (left < node.val < right): return False\n            return valid(node.left, left, node.val) and valid(node.right, node.val, right)\n        return valid(root, float(\"-inf\"), float(\"inf\"))"
},
  {
  id: 100,
  slug: "same-tree",
  title: "100. Same Tree",
  difficulty: "Easy",
  category: "Trees & BST",
  archetype: "tree-bst",
  timeComplexity: "O(n)",
  spaceComplexity: "O(h)",
  description: "Given roots of two binary trees p and q, write a function to check if they are the same or not structurally identical with equal values.",
  defaultInput: "1, 2, 3, 1, 2, 3",
  defaultTarget: null,
  javaCode: "class Solution {\n    public boolean isSameTree(TreeNode p, TreeNode q) {\n        if (p == null && q == null) return true;\n        if (p == null || q == null || p.val != q.val) return false;\n        return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);\n    }\n}",
  pythonCode: "class Solution:\n    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:\n        if not p and not q: return True\n        if not p or not q or p.val != q.val: return False\n        return self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right)"
},
  {
  id: 101,
  slug: "symmetric-tree",
  title: "101. Symmetric Tree",
  difficulty: "Easy",
  category: "Trees & BST",
  archetype: "tree-bst",
  timeComplexity: "O(n)",
  spaceComplexity: "O(h)",
  description: "Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).",
  defaultInput: "1, 2, 2, 3, 4, 4, 3",
  defaultTarget: null,
  javaCode: "class Solution {\n    public boolean isSymmetric(TreeNode root) {\n        return root == null || isMirror(root.left, root.right);\n    }\n    private boolean isMirror(TreeNode t1, TreeNode t2) {\n        if (t1 == null && t2 == null) return true;\n        if (t1 == null || t2 == null || t1.val != t2.val) return false;\n        return isMirror(t1.left, t2.right) && isMirror(t1.right, t2.left);\n    }\n}",
  pythonCode: "class Solution:\n    def isSymmetric(self, root: Optional[TreeNode]) -> bool:\n        def dfs(left, right):\n            if not left and not right: return True\n            if not left or not right: return False\n            return (left.val == right.val and dfs(left.left, right.right) and dfs(left.right, right.left))\n        return dfs(root.left, root.right) if root else True"
},
  {
  id: 105,
  slug: "construct-binary-tree-from-preorder-and-inorder-traversal",
  title: "105. Construct Binary Tree from Preorder and Inorder",
  difficulty: "Medium",
  category: "Trees & BST",
  archetype: "tree-bst",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  description: "Given two integer arrays preorder and inorder where preorder is preorder traversal and inorder is inorder traversal, construct binary tree.",
  defaultInput: "3, 9, 20, 15, 7",
  defaultTarget: null,
  javaCode: "class Solution {\n    private int preIndex = 0;\n    private Map<Integer, Integer> inMap = new HashMap<>();\n    public TreeNode buildTree(int[] preorder, int[] inorder) {\n        for (int i = 0; i < inorder.length; i++) inMap.put(inorder[i], i);\n        return helper(preorder, 0, inorder.length - 1);\n    }\n    private TreeNode helper(int[] preorder, int inStart, int inEnd) {\n        if (inStart > inEnd) return null;\n        int rootVal = preorder[preIndex++];\n        TreeNode root = new TreeNode(rootVal);\n        int mid = inMap.get(rootVal);\n        root.left = helper(preorder, inStart, mid - 1);\n        root.right = helper(preorder, mid + 1, inEnd);\n        return root;\n    }\n}",
  pythonCode: "class Solution:\n    def buildTree(self, preorder: list[int], inorder: list[int]) -> Optional[TreeNode]:\n        if not preorder or not inorder: return None\n        root = TreeNode(preorder[0])\n        mid = inorder.index(preorder[0])\n        root.left = self.buildTree(preorder[1:mid+1], inorder[:mid])\n        root.right = self.buildTree(preorder[mid+1:], inorder[mid+1:])\n        return root"
},
  {
  id: 110,
  slug: "balanced-binary-tree",
  title: "110. Balanced Binary Tree",
  difficulty: "Easy",
  category: "Trees & BST",
  archetype: "tree-bst",
  timeComplexity: "O(n)",
  spaceComplexity: "O(h)",
  description: "Given a binary tree, determine if it is height-balanced (depth of the two subtrees of every node never differs by more than one).",
  defaultInput: "3, 9, 20, 15, 7",
  defaultTarget: null,
  javaCode: "class Solution {\n    public boolean isBalanced(TreeNode root) {\n        return checkHeight(root) != -1;\n    }\n    private int checkHeight(TreeNode node) {\n        if (node == null) return 0;\n        int leftH = checkHeight(node.left);\n        if (leftH == -1) return -1;\n        int rightH = checkHeight(node.right);\n        if (rightH == -1) return -1;\n        if (Math.abs(leftH - rightH) > 1) return -1;\n        return 1 + Math.max(leftH, rightH);\n    }\n}",
  pythonCode: "class Solution:\n    def isBalanced(self, root: Optional[TreeNode]) -> bool:\n        def dfs(root):\n            if not root: return [True, 0]\n            left, right = dfs(root.left), dfs(root.right)\n            balanced = left[0] and right[0] and abs(left[1] - right[1]) <= 1\n            return [balanced, 1 + max(left[1], right[1])]\n        return dfs(root)[0]"
},
  {
  id: 128,
  slug: "longest-consecutive-sequence",
  title: "128. Longest Consecutive Sequence",
  difficulty: "Medium",
  category: "Arrays & Hashing",
  archetype: "two-pointers",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  description: "Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence in O(n) runtime.",
  defaultInput: "100, 4, 200, 1, 3, 2",
  defaultTarget: null,
  javaCode: "class Solution {\n    public int longestConsecutive(int[] nums) {\n        Set<Integer> numSet = new HashSet<>();\n        for (int num : nums) numSet.add(num);\n        int longestStreak = 0;\n        for (int num : numSet) {\n            if (!numSet.contains(num - 1)) {\n                int currentNum = num;\n                int currentStreak = 1;\n                while (numSet.contains(currentNum + 1)) {\n                    currentNum += 1;\n                    currentStreak += 1;\n                }\n                longestStreak = Math.max(longestStreak, currentStreak);\n            }\n        }\n        return longestStreak;\n    }\n}",
  pythonCode: "class Solution:\n    def longestConsecutive(self, nums: list[int]) -> int:\n        num_set = set(nums)\n        longest = 0\n        for n in num_set:\n            if (n - 1) not in num_set:\n                length = 1\n                while (n + length) in num_set: length += 1\n                longest = max(length, longest)\n        return longest"
},
  {
  id: 133,
  slug: "clone-graph",
  title: "133. Clone Graph",
  difficulty: "Medium",
  category: "Graphs",
  archetype: "graphs",
  timeComplexity: "O(V + E)",
  spaceComplexity: "O(V)",
  description: "Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.",
  defaultInput: "1, 2, 3, 4",
  defaultTarget: null,
  javaCode: "class Solution {\n    private Map<Node, Node> visited = new HashMap<>();\n    public Node cloneGraph(Node node) {\n        if (node == null) return null;\n        if (visited.containsKey(node)) return visited.get(node);\n        Node clone = new Node(node.val, new ArrayList<>());\n        visited.put(node, clone);\n        for (Node neighbor : node.neighbors) {\n            clone.neighbors.add(cloneGraph(neighbor));\n        }\n        return clone;\n    }\n}",
  pythonCode: "class Solution:\n    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:\n        oldToNew = {}\n        def dfs(node):\n            if not node: return None\n            if node in oldToNew: return oldToNew[node]\n            copy = Node(node.val)\n            oldToNew[node] = copy\n            for nei in node.neighbors:\n                copy.neighbors.append(dfs(nei))\n            return copy\n        return dfs(node)"
},
  {
  id: 136,
  slug: "single-number",
  title: "136. Single Number",
  difficulty: "Easy",
  category: "Arrays & Hashing",
  archetype: "two-pointers",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one using XOR in O(1) space.",
  defaultInput: "4, 1, 2, 1, 2",
  defaultTarget: null,
  javaCode: "class Solution {\n    public int singleNumber(int[] nums) {\n        int single = 0;\n        for (int num : nums) {\n            single ^= num;\n        }\n        return single;\n    }\n}",
  pythonCode: "class Solution:\n    def singleNumber(self, nums: list[int]) -> int:\n        res = 0\n        for n in nums: res ^= n\n        return res"
},
  {
  id: 139,
  slug: "word-break",
  title: "139. Word Break",
  difficulty: "Medium",
  category: "Dynamic Programming",
  archetype: "dp",
  timeComplexity: "O(n² * k)",
  spaceComplexity: "O(n)",
  description: "Given string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of dictionary words.",
  defaultInput: "8, 4",
  defaultTarget: null,
  javaCode: "class Solution {\n    public boolean wordBreak(String s, List<String> wordDict) {\n        Set<String> set = new HashSet<>(wordDict);\n        boolean[] dp = new boolean[s.length() + 1];\n        dp[0] = true;\n        for (int i = 1; i <= s.length(); i++) {\n            for (int j = 0; j < i; j++) {\n                if (dp[j] && set.contains(s.substring(j, i))) {\n                    dp[i] = true;\n                    break;\n                }\n            }\n        }\n        return dp[s.length()];\n    }\n}",
  pythonCode: "class Solution:\n    def wordBreak(self, s: str, wordDict: list[str]) -> bool:\n        dp = [False] * (len(s) + 1)\n        dp[len(s)] = True\n        for i in range(len(s) - 1, -1, -1):\n            for w in wordDict:\n                if (i + len(w)) <= len(s) and s[i : i + len(w)] == w:\n                    dp[i] = dp[i + len(w)]\n                if dp[i]: break\n        return dp[0]"
},
  {
  id: 142,
  slug: "linked-list-cycle-ii",
  title: "142. Linked List Cycle II",
  difficulty: "Medium",
  category: "Linked Lists",
  archetype: "cycle-detection",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "Given the head of a linked list, return the node where the cycle begins. If there is no cycle, return null.",
  defaultInput: "3, 2, 0, -4",
  defaultTarget: 1,
  javaCode: "class Solution {\n    public ListNode detectCycle(ListNode head) {\n        if (head == null || head.next == null) return null;\n        ListNode slow = head, fast = head;\n        while (fast != null && fast.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n            if (slow == fast) {\n                ListNode entry = head;\n                while (entry != slow) {\n                    entry = entry.next;\n                    slow = slow.next;\n                }\n                return entry;\n            }\n        }\n        return null;\n    }\n}",
  pythonCode: "class Solution:\n    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        slow = fast = head\n        while fast and fast.next:\n            slow = slow.next\n            fast = fast.next.next\n            if slow == fast:\n                entry = head\n                while entry != slow:\n                    entry = entry.next\n                    slow = slow.next\n                return entry\n        return None"
},
  {
  id: 150,
  slug: "evaluate-reverse-polish-notation",
  title: "150. Evaluate Reverse Polish Notation",
  difficulty: "Medium",
  category: "Stack & Monotonic",
  archetype: "stack",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  description: "Evaluate the value of an arithmetic expression in Reverse Polish Notation (RPN). Valid operators are +, -, *, and /.",
  defaultInput: "2, 1, 3",
  defaultTarget: null,
  javaCode: "class Solution {\n    public int evalRPN(String[] tokens) {\n        Stack<Integer> stack = new Stack<>();\n        for (String t : tokens) {\n            if (t.equals(\"+\")) stack.push(stack.pop() + stack.pop());\n            else if (t.equals(\"-\")) {\n                int b = stack.pop();\n                stack.push(stack.pop() - b);\n            } else if (t.equals(\"*\")) stack.push(stack.pop() * stack.pop());\n            else if (t.equals(\"/\")) {\n                int b = stack.pop();\n                stack.push(stack.pop() / b);\n            } else stack.push(Integer.parseInt(t));\n        }\n        return stack.pop();\n    }\n}",
  pythonCode: "class Solution:\n    def evalRPN(self, tokens: list[str]) -> int:\n        stack = []\n        for c in tokens:\n            if c == \+\: stack.append(stack.pop() + stack.pop())\n            elif c == \-\:\n                a, b = stack.pop(), stack.pop()\n                stack.append(b - a)\n            elif c == \*\: stack.append(stack.pop() * stack.pop())\n            elif c == \/\:\n                a, b = stack.pop(), stack.pop()\n                stack.append(int(b / a))\n            else: stack.append(int(c))\n        return stack[0]"
},
  {
  id: 160,
  slug: "intersection-of-two-linked-lists",
  title: "160. Intersection of Two Linked Lists",
  difficulty: "Easy",
  category: "Linked Lists",
  archetype: "linked-list",
  timeComplexity: "O(m + n)",
  spaceComplexity: "O(1)",
  description: "Given the heads of two singly linked-lists headA and headB, return the node at which the two lists intersect.",
  defaultInput: "4, 1, 8, 4, 5, 5, 6, 1, 8, 4, 5",
  defaultTarget: null,
  javaCode: "class Solution {\n    public ListNode getIntersectionNode(ListNode headA, ListNode headB) {\n        if (headA == null || headB == null) return null;\n        ListNode a = headA, b = headB;\n        while (a != b) {\n            a = (a == null) ? headB : a.next;\n            b = (b == null) ? headA : b.next;\n        }\n        return a;\n    }\n}",
  pythonCode: "class Solution:\n    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:\n        l1, l2 = headA, headB\n        while l1 != l2:\n            l1 = l1.next if l1 else headB\n            l2 = l2.next if l2 else headA\n        return l1"
},
  {
  id: 169,
  slug: "majority-element",
  title: "169. Majority Element (Boyer-Moore)",
  difficulty: "Easy",
  category: "Arrays & Hashing",
  archetype: "two-pointers",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "Given an array nums of size n, return the majority element that appears more than ⌊n / 2⌋ times using Boyer-Moore Voting.",
  defaultInput: "2, 2, 1, 1, 1, 2, 2",
  defaultTarget: null,
  javaCode: "class Solution {\n    public int majorityElement(int[] nums) {\n        int candidate = nums[0];\n        int count = 0;\n        for (int num : nums) {\n            if (count == 0) candidate = num;\n            count += (num == candidate) ? 1 : -1;\n        }\n        return candidate;\n    }\n}",
  pythonCode: "class Solution:\n    def majorityElement(self, nums: list[int]) -> int:\n        res = count = 0\n        for n in nums:\n            if count == 0: res = n\n            count += (1 if n == res else -1)\n        return res"
},
  {
  id: 199,
  slug: "binary-tree-right-side-view",
  title: "199. Binary Tree Right Side View",
  difficulty: "Medium",
  category: "Trees & BST",
  archetype: "tree-bst",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  description: "Given the root of a binary tree, imagine yourself standing on the right side of it, return the values of the nodes you can see ordered from top to bottom.",
  defaultInput: "1, 2, 3, null, 5, null, 4",
  defaultTarget: null,
  javaCode: "class Solution {\n    public List<Integer> rightSideView(TreeNode root) {\n        List<Integer> result = new ArrayList<>();\n        if (root == null) return result;\n        Queue<TreeNode> q = new LinkedList<>();\n        q.offer(root);\n        while (!q.isEmpty()) {\n            int size = q.size();\n            for (int i = 0; i < size; i++) {\n                TreeNode cur = q.poll();\n                if (i == size - 1) result.add(cur.val);\n                if (cur.left != null) q.offer(cur.left);\n                if (cur.right != null) q.offer(cur.right);\n            }\n        }\n        return result;\n    }\n}",
  pythonCode: "class Solution:\n    def rightSideView(self, root: Optional[TreeNode]) -> list[int]:\n        res = []\n        q = collections.deque([root])\n        while q:\n            rightSide = None\n            for _ in range(len(q)):\n                node = q.popleft()\n                if node:\n                    rightSide = node\n                    q.append(node.left)\n                    q.append(node.right)\n            if rightSide: res.append(rightSide.val)\n        return res"
},
  {
  id: 209,
  slug: "minimum-size-subarray-sum",
  title: "209. Minimum Size Subarray Sum",
  difficulty: "Medium",
  category: "Sliding Window",
  archetype: "sliding-window",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "Given an array of positive integers nums and a positive integer target, return the minimal length of a subarray whose sum is greater than or equal to target.",
  defaultInput: "2, 3, 1, 2, 4, 3",
  defaultTarget: 7,
  javaCode: "class Solution {\n    public int minSubArrayLen(int target, int[] nums) {\n        int left = 0, sum = 0, minLen = Integer.MAX_VALUE;\n        for (int right = 0; right < nums.length; right++) {\n            sum += nums[right];\n            while (sum >= target) {\n                minLen = Math.min(minLen, right - left + 1);\n                sum -= nums[left++];\n            }\n        }\n        return minLen == Integer.MAX_VALUE ? 0 : minLen;\n    }\n}",
  pythonCode: "class Solution:\n    def minSubArrayLen(self, target: int, nums: list[int]) -> int:\n        l, total = 0, 0\n        res = float(\"inf\")\n        for r in range(len(nums)):\n            total += nums[r]\n            while total >= target:\n                res = min(r - l + 1, res)\n                total -= nums[l]\n                l += 1\n        return 0 if res == float(\"inf\") else res"
},
  {
  id: 213,
  slug: "house-robber-ii",
  title: "213. House Robber II (Circular DP)",
  difficulty: "Medium",
  category: "Dynamic Programming",
  archetype: "dp",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "All houses at this place are arranged in a circle. The first house is the neighbor of the last one. Rob maximal amount without alerting police.",
  defaultInput: "2, 3, 2",
  defaultTarget: null,
  javaCode: "class Solution {\n    public int rob(int[] nums) {\n        if (nums.length == 1) return nums[0];\n        return Math.max(robRange(nums, 0, nums.length - 2), robRange(nums, 1, nums.length - 1));\n    }\n    private int robRange(int[] nums, int start, int end) {\n        int prev1 = 0, prev2 = 0;\n        for (int i = start; i <= end; i++) {\n            int temp = Math.max(prev1, prev2 + nums[i]);\n            prev2 = prev1;\n            prev1 = temp;\n        }\n        return prev1;\n    }\n}",
  pythonCode: "class Solution:\n    def rob(self, nums: list[int]) -> int:\n        return max(nums[0], self.helper(nums[1:]), self.helper(nums[:-1]))\n    def helper(self, nums):\n        rob1, rob2 = 0, 0\n        for n in nums:\n            newRob = max(rob1 + n, rob2)\n            rob1 = rob2\n            rob2 = newRob\n        return rob2"
},
  {
  id: 230,
  slug: "kth-smallest-element-in-a-bst",
  title: "230. Kth Smallest Element in a BST",
  difficulty: "Medium",
  category: "Trees & BST",
  archetype: "tree-bst",
  timeComplexity: "O(H + k)",
  spaceComplexity: "O(H)",
  description: "Given the root of a binary search tree and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.",
  defaultInput: "3, 1, 4, null, 2",
  defaultTarget: 1,
  javaCode: "class Solution {\n    public int kthSmallest(TreeNode root, int k) {\n        Stack<TreeNode> stack = new Stack<>();\n        while (root != null || !stack.isEmpty()) {\n            while (root != null) {\n                stack.push(root);\n                root = root.left;\n            }\n            root = stack.pop();\n            if (--k == 0) return root.val;\n            root = root.right;\n        }\n        return -1;\n    }\n}",
  pythonCode: "class Solution:\n    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:\n        stack = []\n        curr = root\n        while stack or curr:\n            while curr:\n                stack.append(curr)\n                curr = curr.left\n            curr = stack.pop()\n            k -= 1\n            if k == 0: return curr.val\n            curr = curr.right"
},
  {
  id: 234,
  slug: "palindrome-linked-list",
  title: "234. Palindrome Linked List",
  difficulty: "Easy",
  category: "Linked Lists",
  archetype: "linked-list",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "Given the head of a singly linked list, return true if it is a palindrome or false otherwise in O(n) time and O(1) space.",
  defaultInput: "1, 2, 2, 1",
  defaultTarget: null,
  javaCode: "class Solution {\n    public boolean isPalindrome(ListNode head) {\n        ListNode fast = head, slow = head;\n        while (fast != null && fast.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n        }\n        ListNode prev = null;\n        while (slow != null) {\n            ListNode next = slow.next;\n            slow.next = prev;\n            prev = slow;\n            slow = next;\n        }\n        ListNode left = head, right = prev;\n        while (right != null) {\n            if (left.val != right.val) return false;\n            left = left.next;\n            right = right.next;\n        }\n        return true;\n    }\n}",
  pythonCode: "class Solution:\n    def isPalindrome(self, head: Optional[ListNode]) -> bool:\n        fast = slow = head\n        while fast and fast.next:\n            fast = fast.next.next\n            slow = slow.next\n        prev = None\n        while slow:\n            nxt = slow.next\n            slow.next = prev\n            prev = slow\n            slow = nxt\n        left, right = head, prev\n        while right:\n            if left.val != right.val: return False\n            left = left.next\n            right = right.next\n        return True"
},
  {
  id: 236,
  slug: "lowest-common-ancestor-of-a-binary-tree",
  title: "236. Lowest Common Ancestor of Binary Tree",
  difficulty: "Medium",
  category: "Trees & BST",
  archetype: "tree-bst",
  timeComplexity: "O(n)",
  spaceComplexity: "O(h)",
  description: "Given a binary tree, find the lowest common ancestor (LCA) of two given nodes p and q in the tree.",
  defaultInput: "3, 5, 1, 6, 2, 0, 8",
  defaultTarget: null,
  javaCode: "class Solution {\n    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {\n        if (root == null || root == p || root == q) return root;\n        TreeNode left = lowestCommonAncestor(root.left, p, q);\n        TreeNode right = lowestCommonAncestor(root.right, p, q);\n        if (left != null && right != null) return root;\n        return left != null ? left : right;\n    }\n}",
  pythonCode: "class Solution:\n    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':\n        if not root or root == p or root == q: return root\n        left = self.lowestCommonAncestor(root.left, p, q)\n        right = self.lowestCommonAncestor(root.right, p, q)\n        if left and right: return root\n        return left or right"
},
  {
  id: 242,
  slug: "valid-anagram",
  title: "242. Valid Anagram",
  difficulty: "Easy",
  category: "Arrays & Hashing",
  archetype: "two-pointers",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
  defaultInput: "1, 2, 3, 4",
  defaultTarget: null,
  javaCode: "class Solution {\n    public boolean isAnagram(String s, String t) {\n        if (s.length() != t.length()) return false;\n        int[] counts = new int[26];\n        for (int i = 0; i < s.length(); i++) {\n            counts[s.charAt(i) - 'a']++;\n            counts[t.charAt(i) - 'a']--;\n        }\n        for (int c : counts) {\n            if (c != 0) return false;\n        }\n        return true;\n    }\n}",
  pythonCode: "class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        return collections.Counter(s) == collections.Counter(t)"
},
  {
  id: 268,
  slug: "missing-number",
  title: "268. Missing Number",
  difficulty: "Easy",
  category: "Arrays & Hashing",
  archetype: "two-pointers",
  timeComplexity: "O(n)",
  spaceComplexity: "O(1)",
  description: "Given an array nums containing n distinct numbers in range [0, n], return the only number in the range that is missing from the array.",
  defaultInput: "3, 0, 1",
  defaultTarget: null,
  javaCode: "class Solution {\n    public int missingNumber(int[] nums) {\n        int n = nums.length;\n        int expected = n * (n + 1) / 2;\n        int actual = 0;\n        for (int x : nums) actual += x;\n        return expected - actual;\n    }\n}",
  pythonCode: "class Solution:\n    def missingNumber(self, nums: list[int]) -> int:\n        n = len(nums)\n        return n * (n + 1) // 2 - sum(nums)"
},
  {
  id: 278,
  slug: "first-bad-version",
  title: "278. First Bad Version",
  difficulty: "Easy",
  category: "Binary Search",
  archetype: "binary-search",
  timeComplexity: "O(log n)",
  spaceComplexity: "O(1)",
  description: "You are a product manager and currently leading a team to develop a new product. Find the first bad version using binary search.",
  defaultInput: "5",
  defaultTarget: 4,
  javaCode: "public class Solution extends VersionControl {\n    public int firstBadVersion(int n) {\n        int left = 1, right = n;\n        while (left < right) {\n            int mid = left + (right - left) / 2;\n            if (isBadVersion(mid)) right = mid;\n            else left = mid + 1;\n        }\n        return left;\n    }\n}",
  pythonCode: "class Solution:\n    def firstBadVersion(self, n: int) -> int:\n        l, r = 1, n\n        while l < r:\n            mid = (l + r) // 2\n            if isBadVersion(mid): r = mid\n            else: l = mid + 1\n        return l"
},
  {
  id: 295,
  slug: "find-median-from-data-stream",
  title: "295. Find Median from Data Stream",
  difficulty: "Hard",
  category: "Heaps & Priority Queue",
  archetype: "heap",
  timeComplexity: "O(log n)",
  spaceComplexity: "O(n)",
  description: "Design a data structure that supports adding numbers and finding median from continuous data stream using Min & Max Heaps.",
  defaultInput: "1, 2, 3",
  defaultTarget: null,
  javaCode: "class MedianFinder {\n    private PriorityQueue<Integer> small = new PriorityQueue<>(Collections.reverseOrder());\n    private PriorityQueue<Integer> large = new PriorityQueue<>();\n    public void addNum(int num) {\n        small.add(num);\n        large.add(small.poll());\n        if (small.size() < large.size()) small.add(large.poll());\n    }\n    public double findMedian() {\n        return small.size() > large.size() ? small.peek() : (small.peek() + large.peek()) / 2.0;\n    }\n}",
  pythonCode: "class MedianFinder:\n    def __init__(self):\n        self.small, self.large = [], []\n    def addNum(self, num: int) -> None:\n        heapq.heappush(self.small, -1 * num)\n        if self.small and self.large and (-1 * self.small[0]) > self.large[0]:\n            val = -1 * heapq.heappop(self.small)\n            heapq.heappush(self.large, val)\n        if len(self.small) > len(self.large) + 1:\n            val = -1 * heapq.heappop(self.small)\n            heapq.heappush(self.large, val)\n        if len(self.large) > len(self.small) + 1:\n            val = heapq.heappop(self.large)\n            heapq.heappush(self.small, -1 * val)\n    def findMedian(self) -> float:\n        if len(self.small) > len(self.large): return -1 * self.small[0]\n        if len(self.large) > len(self.small): return self.large[0]\n        return (-1 * self.small[0] + self.large[0]) / 2.0"
},
  {
  id: 297,
  slug: "serialize-and-deserialize-binary-tree",
  title: "297. Serialize & Deserialize Binary Tree",
  difficulty: "Hard",
  category: "Trees & BST",
  archetype: "tree-bst",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n)",
  description: "Design an algorithm to serialize and deserialize a binary tree into a string and back to original tree structure.",
  defaultInput: "1, 2, 3, null, null, 4, 5",
  defaultTarget: null,
  javaCode: "public class Codec {\n    public String serialize(TreeNode root) {\n        StringBuilder sb = new StringBuilder();\n        buildString(root, sb);\n        return sb.toString();\n    }\n    private void buildString(TreeNode node, StringBuilder sb) {\n        if (node == null) sb.append(\"null,\");\n        else {\n            sb.append(node.val).append(\",\");\n            buildString(node.left, sb);\n            buildString(node.right, sb);\n        }\n    }\n    public TreeNode deserialize(String data) {\n        Queue<String> nodes = new LinkedList<>(Arrays.asList(data.split(\",\")));\n        return buildTree(nodes);\n    }\n    private TreeNode buildTree(Queue<String> nodes) {\n        String val = nodes.poll();\n        if (val.equals(\"null\")) return null;\n        TreeNode node = new TreeNode(Integer.parseInt(val));\n        node.left = buildTree(nodes);\n        node.right = buildTree(nodes);\n        return node;\n    }\n}",
  pythonCode: "class Codec:\n    def serialize(self, root):\n        res = []\n        def dfs(node):\n            if not node:\n                res.append(\"N\")\n                return\n            res.append(str(node.val))\n            dfs(node.left)\n            dfs(node.right)\n        dfs(root)\n        return \",\".join(res)\n    def deserialize(self, data):\n        vals = data.split(\",\")\n        self.i = 0\n        def dfs():\n            if vals[self.i] == \N\:\n                self.i += 1\n                return None\n            node = TreeNode(int(vals[self.i]))\n            self.i += 1\n            node.left = dfs()\n            node.right = dfs()\n            return node\n        return dfs()"
}
];
