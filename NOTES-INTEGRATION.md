# StudyDrop Notes — Integrated

The Notes feature is already included.

### Files
- `css/notes.css`
- `js/features/notes/notes.js`

### Firebase
Notes use:
`notes/{uid}/{subjectId}/{noteId}`

The Realtime Database rules include user-only access to notes.

### Subject button
To expose Notes for a subject, use:
```html
<button data-notes-subject="economics" data-subject-name="Economics">📚 Notes</button>
```

Replace the subject ID/name with the existing subject values in your app.

### Deployment
1. Extract this ZIP.
2. Copy the contents directly into the root of your cloned GitHub repository.
3. Commit and Push in GitHub Desktop.
4. Vercel should redeploy automatically.
