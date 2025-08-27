import { useCallback } from "react";
import invariant from "tiny-invariant";
import * as FileSystem from "expo-file-system";
import { getBasenameFromFilename, getFilenameFromURI } from "@/util";
import {
  setInspectionPhoto,
  setInspectionPhotos,
  useStore,
} from "@/hooks/useStore";
import { VisitId } from "@/types";

export function useInspectionPhotos() {
  const visitId = useStore((state) => state.visitId),
    visitMetadata = useStore((state) => state.visitMetadata),
    inspectionPhotos = useStore((state) => state.inspectionPhotos);

  const currentInspectionIndex = visitMetadata[visitId].inspectionIdx;

  const attachPhotoToCurrentInspection = useCallback(
    async (photoUri: string) => {
      invariant(
        FileSystem.documentDirectory,
        "Expected a document directory to copy the image to",
      );

      const filename = getFilenameFromURI(photoUri);
      const destination = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.copyAsync({
        from: photoUri,
        to: destination,
      }).catch(console.error);

      setInspectionPhoto({
        filename,
        uri: destination,
        visitId,
        inspectionIdx: currentInspectionIndex,
        referenceCode: getBasenameFromFilename(filename),
      });
    },
    [currentInspectionIndex, visitId],
  );

  const deleteInspectionPhotosFromVisit = useCallback(
    async (visitId: VisitId) => {
      const photosToDelete = inspectionPhotos.filter(
        (photo) => photo.visitId === visitId,
      );
      const newInspectionPhotos = inspectionPhotos.filter(
        (photo) => photo.visitId !== visitId,
      );

      for (const photo of photosToDelete) {
        await FileSystem.deleteAsync(photo.uri, { idempotent: true });
      }
      setInspectionPhotos(newInspectionPhotos);
    },
    [inspectionPhotos],
  );

  return {
    attachPhotoToCurrentInspection,
    deleteInspectionPhotosFromVisit,
  };
}
