# DengueChatPlus Mobile - Agent Guidelines

## Build/Test Commands
- **Start dev server:** `yarn start` (expo start with cache clear)
- **Test (all):** `yarn test` (jest with watch mode)
- **Test (single file):** `npx jest <filename>.test.ts`
- **Lint:** `yarn lint` (check) or `yarn lint:fix` (fix)
- **iOS:** `yarn ios` | **Android:** `yarn android`

## Architecture 
- **Tech Stack:** Expo 54 + React Native 0.81 + TypeScript + NativeWind/TailwindCSS
- **Routing:** Expo Router with typed routes (app directory)
- **State:** Zustand stores (`hooks/useStore.ts`, `hooks/useSessionStore.ts`)
- **Context:** Brigade/Filter contexts for shared state (`context/`)
- **Data Fetching:** TanStack Query with AsyncStorage persistence
- **Forms:** React Hook Form with Zod validation
- **Auth:** Secure storage via Expo SecureStore

## Code Style
- **Imports:** Use `@/*` path aliases, organize external → internal → relative
- **Components:** PascalCase, prefer function declarations, use TypeScript interfaces
- **Styling:** TailwindCSS classes via NativeWind, themed components in `components/themed/`
- **Formatting:** Prettier (semi, double quotes, trailing commas), ESLint with Expo config
- **Files:** kebab-case for files, camelCase for variables/functions
- **Testing:** Jest with `jest-expo` preset, place tests adjacent to source files
