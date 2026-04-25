import { useCallback } from "react";
import { File, Paths } from "expo-file-system";
import { getBasenameFromFilename, getFilenameFromURI } from "@/util";
import {
  setInspectionPhoto,
  setInspectionPhotos,
  useStore,
} from "@/hooks/useStore";
import { VisitId } from "@/types";
import * as Sentry from "@sentry/react-native"

export function useInspectionPhotos() {
  const visitId = useStore((state) => state.visitId),
    visitMetadata = useStore((state) => state.visitMetadata),
    inspectionPhotos = useStore((state) => state.inspectionPhotos);

  const currentInspectionIndex = visitMetadata[visitId]?.inspectionIdx;

  const attachPhotoToCurrentInspection = useCallback(
    async (photoUri: string) => {
      const filename = getFilenameFromURI(photoUri);
      const source = new File(photoUri);
      const destination = new File(Paths.document, filename);

      try {
        source.copy(destination);
      } catch (error) {
        Sentry.captureException(error);
        console.error(error);
      }

      setInspectionPhoto({
        filename,
        uri: destination.uri,
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
        const file = new File(photo.uri);

        if (file.exists) {
          file.delete();
        }
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
