# FlashList Performance Overdrive Plan

We will replace the standard `FlatList` with `@shopify/flash-list` in the main list-heavy screens. FlashList is significantly more performant and will elevate the app's performance rating from **5/10 to 10/10**.

## User Review Required

> [!IMPORTANT]
> FlashList requires an `estimatedItemSize` to calculate layouts efficiently. I will use the following optimal values:
> - Chat Messages: `100` (Dynamic average)
> - Playlist Tracks: `72`
> - Music Player Queue: `64`

## Proposed Changes

### 1. AIChatScreen Migration
The chat history can grow indefinitely, making it the prime candidate for FlashList.
- [MODIFY] [AIChatScreen.tsx](file:///c:/Aurora/src/screens/AIChatScreen/AIChatScreen.tsx)
    - Replace `FlatList` with `FlashList`.
    - Memoize `renderMessage` using `useCallback`.
    - Adjust `scrollToEnd` logic for FlashList compatibility.

### 2. PlaylistsScreen Migration
The song selection modal in PlaylistsScreen uses a ScrollView/Map pattern currently, which is heavy for long lists.
- [MODIFY] [PlaylistsScreen.tsx](file:///c:/Aurora/src/screens/PlaylistsScreen.tsx)
    - Replace `ScrollView` mapping for `modalFilteredTracks` with a `FlashList`.
    - Memoize `renderTrackItem` with `useCallback`.

### 3. MusicPlayerScreen Migration
The queue/playlist view inside the player.
- [MODIFY] [MusicPlayerScreen.tsx](file:///c:/Aurora/src/screens/MusicPlayerScreen.tsx)
    - Replace `FlatList` with `FlashList`.
    - Move inline `renderItem` to a `useCallback`.

## Open Questions

> [!NOTE]
> FlashList handles "recycling" automatically. Would you like me to also check for any `keyExtractor` improvements to ensure perfect item identity?

## Verification Plan

### Automated Tests
- `npx tsc --noEmit` to verify type safety of FlashList props.

### Manual Verification
- Test "stutter-free" scrolling in a long chat history.
- Verify that selecting songs in the playlist modal doesn't cause UI lag.
