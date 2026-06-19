import fs from "fs/promises";
import path from "path";
import { compare, hash } from "bcryptjs";

export type UserRecord = {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: string;
};

const usersFile = path.join(process.cwd(), "data", "users.json");

async function ensureUsersFile() {
  try {
    await fs.access(usersFile);
  } catch {
    await fs.mkdir(path.dirname(usersFile), { recursive: true });
    await fs.writeFile(usersFile, "[]", "utf8");
  }
}

async function readUsers(): Promise<UserRecord[]> {
  await ensureUsersFile();
  const fileContents = await fs.readFile(usersFile, "utf8");

  try {
    const users = JSON.parse(fileContents);
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: UserRecord[]) {
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2), "utf8");
}

export async function findUserByEmail(email: string) {
  const users = await readUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function findUserByUsername(username: string) {
  const users = await readUsers();
  return users.find((user) => user.username.toLowerCase() === username.toLowerCase()) ?? null;
}

export async function createUser({
  email,
  username,
  password,
}: {
  email: string;
  username: string;
  password: string;
}) {
  const users = await readUsers();
  const passwordHash = await hash(password, 10);
  const user: UserRecord = {
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    username,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeUsers(users);

  return user;
}

export async function validatePassword(user: UserRecord, password: string) {
  return compare(password, user.passwordHash);
}
