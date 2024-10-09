import { TouchableOpacity, Pressable } from "react-native";
import { ThemeProps } from "@/components/themed/useThemeColor";
import { Text, View } from "@/components/themed";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";

import { Post } from "@/types";
import { getInitialsBase, formatDatePosts } from "@/util";
import Like from "@/components/icons/Like";
import Comment from "@/components/icons/Comment";
import { useVisit } from "@/hooks/useVisit";

export type PostItemProps = ThemeProps &
  TouchableOpacity["props"] & {
    onPressElement: () => void;
    onPressComments: () => void;
    post: Post;
  };

export function PostItem(props: PostItemProps) {
  const { onPressElement, onPressComments, post } = props;
  const { language } = useVisit();
  const { t } = useTranslation();

  const initials = getInitialsBase(
    String(post.createByUser.userName),
    String(post.createByUser.lastName),
  );

  return (
    <View className="flex flex-col px-5  py-4 border-b border-neutral-200">
      <Pressable
        className="flex flex-row items-center mb-4"
        onPress={onPressElement}
      >
        <View
          className={`flex items-center justify-center w-10 h-10 rounded-full bg-green-400 mr-3`}
        >
          <Text className="font-bold text-sm text-green-700">{initials}</Text>
        </View>
        <View className="flex flex-1 flex-col">
          <Text className="font-semibold">{`${post.createByUser.userName} ${post.createByUser.lastName}`}</Text>
          <Text className={`text-sm opacity-60`}>
            {post.location} • {formatDatePosts(post.createdAt, language)}
          </Text>
        </View>
      </Pressable>

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
            source={{ uri: post.photoUrl.photo_url }}
            style={{ height: 210, resizeMode: "contain" }}
          />
        </Pressable>
      )}
      <View className="h-4" />
      <View className="flex flex-1 flex-row justify-between">
        <TouchableOpacity className="flex flex-row items-center">
          <Like active={post.likedByUser} />
          <Text
            className={`ml-2 text-sm ${post.likedByUser ? "text-blue-700" : "text-neutral-500"}`}
          >
            {!post.likesCount || post.likesCount === 0
              ? t("chat.like")
              : `${post.likesCount}`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex flex-row items-center"
          onPress={onPressComments}
        >
          <Comment />
          <Text className="ml-2 text-neutral-500 text-sm">
            {!post.commentsCount && t("chat.comments.empty")}
            {post.commentsCount !== null &&
              post.commentsCount > 1 &&
              `${post.commentsCount} ${t("chat.comments.number")}`}
            {post.commentsCount !== null &&
              post.commentsCount === 1 &&
              `${post.commentsCount} ${t("chat.comments.numberSingular")}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
