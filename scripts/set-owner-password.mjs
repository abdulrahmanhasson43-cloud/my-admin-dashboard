// Sets a KNOWN password for an account in the DEV database, and makes sure its
// profile carries the given role.
//
// Why this exists: an account created during the build had no recorded password,
// so sign-in failed with "Invalid email or password" and there was no way to
// recover it. This is the supported way to reset it.
//
// DEV ONLY. A row written here never reaches the published app — that app has a
// separate database. On the live site you sign up normally, then set the role on
// that user's row in the platform's database panel.
//
//   node scripts/set-owner-password.mjs <email> <password> [role]
//   node scripts/set-owner-password.mjs owner@madar.test 'MadarOwner2026!' owner
import "dotenv/config";
import bcrypt from "bcryptjs";
import pg from "pg";

const [, , EMAIL, PASSWORD, ROLE = "owner"] = process.argv;

if (!EMAIL || !PASSWORD || PASSWORD.length < 8) {
  console.error("usage: node scripts/set-owner-password.mjs <email> <password(min 8)> [role]");
  process.exit(1);
}

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await db.connect();

const hash = await bcrypt.hash(PASSWORD, 10);
const updated = await db.query(
  "update users set password_hash = $1 where email = $2 returning id, email",
  [hash, EMAIL],
);

if (updated.rowCount === 0) {
  console.error("no account with that email:", EMAIL);
  await db.end();
  process.exit(1);
}

const userId = updated.rows[0].id;

// upsert the profile role; display_name is only set when the profile is new
await db.query(
  `insert into profiles (user_id, role, display_name)
   values ($1, $2, $3)
   on conflict (user_id) do update set role = excluded.role`,
  [userId, ROLE, EMAIL.split("@")[0]],
);

const profile = await db.query("select role, display_name from profiles where user_id = $1", [userId]);
console.log("OK", updated.rows[0].email, "role=", profile.rows[0]?.role, "name=", profile.rows[0]?.display_name);

await db.end();
