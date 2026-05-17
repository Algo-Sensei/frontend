import { extractCodeBlocks } from "./codeParser";

export const MOCK_AI_RESPONSE = `
Got it 👍 Let's make a very simple brute force algorithm example.

Here's a brute-force linear search in Java - it just checks every element one by one until it finds the target:

\`\`\`java
public class BruteForceSearch {
    // Brute Force Algorithm: Linear Search
    public static int bruteForceSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) {    // check each element
                return i;             // return index if found
            }
        }
        return -1; // return -1 if not found
    }

    public static void main(String[] args) {
        int[] numbers = {10, 20, 30, 40, 50};
        int target = 30;

        int result = bruteForceSearch(numbers, target);

        if (result != -1) {
            System.out.println("Target " + target + " found at index " + result);
        } else {
            System.out.println("Target " + target + " not found in list");
        }
    }
}
\`\`\`
`;

export function testVisualizerWithMock() {
    const parsed = extractCodeBlocks(MOCK_AI_RESPONSE);
    if (parsed.code.length > 0) {
        return {
            text: parsed.cleanText,
            code: parsed.code,
        };
    }
    return null;
}
