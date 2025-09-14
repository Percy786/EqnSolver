import nerdamer from 'nerdamer';
import 'nerdamer/Solve';

export function solveEquation(equation) {
  try {
    if (!equation) return 'Enter an equation';

    equation = equation.trim();

    // Detect pure arithmetic expressions, including roots and exponents
    if (/^[0-9+\-*/().^a-zA-Z\s]+$/.test(equation) && !equation.includes('=')) {
      // evaluate numeric result
      return nerdamer(equation).evaluate().text();
    }

    // Treat as algebraic equation
    let eq = equation;
    if (equation.includes('=')) {
      const [lhs, rhs] = equation.split('=');
      eq = `${lhs}-(${rhs})`; // move all terms to LHS
    }

    // Automatically detect all variables
    const variables = Array.from(new Set(eq.match(/[a-zA-Z]/g)));
    if (!variables.length) return 'No variable found to solve for';

    // Pick the first variable as the target
    const variable = variables[0];

    const sols = nerdamer.solveEquations(eq, variable);

    if (!sols.length) return 'No solution found';

    // Evaluate numeric solutions for readability
    return sols.map(s => nerdamer(s).evaluate().text()).join(', ');
  } catch (err) {
    return 'Error: Invalid equation';
  }
}
