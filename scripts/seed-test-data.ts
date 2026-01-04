/**
 * Seed script for test data
 *
 * Creates a user, workspace, and API key for testing.
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL not set");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    // Create test user
    const user = await prisma.user.upsert({
      where: { email: "test@example.com" },
      update: {},
      create: {
        email: "test@example.com",
        name: "Test User",
      },
    });
    console.log("✅ User created:", user.id);

    // Check if workspace exists for this user
    let workspace = await prisma.workspace.findFirst({
      where: {
        members: {
          some: {
            userId: user.id,
            role: "owner",
          },
        },
      },
    });

    if (!workspace) {
      // Create test workspace
      workspace = await prisma.workspace.create({
        data: {
          name: "Test Workspace",
        },
      });
      console.log("✅ Workspace created:", workspace.id);

      // Create workspace member (owner)
      await prisma.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: "owner",
        },
      });
      console.log("✅ WorkspaceMember created");
    } else {
      console.log("✅ Workspace exists:", workspace.id);
    }

    // Generate API key
    const rawKey = `gk_test_${crypto.randomBytes(24).toString("hex")}`;
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    // Delete existing test API key if exists
    await prisma.apiKey.deleteMany({
      where: {
        workspaceId: workspace.id,
        name: "Test API Key",
      },
    });

    // Create API key
    const apiKey = await prisma.apiKey.create({
      data: {
        workspaceId: workspace.id,
        name: "Test API Key",
        keyHash,
        prefix: rawKey.substring(0, 8),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    });
    console.log("✅ API Key created:", apiKey.id);

    console.log("\n========================================");
    console.log("Test data created successfully!");
    console.log("========================================");
    console.log("\n🔑 API Key (save this, it won't be shown again):");
    console.log(`   ${rawKey}`);
    console.log("\n📋 Test with:");
    console.log(`   curl -X POST http://localhost:3001/api/v1/generations \\`);
    console.log(`     -H "Authorization: Bearer ${rawKey}" \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{"inputText": "Lag en presentasjon om AI", "textMode": "generate"}'`);
    console.log("");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
