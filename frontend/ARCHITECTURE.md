# Frontend Architecture Overview

## Introduction

This frontend follows a **feature-based architecture** with centralized shared infrastructure. Each domain (customers, staff, payments, etc.) is self-contained within its own feature module.

---

## Feature Module Structure

```
features/<domain>/
├── api/                  # API calls using apiClient
│   └── <domain>Api.js    # e.g., customersApi.js
├── hooks/                # React Query hooks
│   ├── use<Domain>.js    # e.g., useCustomers.js (queries)
│   └── use<Domain>Mutations.js  # e.g., useCustomerMutations.js (mutations)
├── components/           # UI components
│   ├── <Domain>Toolbar.jsx
│   ├── <Domain>Table.jsx
│   ├── <Domain>Loading.jsx
│   ├── <Domain>EmptyState.jsx
│   └── index.js          # Centralized exports
└── pages/                # Page orchestration
    └── <Domain>Page.jsx  # e.g., CustomersPage.jsx
```

**Existing Features**:
- `customers/`, `staff/`, `meal-plans/`, `attendance/`
- `payments/`, `pause-requests/`, `reports/`
- `subscriptions/`, `billing/`

---

## Shared Components

```
components/
├── layout/               # Layout components (Header, Sidebar, Footer)
├── ui/                   # shadcn/ui primitives (Button, Card, Input, etc.)
├── modals/               # Reusable modals
└── [other shared components]
```

**When to use**:
- **Feature components**: Domain-specific logic (e.g., CustomerTable)
- **Shared components**: Used across multiple features (e.g., Dialog, Button)

---

## Data Flow

```
User Interaction
      ↓
  Page Component (orchestrates)
      ↓
  React Query Hook (useDomain / useDomainMutations)
      ↓
  API Function (features/<domain>/api/)
      ↓
  apiClient (lib/api/client.js) + API_ENDPOINTS (lib/api/endpoints.js)
      ↓
  Backend API
      ↓
  Response cached by React Query
      ↓
  UI updates automatically
```

**Key Benefits**:
- **Automatic caching** (staleTime, refetch on focus)
- **Loading/error states** built-in
- **Optimistic updates** via mutations
- **Cache invalidation** on success

---

## Adding a New Feature

1. **Create feature folder**: `features/<domain>/`
2. **Add endpoints**: Update `lib/api/endpoints.js`
   ```javascript
   DOMAIN: '/admin/<domain>',
   DOMAIN_BY_ID: (id) => `/admin/<domain>/${id}`,
   ```
3. **Create API layer**: `features/<domain>/api/<domain>Api.js`
   ```javascript
   import { apiClient } from '@/lib/api/client';
   import { API_ENDPOINTS } from '@/lib/api/endpoints';
   
   export const list<Domain> = async () => {
     const response = await apiClient.get(API_ENDPOINTS.ADMIN.DOMAIN);
     return response.data;
   };
   ```
4. **Create hooks**: `features/<domain>/hooks/`
   - `use<Domain>.js` for queries
   - `use<Domain>Mutations.js` for mutations
5. **Create components**: `features/<domain>/components/`
6. **Create page**: `features/<domain>/pages/<Domain>Page.jsx`
7. **Add route**: Update `app/AppRoutes.jsx`

---

## Conventions

- **Naming**: PascalCase for components, camelCase for functions
- **File extensions**: `.jsx` for React components, `.js` for utilities/APIs
- **Imports**: Use absolute imports with `@/` prefix
- **Styling**: Tailwind CSS with semantic tokens
- **State management**:
  - **Server state**: React Query
  - **Client state**: useState/useReducer in components
  - **Global state**: Context (Auth, Theme)

---

## Contexts

Located in `context/`:
- `AuthContext.jsx` - Authentication state
- `ThemeContext.js` - Theme preferences

---

## Key Libraries

- **React Query** (`@tanstack/react-query`) - Server state
- **Axios** (`apiClient`) - HTTP client
- **React Router** - Routing
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **date-fns** - Date formatting
- **Sonner** - Toast notifications
- **Lucide React** - Icons

---

## File Structure Summary

```
src/
├── app/                  # App setup (Routes, ProtectedRoute)
├── components/           # Shared components
├── context/              # Global contexts
├── features/             # Feature modules ⭐
├── lib/                  # Utilities, API client, endpoints
├── pages/                # Legacy pages (Dashboard, SuperAdmin, Login)
└── theme/                # Theme configuration
```

**Migration status**: All major admin features migrated to `features/*`. SuperAdmin features pending.

---

## Best Practices

1. **Keep pages thin** - Orchestration only, delegate to components
2. **Colocate feature code** - All domain logic in `features/<domain>/`
3. **Use API client** - Never import axios directly (except in `apiClient`)
4. **Centralize endpoints** - All URLs in `lib/api/endpoints.js`
5. **Invalidate strategically** - Invalidate React Query caches after mutations
6. **Handle errors** - Toast notifications for all user-facing errors
7. **Loading states** - Always show loading UI during async operations
8. **Empty states** - Provide helpful empty states with actions

---

## Questions?

For questions or clarifications, refer to:
- Feature examples: `features/customers/`, `features/payments/`
- API client: `lib/api/client.js`
- Endpoints: `lib/api/endpoints.js`
