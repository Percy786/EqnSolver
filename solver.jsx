import nerdamer from 'nerdamer';
import 'nerdamer/Solve';
import 'nerdamer/Algebra';
import 'nerdamer/Calculus';

export function solveArithmeticOrAlgebra(input, showSteps = false) {
    const steps = [];
    let solutionSet = null; // default: null, only show if needed

    try {
        let eq = input.trim();

        // 1️⃣ Pure arithmetic
        if (/^[0-9+\-*/().^ ]+$/.test(eq)) {
            const result = nerdamer(eq).evaluate().text();
            if (showSteps) steps.push(`Evaluate: ${eq} = ${result}`);
            return { result, steps, solutionSet: null };
        }

        // 2️⃣ Factorization / simplification
        if (/^factor\(/i.test(eq) || /^simplify\(/i.test(eq)) {
            const action = /^factor/i.test(eq) ? 'Factor' : 'Simplify';
            const expr = eq.replace(/^(factor|simplify)\(/i, '').slice(0, -1);
            const result = nerdamer(expr).expand().text();
            if (showSteps) steps.push(`${action} ${expr} = ${result}`);
            return { result, steps, solutionSet: null };
        }

        // 3️⃣ Inequalities
        const inequalityMatch = eq.match(/(<=|>=|<|>)/);
        if (inequalityMatch) {
            const operator = inequalityMatch[0];
            const [lhs, rhs] = eq.split(operator);
            const expr = `${lhs}-(${rhs})`;
            const variableMatch = expr.match(/[a-zA-Z]/);
            if (!variableMatch) return { result: 'No variable found', steps, solutionSet: null };

            const variable = variableMatch[0];
            const sols = nerdamer.solveEquations(expr, variable);

            if (!sols.length) return { result: 'No solution found', steps, solutionSet: null };

            const results = sols.map(s => {
                const val = parseFloat(nerdamer(s).evaluate().text());
                const res = `${variable} ${operator} ${val}`;
                if (showSteps) steps.push(`Solve ${expr} ${operator} 0 => ${res}`);
                return res;
            });

            solutionSet = `{${results.join(', ')}}`; // only for inequalities
            return { result: results.join(', '), steps, solutionSet };
        }

        // 4️⃣ Algebraic equations
        if (eq.includes('=')) {
            const [lhs, rhs] = eq.split('=');
            eq = `${lhs}-(${rhs})`;
            if (showSteps) steps.push(`Rewriting equation: ${lhs} = ${rhs} => ${eq} = 0`);
        }

        const variables = Array.from(new Set(eq.match(/[a-zA-Z]/g)));
        if (!variables.length) return { result: 'No variable found', steps, solutionSet: null };

        const variable = variables[0];
        const sols = nerdamer.solveEquations(eq, variable);

        if (!sols.length) return { result: 'No solution found', steps, solutionSet: null };

        const evaluatedSols = sols.map(s => {
            const val = nerdamer(s).evaluate().text();
            if (showSteps) steps.push(`Solution: ${variable} = ${val}`);
            return val;
        });

        // Only show solution set if multiple solutions
        if (evaluatedSols.length > 1) solutionSet = `{${evaluatedSols.join(', ')}}`;

        return { result: evaluatedSols.join(', '), steps, solutionSet };

    } catch (err) {
        return { result: 'Error: Invalid input', steps, solutionSet: null };
    }
}
