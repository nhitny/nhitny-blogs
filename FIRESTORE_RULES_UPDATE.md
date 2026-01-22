# Cập nhật Firestore Security Rules

Thêm rules sau vào Firestore để cho phép đọc settings:

```javascript
// Thêm vào phần rules hiện tại:

// SETTINGS - Allow read for checking page visibility
match /settings/{settingId} {
  allow read: if true; // Anyone can read settings
  allow write: if isAdmin(); // Only admin can write
}
```

## Full Rules Example:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    // ... existing rules for posts, comments, etc ...

    // INTERVIEW Q&A
    match /interview_qna/{questionId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
      allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['views']);
    }

    // SETTINGS - NEW
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```
