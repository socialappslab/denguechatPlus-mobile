import { TouchableOpacity, Pressable } from "react-native";
import { ThemeProps } from "./useThemeColor";
import { Text } from "./Text";
import { View } from "./View";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";

import { Post } from "@/types";
import { getInitialsBase, formatDatePosts } from "@/util";
import Like from "@/components/icons/Like";
import Comment from "@/components/icons/Comment";
import { useVisit } from "@/hooks/useVisit";
import MoreHorizontal from "@/components/icons/MoreHorizontal";

export type PostItemProps = ThemeProps &
  TouchableOpacity["props"] & {
    onPressElement?: () => void;
    onPressLike: (id: number) => void;
    onPressComments: () => void;
    onPressOptions: () => void;
    post: Post;
    commentsCount: number;
    likedByUser: boolean;
    likesCount: number;
    loadingLike: boolean;
  };

export function PostItem(props: PostItemProps) {
  const {
    onPressElement,
    onPressComments,
    onPressLike,
    onPressOptions,
    commentsCount,
    likedByUser,
    likesCount,
    loadingLike,
    post,
  } = props;
  const { language } = useVisit();
  const { t } = useTranslation();

  const initials = getInitialsBase(
    String(post.createByUser.userName),
    String(post.createByUser.lastName),
  );

  return (
    <View className="flex flex-col px-5  py-4 border-b border-neutral-200">
      <View className="flex flex-row items-center mb-4">
        <Pressable
          className={`flex items-center justify-center w-10 h-10 rounded-full bg-green-400 mr-3`}
          onPress={onPressElement}
        >
          <Text className="font-bold text-sm text-green-700">{initials}</Text>
        </Pressable>
        <Pressable
          className="flex flex-1 flex-col mr-1"
          onPress={onPressElement}
        >
          <Text className="font-semibold">{`${post.createByUser.userName} ${post.createByUser.lastName}`}</Text>
          <Text className={`text-sm opacity-60`}>
            {post.location} • {formatDatePosts(post.createdAt, language)}
          </Text>
        </Pressable>
        {(post.canDeleteByUser || post.canEditByUser) && (
          <TouchableOpacity onPress={onPressOptions}>
            <MoreHorizontal />
          </TouchableOpacity>
        )}
      </View>

      <Pressable
        className="flex flex-1 flex-row items-center mb-3"
        onPress={onPressElement}
      >
        <Text>{post.postText}</Text>
      </Pressable>

      {post.photoUrl && (
        <Pressable onPress={onPressElement}>
          <Image
            className="rounded-lg"
            contentFit="contain"
            source={{ uri: post.photoUrl.photo_url }}
            style={{ height: 210 }}
          />
        </Pressable>
      )}
      <View className="h-4" />
      <View className="flex flex-1 flex-row justify-between">
        <TouchableOpacity
          className="flex flex-row items-center"
          disabled={loadingLike}
          onPress={() => onPressLike(post.id)}
        >
          <Like active={likedByUser} />
          <Text
            className={`ml-2 text-sm ${likedByUser ? "text-blue-700" : "text-neutral-500"}`}
          >
            {!likesCount || likesCount === 0 ? t("chat.like") : `${likesCount}`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex flex-row items-center"
          onPress={onPressComments}
        >
          <Comment />
          <Text className="ml-2 text-neutral-500 text-sm">
            {!commentsCount && t("chat.comments.empty")}
            {commentsCount !== null &&
              commentsCount > 1 &&
              `${commentsCount} ${t("chat.comments.number")}`}
            {commentsCount !== null &&
              commentsCount === 1 &&
              `${commentsCount} ${t("chat.comments.numberSingular")}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
