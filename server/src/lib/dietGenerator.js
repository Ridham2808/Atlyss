const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Strictly use gemini-2.5-flash as requested
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7
    }
});

/**
 * Generates a 7-day personalized diet plan using Gemini 2.5 Flash.
 */
const generateDiet = async (request, member) => {
    console.log(`[AI Diet Engine] Starting generation for member: ${member.id}`);

    try {
        const {
            dietGoal, targetWeight, activityLevel, workoutDuration, sleepDuration,
            dietType, preferredCuisine, mealsPerDay, foodAllergies, foodsLike,
            foodsAvoid, healthConditions, dietaryRestrictions, waterIntake,
            smokingAlcohol, physicalLimitations, bmi, bmiStatus
        } = request;

        const prompt = `
            You are Atlyss AI, a professional high-tier Clinical Nutritionist and Dietitian. 
            Generate a 7-day personalized diet plan for:
            - Age: ${member.age || 'N/A'}
            - Gender: ${member.gender || 'N/A'}
            - Current Weight: ${member.weight || 'N/A'}kg
            - Current Height: ${member.height || 'N/A'}cm
            - BMI: ${bmi} (${bmiStatus})
            - Diet Goal: ${dietGoal}
            - Target Weight: ${targetWeight || 'N/A'}kg
            - Activity Level: ${activityLevel}
            - Workout Duration: ${workoutDuration} min/day
            - Sleep Duration: ${sleepDuration} hours/day
            - Diet Type: ${dietType}
            - Preferred Cuisine: ${preferredCuisine || 'General'}
            - Meals Per Day: ${mealsPerDay}
            - Food Allergies: ${foodAllergies || 'None'}
            - Foods Liked: ${foodsLike || 'Not specified'}
            - Foods Avoided: ${foodsAvoid || 'Not specified'}
            - Health Conditions: ${healthConditions || 'None'}
            - Dietary Restrictions: ${dietaryRestrictions || 'None'}
            - Current Water Intake: ${waterIntake || 'Not specified'}
            - Smoking/Alcohol: ${smokingAlcohol || 'Not specified'}
            - Physical Limitations: ${physicalLimitations || 'None'}

            YOUR TASK:
            1. Return a JSON object with this exact structure:
               {
                 "name": "Smart-Diet Strategy",
                 "goal": "${dietGoal}",
                 "recommendations": "Drink at least 3 liters of water daily. Avoid sugary drinks. Include fruits and vegetables in every meal.",
                 "meals": [
                   {
                     "day": 1,
                     "mealType": "Breakfast",
                     "mealName": "Oatmeal with Almonds",
                     "description": "1/2 cup rolled oats cooked with water, topped with 10 almonds and 1/2 sliced banana",
                     "calories": 350,
                     "protein": 12,
                     "carbs": 45,
                     "fats": 10
                   }
                 ]
               }
            2. Logic: Ensure the plan respects all allergies, health conditions, and dietary restrictions.
            3. Meal Types: For each of the 7 days, provide: Breakfast, Mid-Morning Snack, Lunch, Evening Snack, Dinner (total 35 meal entries).
            4. Macros: Provide realistic estimate for calories, protein, carbs and fats for each meal.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonText = response.text();

        console.log("[AI Diet Engine] Plan generation successful.");
        return JSON.parse(jsonText);
    } catch (err) {
        console.error("[AI Diet Engine] Critical Failure:", err.message);
        throw new Error(`AI Diet Generation failed: ${err.message}`);
    }
};

module.exports = { generateDiet };
