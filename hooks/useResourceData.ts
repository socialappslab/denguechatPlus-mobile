import { ResourceName, Resources } from "@/types";
import { useVisit } from "./useVisit";
import { useMemo } from "react";

export function useResourceData<T extends ResourceName>(resourceName: T) {
  const { resources } = useVisit();

  return useMemo(() => {
    type CurrentResource = Extract<Resources[number], { resourceName: T }>;

    const resource = resources.find(
      (resource) => resource.resourceName === resourceName,
    ) as CurrentResource | undefined;

    if (!resource) {
      throw new Error(
        "I was expecting to find a resource, maybe the types don't match the server response?",
      );
    }

    return resource.resourceData as CurrentResource["resourceData"];
  }, [resourceName, resources]);
}
