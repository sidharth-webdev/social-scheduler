
import cron from "node-cron";
import { Post } from "../models/Post.js";
import { Account } from "../models/Account.js";
import zernio from "../config/zernio.js";
import { ActivityLog } from "../models/ActivityLog.js";

export const initScheduler = () => {
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();
            const postsToPublish = await Post.find({
                status: "scheduled",
                scheduledFor: { $lte: now },
            });

            for (const post of postsToPublish) {
                try {
                    const accounts = await Account.find({
                        user: post.user,
                        platform: { $in: post.platforms },
                        status: "connected",
                        zernioAccountId: { $exists: true },
                    });

                    if (accounts.length === 0) {
                        console.log(`No connected Zernio accounts found for post ${post._id}`);
                        post.status = "failed";
                        await post.save();
                        continue;
                    }

                    const zernioPlatforms = accounts.map((acc) => ({
                        platform: acc.platform as any,
                        accountId: acc.zernioAccountId!,
                    }));

                    const payload = {
                        content: post.content,
                        publishNow: true,
                        // field is "mediaItems", not "mediaTimes"
                        ...(post.mediaUrl
                            ? { mediaItems: [{ type: post.mediaType || "image", url: post.mediaUrl }] }
                            : {}),
                        platforms: zernioPlatforms,
                    };

                    console.log(
                        `Publishing post ${post._id} to Zernio with media: ${post.mediaUrl || "none"}`
                    );

                    const response = await zernio.posts.createPost({
                        body: payload,
                    });

                    const publishedPost = (response.data as any)?.post || response.data;

                    if (!publishedPost) {
                        throw new Error("Failed to get post object from Zernio response");
                    }

                    // Zernio can return a 2xx (e.g. 207) even when a platform rejected the
                    // post, so a successful call is not proof of a successful publish.
                    // Check the real per-platform result before trusting it.
                    const failedPlatforms: string[] = (publishedPost.platforms || [])
                        .filter((p: any) => p.status === "failed")
                        .map((p: any) => `${p.platform}: ${p.errorMessage || "unknown error"}`);

                    if (publishedPost.status === "failed" || failedPlatforms.length > 0) {
                        throw new Error(
                            failedPlatforms.length > 0
                                ? failedPlatforms.join("; ")
                                : "Zernio reported the post as failed"
                        );
                    }

                    console.log(`Zernio post created: ${publishedPost._id || publishedPost.id}`);

                    post.status = "published";
                    await post.save();

                    await ActivityLog.create({
                        user: post.user,
                        actionType: "POST_PUBLISHED",
                        description: `Published post to ${accounts.map((a) => a.platform).join(",")}`,
                        relatedPost: post._id,
                    });
                } catch (err: any) {
                    console.error(`Failed to publish post ${post._id}:`, err?.response?.data || err?.message);
                    post.status = "failed";
                    await post.save();

                    await ActivityLog.create({
                        user: post.user,
                        actionType: "POST_FAILED",
                        description: err?.message || "Failed to publish post",
                        relatedPost: post._id,
                    });
                }
            }

            if (postsToPublish.length > 0) {
                console.log(`Evaluated ${postsToPublish.length} posts at ${now.toISOString()}`);
            }
        } catch (error) {
            console.error("Error in scheduler:", error);
        }
    });

    console.log("Scheduler Service initialized");
}; 