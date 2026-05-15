import { create } from "domain";

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
    foundIndex?: number;
};

const cloneState = (state: RuntimeState): RuntimeState => {
    return {
        variables: JSON.parse(JSON.stringify(state.variables)),
        heap: JSON.parse(JSON.stringify(state.heap)),
        output: [...state.output],
    };
};

const createFrame =(
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

const parseArrayLiteral = (raw: string): number[] => {
    return raw
    .replace(/^\{|\}$/g, "")
    .split(",")
    .map(s => Number(s.trim()));
}

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
        foundIndex: undefined,
    };

    const lines = code
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean);

    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // ARRAY DECLARATION

        const arrayMatch = line.match(/^int\[\]\s+(\w+)\s*=\s*(\{.*\});$/);

        if (arrayMatch) {
            const [, name, values] = arrayMatch;

            const parsed = parseArrayLiteral(`${values}`);

            state.variables[name] = parsed;
            state.heap.arrays[name] = parsed;

            createFrame(
                frames,
                state,
                i + 1,
                `Array "${name}" created`
            );

            i++;
            continue;
        };

        // INTEGER VARIABLE

        const inMatch = line.match(/^int\s+(\w+)\s*=\s*(\d+);$/);

        if (inMatch) {
            const [, name, value] = inMatch;

            state.variables[name] = Number(value);

            createFrame(
                frames,
                state,
                i + 1,
                `Variable "${name}" set to ${value}`
            );

            i++;
            continue;
        };

        // STACK DECLARATION

        const stackMatch = line.match(/^Stack<(\w+)>\s+(\w+)\s*=\s*new\s+Stack<\w+>\(\);$/);

        if (stackMatch) {
            const [, name] = stackMatch;

            state.heap.stacks[name] = [];
            state.variables[name] = [];

            createFrame(
                frames,
                state,
                i + 1,
                `Stack "${name}" created`
            )

            i++;
            continue;
        };

        // STACK PUSH

        const pushMatch = line.match(/^(\w+)\.push\((\w+)\);$/);

        if (pushMatch) {
            const [, stackName, value] = pushMatch;

            const parsed = Number(value);

            state.heap.stacks[stackName].push(parsed);
            state.variables[stackName] = state.heap.stacks[stackName];

            createFrame(
                frames,
                state,
                i + 1,
                `Pushed ${parsed} into ${stackName}`
            );

            i++;
            continue;
        }

        // STACK POP

        const popMatch = line.match(/^(\w+)\.pop\(\);$/);

        if (popMatch) {
            const [, stackName] = popMatch;

            const popped = state.heap.stacks[stackName].pop();

            state.variables[stackName] = state.heap.stacks[stackName];

            createFrame(
                frames,
                state,
                i + 1,
                `Popped ${popped} from ${stackName}`
            );

            i++;
            continue;
        }

        // PRINT STATEMENT

        const printMatch = line.match(/^System\.out\.println\((.+)\);?$/);

        if (printMatch) {
            const [, expr] = printMatch;

            let output = expr;

            Object.entries(state.variables).forEach(([k, v]) => {
                output = output.replaceAll(
                    k,
                    String(v)
                );
            });

            output = output.replace('"', "");

            state.output.push(output);

            createFrame(
                frames,
                state,
                i + 1,
                `Printed output: ${output}`
            );

            i++;
            continue;
        }

        // FOR LOOP

        const forMatch = line.match(
        /^for\s*\(\s*int\s+(\w+)\s*=\s*(\d+);\s*(\w+)\s*<\s*(\w+)\.length;\s*\w+\+\+\s*\)/
        );

        if (forMatch) {
            const [, iterator, start, compareVar, arrayName] = forMatch;

            const arr = state.heap.arrays[arrayName];

            let bodyIndex = i + 1;
            const body: string[] = [];

            while (
                bodyIndex < lines.length &&
                lines[bodyIndex] !== "}"
            ) {
                body.push(lines[bodyIndex]);
                bodyIndex++;
            }

            for (
                let loopIndex = Number(start);
                loopIndex < arr.length;
                loopIndex++
            ) {
                state.variables[iterator] = loopIndex;
                state.variables.current = arr[loopIndex];

                createFrame(
                    frames,
                    state,
                    i + 1,
                    `Loop iteration ${loopIndex}`
                );

                // IF CHECK

                for (const bodyLine of body) {
                    const ifMatch = bodyLine.match(
                        /^if\s*\(\s*(\w+)\[(\w+)\]\s*==\s*(\w+)\s*\)/
                    );

                    if (ifMatch) {
                        const [, arrName, idxVar, compareTo] = ifMatch;

                        const arrRef = state.heap.arrays[arrName];
                        const idx = state.variables[idxVar];
                        const compareValue = state.variables[compareTo];
                        const currentValue = arrRef[idx];

                        createFrame(
                            frames,
                            state,
                            lines.indexOf(bodyLine) + 1, `Comparing ${currentValue} with ${currentValue}`
                        );

                        if (currentValue === compareValue) {
                            state.variables.foundIndex = idx;

                            createFrame(
                                frames,
                                state,
                                lines.indexOf(bodyLine) + 1,
                                `Match found at index ${idx}`
                            );

                            return frames;
                        }
                    }
                }
            }

            i = bodyIndex + 1;
            continue;
        }

        i++;
    }

    return frames;
};

export default traceProgram;