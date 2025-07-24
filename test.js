import bcrypt from "bcryptjs";

async function test() {
  const password = "zxcvbnm";
  const hash = await bcrypt.hash(password, 10);
  console.log("Hash:", hash);

  const isMatch = await bcrypt.compare(password, hash);
  console.log("Password matches?", isMatch); // Should be true
}

test();
