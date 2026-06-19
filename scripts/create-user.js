#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const usersFile = path.join(__dirname, "../data/users.json");

// Parse command line arguments
const args = process.argv.slice(2);
const argMap = {};

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) {
    const key = args[i].slice(2);
    const value = args[i + 1];
    if (value && !value.startsWith("--")) {
      argMap[key] = value;
      i++;
    } else {
      argMap[key] = true;
    }
  }
}

const { email, username, password, help } = argMap;

if (help || !email || !username || !password) {
  console.log(`
Create a new user account

Usage:
  node scripts/create-user.js --email <email> --username <username> --password <password>

Examples:
  node scripts/create-user.js --email admin@example.com --username admin --password MySecurePass123
  npm run create-user -- --email user@example.com --username john --password SecurePassword

Options:
  --email      User email address (required)
  --username   Username (required)
  --password   Password (required)
  --help       Show this help message
  `);
  process.exit(help ? 0 : 1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error("❌ Invalid email format");
  process.exit(1);
}

// Validate username
if (username.length < 3) {
  console.error("❌ Username must be at least 3 characters");
  process.exit(1);
}

// Validate password
if (password.length < 6) {
  console.error("❌ Password must be at least 6 characters");
  process.exit(1);
}

async function createUser() {
  try {
    // Read existing users
    let users = [];
    if (fs.existsSync(usersFile)) {
      const data = fs.readFileSync(usersFile, "utf-8");
      users = JSON.parse(data);
    }

    // Check if user already exists
    if (users.some((u) => u.email === email)) {
      console.error(`❌ Email already in use: ${email}`);
      process.exit(1);
    }

    if (users.some((u) => u.username === username)) {
      console.error(`❌ Username already taken: ${username}`);
      process.exit(1);
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 10);

    // Create user
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      email,
      username,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    // Ensure directory exists
    const dir = path.dirname(usersFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write users file
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    console.log(`✅ User created successfully!\n`);
    console.log(`  Email: ${email}`);
    console.log(`  Username: ${username}`);
    console.log(`  ID: ${newUser.id}`);
    console.log(`\nThe user can now sign in at /sign-up`);
  } catch (error) {
    console.error(`❌ Error creating user: ${error.message}`);
    process.exit(1);
  }
}

createUser();
