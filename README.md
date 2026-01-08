# CodeQuest

Online learning platform for competitive programming and coding interviews.

## Documentation

- [API Documentation](./CodeQuest-API-DB-v2.md)
- [Architecture](./ARCHITECTURE.md)
- [Database Requirements](./DATABASE_REQUIREMENTS.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Backend Structure](./backend/BACKEND_STRUCTURE.md)

---

## Test Cases - Forum - All Features (UC05)

### TC-05-01: View forum posts list (Main Feature)

**Test case name:**
View forum posts list

**Test step:**
1. Navigate to the forum page.
2. Verify forum feed loads with list of posts.
3. Observe each post displays: title, author info, creation date, reply count, view count.
4. Check pagination controls (if applicable).
5. Scroll through the list.

**Expected Result:**
1. GET /api/forum/posts returns 200 OK.
2. Response includes array of forum posts with: id, title, author info, created_at, reply_count, upvotes.
3. Posts are ordered by created_at DESC (newest first).
4. Each post shows correct metadata.
5. UI displays post list with proper formatting.

**Actual Result:**

---

## Sub Features - Search & Filter

### TC-05-02: Search forum posts by keyword

**Test case name:**
Search forum posts by keyword

**Test step:**
1. Navigate to forum page.
2. Locate search input.
3. Type keyword: "dynamic programming".
4. Press Enter or click search.
5. Inspect Network tab for search request.

**Expected Result:**
1. GET /api/forum/posts?search=dynamic+programming returns 200 OK.
2. Results include posts with matching title or content_markdown.
3. Results are limited and paginated (e.g., 10 per page).
4. Matching keywords are highlighted or UI shows result count.
5. Results can be sorted by relevance, date, or votes.

**Actual Result:**

---

### TC-05-03: Filter forum posts by problem/tag

**Test case name:**
Filter forum posts by problem/tag

**Test step:**
1. Navigate to forum page.
2. Click on a problem detail page.
3. Look for "Related Discussions" or "See All Forum Posts" for this problem.
4. Observe posts filtered by related_problem_id.
5. Alternatively, click on a tag like "Array" in post list.

**Expected Result:**
1. GET /api/forum/posts?relatedProblemId={problemId} returns 200 OK with filtered posts.
2. GET /api/forum/posts?tag=Array returns posts with matching tags (searched in tags jsonb).
3. UI shows active filter status.
4. Tag/Problem context link is clearly labeled.
5. Clear filter option is available.

**Actual Result:**

---

## Main Feature - Create Discussion Post

### TC-05-04: Create new discussion post about a problem

**Test case name:**
Create new discussion post about a problem

**Test step:**
1. Navigate to a Coding Problem detail page.
2. Locate and click "Start Discussion" or "Ask on Forum" button.
3. Verify forum post creation form appears with fields: Title, Content, Code Snippet (optional), Tags.
4. Fill in: Title: "Optimal approach for this problem?", Content: "I'm wondering about the best way to solve this...", Tags: ["Algorithm", "Help"]
5. Click "Post Discussion" button.
6. Inspect Network tab for POST request to /api/forum/posts

**Expected Result:**
1. POST /api/forum/posts returns 201 Created.
2. Response includes post ID, author_id, created_at timestamp.
3. Page redirects to forum post detail view.
4. New post is visible in forum feed.
5. Post metadata shows: author name, avatar, creation time, related_problem_id, upvotes=0, reply_count=0.

**Actual Result:**

---

## Sub Features - View & Interact with Posts

### TC-05-05: View forum post with related problem context

**Test case name:**
View forum post with related problem context

**Test step:**
1. Click on a forum post from the list.
2. Verify post detail page loads.
3. Inspect left/sidebar area showing related problem info (title, difficulty, description).
4. Inspect main area showing: post title, author info (name, avatar, level, reputation), content with markdown rendering.
5. Scroll to view replies section.

**Expected Result:**
1. GET /api/forum/posts/{postId} returns 200 OK.
2. Response includes: full post content, author details, problem context (problem.id, problem.title, problem.difficulty, problem.slug).
3. All markdown in content_markdown is properly rendered (bold, code blocks, links).
4. Problem context is clickable and links to problem detail page.
5. Reply section shows: reply_count, list of existing replies ordered by is_accepted_answer DESC, then created_at ASC.

**Actual Result:**

---

### TC-05-06: Post a solution reply with code snippet

**Test case name:**
Post a solution reply with code snippet

**Test step:**
1. On forum post detail page, scroll to reply section.
2. Locate "Post a Solution" or "Add Reply" input area.
3. Fill in: Content: "Here's an efficient solution using HashMap...", Code Snippet: paste working code (e.g., Python solution).
4. Optionally check "This is an accepted solution" checkbox (if user is post author).
5. Click "Post Reply" button.
6. Inspect Network tab for POST request to /api/forum/posts/{postId}/replies

**Expected Result:**
1. POST /api/forum/posts/{postId}/replies returns 201 Created.
2. Response includes: reply ID, post_id, author_id, content_markdown, code_snippet (JSON), upvotes=0, is_accepted_answer=false, created_at.
3. Reply count on post increments by 1 (from reply_count X to X+1).
4. New reply appears in replies list with author info and timestamp.
5. Code snippet is rendered with syntax highlighting.

**Actual Result:**

---

### TC-05-07: Quote/Reference another reply in a solution

**Test case name:**
Quote/Reference another reply in a solution

**Test step:**
1. On a forum post with multiple replies.
2. Hover over or click on a reply.
3. Look for "Quote Reply" or "Reply to This" option.
4. Click the option.
5. Verify parent_reply_id reference is set.
6. Write a response that builds on the quoted reply.
7. Click "Post Reply".

**Expected Result:**
1. New reply is created with parent_reply_id = quoted_reply.id.
2. In reply list, nested replies are indented or grouped under parent reply.
3. GET /api/forum/posts/{postId} response shows parent_reply_id in the reply object.
4. UI visually connects child reply to parent (indentation, line connection, or quoted text preview).

**Actual Result:**

---

## Sub Features - Voting System

### TC-05-08: Upvote a solution reply

**Test case name:**
Upvote a solution reply

**Test step:**
1. Navigate to forum post with multiple replies.
2. Find a helpful solution reply.
3. Click the upvote arrow/icon above the reply.
4. Inspect Network tab for voting request.
5. Check upvotes count changes.
6. Reload page and verify vote persists.

**Expected Result:**
1. POST /api/forum/vote with {votableType: 'reply', votableId: replyId, voteType: 'upvote'} returns 200 OK.
2. forum_votes table records entry: (user_id, 'forum_replies', reply_id, 'upvote').
3. Reply upvotes count increments by 1.
4. UI shows updated upvote count immediately.
5. On page refresh, upvote count remains updated.
6. User cannot vote on their own reply (optional: show "You created this reply" message).

**Actual Result:**

---

### TC-05-09: Downvote a solution reply

**Test case name:**
Downvote a solution reply

**Test step:**
1. Navigate to forum post with replies.
2. Find a reply with incorrect or unhelpful information.
3. Click the downvote arrow/icon below the reply.
4. Inspect Network tab for voting request.

**Expected Result:**
1. POST /api/forum/vote with {votableType: 'reply', votableId: replyId, voteType: 'downvote'} returns 200 OK.
2. forum_votes table records entry: (user_id, 'forum_replies', reply_id, 'downvote').
3. Reply upvotes count decrements (if threshold, reply can be hidden).
4. UI shows updated vote count.
5. System prevents double voting (if user upvoted, downvote replaces upvote).

**Actual Result:**

---

## Sub Features - Mark as Solution

### TC-05-10: Mark reply as accepted solution (Post Author Only)

**Test case name:**
Mark reply as accepted solution (Post Author Only)

**Test step:**
1. Author of forum post navigates to post detail.
2. Reviews multiple replies.
3. Finds the best/correct solution.
4. On that reply, looks for "Mark as Solution" or checkmark icon.
5. Click the mark button.

**Expected Result:**
1. POST /api/forum/replies/{replyId}/accept with authorization check (author_id matches).
2. forum_replies.is_accepted_answer updates to true.
3. forum_posts.has_accepted_answer updates to true.
4. In reply list, marked reply moves to top (sorted by is_accepted_answer DESC).
5. UI shows green checkmark/badge indicating "Accepted Solution".
6. Non-author users cannot mark as solution (403 Forbidden if attempted).

**Actual Result:**

---

## Sub Features - Sort & Filter Replies

### TC-05-11: Filter/Sort forum replies

**Test case name:**
Filter/Sort forum replies

**Test step:**
1. Navigate to forum post with 5+ replies.
2. Locate sorting/filter dropdown (e.g., "Sort By").
3. Select option: "Most Helpful" (by upvotes DESC).
4. Observe reply order changes.
5. Try other filters: "Newest", "Oldest", "Most Voted".

**Expected Result:**
1. Replies are re-sorted in frontend or via API query parameter.
2. Most Helpful: replies sorted by upvotes DESC, then created_at DESC.
3. Newest: replies sorted by created_at DESC.
4. Oldest: replies sorted by created_at ASC.
5. Most Voted (same as Most Helpful for replies).
6. Selected filter persists or is reflected in UI (highlighted/checked state).

**Actual Result:**

---

## Main Feature - Edit/Delete (CRUD Operations)

### TC-05-12: Edit own discussion post

**Test case name:**
Edit own discussion post

**Test step:**
1. Navigate to forum post authored by current user.
2. Click menu icon (⋮) on post.
3. Select "Edit Post" from dropdown.
4. Edit form appears with current content pre-filled.
5. Modify: Title, Content, Tags.
6. Click "Save Changes".

**Expected Result:**
1. PUT /api/forum/posts/{postId} returns 200 OK.
2. Only post author can edit (403 for others).
3. updated_at timestamp is refreshed.
4. Post content on detail page reflects new values.
5. History is maintained (optional: show "Edited" indicator with timestamp).

**Actual Result:**

---

### TC-05-13: Delete own discussion post

**Test case name:**
Delete own discussion post

**Test step:**
1. Navigate to forum post authored by current user.
2. Click menu icon (⋮) on post.
3. Select "Delete Post" from dropdown.
4. Confirm deletion in modal popup.
5. Inspect Network tab for DELETE request.

**Expected Result:**
1. DELETE /api/forum/posts/{postId} with authorization check returns 200 OK.
2. Only post author or admin can delete (403 Forbidden for others).
3. Post is removed from database.
4. User is redirected to forum feed.
5. Deleted post no longer appears in post list (GET /api/forum/posts returns 50 posts, count decreases).

**Actual Result:**

---

### TC-05-14: Edit own reply/solution

**Test case name:**
Edit own reply/solution

**Test step:**
1. Navigate to forum post with user's own reply.
2. Click menu icon (⋮) on reply.
3. Select "Edit Reply" from dropdown.
4. Edit form appears with current content.
5. Modify content or code snippet.
6. Click "Save Changes".

**Expected Result:**
1. PUT /api/forum/replies/{replyId} returns 200 OK.
2. Only reply author can edit (403 for others).
3. updated_at timestamp is refreshed.
4. Reply content updates on page.
5. Code snippet updates with proper rendering.

**Actual Result:**

---

### TC-05-15: Delete own reply/solution

**Test case name:**
Delete own reply/solution

**Test step:**
1. Navigate to forum post with user's own reply.
2. Click menu icon (⋮) on reply.
3. Select "Delete Reply" from dropdown.
4. Confirm deletion.

**Expected Result:**
1. DELETE /api/forum/replies/{replyId} with authorization check returns 200 OK.
2. Only reply author or admin can delete (403 Forbidden for others).
3. Reply is removed from database.
4. Post reply_count decrements by 1.
5. Reply no longer appears in replies list.

**Actual Result:**

---

## Sub Features - User Interaction

### TC-05-16: View user profile from forum post

**Test case name:**
View user profile from forum post

**Test step:**
1. Navigate to forum post.
2. Click on author's name or avatar.
3. Observe user profile card/modal or navigate to profile page.
4. Profile shows: display_name, avatar, level, reputation, total_posts, total_replies.

**Expected Result:**
1. Clicking author name links to /profiles/{userId} or shows user modal.
2. User profile displays all relevant info from users table.
3. Link to view user's other forum posts is available.
4. User's reputation/level badge is visible.

**Actual Result:**

---

## Notes

- All test cases require authentication (JWT token or Supabase auth)
- Code snippets should be rendered with syntax highlighting
- Nested replies (parent_reply_id) should be displayed hierarchically in the UI
- Authorization checks must be enforced at the API level for edit/delete operations