# StudyDrop — secure no-AI build

## Changes
- AI tutor, AI insights, AI quiz, AI flashcard generation and Claude branding removed.
- Manual flashcards remain.
- `/api/ai` backend removed.
- Firebase Anonymous Authentication added.
- Firebase Realtime Database rules added for authenticated users and room membership.
- Ownership checks added for goals, comments and chat messages.
- User text is length-limited client-side and in database rules.
- Production security headers added to Vercel.

## Firebase setup
1. Firebase Console → Authentication → Sign-in method → enable **Anonymous**.
2. Realtime Database → Rules → publish `database.rules.json`.
3. Deploy this folder to Vercel.
4. Remove old `OPENROUTER_API_KEY`/Gemini environment variables.

## Migration
Old rooms used locally generated IDs and a different room structure. Recreate/migrate old rooms before publishing the new rules.

## Next hardening
For a public production app, add Firebase App Check and server-side/Cloud Functions rate limits for spam-sensitive operations.
