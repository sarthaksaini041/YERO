// Seed script to create or verify user 'sarthak' with password '00000000'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mglneknqwgpzjijfuaac.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nbG5la25xd2dwemppamZ1YWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MDIxNzYsImV4cCI6MjEwNDE3ODE3Nn0.HkzlKEjLFWVl-6L3PJrlwGdN8THvxis3pnpLgGhrfzo';

const email = process.argv[2] || 'sarthak@yero.app';
const password = process.argv[3] || '00000000';
const name = 'sarthak';

async function seedUser() {
  console.log(`Checking / seeding user: ${email} (Name: ${name})...`);

  // Try to sign in first
  const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (signInRes.ok) {
    const data = await signInRes.json();
    console.log(`✓ User '${email}' already exists and password authentication is verified!`);
    console.log(`  User ID: ${data.user.id}`);
    return;
  }

  // Otherwise sign up
  console.log(`User does not exist or password differs. Creating user '${email}'...`);
  const signUpRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      data: { name },
    }),
  });

  const signUpData = await signUpRes.json();
  if (!signUpRes.ok) {
    console.error('Failed to create user:', signUpData);
    process.exit(1);
  }

  console.log(`✓ User '${email}' created successfully! User ID: ${signUpData.id}`);
}

seedUser().catch((err) => {
  console.error('Error seeding user:', err);
  process.exit(1);
});
