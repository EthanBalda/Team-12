import bycrypt from "bcryptjs"

export async function hashPassword(password: string) {
  try {
    const salt = 17;
    const hash = await bycrypt.hash(password, salt);
    return hash;
  } catch (error) {
    throw new Error(`Password hashing failed: ${error}`);
  }
}