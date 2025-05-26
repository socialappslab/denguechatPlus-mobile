import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { ThemeProps } from "@/components/themed/useThemeColor";
import { Text, View } from "@/components/themed";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";

import { Comment } from "@/types";
import { getInitialsBase, formatDatePosts } from "@/util";
import Like from "@/components/icons/Like";
import Delete from "@/components/icons/Delete";
import { useVisit } from "@/hooks/useVisit";

interface CommentItemProps extends ThemeProps, TouchableOpacityProps {
  onPressLike: (id: number) => void;
  onPressDelete: (id: number) => void;
  canDelete?: boolean;
  comment: Comment;
  likesCount: number;
  likedByMe: boolean;
  loadingLike: boolean;
}

export default function CommentItem(props: CommentItemProps) {
  const {
    onPressLike,
    onPressDelete,
    comment,
    likesCount,
    likedByMe,
    loadingLike,
  } = props;
  const { language } = useVisit();
  const { t } = useTranslation();

  // console.log("comment>>>>>>>>>>", comment);

  const initials = getInitialsBase(
    comment.createdBy.userName,
    comment.createdBy.lastName,
  );

  return (
    <View className="flex flex-col px-5 py-2 mb-3">
      <View className="flex flex-row items-start">
        <View
          className={`flex items-center justify-center w-10 h-10 rounded-full bg-green-400 mr-3`}
        >
          <Text className="font-bold text-sm text-green-700">{initials}</Text>
        </View>
        <View className="flex flex-1">
          <View className="flex flex-1 flex-row items-center mb-1">
            <Text className="font-semibold">{`${comment.createdBy.userName} ${comment.createdBy.lastName}`}</Text>
            <Text className={`text-sm opacity-60 ml-1`}>
              • {formatDatePosts(comment.createdAt, language)}
            </Text>
          </View>
          <View className="flex flex-1 flex-row items-center">
            <Text>{comment.content}</Text>
          </View>
          {comment.photos && (
            <>
              <Image
                className="rounded-lg mt-3"
                contentFit="cover"
                source={{ uri: comment.photos.photo_url }}
                style={{ height: 210 }}
              />
              <View className="h-1" />
            </>
          )}

          <View className="flex flex-1 flex-row justify-between mt-2">
            <TouchableOpacity
              className="flex flex-row items-center"
              disabled={loadingLike}
              onPress={() => onPressLike(comment.id)}
            >
              <Like active={likedByMe} />
              <Text
                className={`ml-2 text-sm ${likedByMe ? "text-blue-700" : "text-neutral-500"} ${loadingLike ? "opacity-50" : ""}`}
              >
                {likesCount === 0 ? t("chat.like") : `${likesCount}`}
              </Text>
            </TouchableOpacity>

            {comment.canDeleteByUser && (
              <TouchableOpacity
                className="flex flex-row items-center"
                onPress={() => onPressDelete(comment.id)}
              >
                <Delete />
                <Text className="ml-2 text-neutral-500 text-sm">
                  {t("chat.actions.delete")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
