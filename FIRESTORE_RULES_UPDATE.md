# Firestore security rules

The rules live in [`firestore.rules`](firestore.rules). They are **not** applied
automatically when you push code — deploy them to Firebase after the matching
code is live.

## What they enforce

- Posts: the public can read only published posts or scheduled posts whose time
  has passed. Drafts are visible to the admin only.
- Admin = `users/{uid}.role == "admin"`. Clients can never write `/users`, so
  nobody can promote themselves; set the role in the Firebase Console.
- Counters: anyone may add exactly +1 view; signed-in users may change
  `likes` / `commentsCount` by exactly ±1. Nothing else on a post can be changed
  except by the admin.
- Comments: create as yourself only (max 3000 chars); delete your own, or any as
  admin. Likes: create/delete as yourself only.
- Interview Q&A, settings, topics: public read, admin write.

## Deploy

```bash
npm install -g firebase-tools   # once
firebase login                  # once
firebase deploy --only firestore:rules
```

Or open Firebase Console → Firestore Database → Rules, paste the contents of
`firestore.rules` and click **Publish**.

> Order matters: deploy the app code first (it queries only what the rules
> allow), then the rules. Older app versions list every post and would be
> blocked by these rules.
