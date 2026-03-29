import dotenv from 'dotenv';
dotenv.config();
const key = process.env.GEMINI_API_KEY || "";
console.log("KEY_START:", key.substring(0, 4));
console.log("KEY_END:", key.substring(key.length - 4));
console.log("KEY_LENGTH:", key.length);
if (key.startsWith("AIza")) {
    console.log("FORMAT: Standard Google API Key format detected.");
} else {
    console.log("FORMAT: UNEXPECTED. Should start with 'AIza'.");
}
