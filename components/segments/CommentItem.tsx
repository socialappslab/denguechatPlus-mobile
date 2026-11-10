import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { ThemeProps } from "@/components/themed/useThemeColor";
import { Text, View } from "@/components/themed";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";

import { Comment } from "@/types";
import { formatDatePosts } from "@/util";
import { UserAvatar } from "@/components/segments/UserAvatar";
import Like from "@/components/icons/Like";
import Delete from "@/components/icons/Delete";

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
  const { i18n } = useTranslation();
  const { t } = useTranslation();

  // console.log("comment>>>>>>>>>>", comment);

  return (
    <View className="flex flex-col px-5 py-2 mb-3">
      <View className="flex flex-row items-start">
        <View className="mr-3">
          <UserAvatar
            uri={comment.createdBy.avatarUrl}
            name={`${comment.createdBy.userName} ${comment.createdBy.lastName}`}
          />
        </View>
        <View className="flex flex-1">
          <View className="flex flex-1 flex-row items-center mb-1">
            <Text className="font-semibold">{`${comment.createdBy.userName} ${comment.createdBy.lastName}`}</Text>
            <Text className={`text-sm opacity-60 ml-1`}>
              • {formatDatePosts(comment.createdAt, i18n.language)}
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
