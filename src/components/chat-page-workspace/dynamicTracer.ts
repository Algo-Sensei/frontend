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
    arrays: Record<string, any[]>;
    output: string[];
};

const cloneState = (state: RuntimeState): RuntimeState => {
    return {
        variables: JSON.parse(JSON.stringify(state.variables)),
        arrays: JSON.parse(JSON.stringify(state.arrays)),
        output: [...state.output],
    };
};

const createFrame = (
    frames: ExecutionFrame[],
    state: RuntimeState,
    line: number,
    note?: string
) => {
    const snapshot = cloneState(state);
    frames.push({
        line: line + 1, // 1-based indexing for UI
        variables: snapshot.variables,
        heap: {
            arrays: snapshot.arrays,
        },
        output: snapshot.output,
        note,
    });
};

const evaluateExpression = (expr: string, state: RuntimeState): any => {
    const varNames = Object.keys(state.variables);
    const varValues = Object.values(state.variables);
    const arrNames = Object.keys(state.arrays);
    const arrValues = Object.values(state.arrays);

    try {
        const trimmedExpr = expr.trim();
        if (!trimmedExpr) return null;
        // Simple heuristic to replace `.length` with `.length` and basic Java-to-JS mappings
        let jsExpr = trimmedExpr.replace(/System\.out\.println/g, 'console.log');
        // A very basic and unsafe evaluator, but sufficient for a mock visualizer
        const fn = new Function(...varNames, ...arrNames, `return ${jsExpr};`);
        return fn(...varValues, ...arrValues);
    } catch (e) {
        console.warn("Evaluation failed for:", expr, e);
        return null;
    }
};

export const traceDynamicJava = (code: string): ExecutionFrame[] => {
    const frames: ExecutionFrame[] = [];
    const state: RuntimeState = {
        variables: {},
        arrays: {},
        output: [],
    };

    const lines = code.split("\n");
    let pc = 0; // program counter

    // Find block bounds
    const blocks: Record<number, number> = {}; // startLine -> endLine
    const stack: number[] = [];
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("{")) stack.push(i);
        if (lines[i].includes("}")) {
            const start = stack.pop();
            if (start !== undefined) {
                blocks[start] = i;
            }
        }
    }

    let loopContext: { start: number, end: number, update: string, condition: string }[] = [];
    let skipUntil: number | null = null;
    let maxSteps = 1000; // prevent infinite loops
    let steps = 0;

    while (pc < lines.length && steps++ < maxSteps) {
        const rawLine = lines[pc];
        const line = rawLine.trim();

        if (skipUntil !== null) {
            if (pc === skipUntil) {
                skipUntil = null;
            }
            pc++;
            continue;
        }

        // Skip empty or comment lines, or class/method signatures
        if (!line || line.startsWith("//") || line.startsWith("public class") || line.startsWith("public static") || line.startsWith("class ")) {
            if (line.includes("{")) {
                // If it's a method/class declaration, just execute its body
            }
            pc++;
            continue;
        }

        // End of block
        if (line === "}") {
            // Check if we are in a loop
            const currentLoop = loopContext.length > 0 ? loopContext[loopContext.length - 1] : null;
            if (currentLoop && currentLoop.end === pc) {
                // Execute update statement
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
                        // General assignment update
                        const parts = currentLoop.update.split("=");
                        if (parts.length === 2) {
                            state.variables[parts[0].trim()] = evaluateExpression(parts[1], state);
                        }
                    }
                }
                
                // Re-evaluate condition
                const cond = evaluateExpression(currentLoop.condition, state);
                if (cond) {
                    pc = currentLoop.start + 1; // Jump back to start of loop body
                    continue;
                } else {
                    loopContext.pop(); // Loop ends
                }
            }
            pc++;
            continue;
        }

        // Variable Declaration & Assignment
        // e.g. int x = 5; or String s = "hello";
        let match = line.match(/^(?:int|double|float|String|boolean|char)\s+(\w+)\s*=\s*(.+);/);
        if (match) {
            const [, name, expr] = match;
            state.variables[name] = evaluateExpression(expr, state);
            createFrame(frames, state, pc, `Declared ${name} = ${state.variables[name]}`);
            pc++;
            continue;
        }

        // Variable Declaration without Assignment
        match = line.match(/^(?:int|double|float|String|boolean|char)\s+(\w+)\s*;/);
        if (match) {
            const [, name] = match;
            state.variables[name] = 0; // default
            createFrame(frames, state, pc, `Declared ${name}`);
            pc++;
            continue;
        }

        // Array Declaration (Literal)
        // e.g. int[] arr = {1, 2, 3};
        match = line.match(/^(?:int|double|float|String|boolean|char)\[\]\s+(\w+)\s*=\s*\{(.*?)\};/);
        if (match) {
            const [, name, els] = match;
            const elements = els.split(",").map(e => evaluateExpression(e.trim(), state));
            state.arrays[name] = elements;
            createFrame(frames, state, pc, `Created array ${name} with ${elements.length} elements`);
            pc++;
            continue;
        }

        // Array Declaration (New)
        // e.g. int[] arr = new int[5];
        match = line.match(/^(?:int|double|float|String|boolean|char)\[\]\s+(\w+)\s*=\s*new\s+(?:int|double|float|String|boolean|char)\[(.*?)\];/);
        if (match) {
            const [, name, sizeExpr] = match;
            const size = evaluateExpression(sizeExpr, state);
            state.arrays[name] = new Array(size).fill(0);
            createFrame(frames, state, pc, `Allocated array ${name} of size ${size}`);
            pc++;
            continue;
        }

        // Variable Assignment
        // e.g. x = 10;
        match = line.match(/^(\w+)\s*=\s*(.+);/);
        if (match) {
            const [, name, expr] = match;
            if (state.variables[name] !== undefined) {
                state.variables[name] = evaluateExpression(expr, state);
                createFrame(frames, state, pc, `Assigned ${name} = ${state.variables[name]}`);
            }
            pc++;
            continue;
        }

        // Array Element Assignment
        // e.g. arr[i] = 5;
        match = line.match(/^(\w+)\[(.*?)\]\s*=\s*(.+);/);
        if (match) {
            const [, name, idxExpr, valExpr] = match;
            const idx = evaluateExpression(idxExpr, state);
            const val = evaluateExpression(valExpr, state);
            if (state.arrays[name]) {
                state.arrays[name][idx] = val;
                createFrame(frames, state, pc, `Assigned ${name}[${idx}] = ${val}`);
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
                createFrame(frames, state, pc, `Incremented ${name}`);
            }
            pc++;
            continue;
        }
        match = line.match(/^(\w+)--;/);
        if (match) {
            const [, name] = match;
            if (state.variables[name] !== undefined) {
                state.variables[name]--;
                createFrame(frames, state, pc, `Decremented ${name}`);
            }
            pc++;
            continue;
        }

        // Print statement
        match = line.match(/^System\.out\.print(?:ln)?\((.*)\);/);
        if (match) {
            const [, expr] = match;
            let outputVal = expr;
            
            // basic string concatenation handling
            if (expr.includes("+")) {
               outputVal = evaluateExpression(expr, state);
            } else if (expr.startsWith('"') && expr.endsWith('"')) {
               outputVal = expr.slice(1, -1);
            } else {
               outputVal = evaluateExpression(expr, state);
            }

            state.output.push(String(outputVal));
            createFrame(frames, state, pc, `Printed: ${outputVal}`);
            pc++;
            continue;
        }

        // If statement
        match = line.match(/^if\s*\((.*)\)\s*\{/);
        if (match) {
            const [, condition] = match;
            const condResult = evaluateExpression(condition, state);
            createFrame(frames, state, pc, `Condition (${condition}) is ${condResult}`);
            
            if (condResult) {
                // Enter if block
            } else {
                // Skip to end of if block
                skipUntil = blocks[pc];
            }
            pc++;
            continue;
        }

        // Else if / Else
        match = line.match(/^\}?\s*else\s*if\s*\((.*)\)\s*\{/);
        if (match) {
            // If we are evaluating this, it means we just finished the previous if block
            // or we skipped to it. 
            // In a simple tracer, if we hit "else if", it means the previous block executed,
            // so we skip this block.
            skipUntil = blocks[pc];
            pc++;
            continue;
        }

        match = line.match(/^\}?\s*else\s*\{/);
        if (match) {
             // same logic
             skipUntil = blocks[pc];
             pc++;
             continue;
        }

        // While loop
        match = line.match(/^while\s*\((.*)\)\s*\{/);
        if (match) {
            const [, condition] = match;
            const condResult = evaluateExpression(condition, state);
            createFrame(frames, state, pc, `While condition (${condition}) is ${condResult}`);

            if (condResult) {
                loopContext.push({
                    start: pc,
                    end: blocks[pc],
                    update: "",
                    condition: condition
                });
            } else {
                skipUntil = blocks[pc];
            }
            pc++;
            continue;
        }

        // For loop
        // for (int i = 0; i < n; i++) {
        match = line.match(/^for\s*\((.*?);\s*(.*?);\s*(.*?)\)\s*\{/);
        if (match) {
            const [, init, condition, update] = match;
            
            // execute init
            let initMatch = init.match(/^(?:int|double|float|String|boolean|char)?\s*(\w+)\s*=\s*(.+)/);
            if (initMatch) {
                const [, name, expr] = initMatch;
                state.variables[name] = evaluateExpression(expr, state);
                createFrame(frames, state, pc, `For loop init: ${name} = ${state.variables[name]}`);
            }

            const condResult = evaluateExpression(condition, state);
            createFrame(frames, state, pc, `For loop condition (${condition}) is ${condResult}`);

            if (condResult) {
                loopContext.push({
                    start: pc,
                    end: blocks[pc],
                    update: update,
                    condition: condition
                });
            } else {
                skipUntil = blocks[pc];
            }
            pc++;
            continue;
        }

        // Return statement
        match = line.match(/^return\s*(.*);/);
        if (match) {
            const [, expr] = match;
            if (expr) {
               createFrame(frames, state, pc, `Returned ${evaluateExpression(expr, state)}`);
            } else {
               createFrame(frames, state, pc, `Returned`);
            }
            break; // Stop tracing on return
        }

        // Unhandled line
        pc++;
    }

    return frames;
};