const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const transcribe = async (lectureUrl) => {
    try {
        // const { lectureUrl } = req.body;
        const ASSEMBLY_AI_KEY = process.env.ASSEMBLYAI_API_KEY;
        const response = await axios.post("https://api.assemblyai.com/v2/transcript",
            { audio_url: lectureUrl },
            { headers: { authorization: ASSEMBLY_AI_KEY, "Content-Type": "application/json" } }
        );
        return response.data.id;
        // res.json({ transcriptId: response.data.id });
    } catch (error) {
        console.error("Error starting transcription:", error);
        // res.status(500).json({ error: "Failed to start transcription" });
    }
}

const transcription = async (transcriptId) => {
    try {
        const ASSEMBLY_AI_KEY = process.env.ASSEMBLYAI_API_KEY;

        // Polling for the transcription status
        let isTranscriptionReady = false;
        let transcriptionText = null;

        while (!isTranscriptionReady) {
            const response = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
                headers: { authorization: ASSEMBLY_AI_KEY },
            });

            // Check if the transcription is completed
            if (response.data.status === 'completed') {
                transcriptionText = response.data.text;
                isTranscriptionReady = true;
            } else if (response.data.status === 'failed') {
                throw new Error("Transcription failed");
            } else {
                // If transcription is still in progress, wait before retrying
                console.log("Transcription in progress... Retrying...");
                await new Promise(resolve => setTimeout(resolve, 5000));  // Wait for 5 seconds before retrying
            }
        }

        return transcriptionText;
    } catch (error) {
        console.log("Error in fetching transcription:", error);
        throw new Error("Failed to fetch transcript");
    }
}

const summarize = async (transcripts) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.AI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        // const { transcript } = req.body;

        const prompt = `You are an AI that summarizes educational content into concise revision notes. Summarize this lecture into key points for revision: ${transcripts}`;
        // const { videoId } = req.body;
        // const prompt = `Summarize the YouTube video with ID: ${videoId} into revision notes.`;
        console.log(prompt);
        const result = await model.generateContent(prompt);
        // console.log(result.response.text());
        return result.response.text()
        // return res.json({
        //     success: true,
        //     message: result.response.text(),
        //     status: 200
        // });
    } catch (error) {
        console.log("Something went wrong");
        console.log(error);
        // return res.json({
        //     success: false,
        //     message: "Something went wrong ",
        //     status: 500
        // });
    }
}

exports.generateSummary = async (req, res) => {
    try {
        const { lectureUrl } = req.body;
        const transcriptId = await transcribe(lectureUrl);
        // console.log(transcriptId);
        const transcriptions = await transcription(transcriptId);
        // console.log(transcriptions);
        const message = await summarize(transcriptions);
        return res.status(200).json({
            success: true,
            message,
        })
    }
    catch (err) {
        console.log("Error occurred while generating summary");
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}