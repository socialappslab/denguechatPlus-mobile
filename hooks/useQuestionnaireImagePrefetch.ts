import { Questionnaire } from "@/types";
import { CACHE_LOG } from "@/util/logger";
import { Image } from "expo-image";
import { useEffect, useRef } from "react";

function getQuestionnaireImageUrls(questionnaire: Questionnaire): string[] {
  const urls = new Set<string>();

  for (const question of questionnaire.questions) {
    if (question.image?.url) urls.add(question.image.url);
    if (question.additionalData?.image) {
      urls.add(question.additionalData.image);
    }

    for (const option of question.options) {
      if (option.image?.url) urls.add(`${option.image.url}.png`);
    }
  }

  return [...urls];
}

export function useQuestionnaireImagePrefetch(
  questionnaire: Questionnaire | null,
) {
  const completedUrlSets = useRef(new Set<string>());
  const inFlightUrlSets = useRef(new Set<string>());

  useEffect(() => {
    if (!questionnaire) return;

    const urls = getQuestionnaireImageUrls(questionnaire);
    if (urls.length === 0) return;

    const urlSetKey = JSON.stringify([...urls].sort());
    if (
      completedUrlSets.current.has(urlSetKey) ||
      inFlightUrlSets.current.has(urlSetKey)
    ) {
      return;
    }

    inFlightUrlSets.current.add(urlSetKey);
    void Promise.allSettled(urls.map((url) => Image.prefetch(url, "disk")))
      .then((results) => {
        const failedUrls = results.flatMap((result, index) =>
          result.status === "rejected" || !result.value ? [urls[index]] : [],
        );
        const succeeded = urls.length - failedUrls.length;

        CACHE_LOG.info(
          `Successfully prefetched ${succeeded} questionnaire ${succeeded === 1 ? "image" : "images"}`,
        );

        if (failedUrls.length === 0) {
          completedUrlSets.current.add(urlSetKey);
          return;
        }

        CACHE_LOG.error(
          `Failed to cache ${failedUrls.length} of ${urls.length} questionnaire images`,
          failedUrls,
        );
      })
      .finally(() => {
        inFlightUrlSets.current.delete(urlSetKey);
      });
  }, [questionnaire]);
}
