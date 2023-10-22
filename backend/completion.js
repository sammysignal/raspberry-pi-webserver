const config = require("../config");

const formData = require("form-data");
const Mailgun = require("mailgun.js");

/**
 * Get an OpenAi chat response based on the user input
 * @param {*} openai - OpenAI client
 * @param {string} text - User input as text
 * @returns
 */
async function getOpenAICompletion(openai, text) {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    max_tokens: 200,
    temperature: 0.9,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    messages: [
      { role: "system", content: "Come up with a funny quip about the last thing the user said." },
      { role: "user", content: text },
    ],
  });

  return completion.choices[0].message.content;
}

/**
 * Convert audio to text using OpenAI
 * @param {OpenAI} openai - OpenAI client
 * @param {File} audioFile - Audio file
 * @returns
 */
async function getAudioText(openai, audioFile) {
  try {
    const audioText = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
      temperature: 0.9,
      response_format: "json",
    });

    return audioText.text;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

/**
 * Send an email notification
 * @param {string} text - Input of the user as a string
 * @param {string} completion - Completion response from OpenAI
 */
function sendNotificationEmail(text, completion) {
  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({ username: "api", key: config.MAILGUN_EMAIL_API_KEY });
  const today = new Date().toISOString();

  mg.messages
    .create(config.MAILGUN_DOMAIN, {
      from: `RPi Message <mailgun@${config.MAILGUN_DOMAIN}>`,
      to: [config.MY_EMAIL],
      subject: `RPi Message Recieved ${today}`,
      text: "Text: " + text + "\n\nResponse: " + completion,
      html: "<p>Text: " + text + "</p><p>Response: " + completion + "</p>",
    })
    .catch((err) => console.log(err));
}

module.exports = { getAudioText, getOpenAICompletion, sendNotificationEmail };
