import { extractCodeBlocks } from "./codeParser";

export const MOCK_AI_RESPONSE = `
Got it 👍 Let's make a very simple brute force algorithm example.

Here's a brute-force linear search in Java - it just checks every element one by one until it finds the target:

\`\`\`java:BruteForceSearch.java
public class BruteForceSearch {
    public static void main(String[] args) {
        int[] numbers = {10, 20, 30, 40, 50};
        int target = 30;

        for (int i = 0; i < numbers.length; i++) {
            if (numbers[i] == target) {
                System.out.println("Found at index " + i);
            }
        }
    }
}
\`\`\`
`;

export const MOCK_RESPONSES = [
    MOCK_AI_RESPONSE,
    `
Sure! Let's look at **Bubble Sort**. It's a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.

\`\`\`java:BubbleSort.java
public class BubbleSort {
    public static void main(String[] args) {
        int[] arr = {5, 2, 8, 1, 3};
        int n = 5;
        
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }
}
\`\`\`
`,
    `
How about **Binary Search**? It's a much faster way to find an element in a *sorted* array by repeatedly dividing the search interval in half.

\`\`\`java:BinarySearch.java
public class BinarySearch {
    public static void main(String[] args) {
        int[] arr = {10, 20, 30, 40, 50};
        int target = 40;
        int low = 0;
        int high = 4;
        int result = -1;

        while (low <= high) {
            int mid = (low + high) / 2;
            if (arr[mid] == target) {
                result = mid;
                break;
            } else if (arr[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
    }
}
\`\`\`
`,
    `
**Selection Sort** is another simple sorting algorithm. It works by repeatedly finding the minimum element from the unsorted part and putting it at the beginning.

\`\`\`java:SelectionSort.java
public class SelectionSort {
    public static void main(String[] args) {
        int[] arr = {64, 25, 12, 22, 11};
        int n = 5;

        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) {
                    minIdx = j;
                }
            }
            int temp = arr[minIdx];
            arr[minIdx] = arr[i];
            arr[i] = temp;
        }
    }
}
\`\`\`
`,
    `
A **Stack** is a Linear Data Structure that follows the Last-In-First-Out (LIFO) principle. Here is a simple implementation using an array:

\`\`\`java:ArrayStack.java
public class ArrayStack {
    public static void main(String[] args) {
        int[] stack = new int[5];
        int top = -1;

        // Push 10
        top++;
        stack[top] = 10;
        
        // Push 20
        top++;
        stack[top] = 20;

        // Pop
        int popped = stack[top];
        top--;
        
        System.out.println("Popped: " + popped);
    }
}
\`\`\`
`,
    `
A **Queue** is a Linear Data Structure that follows the First-In-First-Out (FIFO) principle. Here is a simple implementation using an array:

\`\`\`java:ArrayQueue.java
public class ArrayQueue {
    public static void main(String[] args) {
        int[] queue = new int[5];
        int front = 0;
        int rear = 0;

        // Enqueue 10
        queue[rear] = 10;
        rear++;
        
        // Enqueue 20
        queue[rear] = 20;
        rear++;

        // Dequeue
        int dequeued = queue[front];
        front++;

        System.out.println("Dequeued: " + dequeued);
    }
}
\`\`\`
`
];

export function getRandomMockResponse() {
    const randomIndex = Math.floor(Math.random() * MOCK_RESPONSES.length);
    return MOCK_RESPONSES[randomIndex];
}

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
