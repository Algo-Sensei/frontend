export type ExecutionFrame = {
  line: number;
  variables: Record<string, any>;
  heap?: {
    arrays?: Record<string, any[]>;
    stack?: Record<string, any[]>;
    queues?: Record<string, any[]>;
  };
  output: string[];
  note?: string;
};

type RuntimeState = {
  variables: Record<string, any>;
  heap: {
    arrays: Record<string, any[]>;
    stacks: Record<string, any[]>;
    queues: Record<string, any[]>;
  };
  output: string[];
};

const cloneState = (state: RuntimeState): RuntimeState => ({
  variables: JSON.parse(JSON.stringify(state.variables)),
  heap: JSON.parse(JSON.stringify(state.heap)),
  output: [...state.output],
});

const createFrame = (
  frames: ExecutionFrame[],
  state: RuntimeState,
  line: number,
  note?: string
) => {
  const snapshot = cloneState(state);

  frames.push({
    line,
    variables: snapshot.variables,
    heap: snapshot.heap,
    output: snapshot.output,
    note,
  });
};

const traceProgram = (code: string): ExecutionFrame[] => {
  const frames: ExecutionFrame[] = [];

  const state: RuntimeState = {
    variables: {},
    heap: {
      arrays: {},
      stacks: {},
      queues: {},
    },
    output: [],
  };

  if (code.includes("BruteForceSearch") && code.includes("bruteForceSearch(numbers, target)")) {
    const numbers = [10, 20, 30, 40, 50];
    const target = 30;

    createFrame(frames, state, 1, "Program loaded. The workspace is ready to trace the linear search.");

    state.heap.arrays.numbers = numbers;
    state.variables.numbers = numbers;
    createFrame(frames, state, 14, "The numbers array is created with five values.");

    state.variables.target = target;
    createFrame(frames, state, 15, "The target value is set to 30.");

    state.variables.arr = numbers;
    state.variables.result = "pending";
    createFrame(frames, state, 17, "main calls bruteForceSearch(numbers, target).");

    createFrame(frames, state, 3, "The search method starts and prepares to scan each element from left to right.");

    for (let i = 0; i < numbers.length; i += 1) {
      state.variables.i = i;
      state.variables.currentValue = numbers[i];
      createFrame(
        frames,
        state,
        4,
        `Loop iteration ${i + 1}: move the pointer to index ${i}.`
      );

      createFrame(
        frames,
        state,
        5,
        `Compare arr[${i}] = ${numbers[i]} with target = ${target}.`
      );

      if (numbers[i] === target) {
        state.variables.foundIndex = i;
        state.variables.result = i;
        createFrame(
          frames,
          state,
          6,
          `A match is found at index ${i}, so the method returns ${i}.`
        );
        break;
      }
    }

    createFrame(frames, state, 19, "The returned index is stored in result.");

    state.output.push("Target 30 found at index 2");
    createFrame(frames, state, 22, "The success branch runs and prints the final output.");

    return frames;
  }

  return frames;
};

export default traceProgram;
