import bcrypt from "bcryptjs"

export async function hashPassword(password: string) {
  try {
    const salt = 17;
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    throw new Error(`Password hashing failed: ${error}`);
  }
}

export async function comparePassword(password: string, hashedPassword: string){

  const match = await bcrypt.compare(password, hashedPassword);
  return match;
}