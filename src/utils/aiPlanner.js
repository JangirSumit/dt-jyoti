// Simple rule-based AI diet plan generator (no external API)
// Inputs: profile { age, gender, heightCm, weightKg, activity, goal, cuisine, veg }
// Output: { calories, proteinG, carbsG, fatG, meals: [{name, items: [..]}] }

export function estimateBMR({ age, gender, heightCm, weightKg }) {
  // Mifflin-St Jeor
  const s = gender === 'female' ? -161 : 5;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + s;
}

export function activityFactor(level) {
  return (
    {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    }[level] || 1.2
  );
}

export function targetCalories(tdee, goal) {
  if (goal === 'lose') return Math.max(1200, tdee - 400);
  if (goal === 'gain') return tdee + 300;
  return tdee;
}

export function macroSplit(cal) {
  // 30P/45C/25F default
  const proteinCal = cal * 0.30;
  const carbsCal = cal * 0.45;
  const fatCal = cal * 0.25;
  return {
    proteinG: Math.round(proteinCal / 4),
    carbsG: Math.round(carbsCal / 4),
    fatG: Math.round(fatCal / 9),
  };
}

const bank = {
  veg: {
    breakfast: [
      'Oats + chia + milk',
      'Besan chilla + mint chutney',
      'Poha with peanuts',
      'Upma + veggies',
    ],
    snack: ['Fruit + nuts', 'Buttermilk', 'Roasted chana', 'Greek yogurt'],
    lunch: ['Roti + dal + sabzi + salad', 'Khichdi + curd + salad', 'Brown rice + rajma + salad'],
    dinner: ['Paneer/tofu + quinoa + sautéed veggies', 'Veg pulao + raita', 'Millet roti + dal + sabzi'],
  },
  nonveg: {
    breakfast: ['Omelette + toast', 'Oats + milk + eggs'],
    snack: ['Fruit + nuts', 'Buttermilk', 'Roasted chana'],
    lunch: ['Roti + chicken curry + salad', 'Brown rice + fish curry + salad'],
    dinner: ['Grilled chicken/fish + quinoa + veggies', 'Egg curry + roti + salad'],
  },
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function generatePlan(profile) {
  const bmr = estimateBMR(profile);
  const tdee = bmr * activityFactor(profile.activity);
  const calories = Math.round(targetCalories(tdee, profile.goal));
  const macros = macroSplit(calories);
  const vegKey = profile.veg ? 'veg' : 'nonveg';
  const meals = [
    { name: 'Breakfast', items: [pick(bank[vegKey].breakfast)] },
    { name: 'Snack', items: [pick(bank[vegKey].snack)] },
    { name: 'Lunch', items: [pick(bank[vegKey].lunch)] },
    { name: 'Snack', items: [pick(bank[vegKey].snack)] },
    { name: 'Dinner', items: [pick(bank[vegKey].dinner)] },
  ];
  return { calories, ...macros, meals };
}
