/* eslint-disable camelcase */
import { clerkClient } from "@clerk/nextjs/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";

// Type definitions for Clerk webhook data
type ClerkUserCreatedEvent = {
  id: string;
  email_addresses: { email_address: string }[];
  image_url: string;
  first_name: string;
  last_name: string;
  username: string;
};

type ClerkUserUpdatedEvent = {
  id: string;
  image_url: string;
  first_name: string;
  last_name: string;
  username: string;
};

type ClerkUserDeletedEvent = {
  id: string;
};

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = (await headerPayload).get("svix-id");
  const svix_timestamp = (await headerPayload).get("svix-timestamp");
  const svix_signature = (await headerPayload).get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  // CREATE
  if (eventType === "user.created") {
    const data = evt.data as ClerkUserCreatedEvent;
    
    if (!data.username || !data.email_addresses?.[0]?.email_address) {
      return new Response("Username or email missing", { status: 400 });
    }

    const user = {
      clerkId: data.id,
      email: data.email_addresses[0].email_address,
      username: data.username,
      firstName: data.first_name,
      lastName: data.last_name,
      photo: data.image_url,
    };

    const newUser = await createUser(user);

    // Set public metadata
    if (newUser) {
      await clerkClient.users.updateUserMetadata(data.id, {
        publicMetadata: {
          userId: newUser._id,
        },
      });
    }

    return NextResponse.json({ message: "OK", user: newUser });
  }

  // UPDATE
  if (eventType === "user.updated") {
    const data = evt.data as ClerkUserUpdatedEvent;
    
    if (!data.username) {
      return new Response("Username missing", { status: 400 });
    }

    const user = {
      firstName: data.first_name,
      lastName: data.last_name,
      username: data.username,
      photo: data.image_url,
    };

    const updatedUser = await updateUser(data.id, user);

    return NextResponse.json({ message: "OK", user: updatedUser });
  }

  // DELETE
  if (eventType === "user.deleted") {
    const data = evt.data as ClerkUserDeletedEvent;
    
    if (!data.id) {
      return new Response("User ID missing", { status: 400 });
    }

    const deletedUser = await deleteUser(data.id);

    return NextResponse.json({ message: "OK", user: deletedUser });
  }

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
  console.log("Webhook body:", body);

  return new Response("", { status: 200 });
}