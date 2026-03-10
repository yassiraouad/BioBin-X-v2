// utils/calculator.js

export function calculateEnergy(weightKg) {
  // 1 kg food waste → ~0.5 kWh biogas energy
  return weightKg * 0.5;
}

export function calculateCO2Saved(weightKg) {
  // 1 kg food waste composted/biogassed → ~0.8 kg CO2 saved vs landfill
  return weightKg * 0.8;
}

export function calculatePoints(weightKg) {
  return Math.round(weightKg * 10);
}

export function formatNumber(num, decimals = 1) {
  if (num >= 1000) return `${(num / 1000).toFixed(decimals)}k`;
  return num.toFixed(decimals);
}

export function energyEquivalent(kwh) {
  // What can you power with this energy?
  if (kwh < 0.1) return `${(kwh * 1000).toFixed(0)} Wh`;
  if (kwh < 1) return `${kwh.toFixed(2)} kWh – lader ${Math.round(kwh / 0.01)} telefoner`;
  return `${kwh.toFixed(2)} kWh – driver en TV i ${Math.round(kwh / 0.1)} timer`;
}

export function getRank(points) {
  if (points < 50) return { name: 'Spire', icon: '🌱', color: '#86efac' };
  if (points < 200) return { name: 'Grønn Kriger', icon: '🌿', color: '#4ade80' };
  if (points < 500) return { name: 'Miljøvenn', icon: '♻️', color: '#22c55e' };
  if (points < 1000) return { name: 'Klimahelt', icon: '🌍', color: '#16a34a' };
  return { name: 'BioLegende', icon: '👑', color: '#facc15' };
}

export function getWeeklyData(logs) {
  const days = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);

  return days.map((day, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dayLogs = logs.filter(log => {
      if (!log.timestamp) return false;
      const logDate = log.timestamp.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
      return logDate.toDateString() === date.toDateString();
    });
    const weight = dayLogs.reduce((sum, l) => sum + (l.weight || 0), 0);
    return { day, weight: parseFloat(weight.toFixed(2)), date: date.toLocaleDateString('no-NO') };
  });
}
