export const getUserRoomName = (userId: string | number): string => {
  return `user_${userId}`;
};
