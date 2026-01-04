# Security Testing Guide

Comprehensive security testing procedures for ARTI Slides (Supabase Auth + Multi-Tenant).

## Testing Strategy

**Defense in Depth:**
1. **Database Layer**: Row Level Security (RLS) policies
2. **Application Layer**: Middleware + API route authorization
3. **Transport Layer**: HTTPS, secure cookies, CORS

**Test Levels:**
- Unit tests (RLS policies)
- Integration tests (auth flows, workspace isolation)
- E2E tests (full user journeys)
- Penetration tests (manual security testing)

## 1. Row Level Security (RLS) Testing

### Test Environment Setup

```sql
-- Create test users
INSERT INTO auth.users (id, email) VALUES
  ('user-a-id', 'user-a@test.com'),
  ('user-b-id', 'user-b@test.com');

-- Create test workspaces
INSERT INTO workspaces (id, name) VALUES
  ('workspace-a', 'Workspace A'),
  ('workspace-b', 'Workspace B');

-- Add memberships
INSERT INTO workspace_members (id, user_id, workspace_id, role) VALUES
  ('member-a-id', 'user-a-id', 'workspace-a', 'owner'),
  ('member-b-id', 'user-b-id', 'workspace-b', 'owner');

-- Create test deck
INSERT INTO decks (id, workspace_id, user_id, title) VALUES
  ('deck-a-id', 'workspace-a', 'user-a-id', 'Deck A');
```

### Test Cases

#### TC-RLS-001: Cross-Workspace Read Isolation

**Objective:** Verify user B cannot read user A's decks.

**Setup:** User A has deck in workspace A. User B is member of workspace B.

**Test:**

```sql
-- Authenticate as user B
SET request.jwt.claims.sub = 'user-b-id';

-- Try to read user A's deck
SELECT * FROM decks WHERE id = 'deck-a-id';
```

**Expected:** 0 rows returned (RLS blocks access).

**Actual:** _[Fill in during testing]_

**Status:** ⬜ Pass / ⬜ Fail

---

#### TC-RLS-002: Cross-Workspace Write Isolation

**Objective:** Verify user B cannot update user A's decks.

**Test:**

```sql
SET request.jwt.claims.sub = 'user-b-id';

UPDATE decks
SET title = 'Hacked!'
WHERE id = 'deck-a-id';
```

**Expected:** 0 rows affected (RLS blocks update).

**Status:** ⬜ Pass / ⬜ Fail

---

#### TC-RLS-003: Same-Workspace Read Access

**Objective:** Verify user A can read their own workspace decks.

**Test:**

```sql
SET request.jwt.claims.sub = 'user-a-id';

SELECT * FROM decks WHERE workspace_id = 'workspace-a';
```

**Expected:** All decks in workspace A returned.

**Status:** ⬜ Pass / ⬜ Fail

---

#### TC-RLS-004: Workspace Member Addition

**Objective:** Verify adding user B to workspace A grants read access.

**Test:**

```sql
-- Add user B to workspace A
INSERT INTO workspace_members (id, user_id, workspace_id, role)
VALUES ('member-b-a-id', 'user-b-id', 'workspace-a', 'member');

-- Now user B can read workspace A decks
SET request.jwt.claims.sub = 'user-b-id';
SELECT * FROM decks WHERE workspace_id = 'workspace-a';
```

**Expected:** Decks in workspace A now visible to user B.

**Status:** ⬜ Pass / ⬜ Fail

---

#### TC-RLS-005: API Keys Scoped to Workspace

**Objective:** Verify API key X (workspace A) cannot access workspace B data.

**Test:**

```sql
-- Create API key for workspace A
INSERT INTO api_keys (id, workspace_id, name, key_hash, prefix)
VALUES ('key-a-id', 'workspace-a', 'Key A', '<hash>', 'ak_abc');

-- In application code, use API key A to try accessing workspace B data
-- (API key auth middleware should set context to workspace A)
```

**Expected:** API calls with key A can only access workspace A resources.

**Status:** ⬜ Pass / ⬜ Fail

---

#### TC-RLS-006: Public Shared Deck Access

**Objective:** Verify unauthenticated users can view public shared decks.

**Test:**

```sql
-- Mark deck as public
UPDATE decks
SET share_access = 'anyone_with_link_can_view'
WHERE id = 'deck-a-id';

-- Unauthenticated request (no jwt claim)
SELECT * FROM decks WHERE id = 'deck-a-id';
```

**Expected:** Deck returned even without authentication.

**Status:** ⬜ Pass / ⬜ Fail

---

#### TC-RLS-007: Service Role Bypass

**Objective:** Verify service role can bypass RLS (for admin operations).

**Test:**

```sql
-- Using service role credentials
SELECT * FROM decks;  -- All decks, all workspaces
```

**Expected:** All decks returned (no RLS filtering).

**Status:** ⬜ Pass / ⬜ Fail

---

## 2. Authentication Flow Testing

### TC-AUTH-001: Signup Success

**Objective:** Verify signup creates user + workspace + membership.

**Steps:**

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

**Expected:**
- Response: `{ "user": { "id": "...", "email": "test@example.com" } }`
- Database: User exists in `auth.users` and `users` table
- Database: Default workspace created
- Database: User is owner of default workspace

**Verification:**

```sql
SELECT * FROM users WHERE email = 'test@example.com';
SELECT * FROM workspaces WHERE name LIKE 'Test User%';
SELECT * FROM workspace_members WHERE user_id = '<user-id>';
```

**Status:** ⬜ Pass / ⬜ Fail

---

### TC-AUTH-002: Login Success

**Objective:** Verify login returns session cookie.

**Steps:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected:**
- Response: `{ "user": { "id": "...", "email": "test@example.com" } }`
- Cookie: `sb-access-token` set (HTTP-only, secure, SameSite)

**Verification:**

```bash
cat cookies.txt | grep sb-access-token
```

**Status:** ⬜ Pass / ⬜ Fail

---

### TC-AUTH-003: Login Failure (Wrong Password)

**Objective:** Verify login fails with wrong password.

**Steps:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "WrongPassword"
  }'
```

**Expected:**
- Response: `{ "error": "Invalid login credentials" }` (401 Unauthorized)
- No session cookie set

**Status:** ⬜ Pass / ⬜ Fail

---

### TC-AUTH-004: Protected Route Redirects to Login

**Objective:** Verify unauthenticated users are redirected.

**Steps:**

```bash
curl -i http://localhost:3000/dashboard
```

**Expected:**
- Response: 307 Redirect to `/login?redirect=/dashboard`

**Status:** ⬜ Pass / ⬜ Fail

---

### TC-AUTH-005: Logout Clears Session

**Objective:** Verify logout invalidates session.

**Steps:**

```bash
# Login first
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{ "email": "test@example.com", "password": "SecurePass123!" }'

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt

# Try accessing protected route
curl -i http://localhost:3000/dashboard -b cookies.txt
```

**Expected:**
- Logout response: `{ "success": true }`
- Dashboard access: Redirected to /login

**Status:** ⬜ Pass / ⬜ Fail

---

## 3. API Key Authentication Testing

### TC-API-001: Valid API Key Accepted

**Objective:** Verify valid API key allows access to API.

**Steps:**

```bash
curl -X POST http://localhost:3000/api/v1/generations \
  -H "Authorization: Bearer ak_valid_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "input_text": "Test presentation",
    "text_mode": "generate",
    "language": "no"
  }'
```

**Expected:**
- Response: `{ "id": "...", "status": "queued", ... }`

**Status:** ⬜ Pass / ⬜ Fail

---

### TC-API-002: Invalid API Key Rejected

**Objective:** Verify invalid API key is rejected.

**Steps:**

```bash
curl -X POST http://localhost:3000/api/v1/generations \
  -H "Authorization: Bearer ak_invalid_key" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

**Expected:**
- Response: `{ "error": "Invalid API key" }` (401 Unauthorized)

**Status:** ⬜ Pass / ⬜ Fail

---

### TC-API-003: Revoked API Key Rejected

**Objective:** Verify revoked API keys are rejected.

**Steps:**

```bash
# Revoke API key via UI (Settings → API Keys → Revoke)

# Try using revoked key
curl -X POST http://localhost:3000/api/v1/generations \
  -H "Authorization: Bearer ak_revoked_key" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

**Expected:**
- Response: `{ "error": "API key has been revoked" }` (401 Unauthorized)

**Status:** ⬜ Pass / ⬜ Fail

---

### TC-API-004: Expired API Key Rejected

**Objective:** Verify expired API keys are rejected.

**Setup:** Create API key with 1-day expiration, wait 2 days (or manually set `expires_at` in past).

**Steps:**

```bash
curl -X POST http://localhost:3000/api/v1/generations \
  -H "Authorization: Bearer ak_expired_key" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

**Expected:**
- Response: `{ "error": "API key has expired" }` (401 Unauthorized)

**Status:** ⬜ Pass / ⬜ Fail

---

## 4. Team Management Security Testing

### TC-TEAM-001: Only Owners/Admins Can Invite

**Objective:** Verify members cannot invite new members.

**Setup:** User A is member (not admin/owner) of workspace A.

**Steps:**

```bash
# Authenticate as user A (member)
curl -X POST http://localhost:3000/api/workspaces/workspace-a/members \
  -H "Authorization: Bearer <user-a-session>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new@example.com",
    "role": "member"
  }'
```

**Expected:**
- Response: `{ "error": "Only owners and admins can invite members" }` (403 Forbidden)

**Status:** ⬜ Pass / ⬜ Fail

---

### TC-TEAM-002: Cannot Change Owner Role

**Objective:** Verify owner role cannot be changed.

**Steps:**

```bash
# Try to demote owner to member
curl -X PATCH http://localhost:3000/api/workspaces/workspace-a/members/owner-user-id \
  -H "Authorization: Bearer <admin-session>" \
  -H "Content-Type: application/json" \
  -d '{ "role": "member" }'
```

**Expected:**
- Response: `{ "error": "Cannot change owner role" }` (400 Bad Request)

**Status:** ⬜ Pass / ⬜ Fail

---

### TC-TEAM-003: Cannot Remove Owner

**Objective:** Verify owner cannot be removed.

**Steps:**

```bash
curl -X DELETE http://localhost:3000/api/workspaces/workspace-a/members/owner-user-id \
  -H "Authorization: Bearer <admin-session>"
```

**Expected:**
- Response: `{ "error": "Cannot remove workspace owner" }` (400 Bad Request)

**Status:** ⬜ Pass / ⬜ Fail

---

### TC-TEAM-004: Invitation Email Match Enforced

**Objective:** Verify invitation can only be accepted by invited email.

**Setup:** Invite sent to `alice@example.com`.

**Steps:**

```bash
# Authenticate as bob@example.com
# Try to accept Alice's invitation
curl -X GET http://localhost:3000/invite/<alice-token>
```

**Expected:**
- Error page: "This invitation is for alice@example.com. You are logged in as bob@example.com."

**Status:** ⬜ Pass / ⬜ Fail

---

### TC-TEAM-005: Expired Invitation Rejected

**Objective:** Verify invitations expire after 7 days.

**Setup:** Create invitation, manually set `expires_at` to past date.

**Steps:**

```bash
curl -X GET http://localhost:3000/invite/<expired-token>
```

**Expected:**
- Error page: "Invitation Expired. Please contact the workspace owner for a new invitation."

**Status:** ⬜ Pass / ⬜ Fail

---

## 5. Workspace Isolation Testing

### TC-WORKSPACE-001: Deck List Filtered by Workspace

**Objective:** Verify dashboard only shows active workspace's decks.

**Setup:** User A is member of workspace A and workspace B. Workspace A is active.

**Steps:**

1. Login as user A
2. Navigate to `/dashboard`
3. Inspect deck list

**Expected:**
- Only decks from workspace A shown
- Decks from workspace B hidden

**Verification:**

```sql
-- Verify user has decks in both workspaces
SELECT workspace_id, COUNT(*) FROM decks
WHERE user_id = 'user-a-id'
GROUP BY workspace_id;
```

**Status:** ⬜ Pass / ⬜ Fail

---

### TC-WORKSPACE-002: Switch Workspace Filters Decks

**Objective:** Verify switching workspace updates deck list.

**Steps:**

1. Login as user A (member of workspace A and B)
2. Note decks shown (workspace A)
3. Switch to workspace B via workspace switcher
4. Verify deck list updated

**Expected:**
- After switch: Only workspace B decks shown

**Status:** ⬜ Pass / ⬜ Fail

---

### TC-WORKSPACE-003: Cannot Edit Other Workspace's Decks

**Objective:** Verify direct URL access to other workspace's deck is blocked.

**Setup:** User A in workspace A, deck D in workspace B.

**Steps:**

```bash
# Authenticate as user A
curl -X PATCH http://localhost:3000/api/decks/deck-d-id \
  -H "Authorization: Bearer <user-a-session>" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Hacked!" }'
```

**Expected:**
- Response: `{ "error": "Deck not found" }` (404 Not Found) or 403 Forbidden

**Status:** ⬜ Pass / ⬜ Fail

---

## 6. Cookie Security Testing

### TC-COOKIE-001: Session Cookie is HTTP-Only

**Objective:** Verify session cookie cannot be accessed via JavaScript.

**Steps:**

1. Login via browser
2. Open DevTools → Console
3. Run: `document.cookie`

**Expected:**
- `sb-access-token` not visible in output (HTTP-only flag prevents JavaScript access)

**Status:** ⬜ Pass / ⬜ Fail

---

### TC-COOKIE-002: Session Cookie is Secure

**Objective:** Verify cookie is only sent over HTTPS (in production).

**Steps:**

1. Deploy to production (HTTPS enabled)
2. Login
3. Inspect cookie via DevTools → Application → Cookies

**Expected:**
- `sb-access-token` has `Secure` flag set

**Status:** ⬜ Pass / ⬜ Fail (N/A for localhost)

---

### TC-COOKIE-003: Session Cookie has SameSite

**Objective:** Verify cookie has SameSite=Lax (CSRF protection).

**Steps:**

1. Login
2. Inspect cookie via DevTools → Application → Cookies

**Expected:**
- `sb-access-token` has `SameSite=Lax` or `SameSite=Strict`

**Status:** ⬜ Pass / ⬜ Fail

---

## 7. Input Validation Testing

### TC-INPUT-001: SQL Injection Prevention

**Objective:** Verify SQL injection is prevented.

**Steps:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "x\u0027 OR \u00271\u0027=\u00271"
  }'
```

**Expected:**
- Response: `{ "error": "Invalid login credentials" }` (401 Unauthorized)
- No SQL error in logs

**Status:** ⬜ Pass / ⬜ Fail

---

### TC-INPUT-002: XSS Prevention

**Objective:** Verify XSS is prevented in user inputs.

**Steps:**

1. Create deck with title: `<script>alert('XSS')</script>`
2. View deck in dashboard

**Expected:**
- Script not executed (Next.js escapes by default)
- Title displayed as plain text

**Status:** ⬜ Pass / ⬜ Fail

---

### TC-INPUT-003: Email Validation

**Objective:** Verify invalid emails are rejected.

**Steps:**

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "password": "SecurePass123!"
  }'
```

**Expected:**
- Response: `{ "error": "Validation failed", "details": { "email": ["Invalid email address"] } }` (400 Bad Request)

**Status:** ⬜ Pass / ⬜ Fail

---

## 8. Rate Limiting Testing (Future)

⚠️ **MVP:** Rate limiting not implemented yet. For production:

### TC-RATE-001: Login Rate Limit

**Objective:** Verify brute force protection on login endpoint.

**Steps:** Attempt 10 login requests in 1 minute.

**Expected:** After 5 failures, receive `429 Too Many Requests`.

**Status:** ⬜ Not Implemented

---

### TC-RATE-002: API Key Rate Limit

**Objective:** Verify API rate limits per key.

**Steps:** Send 100 API requests in 1 minute with same API key.

**Expected:** After threshold (e.g., 60/min), receive `429 Too Many Requests`.

**Status:** ⬜ Not Implemented

---

## 9. E2E Security Journeys

### E2E-SEC-001: Full User Lifecycle

**Scenario:** Signup → Create workspace → Invite member → Member accepts → Collaborate

**Steps:**

1. Signup as Alice (`alice@example.com`)
2. Verify default workspace created
3. Create deck in default workspace
4. Invite Bob (`bob@example.com`) as member
5. Signup as Bob
6. Accept invitation
7. Login as Bob
8. Verify Bob can see Alice's deck (same workspace)
9. Logout Bob, login as Alice
10. Remove Bob from workspace
11. Logout Alice, login as Bob
12. Verify Bob can no longer see Alice's deck

**Expected:** All steps succeed, workspace isolation maintained throughout.

**Status:** ⬜ Pass / ⬜ Fail

---

### E2E-SEC-002: API Key Lifecycle

**Scenario:** Create key → Use key → Revoke key → Verify blocked

**Steps:**

1. Login as Alice
2. Navigate to Settings → API Keys
3. Create new API key, copy key
4. Use key to call `POST /v1/generations`
5. Verify generation succeeds
6. Revoke API key
7. Try using revoked key
8. Verify 401 Unauthorized

**Expected:** Key works before revocation, blocked after.

**Status:** ⬜ Pass / ⬜ Fail

---

## Test Execution Checklist

### Automated Tests

- [ ] Unit tests: `pnpm test`
- [ ] Type checking: `pnpm type-check`
- [ ] Linting: `pnpm lint`

### Manual Security Tests

- [ ] All TC-RLS tests executed
- [ ] All TC-AUTH tests executed
- [ ] All TC-API tests executed
- [ ] All TC-TEAM tests executed
- [ ] All TC-WORKSPACE tests executed
- [ ] All TC-COOKIE tests executed
- [ ] All TC-INPUT tests executed
- [ ] All E2E-SEC tests executed

### Production Readiness

- [ ] Rate limiting implemented
- [ ] Email confirmation enabled
- [ ] Audit logging configured
- [ ] Monitoring/alerting set up
- [ ] Backup/restore tested

## Security Test Results Summary

| Category | Tests Passed | Tests Failed | Pass Rate |
|----------|--------------|--------------|-----------|
| RLS Policies | - / 7 | - | - % |
| Authentication | - / 5 | - | - % |
| API Keys | - / 4 | - | - % |
| Team Management | - / 5 | - | - % |
| Workspace Isolation | - / 3 | - | - % |
| Cookie Security | - / 3 | - | - % |
| Input Validation | - / 3 | - | - % |
| E2E Security | - / 2 | - | - % |
| **TOTAL** | **- / 32** | **-** | **- %** |

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Auth Security](https://supabase.com/docs/guides/auth/auth-deep-dive/auth-policies)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables#security)
- [Migration Guide](./SUPABASE_MIGRATION.md)
