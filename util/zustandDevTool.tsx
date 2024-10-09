import React, { useEffect, useRef, useState } from "react";
import { StoreApi } from "zustand";

export function useZustandDevtool<
  T extends object = Record<string | number | symbol, any>,
>(storeName: string, store: StoreApi<T>) {
  type StoreState = ReturnType<StoreApi<T>["getState"]>;
  const [state, setState] = useState<any>(store.getState());

  const externalUpdates = {
    count: 0,
  };

  const ZustandDevtool: React.FC<StoreState> = (props) => {
    const allUpdatesCount = useRef(externalUpdates.count);

    useEffect(() => {
      allUpdatesCount.current += 1;
      if (allUpdatesCount.current === externalUpdates.count + 1) {
        allUpdatesCount.current -= 1;

        // DevTools update
        store.setState(props);
      }
    });

    return null;
  };

  (ZustandDevtool as any).displayName = `((${storeName})) devtool`;

  const renderDevtool = (state: StoreState | void) => {
    if (!state) {
      return;
    }
    externalUpdates.count += 1;
    return <ZustandDevtool {...state} />;
  };

  renderDevtool(store.getState());
  store.subscribe((zustandState) => setState(zustandState));

  return state;
}
