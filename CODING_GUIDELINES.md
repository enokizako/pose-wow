# Coding Guidelines

This document outlines the coding standards and best practices for this Pose Detection application.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI/ML**: MediaPipe Tasks Vision
- **Database**: Supabase (available for data persistence)
- **Linting**: ESLint with TypeScript support

## Project Structure

```
src/
├── components/          # React components
│   └── PoseDetector.tsx # Main pose detection component
├── App.tsx             # Root application component
├── main.tsx            # Application entry point
└── index.css           # Global styles with Tailwind directives
```

## TypeScript Guidelines

### Type Safety

- Always use explicit types for function parameters and return values
- Avoid `any` type; use `unknown` or specific types
- Use TypeScript utility types when appropriate (`Partial`, `Pick`, `Omit`, etc.)
- Define interfaces for complex data structures

```typescript
// Good
const checkBothHandsRaised = (landmarks: any[]): boolean => {
  // Implementation
};

// Better - define proper interface
interface Landmark {
  x: number;
  y: number;
  z: number;
}

const checkBothHandsRaised = (landmarks: Landmark[]): boolean => {
  // Implementation
};
```

### Refs and DOM Manipulation

- Use `useRef<HTMLElementType>(null)` for DOM references
- Always check ref existence before accessing: `if (!ref.current) return;`
- Store ref in local variable when using multiple times in same scope

```typescript
// Good pattern
const video = videoRef.current;
if (!video) return;
// Use video multiple times
```

## React Guidelines

### Component Structure

- One component per file
- Use functional components with hooks
- Keep components focused and single-purpose
- Extract complex logic into separate functions or custom hooks

### Hooks Best Practices

- **useState**: Initialize with appropriate default values
- **useEffect**: Always include cleanup functions for subscriptions/resources
- **useRef**: Use for DOM access and storing mutable values that don't trigger re-renders

```typescript
// Proper cleanup pattern
useEffect(() => {
  let landmarker: PoseLandmarker | undefined;
  let stream: MediaStream | undefined;

  // Initialization logic

  return () => {
    landmarker?.close();
    stream?.getTracks().forEach((t) => t.stop());
  };
}, []);
```

### Async Operations

- Always handle errors in async functions
- Use try-catch blocks for error handling
- Provide meaningful error messages to users

```typescript
try {
  await someAsyncOperation();
} catch (err) {
  console.error('Detailed error:', err);
  const errorMessage = err instanceof Error ? err.message : String(err);
  setError(`User-friendly message: ${errorMessage}`);
}
```

## MediaPipe Integration

### Video Element Handling

- Wait for `loadedmetadata` event before calling `play()`
- Check `video.readyState` before processing frames
- Use `requestAnimationFrame` for smooth detection loops

```typescript
// Proper video initialization
await new Promise<void>((resolve) => {
  video.onloadedmetadata = () => {
    video.play().then(() => {
      resolve();
    }).catch((err) => {
      console.error('Play error:', err);
    });
  };
});
```

### Detection Loop

- Check video readiness state before processing: `video.readyState < 2`
- Always use `requestAnimationFrame` for frame processing
- Clear and redraw canvas on each frame

```typescript
const detect = () => {
  if (!video || !landmarker || video.readyState < 2) {
    requestAnimationFrame(detect);
    return;
  }

  // Detection logic

  requestAnimationFrame(detect);
};
```

## Styling Guidelines

### Tailwind CSS

- Use Tailwind utility classes for styling
- Follow mobile-first responsive design
- Use semantic color names from Tailwind palette
- Avoid inline styles unless necessary (e.g., transforms, dynamic values)

### Color Scheme

- **Background**: Dark theme with slate colors (`slate-900`, `slate-800`)
- **Accents**: Blue (`blue-400`) for primary actions
- **Errors**: Red tones (`red-500`, `red-300`)
- **Success**: Green tones (`green-400`)
- **Avoid**: Purple, indigo, or violet hues (unless explicitly requested)

### Design Principles

- Maintain consistent spacing using Tailwind's spacing scale
- Use rounded corners for modern look (`rounded-xl`, `rounded-2xl`)
- Add shadows for depth (`shadow-xl`, `shadow-2xl`)
- Implement smooth transitions and animations
- Ensure sufficient color contrast for accessibility

## Error Handling

### User-Facing Errors

- Display clear, actionable error messages
- Provide troubleshooting hints when possible
- Log detailed errors to console for debugging

```typescript
// Good error display
{error && (
  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-4">
    <p className="text-red-300 text-sm">{error}</p>
    <p className="text-red-400 text-xs mt-3">
      Possible causes: Camera permission denied, not using HTTPS, or network error.
    </p>
  </div>
)}
```

## Performance Optimization

- Use `requestAnimationFrame` for animation loops
- Avoid unnecessary re-renders with proper dependency arrays
- Clean up resources in useEffect cleanup functions
- Use GPU acceleration when available (MediaPipe delegate: 'GPU')

## Code Organization

### File Size

- Keep files manageable (typically under 200-300 lines)
- Split large components into smaller, focused components
- Extract utility functions into separate files when reusable

### Naming Conventions

- **Components**: PascalCase (`PoseDetector.tsx`)
- **Functions**: camelCase (`checkBothHandsRaised`)
- **Constants**: UPPER_SNAKE_CASE (`LEFT_WRIST`, `RIGHT_SHOULDER`)
- **Files**: Match component name or descriptive purpose

### Comments

- Only add comments when code intent is not obvious
- Document complex algorithms or business logic
- Avoid redundant comments that just restate the code

## Git and Version Control

- Write clear, descriptive commit messages
- Keep commits focused on single changes
- Never commit sensitive data (API keys, credentials)
- Use `.gitignore` for environment files and build artifacts

## Environment Variables

- Store sensitive configuration in `.env` files
- Never commit `.env` files to version control
- Use Vite's `import.meta.env` for accessing environment variables
- Prefix with `VITE_` for client-side access

## Testing and Quality

- Run `npm run build` before committing to ensure build succeeds
- Use `npm run typecheck` to verify TypeScript types
- Run `npm run lint` to check code quality
- Test in multiple browsers for compatibility

## Supabase Integration

- Use Supabase for data persistence needs
- Follow Row Level Security (RLS) best practices
- Always enable RLS on tables
- Create appropriate policies for data access

## Accessibility

- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation works
- Maintain sufficient color contrast ratios
- Test with screen readers when possible

## Browser Compatibility

- Target modern browsers (Chrome, Firefox, Safari, Edge)
- Use feature detection for camera/media APIs
- Provide fallbacks for unsupported features
- Test on both desktop and mobile devices
