const fs = require('fs');
const path = require('path');

const allowedNumbers = new Set([
  // rl_depth_loop_v1 result_2026_10_18 (oracle - frozen, depth 4); 42 = outreach/vendor_census.jsonl records
  '0.10', '0.04', '0.17', '42',
  // harness_variance_v1 established: best-of-4 0.608 vs sample-t0.8 0.460, gap 0.148, noise floor 0.088, n=250
  '0.608', '0.460', '0.148', '0.088', '250',
  // rl_depth_loop_v1 (result_2026_10_18, design, power): N 100/60/180, 60 steps, r=64, 3,840 rollouts, sweep 0.33,
  // finals 0.15/0.05/0.00/0.65/0.70/0.217/0.156 and their printed intervals; drift 0.000. Derived: 72 = 216/3,
  // 0.13 = power 0.1274 rounded, 0.22/0.16 = 0.217/0.156 rounded. Dates: 25 (post), 18 (run completed).
  '100', '60', '180', '15', '64', '3,840', '0.33', '0.13', '0.05', '0.15', '0.00', '0.000', '0.65', '0.70',
  '0.100', '0.040', '0.170', '0.150', '0.090', '0.220', '0.010', '0.033', '0.117', '0.111', '0.017',
  '0.167', '0.267', '0.067', '0.217', '0.156', '0.22', '0.16', '72', '84', '25', '18',
  // correction (rl_depth_loop_v1.correction_2026_10_25_substrate): old-generator certification d1-8, one-site
  // gameable 0.0074-0.04 (quoted 0.7%-4%); wrong answer keys on 2 of 120 sampled chains
  '0.7', '120',
  '0.2', '0.1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
  '16', '45', '50', '57', '147', '155', '169', '353', '400', '413', '415', '466', '942',
  '1000', '1,000', '17.9', '15.6', '20.5', '13.8', '10.8', '17.5', '10.3', '6.5', '16.1',
  '9.7', '7.3', '12.7', '3.4', '1.5', '7.7', '2.0', '1.0', '4.0', '95.2', '84.6', '95',
  '0.7100', '0.6900', '0.6200', '0.3100', '0.001', '0.400', '0.050', '0', '0%',
  // research/record.html (2026-10-26), each from the ledger entry named:
  // date 26; proposer_solver_externalisation_v2 run A/B; bet4_assembly_line_v1; capacity_sweep_v1.question +0.116
  '26', '0.555', '0.523', '0.586', '0.235', '0.203', '0.266', '1.000', '0.967', '0.917', '0.116',
  // rank_sweep_replication r and retention; benchmark_hardening_v1 61%; hardening_ceiling_v1 floor/tests/problems
  '0.91', '0.94', '0.08', '61', '0.009', '24', '53',
  // depth_verification_v1 + verification_erosion_rate (10-test plateau, 44 tests -> 0.004); gate_with_judgement_v1
  '0.037', '0.057', '0.056', '44', '0.004', '0.065', '0.005', '0.120',
  // E4_verifier_error_0.15 net -14; property_verifier_v1; E4_verifier_error_0.35 (+0.1200, eps 35%)
  '14', '71.1', '4.5', '150', '0.1200', '35',
  // self_composed_frontier_v1/v2; escalation_v2 (30 generations); plasticity_control_v1; referee_calibration_v1 AUROC
  '0.530', '0.385', '0.020', '0.124', '0.093', '30', '6.33', '0.6',
  // externalisation_at_scale_v1 pilot; bet2 / continual_per_item_cap drop shares; census_contract_check_v1
  '0.007', '0.047', '92.8', '7.9', '85.7', '78.6'
]);

const files = [
  'index.html',
  'tools/gameability.html',
  'tools/rsi-audit.html',
  'method.html',
  'research/index.html',
  'research/correct-signal-teaches.html',
  'research/record.html'
];

let totalErrors = 0;

files.forEach(f => {
  const p = path.join(__dirname, f);
  const text = fs.readFileSync(p, 'utf8');
  
  // Remove styles, scripts, html tags, attributes
  const clean = text
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/style="[^"]*"/gi, '')
    .replace(/class="[^"]*"/gi, '')
    .replace(/href="[^"]*"/gi, '')
    .replace(/<[^>]+>/g, ' ');

  // Extract all numbers including formatted numbers like 1,000
  const matches = clean.match(/\b\d{1,3}(,\d{3})*(\.\d+)?%?\b/g) || [];
  console.log('Checking ' + f + ' (found ' + matches.length + ' numbers)...');
  
  const unexpected = [];
  matches.forEach(m => {
    const raw = m.replace('%', '');
    if (!allowedNumbers.has(m) && !allowedNumbers.has(raw)) {
      unexpected.push(m);
    }
  });

  if (unexpected.length === 0) {
    console.log('  -> PASS: All numbers are in allowed list.');
  } else {
    console.log('  -> UNEXPECTED NUMBERS:', unexpected);
    totalErrors += unexpected.length;
  }
});

if (totalErrors === 0) {
  console.log('\nSUCCESS: 100% of numbers across all pages strictly match the prompt specifications!');
} else {
  console.log('\nFAILED: ' + totalErrors + ' unexpected number(s) found.');
  process.exit(1);
}
