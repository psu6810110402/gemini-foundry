const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const models = await genAI.getGenerativeModel({ model: "gemini-pro" }).apiKey; // access internal to check config? No, there is listModels on genAI

    // The SDK exposes listModels on the instance? No, it's not directly on the instance in older versions.
    // Actually, in 0.24.1 it might be different. 
    // Let's try to just use valid model names.
    // But to debug, let's try a simple generation with gemini-pro.
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hello");
    console.log("gemini-pro works:", result.response.text());
  } catch (error) {
    console.error("gemini-pro failed:", error.message);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    console.log("gemini-1.5-flash works:", result.response.text());
  } catch (error) {
    console.error("gemini-1.5-flash failed:", error.message);
  }
}

listModels();
