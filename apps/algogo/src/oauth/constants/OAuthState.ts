export const OAuthState = {
  NEW: 0, // 완전 신규 연동
  CONNECTED_AND_ACTIVE: 1, // 현재 계정에 연동되어 활성 상태
  CONNECTED_AND_INACTIVE: 2, // 현재 계정에 연동되어 있으나 비활성 상태
  DISCONNECTED: 3, // 현재 계정에서 연동 해제됨
  CONNECTED_TO_OTHER_ACCOUNT: 4, // 다른 계정에 연동된 상태
  DISCONNECTED_FROM_OTHER_ACCOUNT: 5, // 다른 계정에 연동되었다가 해제된 상태
} as const;
