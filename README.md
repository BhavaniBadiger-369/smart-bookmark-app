# Smart Bookmark App

A modern bookmark manager built using **Next.js (App Router)** and **Supabase**.

Users can log in using Google OAuth, add private bookmarks, delete them, and see real-time updates across multiple tabs.

---

## 🚀 Live Demo

Vercel URL:  
👉 [Add your deployed link here]

GitHub Repository:  
👉 [Add your GitHub repo link here]

---

## 🛠 Tech Stack

- **Next.js (App Router)**
- **Supabase**
  - Google OAuth Authentication
  - PostgreSQL Database
  - Realtime Subscriptions
  - Row Level Security (RLS)
- **Tailwind CSS**
- **Lucide Icons**
- **Vercel** (Deployment)

---

## ✨ Features

- 🔐 Google OAuth login (no email/password)
- 🔒 Bookmarks are private to each user
- ➕ Add bookmark (title + URL)
- ❌ Delete bookmark with confirmation modal
- 🔄 Real-time updates across multiple tabs
- 🚪 Logout sync across browser tabs
- 📱 Fully responsive (mobile, tablet, desktop)
- 🎨 Modern glass-style UI

---

## 🧠 Application Flow

1. User logs in using Google OAuth.
2. Supabase creates a session.
3. After authentication:
   - The app fetches bookmarks belonging to that user.
4. When a bookmark is added or deleted:
   - Database updates
   - Realtime subscription updates all open tabs
5. Row Level Security ensures users only access their own data.

---

## 🗄 Database Design

### Table: `bookmarks`

| Column      | Type      | Description |
|-------------|-----------|-------------|
| id          | uuid      | Primary key |
| title       | text      | Bookmark title |
| url         | text      | Bookmark URL |
| user_id     | uuid      | Foreign key (auth.users) |
| created_at  | timestamp | Auto timestamp |

---

## 🔐 Security (Row Level Security)

RLS is enabled on the `bookmarks` table.

Policies:

- Users can SELECT only their own bookmarks
- Users can INSERT only their own bookmarks
- Users can DELETE only their own bookmarks

Policy condition used:

```sql
auth.uid() = user_id

⚡ Real-Time Implementation

Supabase Realtime is used to listen for database changes:
supabase
  .channel('realtime-bookmarks')
  .on('postgres_changes', ...)

This allows:

Instant UI updates after add/delete

Multi-tab synchronization

No page refresh required

🧩 Problems Faced & Solutions
1️⃣ First-time Add/Delete Not Updating Immediately

Issue:
On first login with a new Google account, the first bookmark mutation did not immediately reflect in the UI.

Cause:
Realtime subscription was not fully established before the first database mutation occurred.

Solution:
After successful insert/delete, the app explicitly refetches bookmarks to guarantee UI consistency:
await fetchBookmarks(user.id)

This ensures reliable updates even if realtime subscription initializes slightly later.

2️⃣ Logout Not Syncing Across Tabs

Issue:
Logging out in one tab did not automatically log out other open tabs.

Solution:
Added an auth state listener:
supabase.auth.onAuthStateChange(...)

When session becomes null, the app redirects to the login page in all open tabs.

3️⃣ Understanding Row Level Security (RLS)

Initially, it was unclear how auth.uid() worked in Supabase policies.

After understanding that:

auth.uid() returns the authenticated user’s UUID

Matching it against user_id enforces per-user isolation

RLS was properly configured to ensure strict data security.

4️⃣ Responsive Layout Adjustments

The layout initially required refinement for mobile and tablet screens.

Tailwind responsive breakpoints (sm, md) were used to adjust:

Header alignment

Button widths

Input stacking

Modal sizing

The final UI works across mobile, tablet, and desktop.

🧪 Testing Scenarios Covered

Multiple tabs open simultaneously

Add/delete across tabs

Logout sync across tabs

Fresh Google account login

Mobile responsiveness

Normal vs incognito browser behavior

🔧 Environment Variables

The following environment variables are required:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
