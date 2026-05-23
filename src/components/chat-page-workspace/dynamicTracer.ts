export type Operation = 
  | { type: 'assign', target: string, value: any }
  | { type: 'array_update', target: string, index: number, value: any }
  | { type: 'swap', target: string, indices: [number, number] }
  | { type: 'method', target: string, method: string, args: any[] };

export type ExecutionStats = {
    iterations: number;
    comparisons: number;
    swaps: number;
    arrayAccesses: number;
    timeComplexity: string;
    spaceComplexity: string;
};

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
    operations?: Operation[];
    stats?: ExecutionStats;
};

type RuntimeState = {
    variables: Record<string, any>;
    arrays: Record<string, any[]>;
    stack: Record<string, any[]>;
    queues: Record<string, any[]>;
    output: string[];
};

const cloneState = (state: RuntimeState): RuntimeState => {
    return {
        variables: JSON.parse(JSON.stringify(state.variables)),
        arrays: JSON.parse(JSON.stringify(state.arrays)),
        stack: JSON.parse(JSON.stringify(state.stack)),
        queues: JSON.parse(JSON.stringify(state.queues)),
        output: [...state.output],
    };
};

const createFrame = (
    frames: ExecutionFrame[],
    state: RuntimeState,
    line: number,
    note?: string,
    operations?: Operation[],
    stats?: ExecutionStats
) => {
    const snapshot = cloneState(state);
    frames.push({
        line: line + 1, // 1-based indexing for UI
        variables: snapshot.variables,
        heap: {
            arrays: snapshot.arrays,
            stack: snapshot.stack,
            queues: snapshot.queues,
        },
        output: snapshot.output,
        note,
        operations: operations ? [...operations] : [],
        stats: stats ? { ...stats } : undefined,
    });
};

const evaluateExpression = (expr: string, state: RuntimeState, returnError = false): any => {
    const varNames = Object.keys(state.variables);
    const varValues = Object.values(state.variables);
    const arrNames = Object.keys(state.arrays);
    const arrValues = Object.values(state.arrays);
    const stackNames = Object.keys(state.stack);
    const stackValues = Object.values(state.stack);
    const queueNames = Object.keys(state.queues);
    const queueValues = Object.values(state.queues);

    try {
        const trimmedExpr = expr.trim();
        if (!trimmedExpr) return "";
        let jsExpr = trimmedExpr
            .replace(/System\.out\.println/g, 'console.log')
            .replace(/\.offer\(/g, '.push(')
            .replace(/\.add\(/g, '.push(')
            .replace(/\.poll\(\)/g, '.shift()')
            .replace(/\.remove\(\)/g, '.shift()')
            .replace(/Arrays\.toString\((.*?)\)/g, 'JSON.stringify($1)')
            .replace(/Arrays\.deepToString\((.*?)\)/g, 'JSON.stringify($1)');
        const fn = new Function(...varNames, ...arrNames, ...stackNames, ...queueNames, `return ${jsExpr};`);
        return fn(...varValues, ...arrValues, ...stackValues, ...queueValues);
    } catch (e) {
        console.warn("Evaluation failed for:", expr, e);
        if (returnError) return { __error: true, expr };
        return null;
    }
};

export const traceDynamicJava = (code: string): ExecutionFrame[] => {
    const frames: ExecutionFrame[] = [];
    const state: RuntimeState = {
        variables: {},
        arrays: {},
        stack: {},
        queues: {},
        output: [],
    };

    const stats: ExecutionStats = {
        iterations: 0,
        comparisons: 0,
        swaps: 0,
        arrayAccesses: 0,
        timeComplexity: "O(1)",
        spaceComplexity: "O(1)",
    };

    const countArrayAccesses = (expr: string) => {
        const matches = expr.match(/\w+\[.*?\]/g);
        if (matches) {
            stats.arrayAccesses += matches.length;
        }
    };

    const lines = code.split("\n");
    let pc = 0;

    const blocks: Record<number, number> = {};
    const bracketStack: number[] = [];
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("{")) bracketStack.push(i);
        if (lines[i].includes("}")) {
            const start = bracketStack.pop();
            if (start !== undefined) {
                blocks[start] = i;
            }
        }
    }

    let loopContext: { start: number, end: number, update: string, condition: string }[] = [];
    let ifChainState: { resolved: boolean }[] = []; // track if any block in if-else chain was executed
    let skipUntil: number | null = null;
    let maxSteps = 2000;
    let steps = 0;
    let maxLoopDepth = 0;
    let maxArraySize = 0;

    while (pc < lines.length && steps++ < maxSteps) {
        const rawLine = lines[pc];
        const line = rawLine.trim();

        if (skipUntil !== null) {
            if (pc === skipUntil) {
                skipUntil = null;
            } else {
                pc++;
                continue;
            }
        }

        if (!line || line.startsWith("//") || line.startsWith("public class") || line.startsWith("public static") || line.startsWith("class ")) {
            pc++;
            continue;
        }

        if (line === "}") {
            const currentLoop = loopContext.length > 0 ? loopContext[loopContext.length - 1] : null;
            if (currentLoop && currentLoop.end === pc) {
                if (currentLoop.update) {
                    const isIncrement = currentLoop.update.includes("++");
                    const isDecrement = currentLoop.update.includes("--");
                    if (isIncrement) {
                        const varName = currentLoop.update.replace("++", "").trim();
                        state.variables[varName] = (state.variables[varName] || 0) + 1;
                    } else if (isDecrement) {
                        const varName = currentLoop.update.replace("--", "").trim();
                        state.variables[varName] = (state.variables[varName] || 0) - 1;
                    } else {
                        const parts = currentLoop.update.split("=");
                        if (parts.length === 2) {
                            state.variables[parts[0].trim()] = evaluateExpression(parts[1], state);
                        }
                    }
                }
                
                countArrayAccesses(currentLoop.condition);
                stats.comparisons++;
                const cond = evaluateExpression(currentLoop.condition, state);
                if (cond) {
                    stats.iterations++;
                    pc = currentLoop.start + 1;
                    continue;
                } else {
                    loopContext.pop();
                }
            }

            // End of an if/else if/else block
            // If the block we just finished was part of an if-else chain, it's already resolved.
            // But we don't necessarily pop here, we pop when we hit a line that ISN'T an else/else if.
            // Simplified: we'll pop ifChainState if the NEXT line is not an else/else if.
            let nextLine = (lines[pc + 1] || "").trim();
            if (!nextLine.startsWith("else") && !nextLine.startsWith("} else")) {
                ifChainState.pop();
            }

            pc++;
            continue;
        }

        // Variable Declaration & Assignment
        let match = line.match(/^(?:int|double|float|String|boolean|char)\s+(\w+)\s*=\s*(.+);/);
        if (match) {
            const [, name, expr] = match;
            countArrayAccesses(expr);
            state.variables[name] = evaluateExpression(expr, state);
            createFrame(frames, state, pc, `The variable '${name}' is initialized with the value ${state.variables[name]}.`, [{ type: 'assign', target: name, value: state.variables[name] }], stats);
            pc++;
            continue;
        }

        // Variable Declaration without Assignment
        match = line.match(/^(?:int|double|float|String|boolean|char)\s+(\w+)\s*;/);
        if (match) {
            const [, name] = match;
            state.variables[name] = 0;
            createFrame(frames, state, pc, `The variable '${name}' is declared.`, undefined, stats);
            pc++;
            continue;
        }

        // Array Declaration (Literal)
        match = line.match(/^(?:int|double|float|String|boolean|char)\[\]\s+(\w+)\s*=\s*\{(.*?)\};/);
        if (match) {
            const [, name, els] = match;
            const elements = els.split(",").map(e => evaluateExpression(e.trim(), state));
            state.arrays[name] = elements;
            maxArraySize = Math.max(maxArraySize, elements.length);
            createFrame(frames, state, pc, `The array '${name}' is created with ${elements.length} elements: [${elements.join(', ')}].`, undefined, stats);
            pc++;
            continue;
        }

        // Array Declaration (New)
        match = line.match(/^(?:int|double|float|String|boolean|char)\[\]\s+(\w+)\s*=\s*new\s+(?:int|double|float|String|boolean|char)\[(.*?)\];/);
        if (match) {
            const [, name, sizeExpr] = match;
            const size = evaluateExpression(sizeExpr, state);
            state.arrays[name] = new Array(size).fill(0);
            maxArraySize = Math.max(maxArraySize, size);
            createFrame(frames, state, pc, `The array '${name}' is allocated in memory with size ${size}.`, undefined, stats);
            pc++;
            continue;
        }

        // Stack Declaration
        match = line.match(/^Stack<(.*?)>\s+(\w+)\s*=\s*new\s+Stack<.*?>\(\);/);
        if (match) {
            const [, type, name] = match;
            state.stack[name] = [];
            createFrame(frames, state, pc, `A new Stack named '${name}' is allocated in memory.`, undefined, stats);
            pc++;
            continue;
        }

        // Queue Declaration
        match = line.match(/^Queue<(.*?)>\s+(\w+)\s*=\s*new\s+(?:LinkedList|PriorityQueue|ArrayDeque)<.*?>\(\);/);
        if (match) {
            const [, type, name] = match;
            state.queues[name] = [];
            createFrame(frames, state, pc, `A new Queue named '${name}' is allocated in memory.`, undefined, stats);
            pc++;
            continue;
        }

        // Variable Assignment
        match = line.match(/^(\w+)\s*=\s*(.+);/);
        if (match) {
            const [, name, expr] = match;
            if (state.variables[name] !== undefined) {
                countArrayAccesses(expr);
                state.variables[name] = evaluateExpression(expr, state);
                createFrame(frames, state, pc, `The variable '${name}' is assigned a new value: ${state.variables[name]}.`, [{ type: 'assign', target: name, value: state.variables[name] }], stats);
            }
            pc++;
            continue;
        }

        // Array Element Assignment
        match = line.match(/^(\w+)\[(.*?)\]\s*=\s*(.+);/);
        if (match) {
            const [, name, idxExpr, valExpr] = match;
            countArrayAccesses(idxExpr);
            countArrayAccesses(valExpr);
            stats.arrayAccesses++; // The assignment itself is an access
            const idx = evaluateExpression(idxExpr, state);
            const val = evaluateExpression(valExpr, state);
            if (state.arrays[name]) {
                state.arrays[name][idx] = val;
                createFrame(frames, state, pc, `Index ${idx} of array '${name}' is updated to store the value ${val}.`, [{ type: 'array_update', target: name, index: idx, value: val }], stats);
            }
            pc++;
            continue;
        }

        // Increment / Decrement
        match = line.match(/^(\w+)\+\+;/);
        if (match) {
            const [, name] = match;
            if (state.variables[name] !== undefined) {
                state.variables[name]++;
                createFrame(frames, state, pc, `The variable '${name}' is incremented by 1 (now ${state.variables[name]}).`, [{ type: 'assign', target: name, value: state.variables[name] }], stats);
            }
            pc++;
            continue;
        }
        match = line.match(/^(\w+)--;/);
        if (match) {
            const [, name] = match;
            if (state.variables[name] !== undefined) {
                state.variables[name]--;
                createFrame(frames, state, pc, `The variable '${name}' is decremented by 1 (now ${state.variables[name]}).`, [{ type: 'assign', target: name, value: state.variables[name] }], stats);
            }
            pc++;
            continue;
        }

        // Standalone Method Calls (e.g. Stack/Queue operations)
        match = line.match(/^(\w+)\.(push|pop|add|offer|poll|remove)\((.*)\);/);
        if (match) {
            const [, name, method, args] = match;
            if (state.stack[name] || state.queues[name] || state.arrays[name]) {
                countArrayAccesses(args);
                evaluateExpression(`${name}.${method}(${args})`, state);
                createFrame(frames, state, pc, `Called the method '${method}' on '${name}' with arguments: ${args}.`, [{ type: 'method', target: name, method, args: [args] }], stats);
                pc++;
                continue;
            }
        }

        // Print statement
        match = line.match(/^System\.out\.print(?:ln)?\((.*)\);/);
        if (match) {
            const [, expr] = match;
            countArrayAccesses(expr);
            let outputVal = evaluateExpression(expr, state, true);
            if (outputVal && typeof outputVal === 'object' && outputVal.__error) {
                outputVal = expr.trim();
            }
            state.output.push(String(outputVal));
            createFrame(frames, state, pc, `Output printed to console: ${outputVal}.`, undefined, stats);
            pc++;
            continue;
        }

        // If statement
        match = line.match(/^if\s*\((.*)\)\s*\{/);
        if (match) {
            const [, condition] = match;
            countArrayAccesses(condition);
            stats.comparisons++;
            const condResult = evaluateExpression(condition, state);
            ifChainState.push({ resolved: condResult });
            createFrame(frames, state, pc, `Evaluating the 'if' condition (${condition})... it evaluates to ${condResult ? "true, so we enter the block" : "false, so we skip the block"}.`, undefined, stats);
            
            if (condResult) {
                // Enter if block
            } else {
                skipUntil = blocks[pc];
            }
            pc++;
            continue;
        }

        // Else if statement
        match = line.match(/^\}?\s*else\s*if\s*\((.*)\)\s*\{/);
        if (match) {
            const [, condition] = match;
            const currentChain = ifChainState[ifChainState.length - 1];
            
            if (currentChain && currentChain.resolved) {
                // Already resolved, skip this block
                skipUntil = blocks[pc];
            } else {
                countArrayAccesses(condition);
                stats.comparisons++;
                const condResult = evaluateExpression(condition, state);
                if (currentChain) currentChain.resolved = condResult;
                createFrame(frames, state, pc, `Evaluating the 'else if' condition (${condition})... it evaluates to ${condResult ? "true, so we enter the block" : "false, so we skip the block"}.`, undefined, stats);
                if (!condResult) {
                    skipUntil = blocks[pc];
                }
            }
            pc++;
            continue;
        }

        // Else statement
        match = line.match(/^\}?\s*else\s*\{/);
        if (match) {
            const currentChain = ifChainState[ifChainState.length - 1];
            if (currentChain && currentChain.resolved) {
                skipUntil = blocks[pc];
            } else {
                if (currentChain) currentChain.resolved = true;
                createFrame(frames, state, pc, `None of the previous conditions were true, so we enter the 'else' block.`, undefined, stats);
            }
            pc++;
            continue;
        }

        // While loop
        match = line.match(/^while\s*\((.*)\)\s*\{/);
        if (match) {
            const [, condition] = match;
            countArrayAccesses(condition);
            stats.comparisons++;
            const condResult = evaluateExpression(condition, state);
            createFrame(frames, state, pc, `Checking the 'while' loop condition (${condition})... it's ${condResult ? "true, so we execute the loop body" : "false, so the loop terminates"}.`, undefined, stats);

            if (condResult) {
                stats.iterations++;
                loopContext.push({
                    start: pc,
                    end: blocks[pc],
                    update: "",
                    condition: condition
                });
                maxLoopDepth = Math.max(maxLoopDepth, loopContext.length);
            } else {
                skipUntil = blocks[pc];
            }
            pc++;
            continue;
        }

        // For loop
        match = line.match(/^for\s*\((.*?);\s*(.*?);\s*(.*?)\)\s*\{/);
        if (match) {
            const [, init, condition, update] = match;
            
            let initMatch = init.match(/^(?:int|double|float|String|boolean|char)?\s*(\w+)\s*=\s*(.+)/);
            if (initMatch) {
                const [, name, expr] = initMatch;
                countArrayAccesses(expr);
                state.variables[name] = evaluateExpression(expr, state);
                createFrame(frames, state, pc, `Initializing the 'for' loop: '${name}' is set to ${state.variables[name]}.`, undefined, stats);
            }

            countArrayAccesses(condition);
            stats.comparisons++;
            const condResult = evaluateExpression(condition, state);
            createFrame(frames, state, pc, `Checking the 'for' loop condition (${condition})... it's ${condResult ? "true, so we execute the loop body" : "false, so the loop terminates"}.`, undefined, stats);

            if (condResult) {
                stats.iterations++;
                loopContext.push({
                    start: pc,
                    end: blocks[pc],
                    update: update,
                    condition: condition
                });
                maxLoopDepth = Math.max(maxLoopDepth, loopContext.length);
            } else {
                skipUntil = blocks[pc];
            }
            pc++;
            continue;
        }

        // Break statement
        if (line === "break;") {
            const currentLoop = loopContext.pop();
            if (currentLoop) {
                createFrame(frames, state, pc, `Encountered a 'break' statement. Immediately exiting the current loop.`, undefined, stats);
                pc = currentLoop.end + 1;
                continue;
            }
        }

        // Return statement
        match = line.match(/^return\s*(.*);/);
        if (match) {
            const [, expr] = match;
            if (expr) {
               countArrayAccesses(expr);
               createFrame(frames, state, pc, `The method returns the value: ${evaluateExpression(expr, state)}.`, undefined, stats);
            } else {
               createFrame(frames, state, pc, `The method returns and execution finishes.`, undefined, stats);
            }
            break;
        }

        // Fallback for unhandled executable lines (e.g., method calls)
        createFrame(frames, state, pc, `Executed statement: ${line}`, undefined, stats);

        pc++;
    }

    // Post-processing to detect swaps and calculate time/space complexity
    let totalSwaps = 0;
    let i = 0;
    while (i < frames.length - 2) {
        const f1 = frames[i];
        const f2 = frames[i + 1];
        const f3 = frames[i + 2];

        const op1 = f1.operations?.[0];
        const op2 = f2.operations?.[0];
        const op3 = f3.operations?.[0];

        if (
            op1?.type === 'assign' &&
            op2?.type === 'array_update' &&
            op3?.type === 'array_update' &&
            op2.target === op3.target
        ) {
            f3.operations = [{ type: 'swap', target: op2.target, indices: [op2.index, op3.index] }];
            f3.note = `Swapped elements at indices ${op2.index} and ${op3.index} in array '${op2.target}'.`;
            totalSwaps++;
            i += 3;
            continue;
        }
        i++;
    }

    // Determine final complexities
    let tComplex = "O(1)";
    if (maxLoopDepth === 1) tComplex = "O(n)";
    if (maxLoopDepth === 2) tComplex = "O(n²)";
    if (maxLoopDepth >= 3) tComplex = `O(n^${maxLoopDepth})`;

    let sComplex = "O(1)";
    if (maxArraySize > 0) sComplex = "O(n)";

    // Update all frames with correct swap count and complexities
    for (const frame of frames) {
        if (frame.stats) {
            frame.stats.swaps = totalSwaps;
            frame.stats.timeComplexity = tComplex;
            frame.stats.spaceComplexity = sComplex;
        }
    }

    return frames;
};
