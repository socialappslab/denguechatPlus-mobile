# AGENTS.md - DengueChat Plus Mobile

## Commands
- **Start**: `yarn start` (Expo dev server)
- **Lint**: `yarn lint` / `yarn lint:fix`
- **TypeCheck**: `npx tsc --noEmit`
- **Build iOS/Android**: `yarn ios` / `yarn android`

## Architecture
- **Framework**: Expo SDK 54 with Expo Router (file-based routing in `app/`)
- **State**: Zustand with immer middleware (`hooks/useStore.ts`), React Query for server state
- **API**: Axios configured in `config/axios.ts`, base URL from `EXPO_PUBLIC_API_URL`
- **Styling**: NativeWind (TailwindCSS for React Native)
- **i18n**: i18next configured in `config/i18n.ts`
- **Forms**: react-hook-form with zod validation (`schema/`)

## Code Style
- TypeScript with strict mode, use `@/*` path alias for imports
- Prettier: double quotes, trailing commas, 2-space indent, semicolons
- Components in `components/`, hooks in `hooks/`, types in `types/`
- Use existing utilities (`util/`), axios instance from `@/config/axios`
- Validate with zod schemas, use `tiny-invariant` for runtime assertions
- We're on React 19 so there's no need to `useMemo` and `useCallback` hooks

## Other considerations

- When working with the charts in the app you may want to know the props or the
  usage of the components/API that `react-native-gifted-charts` gives you, for
  that use the following links depending on the chart type you're working with:
  - https://gifted-charts.web.app/barchart
  - https://gifted-charts.web.app/horizbar
  - https://gifted-charts.web.app/stackbar
  - https://gifted-charts.web.app/linechart
  - https://gifted-charts.web.app/areachart
  - https://gifted-charts.web.app/piechart
  - https://gifted-charts.web.app/radarchart
  - https://gifted-charts.web.app/popnpyramid
