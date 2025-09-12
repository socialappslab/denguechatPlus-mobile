import { ResourceName, Resources } from "@/types";
import { useMemo } from "react";
import { useStore } from "./useStore";

type CurrentResource<T extends ResourceName> = Extract<
  Resources[number],
  { resourceName: T }
>;

export function useResourceData<T extends ResourceName>(resourceName: T) {
  const appConfig = useStore((state) => state.appConfig);

  return useMemo(() => {
    const resource = appConfig?.find(
      (resource) => resource.resourceName === resourceName,
    ) as CurrentResource<T> | undefined;

    if (!resource) {
      throw new Error(
        "I was expecting to find a resource, maybe the types don't match the server response?",
      );
    }

    return resource.resourceData as CurrentResource<T>["resourceData"];
  }, [resourceName, appConfig]);
}
