# Customers Feature Components

This folder contains UI components for the Customers feature. Each component has a single, clear responsibility.

## Component Responsibilities

### `CustomersToolbar.jsx`
**Purpose**: Search and action bar  
**Props**:
- `searchTerm` - Current search value
- `onSearchChange` - Search change handler
- `onAddClick` - Add button click handler

**Used for**: Top toolbar with search input and "Add Customer" button

---

### `CustomersTable.jsx`
**Purpose**: Desktop table view  
**Props**:
- `customers` - Array of customer objects
- `onDelete` - Delete handler
- `isDeleting` - Loading state

**Used for**: Displaying customers in a table on desktop/tablet

---

### `CustomersCards.jsx`
**Purpose**: Mobile card view  
**Props**:
- `customers` - Array of customer objects
- `onDelete` - Delete handler
- `isDeleting` - Loading state

**Used for**: Displaying customers as cards on mobile devices

---

### `CustomersLoading.jsx`
**Purpose**: Loading state  
**Props**: None

**Used for**: Showing loading spinner while data is being fetched

---

### `CustomersEmptyState.jsx`
**Purpose**: Empty state message  
**Props**:
- `hasSearchTerm` - Whether a search is active

**Used for**: Showing messages when no customers exist or search returns no results

---

## Styling Guidelines

All components use **Tailwind utility classes** based on the centralized `tailwind.config.js`.

### Color Tokens Used
- `primary` - Primary brand color (buttons, accents)
- `success` - Success states (active status, positive dues)
- `danger` - Danger states (delete actions, overdue)
- `gray-*` - Neutral grays (text, borders, backgrounds)

### Common Patterns
```jsx
// Primary button
className="bg-primary hover:bg-primary-600 text-white"

// Success badge
className="bg-success-100 text-success-800 border-success-200"

// Danger action
className="text-danger-600 hover:bg-danger-50"

// Neutral text
className="text-gray-700"
```

---

## Usage Example

```jsx
import { 
  CustomersToolbar,
  CustomersTable,
  CustomersCards,
  CustomersLoading,
  CustomersEmptyState
} from '../components';

function CustomersPage() {
  const { data: customers, isLoading } = useCustomers();
  
  return (
    <>
      <CustomersToolbar {...props} />
      {isLoading ? (
        <CustomersLoading />
      ) : customers.length === 0 ? (
        <CustomersEmptyState />
      ) : (
        <>
          <CustomersTable customers={customers} />
          <CustomersCards customers={customers} />
        </>
      )}
    </>
  );
}
```

---

## Copy This Pattern for Other Features

When creating new features (staff, meal-plans, etc.), follow this structure:

```
features/[feature-name]/
├── components/
│   ├── [Feature]Toolbar.jsx
│   ├── [Feature]Table.jsx
│   ├── [Feature]Cards.jsx
│   ├── [Feature]Loading.jsx
│   ├── [Feature]EmptyState.jsx
│   └── index.js
```

Keep the same props pattern and Tailwind styling approach.
