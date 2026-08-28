import cases from "./cases.json" with { type: "json" };

const BASE = "http://localhost:3000";

let pass = 0;
const failures = [];

for (const { input, expected_category } of cases) {
  const res = await fetch(`${BASE}/tasks/triage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: input }),
  });
  
  const data = await res.json();
  
  if (data.category === expected_category) {
    pass++;
    console.log(`✓ "${input.slice(0, 50)}"`);
  } else {
    failures.push({ input, expected: expected_category, got: data.category });
    console.log(`✗ "${input.slice(0, 50)}" → expected ${expected_category}, got ${data.category}`);
  }
}

console.log(`\nResult: ${pass}/${cases.length} (${Math.round(pass/cases.length*100)}%)`);
if (failures.length) {
  console.log("\nFailed cases:");
  failures.forEach(f => console.log(`  "${f.input}"`));
}
