import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import myPrismaClient from "@/lib";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type === "user.created") {
      try {
        // Save user to the database
        const userEmail = evt.data.email_addresses[0]?.email_address;
        const userAvatar =
          evt.data.image_url ||
          "https://i.pinimg.com/736x/6c/eb/75/6ceb75052855a7c75e8134396f801f64.jpg";
        const clerkId = evt.data.id;

        await myPrismaClient.user.create({
          data: {
            clerkId: clerkId,
            username: evt.data.email_addresses[0]?.email_address.split("@")[0],
            email: userEmail,
            avatar: userAvatar,
          },
        });

        // Update public metadata
        /* await clerkClient.users.updateUserMetadata(clerkId, {
          publicMetadata: {
            userId: newUser.id,
          },
        }); */
      } catch (error) {
        console.log("Error saving user to the database:", error);
        return new Response("Error saving user to the database", {
          status: 500,
        });
      }
    } else if (evt.type === "user.updated") {
      try {
        // Update user in the database
        const userEmail = evt.data.email_addresses[0]?.email_address;
        const userAvatar =
          evt.data.image_url ||
          "https://i.pinimg.com/736x/6c/eb/75/6ceb75052855a7c75e8134396f801f64.jpg";
        const clerkId = evt.data.id;

        const username =
          evt.data.username || evt.data.first_name + " " + evt.data.last_name;

        await myPrismaClient.user.update({
          where: { clerkId: clerkId },
          data: {
            username: username,
            email: userEmail,
            avatar: userAvatar,
          },
        });
      } catch (error) {
        console.log("Error updating user in the database:", error);
        return new Response("Error updating user in the database", {
          status: 500,
        });
      }
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
