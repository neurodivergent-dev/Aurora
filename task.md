# FlashList Migration Task List

- [ ] **Phase 1: AIChatScreen Migration**
    - [ ] Import `FlashList` from `@shopify/flash-list`
    - [x] Extract `renderMessage` to a memoized `useCallback`
    - [ ] Replace `FlatList` with `FlashList` and set `estimatedItemSize`
    - [ ] Verify scrolling and typing performance
- [ ] **Phase 2: PlaylistsScreen Migration**
    - [ ] Import `FlashList` from `@shopify/flash-list`
    - [ ] Extract `renderTrackItem` to a memoized `useCallback`
    - [ ] Replace `FlatList` with `FlashList` and set `estimatedItemSize`
    - [ ] Verify list stability
- [ ] **Phase 3: MusicPlayerScreen Migration**
    - [ ] Import `FlashList` from `@shopify/flash-list`
    - [ ] Extract inline `renderItem` to a `useCallback`
    - [ ] Replace `FlatList` with `FlashList` and set `estimatedItemSize`
    - [ ] Verify queue rendering
- [ ] **Phase 4: Final Cleanup & Verification**
    - [ ] Run `npx tsc --noEmit` to ensure type safety
    - [ ] Update `qwen.md` with new performance scores
