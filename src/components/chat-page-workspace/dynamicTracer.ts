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
        let jsExpr = trimmedExpr.replace(/System\.out\.println/g, 'console.log');
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
                
                const cond = evaluateExpression(currentLoop.condition, state);
                if (cond) {
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
            state.variables[name] = evaluateExpression(expr, state);
            createFrame(frames, state, pc, `Declared ${name} = ${state.variables[name]}`);
            pc++;
            continue;
        }

        // Variable Declaration without Assignment
        match = line.match(/^(?:int|double|float|String|boolean|char)\s+(\w+)\s*;/);
        if (match) {
            const [, name] = match;
            state.variables[name] = 0;
            createFrame(frames, state, pc, `Declared ${name}`);
            pc++;
            continue;
        }

        // Array Declaration (Literal)
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
            let outputVal = evaluateExpression(expr, state);
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
            ifChainState.push({ resolved: condResult });
            createFrame(frames, state, pc, `Condition (${condition}) is ${condResult}`);
            
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
                const condResult = evaluateExpression(condition, state);
                if (currentChain) currentChain.resolved = condResult;
                createFrame(frames, state, pc, `Else if condition (${condition}) is ${condResult}`);
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
                createFrame(frames, state, pc, `Entering else block`);
            }
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
        match = line.match(/^for\s*\((.*?);\s*(.*?);\s*(.*?)\)\s*\{/);
        if (match) {
            const [, init, condition, update] = match;
            
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

        // Break statement
        if (line === "break;") {
            const currentLoop = loopContext.pop();
            if (currentLoop) {
                createFrame(frames, state, pc, `Break encountered. Exiting loop.`);
                pc = currentLoop.end + 1;
                continue;
            }
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
            break;
        }

        pc++;
    }

    return frames;
};
