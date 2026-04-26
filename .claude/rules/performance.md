# Performance

## The Default: Don't Optimize Prematurely

Write readable code first. Reach for memoization only when there is a measurable re-render problem — not "just in case."

---

## useMemo / useCallback

**Use when ALL of these are true:**

1. The value is referentially compared by a child component (prop passed to a memoized child, or a dependency of another hook)
2. The computation is genuinely expensive (e.g. filtering a large list, not just summing 3 numbers)
3. You can verify the optimization via React DevTools Profiler

**Never use when:**

- The result is only used inside the same component's render — a new reference on each render doesn't matter
- The dependency array is empty and the value is a constant — just declare it outside the component
- The hook is a one-liner returning a primitive — primitives are always stable by value

```ts
// ✅ Justified: heavy computation + passed to memoized child
const sortedLessons = useMemo(
  () => [...lessons].sort((a, b) => a.title.localeCompare(b.title)),
  [lessons],
)

// ❌ Pointless: primitive, only used here
const label = useMemo(() => `${count} items`, [count])

// ✅ Justified: stable callback reference for memoized child
const handleDelete = useCallback(
  (id: string) => {
    deleteMutation.mutate(id)
  },
  [deleteMutation],
)

// ❌ Pointless: parent re-renders anyway, child is not memoized
const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value)
}, [])
```

---

## React.memo

Wrap a component with `React.memo` only when:

- It receives stable props (primitives or memoized references)
- It re-renders frequently due to a parent that updates for unrelated reasons
- Profiler confirms the component's render is the bottleneck

Never memo every component by default — it adds a shallow comparison cost on every render that often exceeds the cost it saves.

---

## useReducer vs useState

Use `useReducer` when:

- State has ≥3 related fields that update together
- Next state depends on multiple current values simultaneously
- Transitions have named actions that aid debugging

```ts
// ✅ useReducer: 3 fields, coordinated transitions
type FilterState = { query: string; page: number; status: LessonStatus }
type FilterAction =
  | { type: 'search'; query: string }
  | { type: 'next_page' }
  | { type: 'reset' }

// ✅ useState: simple, independent
const [isOpen, setIsOpen] = useState(false)
```

---

## Lazy Loading

- Lazy-load route-level components with `next/dynamic` when they are large and not needed on initial paint.
- Never lazy-load small UI components — the network round-trip costs more than the bundle size saved.
- Always provide a `loading` fallback to avoid layout shift.

```ts
// ✅ Large page-level editor, not needed immediately
const RichEditor = dynamic(() => import('~/components/rich-editor'), {
  loading: () => <Skeleton className="h-64 w-full" />,
})

// ❌ Don't lazy-load a button
const SubmitButton = dynamic(() => import('~/components/ui/button'))
```

---

## Images

- Always use Next.js `<Image>` from `next/image` — never raw `<img>`.
- Set explicit `width` and `height` (or use `fill` + a sized container) to prevent layout shift.
- Use `priority` only on above-the-fold images (hero, LCP candidate).
- Use `sizes` when the image width varies by viewport.

```tsx
// ✅
<Image
  src={lesson.thumbnail}
  alt={lesson.title}
  width={320}
  height={180}
  sizes="(max-width: 768px) 100vw, 320px"
/>

// ❌
<img src={lesson.thumbnail} alt={lesson.title} />
```

---

## List Rendering

- Never use array index as `key` when the list can reorder or items can be deleted — use stable IDs.
- Virtualize lists with >100 items using `@tanstack/react-virtual`.

```tsx
// ✅
{
  lessons.map((lesson) => <LessonRow key={lesson.id} lesson={lesson} />)
}

// ❌
{
  lessons.map((lesson, i) => <LessonRow key={i} lesson={lesson} />)
}
```
