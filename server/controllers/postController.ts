
import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { GoogleGenAI } from "@google/genai";
import { cloudinary } from "../config/cloudinary.js";
import { Generation } from "../models/Generation.js";
import { Post } from "../models/Post.js";

const TEXT_MODEL = "gemini-2.5-flash";

// Generate Post (text only)
// POST /api/posts/generate
export const generatePost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { prompt, tone } = req.body;

        if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
            res.status(400).json({ message: "Prompt is required" });
            return;
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            res.status(400).json({
                message: "Gemini API Key is missing. Please add it to your server/.env file.",
            });
            return;
        }

        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            contents: `Write a social media post based on this idea: "${prompt.trim()}".
Tone: ${tone || "Professional"}.
Rules:
- Write only the post text, ready to publish.
- Include 3 to 6 relevant hashtags at the end.
- Do not add explanations, titles, quotation marks, or markdown formatting.`,
        });

        const content = (response.text || "").trim();

        if (!content) {
            res.status(502).json({ message: "The AI returned an empty response. Please try again." });
            return;
        }

        // Save generation to DB
        const generation = await Generation.create({
            user: req.user._id,
            prompt: prompt.trim(),
            content,
            tone,
        });

        res.json(generation);
    } catch (error: any) {
        console.error("generatePost error:", error);
        res.status(500).json({ message: error?.message || "Server error" });
    }
};

// Get generations
// GET /api/posts/generations
export const getGenerations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const generations = await Generation.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(generations);
    } catch (error: any) {
        console.error("getGenerations error:", error);
        res.status(500).json({ message: error?.message || "Server error" });
    }
};

// Get posts
// GET /api/posts
export const getPosts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const posts = await Post.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error: any) {
        console.error("getPosts error:", error);
        res.status(500).json({ message: error?.message || "Server error" });
    }
};

// Schedule post
// POST /api/posts
export const schedulePost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { content, platforms, scheduledFor } = req.body;

        if (!content || !platforms || !scheduledFor) {
            res.status(400).json({ message: "content, platforms and scheduledFor are required" });
            return;
        }

        const scheduledDate = new Date(scheduledFor);
        if (isNaN(scheduledDate.getTime())) {
            res.status(400).json({ message: "Invalid scheduledFor date" });
            return;
        }

        // Parse platforms if it comes as a stringified array from FormData
        let parsedPlatforms = platforms;
        if (typeof platforms === "string") {
            try {
                parsedPlatforms = JSON.parse(platforms);
            } catch (e) {
                parsedPlatforms = platforms.split(",");
            }
        }

        // Optional media uploaded manually (used by the Scheduler page)
        let mediaUrl: string | undefined = req.body.mediaUrl || undefined;
        let mediaType: "image" | "video" | undefined = req.body.mediaType || undefined;

        if (req.file) {
            const result = await new Promise<any>((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: "auto", folder: "social-scheduler" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file!.buffer);
            });
            mediaUrl = result.secure_url;
            mediaType = result.resource_type === "video" ? "video" : "image";
        }

        const post = await Post.create({
            user: req.user._id,
            content,
            platforms: parsedPlatforms,
            mediaUrl,
            mediaType,
            scheduledFor: scheduledDate,
            status: "scheduled", // set on the server, not trusted from the client
        });

        res.status(201).json(post);
    } catch (error: any) {
        console.error("schedulePost error:", error);
        res.status(500).json({ message: error?.message || "Server error" });
    }
}; 