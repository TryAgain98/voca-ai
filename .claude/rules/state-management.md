# State Management

## Decision Tree — Pick the Lowest Layer That Works

```
Is the state server data (fetched async)?
  → React Query (server state). Do NOT duplicate into Zustand.

Is the state local to one component or a short parent→child chain?
  → useState / useReducer inside the component.

Is the state shared across multiple unrelated components AND changes frequently?
  → Zustand store.

Is the state shared but read-heavy and rarely updated (theme, locale, auth user)?
  → React context.
```

Never "just put it in Zustand" as a default. The higher layers are simpler and easier to test.

---

## Server State — React Query Only

- Data that lives in the database belongs to React Query, not Zustand.
- Never copy server data into a Zustand store to "cache" it — React Query already caches it.
- Never `useState` to store the result of a `fetch` — that reinvents React Query badly.

```ts
// ✅
const { data: lessons } = useLessons()

// ❌ Copying server data into local state
const [lessons, setLessons] = useState<Lesson[]>([])
useEffect(() => {
  fetch('/api/lessons')
    .then((r) => r.json())
    .then(setLessons)
}, [])
```

---

## Local State — useState / useReducer

Use for:

- UI-only state: `isOpen`, `activeTab`, `inputValue`
- State that doesn't need to survive navigation or be shared beyond 2 component levels
- Form state (prefer React Hook Form or conform-to, not manual useState per field)

Rules:

- One `useState` per concern — don't bundle unrelated booleans into an object.
- If you have >3 `useState` calls that update together, switch to `useReducer`.
- Lift state up only as far as needed — no further.

```ts
// ✅ Independent concerns, separate state
const [isOpen, setIsOpen] = useState(false)
const [search, setSearch] = useState('')

// ❌ Bundled unrelated state
const [ui, setUi] = useState({
  isOpen: false,
  search: '',
  page: 1,
  sort: 'asc',
})
```

---

## Zustand Stores

Use Zustand for client-side global state that:

- Is shared between 2+ unrelated subtrees
- Persists across route navigations
- Changes frequently (high update rate suits Zustand's subscription model)

**Store rules:**

- One store per domain: `useLessonStore`, `usePlayerStore`, NOT one giant `useAppStore`.
- Keep stores flat — avoid deeply nested objects (hard to update immutably).
- Never put async logic in a store action — call the React Query mutation, then update store state if needed.
- Selectors should be stable: use primitive selectors or `useShallow` for object/array selectors to prevent infinite re-renders.

```ts
// ✅ Flat, focused store
interface PlayerStore {
  currentLessonId: string | null
  isPlaying: boolean
  setLesson: (id: string) => void
  togglePlay: () => void
}

// ❌ Storing server data in Zustand
interface LessonStore {
  lessons: Lesson[] // ← this belongs to React Query
  fetchLessons: () => void // ← this belongs to a service + hook
}
```

```ts
// ✅ Stable primitive selector
const isPlaying = usePlayerStore((s) => s.isPlaying)

// ❌ New object reference on every render → infinite loop risk
const { isPlaying, currentLessonId } = usePlayerStore((s) => ({
  isPlaying: s.isPlaying,
  currentLessonId: s.currentLessonId,
}))

// ✅ Fixed with useShallow
const { isPlaying, currentLessonId } = usePlayerStore(
  useShallow((s) => ({
    isPlaying: s.isPlaying,
    currentLessonId: s.currentLessonId,
  })),
)
```

---

## React Context

Use context for:

- Static or rarely-changing values: theme, locale, authenticated user object
- Values that many components read but few update

**Context rules:**

- Split context by update frequency — combine a `ThemeContext` and a `LessonListContext` and every lesson list update re-renders theme consumers.
- Always provide a default value or throw a clear error if used outside the provider.
- For high-frequency updates (mouse position, scroll), context will cause excessive re-renders — use Zustand instead.

```ts
// ✅ Context for stable values
const ThemeContext = createContext<Theme>('dark')

// ❌ Context for frequently changing data
const LessonListContext = createContext<Lesson[]>([]) // triggers rerenders on every fetch
```

---

## Form State

- Use `@conform-to/react` + `@conform-to/zod` for server action forms.
- Use `react-hook-form` for complex client-side forms with real-time validation.
- Never manage individual form fields with separate `useState` calls.
- Never submit form data via a Zustand store.
